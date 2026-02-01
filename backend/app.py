from fastapi import FastAPI, File, UploadFile, HTTPException, WebSocket, WebSocketDisconnect, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import os
import shutil
from pathlib import Path
import uuid
import logging
import json
from typing import List
from datetime import datetime
from ai_engine import process_video
from database import get_db, init_db, VideoCRUD, DetectionCRUD, UserProfileCRUD
from sqlalchemy.orm import Session
from pydantic import BaseModel
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="VisionSafe Backend API")

# Initialize Firebase Admin (expects GOOGLE_APPLICATION_CREDENTIALS env or default credentials)
if not firebase_admin._apps:
    try:
        creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if creds_path:
            firebase_admin.initialize_app(credentials.Certificate(creds_path))
        else:
            firebase_admin.initialize_app()
        logger.info("✅ Firebase Admin initialized")
    except Exception as e:
        logger.warning(f"⚠️ Firebase Admin initialization failed: {e}")


def get_email_from_token(authorization: str | None) -> str:
    """Extract user email from Firebase ID token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid Authorization header")

    token = parts[1]
    try:
        decoded = firebase_auth.verify_id_token(token)
        email = decoded.get("email")
        if not email:
            raise HTTPException(status_code=401, detail="Email not found in token")
        return email
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    logger.info("Initializing database...")
    try:
        init_db()
        logger.info("✅ Database initialized successfully")
    except Exception as e:
        logger.warning(f"⚠️ Database initialization: {e}")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories
UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("output")
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# Mount output directory for serving processed videos
app.mount("/output", StaticFiles(directory=OUTPUT_DIR), name="output")

# ========================================
# WebSocket Connection Manager
# ========================================

class ConnectionManager:
    """
    Manages WebSocket connections for real-time alerts
    """
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        """Accept and store new WebSocket connection"""
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"New WebSocket connection. Total active: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        """Remove WebSocket connection"""
        self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total active: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        """Send message to specific client"""
        try:
            await websocket.send_text(message)
        except Exception as e:
            logger.error(f"Error sending personal message: {str(e)}")
    
    async def broadcast(self, message: str):
        """Send message to all connected clients"""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Error broadcasting to client: {str(e)}")
                disconnected.append(connection)
        
        # Remove disconnected clients
        for conn in disconnected:
            if conn in self.active_connections:
                self.active_connections.remove(conn)
    
    async def send_json(self, data: dict):
        """Send JSON data to all connected clients"""
        message = json.dumps(data)
        await self.broadcast(message)

# Initialize connection manager
manager = ConnectionManager()


# ========================================
# Alert Broadcasting Function
# ========================================

async def send_alert(message: str, alert_type: str = "info", data: dict = None):
    """
    Send alert to all connected WebSocket clients
    
    Args:
        message: Alert message text
        alert_type: Type of alert (info, warning, danger, success)
        data: Additional data to include in alert
    """
    alert_payload = {
        "type": "alert",
        "alert_type": alert_type,
        "message": message,
        "timestamp": datetime.utcnow().isoformat(),
        "data": data or {}
    }
    
    logger.info(f"Broadcasting alert: {alert_type} - {message}")
    await manager.send_json(alert_payload)


# ========================================
# REST API Endpoints
# ========================================

@app.get("/")
async def root():
    return {"message": "VisionSafe API is running"}

@app.post("/upload-video")
async def upload_video(
    file: UploadFile = File(...), 
    user_email: str = None,
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db)
):
    """
    Upload and process video file with AI safety detection
    
    Returns:
        JSON response with video_url and safety status
    """
    logger.info(f"Received video upload request: {file.filename}")
    
    try:
        # Extract email from Bearer token if Authorization header is provided
        if authorization and not user_email:
            try:
                user_email = get_email_from_token(authorization)
                logger.info(f"Extracted email from token: {user_email}")
            except HTTPException as e:
                logger.warning(f"Token verification failed: {e.detail}")
                user_email = "anonymous"
        
        # Use provided email or default to anonymous
        if not user_email:
            user_email = "anonymous"
        
        # Validate file type
        if not file.content_type.startswith("video/"):
            logger.warning(f"Invalid file type: {file.content_type}")
            raise HTTPException(status_code=400, detail="File must be a video")
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        upload_path = UPLOAD_DIR / unique_filename
        
        logger.info(f"Saving uploaded file to: {upload_path}")
        
        # Save uploaded file
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_size = os.path.getsize(upload_path)
        logger.info(f"File saved successfully. Size: {file_size} bytes")
        
        # Generate output filename
        output_filename = f"processed_{unique_filename}"
        output_path = OUTPUT_DIR / output_filename
        
        logger.info("Starting AI video processing...")
        
        # Process video with AI engine
        try:
            # Send alert: Processing started
            await send_alert(
                message=f"Processing video: {file.filename}",
                alert_type="info",
                data={"filename": file.filename, "status": "processing"}
            )
            
            result = process_video(
                input_path=str(upload_path),
                output_path=str(output_path)
            )
            
            logger.info(f"AI processing complete. Status: {result['status']}")
            
            # Save to database
            try:
                video_crud = VideoCRUD(db)
                video_data = {
                    "filename": file.filename,
                    "upload_time": datetime.utcnow(),
                    "processed_video_path": str(output_path),
                    "overall_status": result.get("status", "SAFE").lower(),
                    "user_email": user_email or "anonymous",
                    "confidence": float(result.get("confidence", 0.0)),
                    "duration_seconds": float(result.get("duration", 0.0)),
                    "total_frames": int(result.get("total_frames", 0)),
                    "file_size_bytes": int(file_size)
                }
                
                video = video_crud.create_video(**video_data)
                logger.info(f"✅ Video record created: {video.id}")
                
                # Save detections if available
                if "detections" in result and result["detections"]:
                    detection_crud = DetectionCRUD(db)
                    for detection_data in result["detections"]:
                        detection_data["video_id"] = video.id
                        detection_crud.create_detection(**detection_data)
                    logger.info(f"✅ Created {len(result['detections'])} detection records")
            
            except Exception as db_error:
                logger.error(f"Database error: {db_error}")
                # Continue anyway - video is processed even if DB save fails
            
            # Send alert based on detection result
            if result["status"] == "UNSAFE":
                await send_alert(
                    message=f"⚠️ UNSAFE activity detected in {file.filename}!",
                    alert_type="danger",
                    data={
                        "filename": file.filename,
                        "status": result["status"],
                        "confidence": result.get("confidence", 0.0),
                        "unsafe_events": result.get("unsafe_events", [])
                    }
                )
            else:
                await send_alert(
                    message=f"✓ Video {file.filename} processed successfully - All Safe",
                    alert_type="success",
                    data={
                        "filename": file.filename,
                        "status": result["status"],
                        "detected_activities": result.get("detected_activities", [])
                    }
                )
            
            # Build response
            response_data = {
                "video_url": f"/output/{output_filename}",
                "status": result["status"],
                "message": "Video processed successfully",
                "confidence": result.get("confidence", 0.0),
                "detected_activities": result.get("detected_activities", []),
                "unsafe_events": result.get("unsafe_events", [])
            }
            
            logger.info(f"Response: {response_data}")
            return JSONResponse(content=response_data)
            
        except Exception as ai_error:
            logger.error(f"AI processing failed: {str(ai_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Video processing failed: {str(ai_error)}"
            )
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}

# ========================================
# Database API Endpoints
# ========================================

class UpdateProfilePayload(BaseModel):
    mobile_number: str | None = None
    bio: str | None = None

@app.get("/videos/history")
async def get_video_history(user_email: str = None, db: Session = Depends(get_db)):
    """Get video processing history for a user"""
    try:
        video_crud = VideoCRUD(db)
        if user_email:
            videos = video_crud.get_videos_by_user(user_email)
        else:
            videos = video_crud.get_all_videos()
        
        return {
            "status": "success",
            "count": len(videos),
            "videos": [
                {
                    "id": str(v.id),
                    "filename": v.filename,
                    "upload_time": v.upload_time.isoformat(),
                    "overall_status": v.overall_status,
                    "confidence": v.confidence,
                    "duration_seconds": v.duration_seconds
                }
                for v in videos
            ]
        }
    except Exception as e:
        logger.error(f"Error fetching video history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/videos/{video_id}")
async def get_video_details(video_id: str, db: Session = Depends(get_db)):
    """Get details for a specific video"""
    try:
        video_crud = VideoCRUD(db)
        video = video_crud.get_video(video_id)
        
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        
        return {
            "status": "success",
            "video": {
                "id": str(video.id),
                "filename": video.filename,
                "upload_time": video.upload_time.isoformat(),
                "overall_status": video.overall_status,
                "confidence": video.confidence,
                "duration_seconds": video.duration_seconds,
                "total_frames": video.total_frames,
                "file_size_bytes": video.file_size_bytes,
                "processed_video_path": video.processed_video_path
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching video details: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/videos/{video_id}/detections")
async def get_video_detections(video_id: str, db: Session = Depends(get_db)):
    """Get all detections for a specific video"""
    try:
        detection_crud = DetectionCRUD(db)
        detections = detection_crud.get_detections_by_video(video_id)
        
        return {
            "status": "success",
            "count": len(detections),
            "detections": [
                {
                    "id": str(d.id),
                    "frame_number": d.frame_number,
                    "activity_label": d.activity_label,
                    "safety_status": d.safety_status,
                    "timestamp_seconds": d.timestamp_seconds,
                    "confidence": d.confidence,
                    "bounding_box": d.bounding_box
                }
                for d in detections
            ]
        }
    except Exception as e:
        logger.error(f"Error fetching detections: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/videos/{video_id}")
async def delete_video(video_id: str, db: Session = Depends(get_db)):
    """Delete a video and its detections"""
    try:
        video_crud = VideoCRUD(db)
        video = video_crud.get_video(video_id)
        
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        
        # Delete associated file
        if os.path.exists(video.processed_video_path):
            os.remove(video.processed_video_path)
            logger.info(f"Deleted file: {video.processed_video_path}")
        
        # Delete from database (cascades to detections)
        video_crud.delete_video(video_id)
        
        return {
            "status": "success",
            "message": f"Video {video_id} deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting video: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/videos/stats/{user_email}")
async def get_user_stats(user_email: str, db: Session = Depends(get_db)):
    """Get safety statistics for a user"""
    try:
        video_crud = VideoCRUD(db)
        videos = video_crud.get_videos_by_user(user_email)
        
        total_videos = len(videos)
        unsafe_count = len([v for v in videos if v.overall_status == "unsafe"])
        safe_count = total_videos - unsafe_count
        avg_confidence = sum(v.confidence for v in videos) / total_videos if total_videos > 0 else 0
        
        return {
            "status": "success",
            "user_email": user_email,
            "total_videos": total_videos,
            "safe_videos": safe_count,
            "unsafe_videos": unsafe_count,
            "average_confidence": round(avg_confidence, 3),
            "unsafe_percentage": round((unsafe_count / total_videos * 100) if total_videos > 0 else 0, 2)
        }
    except Exception as e:
        logger.error(f"Error fetching user stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/user/profile")
async def get_user_profile(authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    """Get user profile using Firebase token"""
    try:
        email = get_email_from_token(authorization)
        profile = UserProfileCRUD.ensure_profile(db, email)

        return {
            "status": "success",
            "profile": {
                "email": profile.email,
                "mobile_number": profile.mobile_number,
                "bio": profile.bio,
                "created_at": profile.created_at.isoformat() if profile.created_at else None
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/user/update-profile")
async def update_user_profile(payload: UpdateProfilePayload, authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    """Update user profile using Firebase token"""
    try:
        email = get_email_from_token(authorization)
        UserProfileCRUD.ensure_profile(db, email)
        profile = UserProfileCRUD.upsert_profile(
            db,
            email=email,
            mobile_number=payload.mobile_number,
            bio=payload.bio
        )

        return {
            "status": "success",
            "message": "Profile updated successfully",
            "profile": {
                "email": profile.email,
                "mobile_number": profile.mobile_number,
                "bio": profile.bio
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving user profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ========================================
# WebSocket Endpoints
# ========================================

@app.websocket("/ws/alerts")
async def websocket_alerts_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time safety alerts
    
    Clients can connect to receive:
    - Unsafe activity detections
    - Video processing status updates
    - System notifications
    """
    await manager.connect(websocket)
    
    try:
        # Send welcome message
        welcome_message = {
            "type": "connection",
            "message": "Connected to VisionSafe alert system",
            "timestamp": datetime.utcnow().isoformat()
        }
        await websocket.send_json(welcome_message)
        
        # Keep connection alive and handle incoming messages
        while True:
            try:
                # Receive messages from client (optional - for ping/pong)
                data = await websocket.receive_text()
                logger.info(f"Received from client: {data}")
                
                # Echo back or handle client commands
                try:
                    client_data = json.loads(data)
                    
                    # Handle ping
                    if client_data.get("type") == "ping":
                        await websocket.send_json({
                            "type": "pong",
                            "timestamp": datetime.utcnow().isoformat()
                        })
                    
                    # Handle status request
                    elif client_data.get("type") == "status":
                        await websocket.send_json({
                            "type": "status",
                            "active_connections": len(manager.active_connections),
                            "timestamp": datetime.utcnow().isoformat()
                        })
                    
                except json.JSONDecodeError:
                    logger.warning(f"Invalid JSON received: {data}")
                
            except WebSocketDisconnect:
                logger.info("Client disconnected normally")
                break
            except Exception as e:
                logger.error(f"Error in WebSocket loop: {str(e)}")
                break
    
    except Exception as e:
        logger.error(f"WebSocket connection error: {str(e)}")
    
    finally:
        manager.disconnect(websocket)


@app.get("/ws/connections")
async def get_active_connections():
    """
    Get count of active WebSocket connections (for monitoring)
    """
    return {
        "active_connections": len(manager.active_connections),
        "timestamp": datetime.utcnow().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
