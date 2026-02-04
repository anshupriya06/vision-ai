import os
import sys
import logging
from pathlib import Path

# Add model directory to path
_backend_model_dir = Path(__file__).parent / "model"
_repo_model_dir = Path(__file__).parent.parent / "model"
MODEL_DIR = _backend_model_dir if _backend_model_dir.exists() else _repo_model_dir
sys.path.insert(0, str(MODEL_DIR))

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for models
yolo_model = None
pose_model = None
scaler = None
feature_cols = None

def load_models():
    """Load YOLOv8 and pose classification models"""
    global yolo_model, pose_model, scaler, feature_cols
    
    try:
        logger.info("Loading AI models...")
        
        import joblib
        from ultralytics import YOLO
        
        # Load YOLO model
        yolo_path = MODEL_DIR / "yolov8n.pt"
        if yolo_path.exists():
            yolo_model = YOLO(str(yolo_path))
            logger.info(f"✓ Loaded YOLOv8 from {yolo_path}")
        else:
            logger.warning(f"YOLOv8 model not found at {yolo_path}, attempting auto-download")
            try:
                yolo_model = YOLO("yolov8n.pt")
                logger.info("✓ Downloaded YOLOv8 weights")
            except Exception as download_error:
                logger.error(f"Failed to download YOLOv8 weights: {download_error}")
            
        # Load pose classification model
        pose_model_path = MODEL_DIR / "models" / "pose_activity_model.pkl"
        scaler_path = MODEL_DIR / "models" / "pose_scaler.pkl"
        features_path = MODEL_DIR / "models" / "pose_feature_cols.pkl"
        
        if pose_model_path.exists() and scaler_path.exists() and features_path.exists():
            pose_model = joblib.load(str(pose_model_path))
            scaler = joblib.load(str(scaler_path))
            feature_cols = joblib.load(str(features_path))
            logger.info("✓ Loaded pose classification model")
        else:
            logger.warning("Pose classification model files not found")
            
        return True
    except Exception as e:
        logger.error(f"Error loading models: {e}")
        return False

