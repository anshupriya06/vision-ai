import os
import sys
import logging
import threading
import urllib.request
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MODEL_DIR = Path(__file__).parent / "model"

yolo_model = None
pose_clf = None
pose_scaler = None
pose_feature_cols = None

# Guards lazy model loading so concurrent requests don't race on the globals.
_model_lock = threading.Lock()

VEHICLE_CLASSES = {
    1: "Bicycle",
    2: "Car",
    3: "Motorcycle",
    5: "Bus",
    7: "Truck",
}

SAFE_ACTIVITIES = {"Walking", "Running", "Standing", "Standing Still", "Sitting", "Sit Down", "Yoga"}


def load_models():
    global yolo_model, pose_clf, pose_scaler, pose_feature_cols
    try:
        import joblib
        from ultralytics import YOLO

        # YOLO
        yolo_path = MODEL_DIR / "yolov8n.pt"
        if yolo_path.exists():
            yolo_model = YOLO(str(yolo_path))
            logger.info(f"✓ Loaded YOLOv8 from {yolo_path}")
        else:
            logger.info("Downloading YOLOv8n weights...")
            yolo_model = YOLO("yolov8n.pt")
            logger.info("✓ Downloaded YOLOv8n weights")

        # Pose activity classifier (trained pkl)
        clf_path  = MODEL_DIR / "models" / "pose_activity_model.pkl"
        scaler_path = MODEL_DIR / "models" / "pose_scaler.pkl"
        cols_path   = MODEL_DIR / "models" / "pose_feature_cols.pkl"
        if clf_path.exists() and scaler_path.exists() and cols_path.exists():
            pose_clf          = joblib.load(str(clf_path))
            pose_scaler       = joblib.load(str(scaler_path))
            pose_feature_cols = joblib.load(str(cols_path))
            classes = list(getattr(pose_clf, 'classes_', []))
            logger.info(f"✓ Loaded pose activity classifier — classes: {classes}")
        else:
            logger.warning("Pose classifier pkl files not found — using rule-based fallback")

        return True
    except Exception as e:
        logger.error(f"Failed to load models: {e}")
        return False


def _get_pose_landmarker():
    """Download pose landmarker model if needed and return its path."""
    task_path = MODEL_DIR / "models" / "pose_landmarker.task"
    if not task_path.exists():
        MODEL_DIR.mkdir(parents=True, exist_ok=True)
        url = (
            "https://storage.googleapis.com/mediapipe-models/"
            "pose_landmarker/pose_landmarker_lite/float16/latest/"
            "pose_landmarker_lite.task"
        )
        logger.info("Downloading MediaPipe pose landmarker model...")
        urllib.request.urlretrieve(url, str(task_path))
        logger.info("✓ Downloaded pose_landmarker.task")
    return str(task_path)


def _classify_activity(landmarks):
    """
    Rule-based activity classification from MediaPipe pose landmarks.
    Uses joint angles to determine what the person is doing.
    Returns one of: Walking, Running, Standing, Sitting, Yoga
    """
    import numpy as np

    def pt(i):
        return np.array([landmarks[i].x, landmarks[i].y])

    def angle(a, b, c):
        ba = a - b
        bc = c - b
        cos = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
        return np.degrees(np.arccos(np.clip(cos, -1.0, 1.0)))

    # Key landmarks
    left_shoulder  = pt(11); right_shoulder = pt(12)
    left_hip       = pt(23); right_hip      = pt(24)
    left_knee      = pt(25); right_knee     = pt(26)
    left_ankle     = pt(27); right_ankle    = pt(28)
    left_elbow     = pt(13); right_elbow    = pt(14)
    left_wrist     = pt(15); right_wrist    = pt(16)

    left_knee_angle  = angle(left_hip,  left_knee,  left_ankle)
    right_knee_angle = angle(right_hip, right_knee, right_ankle)
    avg_knee_angle   = (left_knee_angle + right_knee_angle) / 2

    left_hip_angle  = angle(left_shoulder,  left_hip,  left_knee)
    right_hip_angle = angle(right_shoulder, right_hip, right_knee)
    avg_hip_angle   = (left_hip_angle + right_hip_angle) / 2

    left_arm_angle  = angle(left_shoulder,  left_elbow,  left_wrist)
    right_arm_angle = angle(right_shoulder, right_elbow, right_wrist)
    avg_arm_angle   = (left_arm_angle + right_arm_angle) / 2

    # Vertical torso: hip y vs shoulder y (normalized coords, y increases downward)
    hip_y      = (left_hip[1] + right_hip[1]) / 2
    shoulder_y = (left_shoulder[1] + right_shoulder[1]) / 2
    torso_vertical = hip_y - shoulder_y  # positive = upright

    # Sitting: knees heavily bent, hips bent
    if avg_knee_angle < 110 and avg_hip_angle < 120:
        return "Sitting"

    # Yoga: one or both knees very bent with arms extended (wide arm angle)
    if avg_knee_angle < 130 and avg_arm_angle > 140 and torso_vertical > 0.1:
        return "Yoga"

    # Running: knees bent more than walking, torso upright
    if 110 <= avg_knee_angle < 155 and torso_vertical > 0.15:
        return "Running"

    # Walking: moderate knee bend
    if 155 <= avg_knee_angle < 170 and torso_vertical > 0.1:
        return "Walking"

    # Default: Standing
    return "Standing"


