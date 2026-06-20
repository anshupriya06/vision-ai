from fastapi import FastAPI, File, UploadFile, HTTPException, WebSocket, WebSocketDisconnect, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os
from pathlib import Path
import uuid
import logging
import json
from typing import List
from datetime import datetime
from ai_engine import process_video
from database import get_db, init_db, Video, VideoCRUD, DetectionCRUD, UserProfileCRUD, NewsletterCRUD
from sqlalchemy.orm import Session
from pydantic import BaseModel
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
from email_service import send_welcome_email, send_contact_email

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="VisionSafe Backend API")

# Load environment variables from backend/.env if present
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

# Initialize Firebase Admin (expects GOOGLE_APPLICATION_CREDENTIALS env or default credentials)
if not firebase_admin._apps:
    try:
        creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if creds_path:
            firebase_admin.initialize_app(credentials.Certificate(creds_path))
        else:
            firebase_admin.initialize_app()
        logger.info("Firebase Admin initialized")
    except Exception as e:
        logger.warning(f"WARNING: Firebase Admin initialization failed: {e}")


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
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# Admin allowlist (server-side authority). Configure via ADMIN_EMAILS env (comma-separated).
ADMIN_EMAILS = {
    e.strip().lower()
    for e in os.getenv("ADMIN_EMAILS", "anshu@stellatone.com,admin@visionsafe.io").split(",")
    if e.strip()
}


def require_user(authorization: str | None = Header(default=None)) -> str:
    """
    FastAPI dependency: verify the Firebase Bearer token and return the
    authenticated (normalized) email. Raises 401 if the token is missing/invalid.
    This is the single source of identity for protected endpoints.
    """
    email = get_email_from_token(authorization)
    return email.strip().lower()


def require_admin(email: str = Depends(require_user)) -> str:
    """FastAPI dependency: require an authenticated user who is in the admin allowlist."""
    if email not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    return email


# Simple in-memory fixed-window rate limiter (per-key). Good enough to blunt
# abuse of unauthenticated endpoints on a single instance; swap for Redis if
# the app is ever scaled horizontally.
from collections import defaultdict
import time as _time
import threading as _threading

_rate_lock = _threading.Lock()
_rate_hits: dict[str, list[float]] = defaultdict(list)


def rate_limit(key: str, max_calls: int, window_seconds: int) -> bool:
    """Return True if the call is allowed, False if the key is over its quota."""
    now = _time.time()
    with _rate_lock:
        hits = [t for t in _rate_hits[key] if now - t < window_seconds]
        if len(hits) >= max_calls:
            _rate_hits[key] = hits
            return False
        hits.append(now)
        _rate_hits[key] = hits
        return True

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    logger.info("Initializing database...")
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.warning(f"WARNING: Database initialization: {e}")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:5173",
        "https://vision-ai-delta.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories
UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("output")
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# Maximum allowed upload size (bytes). Configurable via MAX_UPLOAD_MB env.
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_MB", "200")) * 1024 * 1024

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
    user_email: str = Depends(require_user),
    db: Session = Depends(get_db)
):
    """
    Upload and process video file with AI safety detection.
    Requires a valid Firebase Bearer token; the video is owned by the
    authenticated user.

    Returns:
        JSON response with video_url and safety status
    """
    logger.info(f"Received video upload request from {user_email}: {file.filename}")

    try:
        # Validate file type (content_type may be absent on some clients)
        if not (file.content_type or "").startswith("video/"):
            logger.warning(f"Invalid file type: {file.content_type}")
            raise HTTPException(status_code=400, detail="File must be a video")

        # Generate unique filename
        file_extension = os.path.splitext(file.filename or "")[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        upload_path = UPLOAD_DIR / unique_filename

        logger.info(f"Saving uploaded file to: {upload_path}")

        # Stream the upload to disk while enforcing a hard size cap so a
        # malicious or runaway client cannot fill the disk.
        file_size = 0
        try:
            with open(upload_path, "wb") as buffer:
                while True:
                    chunk = await file.read(1024 * 1024)  # 1 MB chunks
                    if not chunk:
                        break
                    file_size += len(chunk)
                    if file_size > MAX_UPLOAD_BYTES:
                        buffer.close()
                        upload_path.unlink(missing_ok=True)
                        raise HTTPException(
                            status_code=413,
                            detail=f"File too large. Maximum size is {MAX_UPLOAD_BYTES // (1024 * 1024)} MB.",
                        )
                    buffer.write(chunk)
        except HTTPException:
            raise
        except Exception:
            upload_path.unlink(missing_ok=True)
            raise

        logger.info(f"File saved successfully. Size: {file_size} bytes")
        
        # Generate output filename
        output_filename = f"processed_{unique_filename}"
        output_path = OUTPUT_DIR / output_filename
        
        logger.info("Starting AI video processing...")
        
        # Process video with AI engine
        try:
            import time
            
            # Send alert: Processing started
            alert_start = time.time()
            await send_alert(
                message=f"Processing video: {file.filename}",
                alert_type="info",
                data={"filename": file.filename, "status": "processing"}
            )
            logger.info(f"⏱  Alert sent: {time.time() - alert_start:.2f}s")
            
            process_start = time.time()
            result = process_video(
                input_path=str(upload_path),
                output_path=str(output_path)
            )
            process_time = time.time() - process_start
            
            logger.info(f"AI processing complete. Status: {result['status']}")
            logger.info(f"⏱️  Video processing time: {process_time:.2f}s")
            
            # Save to database
            try:
                db_start = time.time()
                # Fix: VideoCRUD uses static methods, no need to instantiate
                video = VideoCRUD.create_video(
                    db=db,
                    filename=file.filename,
                    user_email=user_email,
                    overall_status=result.get("status", "SAFE").upper(),  # Must be uppercase: SAFE or UNSAFE
                    upload_time=datetime.utcnow(),
                    processed_video_path=str(output_path),
                    confidence=float(result.get("confidence", 0.0)),
                    duration_seconds=float(result.get("duration", 0.0)),
                    total_frames=int(result.get("total_frames", 0)),
                    file_size_bytes=int(file_size)
                )
                
                logger.info(f"Video record created: {video.id}")
                logger.info(f"⏱️  Database video save: {time.time() - db_start:.2f}s")
                
                # Save detections if available - Use BULK INSERT for speed
                if "detections" in result and result["detections"]:
                    det_start = time.time()
                    
                    # OPTIMIZATION: Limit detections to save (first 100) and use bulk insert
                    detections_to_save = result["detections"][:100]
                    
                    # Add video_id to each detection
                    for detection in detections_to_save:
                        detection["video_id"] = video.id
                    
                    # Bulk insert all detections at once (MUCH FASTER!)
                    DetectionCRUD.bulk_create_detections(db, detections_to_save)
                    
                    logger.info(f"Created {len(detections_to_save)} detection records (bulk insert)")
                    logger.info(f"⏱️  Database detections save: {time.time() - det_start:.2f}s")
            
            except Exception as db_error:
                logger.error(f"❌ DATABASE ERROR: {db_error}")
                logger.error(f"Error type: {type(db_error).__name__}")
                import traceback
                logger.error(f"Traceback: {traceback.format_exc()}")
                # Continue anyway - video is processed even if DB save fails
            
            # Send alert based on detection result
            alert2_start = time.time()
            if result["status"] == "UNSAFE":
                await send_alert(
                    message=f"WARNING: UNSAFE activity detected in {file.filename}!",
                    alert_type="danger",
                    data={
                        "filename": file.filename,
                        "status": result["status"],
                        "confidence": result.get("confidence", 0.0),
                        "unsafe_events": result.get("unsafe_events", [])[:20]  # Limit events in alert
                    }
                )
            else:
                await send_alert(
                    message=f"Video {file.filename} processed successfully - All Safe",
                    alert_type="success",
                    data={
                        "filename": file.filename,
                        "status": result["status"],
                        "detected_activities": result.get("detected_activities", [])
                    }
                )
            logger.info(f"⏱️  Final alert sent: {time.time() - alert2_start:.2f}s")
            
            # Build response
            response_start = time.time()
            response_data = {
                "video_url": f"/output/{output_filename}",
                "status": result["status"],
                "message": "Video processed successfully",
                "confidence": result.get("confidence", 0.0),
                "detected_activities": result.get("detected_activities", []),
                "unsafe_events": result.get("unsafe_events", [])[:50]  # Limit events in response
            }
            
            logger.info(f"Response prepared: {response_data.get('status')}")
            logger.info(f"⏱️  Response build: {time.time() - response_start:.2f}s")
            logger.info(f"⏱️  TOTAL TIME: {time.time() - process_start:.2f}s")
            return JSONResponse(content=response_data)
            
        except Exception as ai_error:
            logger.error(f"AI processing failed: {str(ai_error)}")
            raise HTTPException(
                status_code=500,
                detail="Video processing failed"
            )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}