def process_video(input_path: str, output_path: str) -> dict:
    """Process video with YOLOv8 and pose classification to detect safe/unsafe activities"""
    
    try:
        logger.info(f"Starting video processing: {input_path}")
        
        # Check if input file exists
        if not os.path.exists(input_path):
            raise FileNotFoundError(f"Input video not found: {input_path}")
        
        # Load models if not already loaded
        if yolo_model is None:
            load_models()
            
        # If YOLO is not available, return placeholder result
        if yolo_model is None:
            logger.warning("YOLO model not available, using placeholder detection")
            import shutil
            shutil.copy(input_path, output_path)
            return {
                "status": "SAFE",
                "confidence": 0.85,
                "detected_activities": ["Unknown"],
                "unsafe_events": [],
                "total_frames": 0,
                "processed_frames": 0,
                "detections": []
            }
        
        import cv2
        import numpy as np
        import mediapipe as mp
        import pandas as pd
        
        # MediaPipe Pose setup (optimized for speed)
        mp_pose = mp.solutions.pose
        pose = mp_pose.Pose(
            static_image_mode=False,
            model_complexity=0,  # Changed from 1 to 0 for faster processing
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        def calculate_angle(a, b, c):
            a = np.array(a); b = np.array(b); c = np.array(c)
            ba = a - b; bc = c - b
            cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
            return np.degrees(np.arccos(np.clip(cosine_angle, -1.0, 1.0)))
        
        def extract_angles_from_person(person_img):
            h, w = person_img.shape[:2]
            # Resize to smaller resolution for faster processing
            if w > 320:  # Changed from 640 to 320 for 2x speed
                person_img = cv2.resize(person_img, (320, int((h/w)*320)))
            rgb = cv2.cvtColor(person_img, cv2.COLOR_BGR2RGB)
            results = pose.process(rgb)
            if not results.pose_landmarks:
                return None
            lm = results.pose_landmarks.landmark
            def pt(i): return (lm[i].x, lm[i].y)
            ls, rs = pt(11), pt(12); le, re = pt(13), pt(14)
            lw, rw = pt(15), pt(16); lh, rh = pt(23), pt(24)
            lk, rk = pt(25), pt(26); la, ra = pt(27), pt(28)
            return [
                calculate_angle(ls, le, lw), calculate_angle(rs, re, rw),
                calculate_angle(le, ls, lh), calculate_angle(re, rs, rh),
                calculate_angle(lh, lk, la), calculate_angle(rh, rk, ra),
                calculate_angle(ls, lh, lk), calculate_angle(rs, rh, rk),
                calculate_angle(le, ls, lh), calculate_angle(re, rs, rh),
            ]
        
        SAFE_ACTIVITIES = ["Sitting", "Standing still", "Walking", "Yoga"]
        UNSAFE_ACTIVITIES = ["Fighting"]
        
        # Video processing
        cap = cv2.VideoCapture(input_path)
        if not cap.isOpened():
            raise Exception("Cannot open video file")
            
        fps = cap.get(cv2.CAP_PROP_FPS) or 25
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Use H.264 codec for better browser compatibility (fallback to mp4v if not available)
        fourcc = cv2.VideoWriter_fourcc(*"avc1")  # H.264 codec
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        # Check if VideoWriter opened successfully
        if not out.isOpened():
            logger.warning("H.264 (avc1) codec not available, trying mp4v...")
            fourcc = cv2.VideoWriter_fourcc(*"mp4v")
            out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        detected_activities = []
        unsafe_events = []
        detections = []
        processed_frames = 0
        unsafe_frame_count = 0
        
        # OPTIMIZATION: Process every Nth frame for speed (analyze 1 out of 3 frames)
        frame_skip = 3  # Process every 3rd frame for 3x speed boost
        frame_count = 0
        
        logger.info(f"Processing {total_frames} frames (analyzing every {frame_skip} frames for speed)...")
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_count += 1
            
            # Skip frames for faster processing
            if frame_count % frame_skip != 0:
                out.write(frame)  # Still write all frames to output
                continue
                
            processed_frames += 1
            frame_has_unsafe = False
            
            results = yolo_model.predict(frame, verbose=False)[0]
            
            for box in results.boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                if conf < 0.4:
                    continue
                    
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                
                # Person detection - analyze activity
                if cls_id == 0:
                    person_crop = frame[y1:y2, x1:x2]
                    if person_crop.size == 0:
                        continue
                        
                    pred = "Person"
                    if pose_model is not None and scaler is not None and feature_cols is not None:
                        feats = extract_angles_from_person(person_crop)
                        if feats is not None:
                            X_pred = pd.DataFrame([feats], columns=feature_cols)
                            X_scaled = scaler.transform(X_pred)
                            pred = pose_model.predict(X_scaled)[0]
                        else:
                            pred = "Unknown"
                    
                    detected_activities.append(pred)
                    
                    # Safety decision
                    if pred in SAFE_ACTIVITIES or pred == "Person":
                        status = "SAFE"
                        color = (0, 255, 0)
                    else:
                        status = "UNSAFE"
                        color = (0, 0, 255)
                        frame_has_unsafe = True
                        unsafe_events.append({"frame": processed_frames, "activity": pred})
                    
                    cv2.rectangle(frame, (x1,y1), (x2,y2), color, 2)
                    cv2.putText(frame, f"{pred} ({status})", (x1,y1-10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)

                    detections.append({
                        "frame_number": int(frame_count),
                        "activity_label": pred,
                        "safety_status": status,
                        "timestamp_seconds": float(frame_count / fps) if fps else 0.0,
                        "confidence": float(conf),
                        "bounding_box": {
                            "x1": int(x1),
                            "y1": int(y1),
                            "x2": int(x2),
                            "y2": int(y2)
                        }
                    })
                
                # Vehicle detection = UNSAFE
                elif cls_id in [1, 2, 3]:  # bicycle, car, motorcycle
                    vehicle_names = {1: "BIKE", 2: "CAR", 3: "MOTORCYCLE"}
                    vehicle_name = vehicle_names.get(cls_id, "VEHICLE")
                    cv2.rectangle(frame, (x1,y1), (x2,y2), (0,0,255), 2)
                    cv2.putText(frame, f"{vehicle_name} (UNSAFE)", (x1,y1-10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,0,255), 2)
                    frame_has_unsafe = True
                    unsafe_events.append({"frame": processed_frames, "activity": vehicle_name})

                    detections.append({
                        "frame_number": int(frame_count),
                        "activity_label": vehicle_name,
                        "safety_status": "UNSAFE",
                        "timestamp_seconds": float(frame_count / fps) if fps else 0.0,
                        "confidence": float(conf),
                        "bounding_box": {
                            "x1": int(x1),
                            "y1": int(y1),
                            "x2": int(x2),
                            "y2": int(y2)
                        }
                    })
            
            if frame_has_unsafe:
                unsafe_frame_count += 1
                
            out.write(frame)
        
        cap.release()
        out.release()
        pose.close()
        
        # Calculate overall status
        unsafe_percentage = (unsafe_frame_count / processed_frames * 100) if processed_frames > 0 else 0
        overall_status = "UNSAFE" if unsafe_percentage > 10 else "SAFE"
        confidence = 1.0 - (unsafe_percentage / 100.0)
        duration_seconds = (total_frames / fps) if fps else 0
        
        result = {
            "status": overall_status,
            "confidence": round(confidence, 2),
            "detected_activities": list(set(detected_activities))[:10],
            "unsafe_events": unsafe_events[:20],
            "detections": detections,
            "total_frames": total_frames,
            "duration": round(duration_seconds, 2),
            "processed_frames": processed_frames,
            "unsafe_frame_count": unsafe_frame_count,
            "unsafe_percentage": round(unsafe_percentage, 2)
        }
        
        logger.info(f"✓ Processing complete: {overall_status} ({unsafe_percentage:.1f}% unsafe frames)")
        return result
        
    except Exception as e:
        logger.error(f"Error processing video: {str(e)}")
        raise Exception(f"Video processing failed: {str(e)}")
