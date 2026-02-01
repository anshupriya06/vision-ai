import cv2
import numpy as np
import mediapipe as mp
import joblib
from ultralytics import YOLO
import pandas as pd

# -------------------- CONFIG --------------------
INPUT_VIDEO = "input-unsafe.mp4"
OUTPUT_VIDEO = "output-unsafe.mp4"

# -------------------- LOAD MODELS --------------------
yolo = YOLO("yolov8n.pt")

pose_model = joblib.load("pose_activity_model.pkl")
scaler = joblib.load("pose_scaler.pkl")
FEATURE_COLS = joblib.load("pose_feature_cols.pkl")

# -------------------- SAFETY RULES --------------------
SAFE_ACTIVITIES = ["Sitting", "Standing still", "Walking", "Yoga"]
UNSAFE_ACTIVITIES = ["Fighting"]

# -------------------- MEDIAPIPE POSE --------------------
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    static_image_mode=False,
    model_complexity=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# -------------------- ANGLE FUNCTION --------------------
def calculate_angle(a, b, c):
    a = np.array(a); b = np.array(b); c = np.array(c)
    ba = a - b
    bc = c - b
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
    return np.degrees(np.arccos(np.clip(cosine_angle, -1.0, 1.0)))

# -------------------- POSE FEATURE EXTRACTION --------------------
def extract_angles_from_person(person_img):
    h, w = person_img.shape[:2]
    if w > 640:
        person_img = cv2.resize(person_img, (640, int((h/w)*640)))

    rgb = cv2.cvtColor(person_img, cv2.COLOR_BGR2RGB)
    results = pose.process(rgb)

    if not results.pose_landmarks:
        return None

    lm = results.pose_landmarks.landmark
    def pt(i): return (lm[i].x, lm[i].y)

    LS, RS = 11, 12
    LE, RE = 13, 14
    LW, RW = 15, 16
    LH, RH = 23, 24
    LK, RK = 25, 26
    LA, RA = 27, 28

    ls, rs = pt(LS), pt(RS)
    le, re = pt(LE), pt(RE)
    lw, rw = pt(LW), pt(RW)
    lh, rh = pt(LH), pt(RH)
    lk, rk = pt(LK), pt(RK)
    la, ra = pt(LA), pt(RA)

    return [
        calculate_angle(ls, le, lw),
        calculate_angle(rs, re, rw),
        calculate_angle(le, ls, lh),
        calculate_angle(re, rs, rh),
        calculate_angle(lh, lk, la),
        calculate_angle(rh, rk, ra),
        calculate_angle(ls, lh, lk),
        calculate_angle(rs, rh, rk),
        calculate_angle(le, ls, lh),
        calculate_angle(re, rs, rh),
    ]

# -------------------- VIDEO SETUP --------------------
cap = cv2.VideoCapture(INPUT_VIDEO)
if not cap.isOpened():
    print("Cannot open video")
    exit()

fps = cap.get(cv2.CAP_PROP_FPS) or 25
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

out = cv2.VideoWriter(OUTPUT_VIDEO, cv2.VideoWriter_fourcc(*"mp4v"), fps, (width, height))

print(" Processing video...")

# -------------------- MAIN LOOP --------------------
while True:
    ret, frame = cap.read()
    if not ret:
        break

    results = yolo.predict(frame, verbose=False)[0]

    for box in results.boxes:
        cls_id = int(box.cls[0])
        conf = float(box.conf[0])
        if conf < 0.4:
            continue

        x1, y1, x2, y2 = map(int, box.xyxy[0])

        # ---------------- PERSON ACTIVITY ----------------
        if cls_id == 0:
            person_crop = frame[y1:y2, x1:x2]
            if person_crop.size == 0:
                continue

            feats = extract_angles_from_person(person_crop)

            if feats is not None:
                X_pred = pd.DataFrame([feats], columns=FEATURE_COLS)
                X_scaled = scaler.transform(X_pred)
                pred = pose_model.predict(X_scaled)[0]
            else:
                pred = "Unknown"

            # SAFETY DECISION
            if pred in SAFE_ACTIVITIES:
                status = "SAFE"
                color = (0, 255, 0)
            else:
                status = "UNSAFE"
                color = (0, 0, 255)

            cv2.rectangle(frame, (x1,y1), (x2,y2), color, 2)
            cv2.putText(frame, f"{pred} ({status})", (x1,y1-10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)

        # ---------------- CAR = UNSAFE ----------------
        elif cls_id == 2:
            cv2.rectangle(frame, (x1,y1), (x2,y2), (0,0,255), 2)
            cv2.putText(frame, "CAR (UNSAFE)", (x1,y1-10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,0,255), 2)

        # ---------------- BIKE = UNSAFE ----------------
        elif cls_id in [1,3]:
            cv2.rectangle(frame, (x1,y1), (x2,y2), (0,0,255), 2)
            cv2.putText(frame, "BIKE (UNSAFE)", (x1,y1-10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,0,255), 2)

    out.write(frame)

cap.release()
out.release()

print("Done! Output saved as:", OUTPUT_VIDEO)