# Database API Endpoints

class UpdateProfilePayload(BaseModel):
    mobile_number: str | None = None
    bio: str | None = None


class ContactPayload(BaseModel):
    name: str
    email: str
    subject: str
    message: str


class SubscribePayload(BaseModel):
    email: str

@app.get("/videos/history")
async def get_video_history(
    user_email: str = None,
    email: str = None,
    auth_email: str = Depends(require_user),
    db: Session = Depends(get_db),
):
    """
    Get video processing history. A user always sees only their own videos.
    Admins may pass ?user_email=... to view another user's history, or omit it
    to see the 100 most recent videos across all users.
    """
    try:
        requested = (user_email or email or "").strip().lower()
        is_admin = auth_email in ADMIN_EMAILS

        if not is_admin:
            # Non-admins are locked to their own history regardless of params.
            videos = VideoCRUD.get_videos_by_user(db, auth_email)
        elif requested:
            videos = VideoCRUD.get_videos_by_user(db, requested)
        else:
            videos = db.query(Video).order_by(Video.upload_time.desc()).limit(100).all()

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
                    "duration_seconds": v.duration_seconds,
                    "unsafe_percentage": round((1 - (v.confidence or 0)) * 100, 2) if v.confidence is not None else None,
                    "safe_percentage": round((v.confidence or 0) * 100, 2) if v.confidence is not None else None,
                    "video_url": f"/output/{Path(v.processed_video_path).name}" if v.processed_video_path else None
                }
                for v in videos
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching video history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch video history")