def _extract_angles(landmarks):
    """Extract 10 joint angles from MediaPipe landmarks for the pkl classifier."""
    import numpy as np

    def pt(i):
        return np.array([landmarks[i].x, landmarks[i].y])

    def angle(a, b, c):
        ba = a - b
        bc = c - b
        cos = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
        return float(np.degrees(np.arccos(np.clip(cos, -1.0, 1.0))))

    try:
        ls, rs = pt(11), pt(12)
        le, re = pt(13), pt(14)
        lw, rw = pt(15), pt(16)
        lh, rh = pt(23), pt(24)
        lk, rk = pt(25), pt(26)
        la, ra = pt(27), pt(28)
        return [
            angle(ls, le, lw), angle(rs, re, rw),
            angle(le, ls, lh), angle(re, rs, rh),
            angle(lh, lk, la), angle(rh, rk, ra),
            angle(ls, lh, lk), angle(rs, rh, rk),
            angle(le, ls, lh), angle(re, rs, rh),
        ]
    except Exception:
        return None


class BoundingBoxTracker:
    """Smooth bounding boxes using exponential moving average to reduce flicker."""

    def __init__(self, smoothing=0.7):
        self.tracks = {}
        self.next_id = 0
        self.smoothing = smoothing
        self.max_missing = 15

    def update(self, detections):
        import numpy as np

        for track in self.tracks.values():
            track["missing"] += 1

        stale = [tid for tid, t in self.tracks.items() if t["missing"] > self.max_missing]
        for tid in stale:
            del self.tracks[tid]

        smoothed = []
        for det in detections:
            x1, y1, x2, y2 = det["box"]
            label = det["label"]
            best_id, best_iou = None, 0.2

            for tid, track in self.tracks.items():
                if track["label"] != label:
                    continue
                iou = self._iou([x1, y1, x2, y2], track["box"])
                if iou > best_iou:
                    best_iou = iou
                    best_id = tid

            if best_id is not None:
                ob = self.tracks[best_id]["box"]
                s = self.smoothing
                new_box = [
                    int(s * ob[0] + (1 - s) * x1),
                    int(s * ob[1] + (1 - s) * y1),
                    int(s * ob[2] + (1 - s) * x2),
                    int(s * ob[3] + (1 - s) * y2),
                ]
                self.tracks[best_id]["box"] = new_box
                self.tracks[best_id]["missing"] = 0
                smoothed.append({**det, "box": new_box, "track_id": best_id})
            else:
                tid = self.next_id
                self.next_id += 1
                self.tracks[tid] = {"box": [x1, y1, x2, y2], "label": label, "missing": 0}
                smoothed.append({**det, "box": [x1, y1, x2, y2], "track_id": tid})

        return smoothed

    def _iou(self, a, b):
        ix1 = max(a[0], b[0]); iy1 = max(a[1], b[1])
        ix2 = min(a[2], b[2]); iy2 = min(a[3], b[3])
        if ix2 <= ix1 or iy2 <= iy1:
            return 0.0
        inter = (ix2 - ix1) * (iy2 - iy1)
        area_a = (a[2] - a[0]) * (a[3] - a[1])
        area_b = (b[2] - b[0]) * (b[3] - b[1])
        return inter / (area_a + area_b - inter + 1e-6)


