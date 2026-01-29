import os
import cv2
import numpy as np
import pandas as pd
from tqdm import tqdm
import mediapipe as mp

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    static_image_mode=False,
    model_complexity=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

FEATURE_COLS = [
    "left_elbow_angle", "right_elbow_angle",
    "left_shoulder_angle", "right_shoulder_angle",
    "left_knee_angle", "right_knee_angle",
    "left_hip_angle", "right_hip_angle",
    "torso_tilt_left", "torso_tilt_right"
]

def calculate_angle(a, b, c):
    a = np.array(a); b = np.array(b); c = np.array(c)
    ba = a - b
    bc = c - b
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
    angle = np.degrees(np.arccos(np.clip(cosine_angle, -1.0, 1.0)))
    return angle

def extract_angles_from_frame(frame):
    h, w = frame.shape[:2]
    new_w = 640
    new_h = int((h / w) * new_w)
    frame = cv2.resize(frame, (new_w, new_h))

    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = pose.process(frame_rgb)

    if not results.pose_landmarks:
        return None

    lm = results.pose_landmarks.landmark
    important = [11,12,13,14,15,16,23,24,25,26,27,28]
    for i in important:
        if lm[i].visibility < 0.5:
            return None

    # visibility filter
    important = [11,12,13,14,15,16,23,24,25,26,27,28]
    for i in important:
        if lm[i].visibility < 0.5:
            return None

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

    return {
        "left_elbow_angle": calculate_angle(ls, le, lw),
        "right_elbow_angle": calculate_angle(rs, re, rw),
        "left_shoulder_angle": calculate_angle(le, ls, lh),
        "right_shoulder_angle": calculate_angle(re, rs, rh),
        "left_knee_angle": calculate_angle(lh, lk, la),
        "right_knee_angle": calculate_angle(rh, rk, ra),
        "left_hip_angle": calculate_angle(ls, lh, lk),
        "right_hip_angle": calculate_angle(rs, rh, rk),
        "torso_tilt_left": calculate_angle(le, ls, lh),
        "torso_tilt_right": calculate_angle(re, rs, rh),
    }

    # Resize for better mediapipe detection
    h, w = frame.shape[:2]
    new_w = 640
    new_h = int((h / w) * new_w)
    frame = cv2.resize(frame, (new_w, new_h))

    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = pose.process(frame_rgb)

    if not results.pose_landmarks:
        return None

    lm = results.pose_landmarks.landmark

    def pt(i):
        return (lm[i].x, lm[i].y)

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

    return {
        "left_elbow_angle": calculate_angle(ls, le, lw),
        "right_elbow_angle": calculate_angle(rs, re, rw),
        "left_shoulder_angle": calculate_angle(le, ls, lh),
        "right_shoulder_angle": calculate_angle(re, rs, rh),
        "left_knee_angle": calculate_angle(lh, lk, la),
        "right_knee_angle": calculate_angle(rh, rk, ra),
        "left_hip_angle": calculate_angle(ls, lh, lk),
        "right_hip_angle": calculate_angle(rs, rh, rk),
        "torso_tilt_left": calculate_angle(le, ls, lh),
        "torso_tilt_right": calculate_angle(re, rs, rh),
    }


def process_video(video_path, frame_skip=2, max_frames=300):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(" Cannot open video:", video_path)
        return []

    rows = []
    frame_no = 0
    saved = 0
    pose_found = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_no % frame_skip == 0:
            feats = extract_angles_from_frame(frame)
            if feats:
                pose_found += 1
                feats["frame"] = frame_no
                rows.append(feats)
                saved += 1

        frame_no += 1
        if max_frames and saved >= max_frames:
            break

    cap.release()

    #  Debug line (very important)
    if pose_found == 0:
        print(f" Pose NOT detected in: {os.path.basename(video_path)}")

    return rows


def generate_csv(dataset_root, output_csv="pose_dataset.csv", frame_skip=5):
    print("\n DATASET ROOT:", os.path.abspath(dataset_root))

    all_rows = []

    # detect split folders (train-... test-... val-...)
    split_folders = [x for x in os.listdir(dataset_root) if x.startswith(("train", "test", "val"))]
    print(" Found split folders:", split_folders)

    for split_folder in split_folders:
        split_path = os.path.join(dataset_root, split_folder)

        inner = None
        split_name = None
        for maybe in ["train", "test", "val"]:
            p = os.path.join(split_path, maybe)
            if os.path.isdir(p):
                inner = p
                split_name = maybe
                break

        if inner is None:
            print(f"No inner train/test/val found in {split_folder}")
            continue

        for safety in ["safe", "unsafe"]:
            safety_path = os.path.join(inner, safety)
            if not os.path.isdir(safety_path):
                print(f"  Missing folder: {safety_path}")
                continue

            activities = [a for a in os.listdir(safety_path) if os.path.isdir(os.path.join(safety_path, a))]
            print(f"\n {split_name}/{safety} activities:", activities)

            for activity in activities:
                activity_path = os.path.join(safety_path, activity)

                videos = [v for v in os.listdir(activity_path) if v.lower().endswith((".mp4", ".avi", ".mov", ".mkv"))]
                print(f" {split_name}/{safety}/{activity} videos found:", len(videos))

                for vid in tqdm(videos, desc=f"{split_name}/{safety}/{activity}"):
                    video_path = os.path.join(activity_path, vid)

                    feats_list = process_video(video_path, frame_skip=frame_skip, max_frames=150)

                    for feats in feats_list:
                        feats["split"] = split_name
                        feats["safety"] = safety
                        feats["label"] = activity
                        feats["video"] = vid
                        all_rows.append(feats)

    if len(all_rows) == 0:
        print("\n No pose data extracted.")
        print(" Possible reasons:")
        print("1) Videos not detected (.mp4 etc)")
        print("2) MediaPipe not finding pose in frames")
        print("3) Incorrect dataset root path")
        return

    df = pd.DataFrame(all_rows)
    df.to_csv(output_csv, index=False)

    print("\n CSV CREATED:", output_csv)
    print(" Total rows (frames):", len(df))
    print(" Labels:", df["label"].unique())

if __name__ == "__main__":
    DATASET_ROOT = r"."
    generate_csv(DATASET_ROOT, output_csv="pose_dataset.csv", frame_skip=5)