@app.get("/videos/stats")
async def get_user_stats(
    user_email: str = None,
    auth_email: str = Depends(require_user),
    db: Session = Depends(get_db),
):
    """Get safety statistics. Users see their own stats; admins may query any user."""
    try:
        requested = (user_email or "").strip().lower()
        if requested and requested != auth_email and auth_email not in ADMIN_EMAILS:
            raise HTTPException(status_code=403, detail="Cannot access another user's stats")
        target_email = requested or auth_email
        videos = VideoCRUD.get_videos_by_user(db, target_email)

        total_videos = len(videos)
        unsafe_count = len([v for v in videos if (v.overall_status or "").upper() == "UNSAFE"])
        safe_count = total_videos - unsafe_count
        avg_confidence = (
            sum((v.confidence or 0) for v in videos) / total_videos
            if total_videos > 0 else 0
        )

        return {
            "status": "success",
            "user_email": target_email,
            "total_videos": total_videos,
            "safe_videos": safe_count,
            "unsafe_videos": unsafe_count,
            "average_confidence": round(avg_confidence, 3),
            "unsafe_percentage": round((unsafe_count / total_videos * 100) if total_videos > 0 else 0, 2)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch user stats")

def _get_owned_video(db: Session, video_id: str, auth_email: str):
    """Fetch a video and enforce that the caller owns it (or is an admin)."""
    video = VideoCRUD.get_video(db, video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    if video.user_email != auth_email and auth_email not in ADMIN_EMAILS:
        # Don't reveal existence of other users' videos.
        raise HTTPException(status_code=404, detail="Video not found")
    return video


@app.get("/videos/{video_id}")
async def get_video_details(
    video_id: str,
    auth_email: str = Depends(require_user),
    db: Session = Depends(get_db),
):
    """Get details for a specific video (owner or admin only)"""
    try:
        video = _get_owned_video(db, video_id, auth_email)

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
        raise HTTPException(status_code=500, detail="Failed to fetch video details")

@app.get("/videos/{video_id}/detections")
async def get_video_detections(
    video_id: str,
    auth_email: str = Depends(require_user),
    db: Session = Depends(get_db),
):
    """Get all detections for a specific video (owner or admin only)"""
    try:
        # Enforce ownership before returning detection data.
        _get_owned_video(db, video_id, auth_email)
        detections = DetectionCRUD.get_detections_by_video(db, video_id)

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
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching detections: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch detections")

@app.delete("/videos/{video_id}")
async def delete_video(
    video_id: str,
    auth_email: str = Depends(require_user),
    db: Session = Depends(get_db),
):
    """Delete a video and its detections (owner or admin only)"""
    try:
        video = _get_owned_video(db, video_id, auth_email)

        # Delete associated file (path may be NULL if processing never finished)
        if video.processed_video_path and os.path.exists(video.processed_video_path):
            os.remove(video.processed_video_path)
            logger.info(f"Deleted file: {video.processed_video_path}")

        # Delete from database (cascades to detections)
        VideoCRUD.delete_video(db, video_id)

        return {
            "status": "success",
            "message": f"Video {video_id} deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting video: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete video")

@app.post("/newsletter/subscribe")
async def subscribe_newsletter(
    payload: SubscribePayload,
    request: Request,
    db: Session = Depends(get_db),
):
    """Subscribe email to newsletter with welcome email"""
    try:
        email = payload.email.strip().lower()

        # Validate email format
        import re
        email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_regex, email):
            raise HTTPException(status_code=400, detail="Invalid email format")

        # Rate-limit by client IP to prevent using this unauthenticated endpoint
        # as a welcome-email spam relay against arbitrary addresses.
        client_ip = request.client.host if request.client else "unknown"
        if not rate_limit(f"subscribe:{client_ip}", max_calls=5, window_seconds=3600):
            raise HTTPException(
                status_code=429,
                detail="Too many subscription attempts. Please try again later.",
            )

        # Subscribe to database first (this must succeed)
        try:
            subscriber, is_new = NewsletterCRUD.subscribe(db, email)
            logger.info(f"✅ Database subscription successful for {email}")
        except HTTPException:
            raise
        except Exception as db_error:
            logger.error(f"❌ Database error: {db_error}")
            raise HTTPException(status_code=500, detail="Failed to save subscription")
        
        # Try to send welcome email (don't fail if this doesn't work)
        if is_new:
            logger.info(f"New subscriber: {email}. Attempting to send welcome email...")
            try:
                email_sent = send_welcome_email(email, str(subscriber.unsubscribe_token))
                
                if email_sent:
                    logger.info(f"✅ Welcome email sent to {email}")
                    message = "Successfully subscribed! Check your email for a warm welcome from VisionSafe."
                else:
                    logger.warning(f"⚠️ Email not sent to {email}")
                    message = "Successfully subscribed! Welcome to VisionSafe."
            except Exception as email_error:
                logger.error(f"⚠️ Email sending failed for {email}: {email_error}")
                message = "Successfully subscribed! Welcome to VisionSafe."
        else:
            logger.info(f"Existing subscriber: {email}")
            message = "You're already subscribed! Thank you for your continued interest."
        
        return {
            "status": "success",
            "message": message,
            "email": email,
            "is_new": is_new
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Newsletter subscription error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Subscription failed")

@app.get("/newsletter/unsubscribe")
async def unsubscribe_newsletter(token: str, db: Session = Depends(get_db)):
    """Unsubscribe from newsletter using token"""
    try:
        success = NewsletterCRUD.unsubscribe(db, token)
        
        if success:
            return {
                "status": "success",
                "message": "Successfully unsubscribed from newsletter"
            }
        else:
            raise HTTPException(status_code=404, detail="Invalid unsubscribe token")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unsubscribe error: {e}")
        raise HTTPException(status_code=500, detail="Failed to unsubscribe")


@app.get("/user/profile")
async def get_user_profile(
    email: str = Depends(require_user),
    db: Session = Depends(get_db)
):
    """Get the authenticated user's profile"""
    try:
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
        raise HTTPException(status_code=500, detail="Failed to fetch user profile")


@app.post("/user/update-profile")
async def update_user_profile(
    payload: UpdateProfilePayload,
    email: str = Depends(require_user),
    db: Session = Depends(get_db)
):
    """Update the authenticated user's profile"""
    try:
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
        raise HTTPException(status_code=500, detail="Failed to save user profile")


@app.post("/contact")
async def send_contact(payload: ContactPayload):
    """Send contact form message to configured receiver"""
    try:
        sent = send_contact_email(
            name=payload.name,
            sender_email=payload.email,
            subject=payload.subject,
            message=payload.message
        )
        if not sent:
            raise HTTPException(
                status_code=500,
                detail="Failed to send message. Configure SMTP_USER, SMTP_PASSWORD, and FROM_EMAIL."
            )

        return {
            "status": "success",
            "message": "Message sent successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Contact form error: {e}")
        raise HTTPException(status_code=500, detail="Failed to send message")


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
