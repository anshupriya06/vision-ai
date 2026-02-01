import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
from sklearn.preprocessing import StandardScaler
import joblib

# -------------------- Load dataset --------------------
df = pd.read_csv("pose_dataset.csv")

df = df[df["label"].isin(["Sitting", "Standing still", "Walking", "Yoga"])]

FEATURE_COLS = [
    "left_elbow_angle", "right_elbow_angle",
    "left_shoulder_angle", "right_shoulder_angle",
    "left_knee_angle", "right_knee_angle",
    "left_hip_angle", "right_hip_angle",
    "torso_tilt_left","torso_tilt_right"
]

X = df[FEATURE_COLS]
y = df["label"]

# -------------------- Split --------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# -------------------- Scaling --------------------
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# -------------------- Train model --------------------
model = RandomForestClassifier(
    n_estimators=500,
    max_depth=15,
    class_weight="balanced",
    random_state=42,
    n_jobs=-1
)

model.fit(X_train_scaled, y_train)

# -------------------- Evaluation --------------------
y_pred = model.predict(X_test_scaled)

print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))
print("Accuracy:", accuracy_score(y_test, y_pred))

# -------------------- Save everything --------------------
joblib.dump(model, "pose_activity_model.pkl")
joblib.dump(scaler, "pose_scaler.pkl")
joblib.dump(FEATURE_COLS, "pose_feature_cols.pkl")

print("\nModel saved")
print("Scaler saved")
print("Feature columns saved")