def process_video(input_path: str, output_path: str) -> dict:
    # Resources that must always be released, even on error (declared up front
    # so the finally block can reference them no matter where we fail).
    cap = None
    out = None
    pose_landmarker = None
    try:
        logger.info(f"Starting video processing: {input_path}")

        if not os.path.exists(input_path):
            raise FileNotFoundError(f"Input video not found: {input_path}")

        if yolo_model is None:
            # Double-checked locking: only one thread loads the shared models.
            with _model_lock:
                if yolo_model is None:
                    success = load_models()
                    if not success or yolo_model is None:
                        raise RuntimeError("YOLO model could not be loaded. Check your internet connection or model path.")

        import cv2
        import numpy as np
        import mediapipe as mp
        from mediapipe.tasks import python as mp_python
        from mediapipe.tasks.python import vision as mp_vision

        # Setup MediaPipe PoseLandmarker
        task_path = _get_pose_landmarker()
        base_options = mp_python.BaseOptions(model_asset_path=task_path)
        pose_options = mp_vision.PoseLandmarkerOptions(
            base_options=base_options,
            running_mode=mp_vision.RunningMode.IMAGE,
            num_poses=1,
            min_pose_detection_confidence=0.5,
            min_pose_presence_confidence=0.5,
        )
        pose_landmarker = mp_vision.PoseLandmarker.create_from_options(pose_options)

        tracker = BoundingBoxTracker(smoothing=0.7)

        cap = cv2.VideoCapture(input_path)
        if not cap.isOpened():
            raise RuntimeError("Cannot open video file")

        fps          = cap.get(cv2.CAP_PROP_FPS) or 25
        width        = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height       = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        # Some containers report 0x0 dimensions; the VideoWriter would silently
        # drop every frame, producing an empty output. Fail loudly instead.
        if width <= 0 or height <= 0:
            raise RuntimeError(f"Invalid video dimensions {width}x{height}; cannot process file")

        # Process every Nth frame; draw cached results on skipped frames
        # Target ~8 AI inferences/sec regardless of source fps
        PROCESS_EVERY = max(1, int(round(fps / 8)))

        fourcc = cv2.VideoWriter_fourcc(*"avc1")
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        if not out.isOpened():
            fourcc = cv2.VideoWriter_fourcc(*"mp4v")
            out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        if not out.isOpened():
            raise RuntimeError("Could not open VideoWriter for output file")

        detected_activities = []
        unsafe_events       = []
        all_detections      = []
        frame_count         = 0
        processed_frames    = 0
        unsafe_frame_count  = 0
        last_smoothed       = []  # cached detections reused on skipped frames

        logger.info(f"Processing {total_frames} frames at {fps:.1f} fps (every {PROCESS_EVERY} frames)...")

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            frame_count += 1
            is_inference_frame = (frame_count % PROCESS_EVERY == 0) or frame_count == 1

            if is_inference_frame:
                processed_frames += 1
                frame_has_unsafe = False
                frame_detections = []

                # Downscale for inference, keep original for writing
                infer_w = min(width, 640)
                scale   = infer_w / width
                infer_frame = cv2.resize(frame, (infer_w, int(height * scale))) if scale < 1.0 else frame

                # ── YOLO object detection ──────────────────────────────────────
                yolo_results = yolo_model.predict(infer_frame, verbose=False)[0]

                inv = 1.0 / scale if scale < 1.0 else 1.0

                for box in yolo_results.boxes:
                    cls_id = int(box.cls[0])
                    conf   = float(box.conf[0])
                    if conf < 0.4:
                        continue

                    # Scale coords back to original resolution
                    x1, y1, x2, y2 = (int(v * inv) for v in box.xyxy[0])
                    x1, y1 = max(0, x1), max(0, y1)
                    x2, y2 = min(width, x2), min(height, y2)

                    # ── Person: use MediaPipe for activity classification ──
                    if cls_id == 0:
                        crop = frame[y1:y2, x1:x2]
                        if crop.size == 0:
                            continue

                        activity = "Person"
                        h, w = crop.shape[:2]
                        if w > 256:
                            crop = cv2.resize(crop, (256, int(h * 256 / w)))

                        rgb      = cv2.cvtColor(crop, cv2.COLOR_BGR2RGB)
                        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
                        result   = pose_landmarker.detect(mp_image)

                        if result.pose_landmarks:
                            landmarks = result.pose_landmarks[0]
                            if pose_clf is not None and pose_scaler is not None and pose_feature_cols is not None:
                                import pandas as pd
                                angles = _extract_angles(landmarks)
                                if angles is not None:
                                    X = pd.DataFrame([angles], columns=pose_feature_cols)
                                    X_scaled = pose_scaler.transform(X)
                                    activity = str(pose_clf.predict(X_scaled)[0]).strip().title()
                                else:
                                    activity = _classify_activity(landmarks)
                            else:
                                activity = _classify_activity(landmarks)

                        detected_activities.append(activity)
                        is_safe = activity in SAFE_ACTIVITIES or activity == "Person"
                        status  = "SAFE" if is_safe else "UNSAFE"
                        color   = (0, 200, 0) if is_safe else (0, 0, 255)

                        if not is_safe:
                            frame_has_unsafe = True
                            unsafe_events.append({"frame": frame_count, "activity": activity})

                        frame_detections.append({
                            "box": [x1, y1, x2, y2],
                            "label": activity,
                            "status": status,
                            "color": color,
                            "conf": conf,
                        })

                    # ── Vehicle: always UNSAFE ────────────────────────────
                    elif cls_id in VEHICLE_CLASSES:
                        label = VEHICLE_CLASSES[cls_id]
                        frame_has_unsafe = True
                        unsafe_events.append({"frame": frame_count, "activity": label})

                        frame_detections.append({
                            "box": [x1, y1, x2, y2],
                            "label": label,
                            "status": "UNSAFE",
                            "color": (0, 0, 255),
                            "conf": conf,
                        })

                last_smoothed = tracker.update(frame_detections)

                for det in last_smoothed:
                    all_detections.append({
                        "frame_number":      frame_count,
                        "activity_label":    det["label"],
                        "safety_status":     det["status"],
                        "timestamp_seconds": round(frame_count / fps, 2),
                        "confidence":        round(det["conf"], 2),
                        "bounding_box":      {"x1": det["box"][0], "y1": det["box"][1],
                                              "x2": det["box"][2], "y2": det["box"][3]},
                    })

                if frame_has_unsafe:
                    unsafe_frame_count += 1

            # ── Draw cached boxes on every frame (inference or skipped) ──
            for det in last_smoothed:
                x1, y1, x2, y2 = det["box"]
                color = det["color"]
                conf  = det["conf"]
                text  = f"{det['label']} {conf:.0%}"
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                cv2.putText(frame, text, (x1, max(y1 - 8, 0)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.55, color, 2)

            out.write(frame)

        unsafe_pct     = (unsafe_frame_count / processed_frames * 100) if processed_frames else 0
        overall_status = "UNSAFE" if unsafe_pct > 10 else "SAFE"
        confidence     = round(1.0 - unsafe_pct / 100.0, 2)
        duration       = round(total_frames / fps, 2) if fps else 0

        logger.info(f"✓ Done: {overall_status} ({unsafe_pct:.1f}% unsafe frames)")

        return {
            "status":              overall_status,
            "confidence":          confidence,
            "detected_activities": list(set(detected_activities))[:10],
            "unsafe_events":       unsafe_events[:50],
            "detections":          all_detections[:500],
            "total_frames":        total_frames,
            "duration":            duration,
            "processed_frames":    processed_frames,
            "unsafe_frame_count":  unsafe_frame_count,
            "unsafe_percentage":   round(unsafe_pct, 2),
        }

    except Exception as e:
        logger.error(f"Video processing error: {e}")
        raise Exception(f"Video processing failed: {e}")

    finally:
        # Always release native resources, even if processing failed midway.
        try:
            if cap is not None:
                cap.release()
        except Exception:
            pass
        try:
            if out is not None:
                out.release()
        except Exception:
            pass
        try:
            if pose_landmarker is not None:
                pose_landmarker.close()
        except Exception:
            pass
