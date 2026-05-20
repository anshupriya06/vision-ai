```

```

# VisionSafe — Complete Project Documentation

> Read this document top-to-bottom to understand the entire project: architecture, AI pipeline, every feature, every file, and how it all connects.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Repository Structure](#3-repository-structure)
4. [Environment Setup](#4-environment-setup)
5. [Backend Architecture](#5-backend-architecture)
6. [Database Schema](#6-database-schema)
7. [AI Engine (Core Intelligence)](#7-ai-engine-core-intelligence)
8. [API Endpoints Reference](#8-api-endpoints-reference)
9. [WebSocket Real-Time Alerts](#9-websocket-real-time-alerts)
10. [Frontend Architecture](#10-frontend-architecture)
11. [Authentication System](#11-authentication-system)
12. [Feature Deep-Dives](#12-feature-deep-dives)
    - 12.1 [Dashboard Layout &amp; Sidebar](#121-dashboard-layout--sidebar)
    - 12.2 [Video Upload &amp; Analysis (4 Slots)](#122-video-upload--analysis-4-slots)
    - 12.3 [Live Camera Mode](#123-live-camera-mode)
    - 12.4 [Monitor &amp; Alerts Tab](#124-monitor--alerts-tab)
    - 12.5 [Event History Tab](#125-event-history-tab)
    - 12.6 [Analytics Tab](#126-analytics-tab)
    - 12.7 [Smart Alert System](#127-smart-alert-system)
    - 12.8 [Video History &amp; Confidence Filtering](#128-video-history--confidence-filtering)
    - 12.9 [Admin Panel](#129-admin-panel)
    - 12.10 [Pricing Page](#1210-pricing-page)
    - 12.11 [Onboarding Tour](#1211-onboarding-tour)
    - 12.12 [Dark / Light Mode](#1212-dark--light-mode)
    - 12.13 [User Profile](#1213-user-profile)
    - 12.14 [Contact &amp; Newsletter](#1214-contact--newsletter)
    - 12.15 [ChatBot Assistant](#1215-chatbot-assistant)
    - 12.16 [Testimonials, Features &amp; How It Works Pages](#1216-testimonials-features--how-it-works-pages)
13. [Routing Map](#13-routing-map)
14. [Data Flow: End-to-End Video Analysis](#14-data-flow-end-to-end-video-analysis)
15. [Safety Classification Logic](#15-safety-classification-logic)
16. [LocalStorage Keys](#16-localstorage-keys)
17. [Deployment](#17-deployment)
18. [Known Constraints &amp; Design Decisions](#18-known-constraints--design-decisions)

---

## 1. Project Overview

**VisionSafe** is an AI-powered workplace video surveillance web application. Users upload video footage (or stream a live webcam) and the system automatically detects human activities frame-by-frame, classifying each one as **SAFE** or **UNSAFE**.

**Core value proposition:** Replace manual video review with automated AI analysis — flag dangerous activities (fighting, falling, weapon detection) in seconds, not hours.

**Who uses it:**

- Security teams monitoring workplace footage
- Facility managers reviewing incidents
- Admins overseeing multi-user deployments

**Live URL:** `https://vision-ai-delta.vercel.app`
**Backend URL:** (self-hosted FastAPI, configured in `frontend/src/config/api.js`)

---

## 2. Tech Stack

### Frontend

| Layer       | Technology                                                  |
| ----------- | ----------------------------------------------------------- |
| Framework   | React 18 + Vite                                             |
| Styling     | Tailwind CSS (class-based dark mode) + custom CSS variables |
| Animation   | Framer Motion                                               |
| Charts      | Recharts (PieChart, BarChart, LineChart)                    |
| Routing     | React Router v6                                             |
| HTTP client | Axios                                                       |
| Auth client | Firebase SDK v9 (modular)                                   |

### Backend

| Layer             | Technology                    |
| ----------------- | ----------------------------- |
| Framework         | FastAPI (Python 3.10+)        |
| Server            | Uvicorn (ASGI)                |
| ORM               | SQLAlchemy 2.x                |
| Database          | PostgreSQL                    |
| Auth verification | Firebase Admin SDK            |
| Email             | SMTP via `email_service.py` |

### AI / ML

| Model                       | Purpose                                                   |
| --------------------------- | --------------------------------------------------------- |
| YOLOv8n (Ultralytics)       | Object + person detection per frame                       |
| MediaPipe PoseLandmarker    | 33 body landmark extraction                               |
| Scikit-learn PKL classifier | Activity classification from joint angles                 |
| Rule-based fallback         | Angle-threshold classification when PKL confidence is low |

---

## 3. Repository Structure

```
vision ai/
├── backend/
│   ├── app.py              # FastAPI application, all REST endpoints, WebSocket
│   ├── ai_engine.py        # Full AI pipeline: YOLO → MediaPipe → classify → annotate
│   ├── database.py         # SQLAlchemy models, CRUD classes, DB init
│   ├── email_service.py    # SMTP welcome + contact email functions
│   ├── requirements.txt    # Python dependencies
│   ├── .env                # Environment variables (not in git)
│   ├── uploads/            # Temporary storage for incoming video files
│   ├── output/             # Processed/annotated video files (served as /output/*)
│   └── pose_activity_model.pkl  # Trained sklearn activity classifier
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                         # Root component, SharedRoutes, ScrollToTop
│   │   ├── main.jsx                        # React DOM entry point
│   │   ├── index.css                       # Global styles, CSS variables, dark/light theme
│   │   ├── config/
│   │   │   └── api.js                      # API_BASE URL constant
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx             # Firebase auth state provider
│   │   │   └── ThemeContext.jsx            # Dark/light theme state provider
│   │   ├── hooks/
│   │   │   └── useAuth.js                  # useAuth() hook (wraps AuthContext)
│   │   ├── components/
│   │   │   ├── Navbar.jsx                  # Top navigation bar (3-col flex layout)
│   │   │   ├── Dashboard.jsx               # Main logged-in view: sidebar + 5 tabs
│   │   │   ├── DashboardStats.jsx          # Statistics charts (used in /history)
│   │   │   ├── VideoHistory.jsx            # Video list + detail panel (used in /history)
│   │   │   ├── LiveCamera.jsx              # Webcam capture + auto-analysis
│   │   │   ├── SmartAlerts.jsx             # Alert threshold engine + history
│   │   │   ├── AlertNotifications.jsx      # WebSocket alert display (unused/legacy)
│   │   │   ├── OnboardingTour.jsx          # First-login 5-step modal walkthrough
│   │   │   ├── Hero.jsx                    # Landing page hero section
│   │   │   ├── Features.jsx                # Landing page features grid
│   │   │   ├── Testimonials.jsx            # Testimonials carousel page (/testimonials)
│   │   │   ├── Footer.jsx                  # Site footer with links
│   │   │   ├── ChatBot.jsx                 # Floating FAQ chatbot (all pages)
│   │   │   └── LoginModal.jsx              # Login/signup modal
│   │   └── pages/
│   │       ├── History.jsx                 # /history page (tabs: history + stats)
│   │       ├── Pricing.jsx                 # /pricing page (4 tiers incl. Free)
│   │       ├── AdminPanel.jsx              # /admin page (admin-only, no navbar link)
│   │       ├── Profile.jsx                 # /profile page
│   │       ├── EditProfile.jsx             # /profile/edit page
│   │       ├── About.jsx                   # /about page
│   │       ├── Contact.jsx                 # /contact page
│   │       ├── FeaturesPage.jsx            # /features page (logged-out + logged-in nav)
│   │       ├── HowItWorks.jsx              # /how-it-works page
│   │       ├── FeatureDetails.jsx          # /feature-details page
│   │       └── StaticPage.jsx              # Generic placeholder for stub pages
│   ├── tailwind.config.js                  # Tailwind config (custom neon colors)
│   ├── vite.config.js                      # Vite build config
│   └── package.json
│
└── PROJECT_DOCUMENTATION.md               # This file
```

---

## 4. Environment Setup

### Backend

**Prerequisites:** Python 3.10+, PostgreSQL running locally

1. Create and activate a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```
2. Install dependencies:

   ```bash
   pip install -r backend/requirements.txt
   ```
3. Create `backend/.env` with:

   ```env
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/visionsafe
   GOOGLE_APPLICATION_CREDENTIALS=path/to/firebase-service-account.json
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your@email.com
   SMTP_PASS=your_app_password
   ```
4. Initialize the database (creates all tables automatically on first startup):

   ```bash
   cd backend
   uvicorn app:app --reload --port 8000
   ```

   Tables are auto-created on `startup` via `init_db()` → `Base.metadata.create_all()`.

### Frontend

**Prerequisites:** Node.js 18+

1. Install dependencies:

   ```bash
   cd frontend
   npm install
   ```
2. Set API base URL in `frontend/src/config/api.js`:

   ```js
   const API_BASE = 'http://localhost:8000';  // dev
   // or 'https://your-production-api.com' for prod
   export default API_BASE;
   ```
3. Configure Firebase in `frontend/src/contexts/AuthContext.jsx` — replace `firebaseConfig` object with your project's config from the Firebase Console.
4. Run dev server:

   ```bash
   npm run dev   # starts at http://localhost:5173
   ```

---

## 5. Backend Architecture

The backend is a single **FastAPI** app (`app.py`) with these responsibilities:

1. **Receive video files** via HTTP POST multipart form
2. **Verify Firebase ID tokens** for authenticated requests
3. **Run the AI engine** (`process_video()`) synchronously
4. **Persist results** to PostgreSQL via SQLAlchemy
5. **Serve processed videos** as static files from `output/`
6. **Broadcast alerts** via WebSocket to all connected clients
7. **Expose REST endpoints** for history, stats, detections, user profiles

### Key design choices:

- **Sync AI processing**: `process_video()` is called synchronously in the endpoint. For long videos this blocks the request, but simplifies the architecture (no task queue needed at current scale).
- **Token fallback**: If Firebase token verification fails but a `user_email` form field was provided, the email is used as a fallback rather than rejecting the request — this accommodates edge cases in token refresh timing.
- **Email normalization**: All user emails are lowercased and stripped before DB writes to prevent duplicate user records.
- **Output served as static files**: Processed videos are written to `output/` and served via `StaticFiles` mount at `/output/*`. The frontend builds the URL as `${API_BASE}${video.video_url}`.

---

## 6. Database Schema

### Table: `videos`

| Column                          | Type       | Description                             |
| ------------------------------- | ---------- | --------------------------------------- |
| `id`                          | UUID (PK)  | Auto-generated                          |
| `filename`                    | String     | Original uploaded filename              |
| `upload_time`                 | DateTime   | When uploaded                           |
| `processed_video_path`        | String     | Absolute path to annotated output video |
| `overall_status`              | String     | `SAFE` or `UNSAFE` (constrained)    |
| `user_email`                  | String     | Owner's email (lowercased)              |
| `confidence`                  | Float      | Model confidence (0.0–1.0)             |
| `duration_seconds`            | Float      | Video length                            |
| `total_frames`                | Integer    | Total frames processed                  |
| `file_size_bytes`             | BigInteger | Original file size                      |
| `created_at` / `updated_at` | DateTime   | Audit timestamps                        |

**Constraint:** `overall_status IN ('SAFE', 'UNSAFE')` — enforced at DB level.

**Relationship:** one Video → many Detections (cascade delete).

### Table: `detections`

| Column                | Type                | Description                                       |
| --------------------- | ------------------- | ------------------------------------------------- |
| `id`                | UUID (PK)           | Auto-generated                                    |
| `video_id`          | UUID (FK → videos) | Parent video                                      |
| `frame_number`      | Integer             | Frame index where detection occurred              |
| `activity_label`    | String              | e.g.,`"Walking"`, `"Fighting"`, `"Falling"` |
| `safety_status`     | String              | `SAFE` or `UNSAFE`                            |
| `timestamp_seconds` | Float               | Time in video                                     |
| `confidence`        | Float               | Detection confidence                              |
| `bounding_box`      | JSONB               | `{x1, y1, x2, y2}` pixel coordinates            |

**Performance note:** Only the first 100 detections per video are saved to DB (bulk insert). Full detection data is available in the AI engine result dict but truncated before persistence.

### Table: `users`

| Column            | Type            | Description           |
| ----------------- | --------------- | --------------------- |
| `id`            | UUID (PK)       | Auto-generated        |
| `email`         | String (unique) | User's email          |
| `mobile_number` | String          | Optional phone number |
| `bio`           | Text            | Optional bio text     |
| `created_at`    | DateTime        | Profile creation time |

### Table: `newsletter_subscribers`

| Column                | Type            | Description                     |
| --------------------- | --------------- | ------------------------------- |
| `id`                | UUID (PK)       | Auto-generated                  |
| `email`             | String (unique) | Subscriber email                |
| `subscribed_at`     | DateTime        | Subscription time               |
| `is_active`         | String          | `'true'` or `'false'`       |
| `unsubscribe_token` | UUID (unique)   | Token for one-click unsubscribe |

---

## 7. AI Engine (Core Intelligence)

**File:** `backend/ai_engine.py`

This is the heart of VisionSafe. The function `process_video(input_path, output_path)` takes a raw video file and returns a structured result dict.

### Pipeline Overview

```
Input Video
    │
    ▼
┌─────────────────────┐
│  1. Load Models      │  YOLOv8n + MediaPipe PoseLandmarker + PKL classifier
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  2. Frame Loop       │  Read frame-by-frame (OpenCV)
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  3. YOLO Detection   │  Detect people + vehicles in frame
│                      │  → bounding boxes for each person
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  4. BoundingBox      │  Exponential Moving Average (α=0.7) smoothing
│     Tracking         │  → reduces bounding box flicker between frames
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  5. MediaPipe Pose   │  Extract 33 body landmarks per detected person
│                      │  → 3D (x, y, z, visibility) per landmark
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  6. Angle Extraction │  Compute 10 joint angles from landmarks:
│                      │  left/right elbow, knee, hip, shoulder, ankle
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  7. Activity         │  Primary: PKL classifier (sklearn) on angle vector
│     Classification   │  Fallback: rule-based angle thresholds
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  8. Safety Label     │  SAFE_ACTIVITIES = {Walking, Running, Standing,
│                      │                     Sitting, Yoga}
│                      │  All others → UNSAFE (Fighting, Falling, etc.)
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  9. Frame Annotation │  Draw bounding boxes, activity labels, status badges
│                      │  Color-coded: green (SAFE), red (UNSAFE)
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│ 10. Write Output     │  Write annotated frames to output video (MP4/H264)
└─────────────────────┘
    │
    ▼
Result Dict:
{
  "status": "SAFE" | "UNSAFE",
  "confidence": 0.0–1.0,
  "duration": float (seconds),
  "total_frames": int,
  "unsafe_frames": int,
  "unsafe_pct": float,
  "detections": [ { frame_number, activity_label, safety_status, ... }, ... ]
}
```

### Safety Decision Logic

After processing all frames:

```python
unsafe_pct = (unsafe_frames / total_frames) * 100
overall_status = "UNSAFE" if unsafe_pct > 10 else "SAFE"
confidence = 1.0 - (unsafe_pct / 100)
```

**Meaning:** A video is marked UNSAFE if more than 10% of its frames contain an unsafe activity. The confidence score represents the proportion of safe frames.

### BoundingBoxTracker

```python
class BoundingBoxTracker:
    alpha = 0.7  # EMA smoothing factor

    def smooth(self, track_id, new_box):
        if track_id not in self.tracks:
            self.tracks[track_id] = new_box
        else:
            old = self.tracks[track_id]
            self.tracks[track_id] = [
                alpha * new + (1 - alpha) * old
                for new, old in zip(new_box, old)
            ]
        return self.tracks[track_id]
```

Higher alpha = more weight on current detection (snappier but jittery). The 0.7 value balances responsiveness with stability.

### Vehicle Detection

YOLO also detects vehicles using class IDs:

```python
VEHICLE_CLASSES = {
    1: "Bicycle", 2: "Car", 3: "Motorcycle",
    5: "Bus", 7: "Truck"
}
```

Vehicles are annotated on the output video but do not affect the SAFE/UNSAFE classification (only human activities do).

### Model Loading

```python
def load_models():
    yolo_model = YOLO("yolov8n.pt")       # auto-downloads if missing
    pose_model = mp.solutions.pose        # MediaPipe
    classifier = joblib.load("pose_activity_model.pkl")
    return yolo_model, pose_model, classifier
```

Models are loaded once at module import time and reused across all requests.

---

## 8. API Endpoints Reference

Base URL: configured in `frontend/src/config/api.js`

### Public Endpoints

| Method | Path                      | Description                                                 |
| ------ | ------------------------- | ----------------------------------------------------------- |
| GET    | `/`                     | Health check →`{"message": "VisionSafe API is running"}` |
| POST   | `/newsletter/subscribe` | Subscribe email to newsletter                               |
| POST   | `/contact`              | Send contact form message via email                         |
| GET    | `/unsubscribe/{token}`  | One-click newsletter unsubscribe                            |

### Authenticated Endpoints

All require `Authorization: Bearer <Firebase_ID_token>` header.

| Method | Path                              | Description                                                                             |
| ------ | --------------------------------- | --------------------------------------------------------------------------------------- |
| POST   | `/upload-video`                 | Upload + process video. Returns `video_url`, `status`, `confidence`, etc.         |
| GET    | `/videos/history`               | Get video history. Pass `?email=` param. Without email: returns last 100 (admin use). |
| GET    | `/videos/stats/{email}`         | Get aggregate stats for a user: total, safe, unsafe counts, avg confidence.             |
| GET    | `/videos/{video_id}/detections` | Get all saved detections for a specific video.                                          |
| DELETE | `/videos/{video_id}`            | Delete a video and its detections (cascade).                                            |
| GET    | `/profile`                      | Get current user's profile (mobile, bio).                                               |
| PUT    | `/profile`                      | Update current user's profile.                                                          |

### Upload Video Request Format

```
POST /upload-video
Content-Type: multipart/form-data

file: <video file binary>
user_email: user@example.com        (optional, fallback if token fails)
Authorization: Bearer <token>        (optional but recommended)
```

### Upload Video Response

```json
{
  "success": true,
  "video_url": "/output/processed_<uuid>.mp4",
  "status": "SAFE",
  "confidence": 0.87,
  "duration": 12.4,
  "total_frames": 372,
  "unsafe_frames": 48,
  "unsafe_pct": 12.9,
  "safe_percentage": 87.1,
  "unsafe_percentage": 12.9,
  "detections": [...]
}
```

### Video History Response

```json
{
  "videos": [
    {
      "id": "uuid",
      "filename": "surveillance.mp4",
      "upload_time": "2024-01-15T10:30:00",
      "overall_status": "SAFE",
      "confidence": 0.92,
      "duration_seconds": 45.2,
      "total_frames": 1356,
      "video_url": "/output/processed_uuid.mp4",
      "safe_percentage": 92.0,
      "unsafe_percentage": 8.0
    }
  ]
}
```

### Stats Response

```json
{
  "total_videos": 25,
  "safe_videos": 20,
  "unsafe_videos": 5,
  "average_confidence": 0.874,
  "unsafe_percentage": 20.0
}
```

---

## 9. WebSocket Real-Time Alerts

**Endpoint:** `ws://your-backend/ws/alerts`

### How it works

1. Frontend connects to the WebSocket on Dashboard mount
2. Backend `ConnectionManager` tracks all active connections in a list
3. When a video is uploaded, the backend broadcasts two events:
   - **Processing started:** `alert_type: "info"` when upload begins
   - **Result ready:** `alert_type: "danger"` if UNSAFE, `"success"` if SAFE
4. All connected clients receive every broadcast (no user-scoped filtering)

### Message Format (Server → Client)

```json
{
  "type": "alert",
  "alert_type": "danger",
  "message": "UNSAFE activity detected in: video.mp4",
  "timestamp": "2024-01-15T10:30:05.123456",
  "data": {
    "filename": "video.mp4",
    "status": "UNSAFE",
    "confidence": 0.65
  }
}
```

### Connection Lifecycle

- On connect: `websocket.accept()` → added to `active_connections` list
- On disconnect/error: removed from list silently
- Dead connections are pruned during broadcast attempts

---

## 10. Frontend Architecture

### Provider Hierarchy

```
<ThemeProvider>           ← manages dark/light state, CSS class on <html>
  <AuthProvider>          ← manages Firebase auth state
    <Router>
      <AppContent>        ← reads both contexts, renders routes
```

**Why ThemeProvider wraps AuthProvider:** The theme must be applied to the `<html>` element before any component renders to avoid flash-of-unstyled-content.

### Authentication Flow

```
User visits site
    │
    ├── Not logged in → Hero + Features landing page
    │
    └── Logged in → Dashboard (4 upload slots + tabs)
```

`AppContent` checks `currentUser` from `useAuth()`:

- If null → show `<Hero /><Features />`
- If set → show `<Dashboard />`

### Route Protection

`ProtectedRoute` component in `App.jsx` redirects unauthenticated users to `/`:

```jsx
const ProtectedRoute = ({ children }) => {
  if (!currentUser) return <Navigate to="/" replace />;
  return children;
};
```

Used for: `/history`, `/profile`, `/profile/edit`, `/admin`

### Theming System

All colors are CSS variables set in `index.css`:

```css
:root {                           /* dark mode (default) */
  --bg-base:       #020617;
  --bg-card:       rgba(13, 27, 42, 0.85);
  --text-primary:  #f1f5f9;
  --text-muted:    #94a3b8;
  --border-subtle: rgba(0, 240, 255, 0.15);
  --grid-line:     rgba(0,240,255,0.04);
}

:root.light {                     /* light mode */
  --bg-base:        #f1f5f9;
  --bg-card:        rgba(255, 255, 255, 0.92);
  --text-primary:   #0f172a;
  --text-muted:     #475569;
  --border-subtle:  rgba(99, 102, 241, 0.18);
  --grid-line:      rgba(99, 102, 241, 0.05);
  --accent-primary: #4f46e5;       /* indigo — replaces neon-cyan */
  --accent-success: #059669;       /* emerald — replaces neon-green */
  --accent-danger:  #dc2626;       /* red-600 — replaces neon-red */
}
```

**Dark mode** uses the classic cyberpunk neon palette (cyan #00f0ff, green #00ff9f, red #ff3b3b) with glows.

**Light mode** remaps all neon accents to professional indigo/emerald/red tones with no glow effects. Key light-mode overrides in `index.css`:

- `.text-neon-cyan` → `#4f46e5` (indigo-600)
- `.text-neon-green` → `#059669` (emerald-600)
- `.text-neon-red` → `#dc2626` (red-600)
- `.neon-border` family → solid indigo/emerald/red borders with subtle shadow only
- `.btn-cyber` → indigo border/text, fill on hover
- `.btn-cyber-solid` → solid indigo background
- `.text-gradient` → indigo → violet gradient (instead of cyan → green)
- `.hud-frame` corners → indigo
- `.confidence-range` thumb → indigo-600
- `.glass-panel` → cleaner box-shadow, lighter border

`ThemeContext` adds/removes the `light` class on `document.documentElement` to switch between variable sets. Tailwind's `dark:` variants are **not** used — all theming goes through CSS variables and targeted `:root.light` overrides.

---

## 11. Authentication System

### Firebase Auth Configuration

Supported sign-in methods:

- **Email + password** (EmailAuthProvider)
- **Google OAuth** (GoogleAuthProvider)

### How the frontend sends authenticated requests

```jsx
const idToken = await currentUser.getIdToken();
await axios.post(`${API_BASE}/upload-video`, formData, {
  headers: {
    Authorization: `Bearer ${idToken}`,
    'Content-Type': 'multipart/form-data'
  }
});
```

### How the backend verifies tokens

```python
decoded = firebase_auth.verify_id_token(token)
email = decoded.get("email")
```

Firebase Admin SDK contacts Google's auth servers to verify the token signature and expiry. The email extracted is then used as the user identifier for all DB operations.

### Token Refresh

Firebase ID tokens expire after 1 hour. The Firebase client SDK automatically refreshes them. `getIdToken()` returns a fresh token transparently.

---

## 12. Feature Deep-Dives

### 12.1 Video Upload & Analysis (4 Slots)

**File:** `frontend/src/components/Dashboard.jsx`

#### Dashboard Layout (current)

The Dashboard uses a **fixed viewport layout** (`position: fixed; inset: 0; top: 56px`) that fills exactly the area below the navbar. It has two regions:

```
┌──────────────────────────────────────────────────────────┐
│  Navbar (fixed, h-14)                                    │
├──────────┬───────────────────────────────────────────────┤
│ Sidebar  │  Main content area                            │
│ (w-56    │                                               │
│  or w-0) │  [hamburger + tab label + user avatar]        │
│          │  ──────────────────────────────────────────   │
│ Nav tabs │  2×2 FEED SLOT GRID (fills all remaining h)   │
│ Status   │                                               │
│ Stats    │                                               │
│ Alerts   │                                               │
└──────────┴───────────────────────────────────────────────┘
```

**Left Sidebar (`<aside>`):**

- Toggles between `w-56` (open) and `w-0` (closed) with `transition-all duration-300`
- Defaults **open** on desktop (≥768px), **closed** on mobile
- Contains:
  - Navigation tabs: Upload / Live Cam / Smart Alerts / History / Stats
  - System status rows (camera, backend, WebSocket)
  - Quick stats (total, safe, unsafe)
  - SmartAlerts component (compact mode, embedded)
- Hidden content is clipped with `overflow-hidden` so it collapses cleanly

**Hamburger toggle button:**

- Positioned in the top bar, always visible
- Three spans animate to an × (close icon) when sidebar is open:
  ```
  Open:   ─────   →  ╲
          ─────      (hidden)
          ─────      ╱
  ```

**Top bar (replaces old operator header):**

- Minimal: hamburger button + current tab name + small user avatar chip (photo or initial)
- No display name or email shown — keeps the interface clean

**Four feed slots (Upload tab):**

The main content area shows a `grid grid-cols-1 sm:grid-cols-2` grid with `gridAutoRows: 'minmax(280px, 1fr)'` — each slot has a minimum height of 280px and all slots grow equally to fill the available viewport height.

Each `UploadSlot` is self-contained with its own state:

```
idle → (file dropped/selected) → analyzing → done
                                            ↘ error
                              (RESET button) ↩ idle
```

**UI details per slot:**

- **Idle:** Circular dashed drop-zone icon (large, centered), "DRAG & DROP or CLICK" label, supported format note
- **Analyzing:** Circular spinner + pulsing dot, 3 animated step badges (`YOLO DETECTION → POSE ANALYSIS → CLASSIFICATION`)
- **Done:** Full-width SAFE (green) or UNSAFE (red) header with confidence %, progress bar, Download button with icon

**Key behavior:** There is **no "Analyze" button**. The moment a file is selected or dropped, analysis begins automatically.

**After each slot completes**, a `CustomEvent` named `vs:analysis-result` is dispatched on `window`:

```js
window.dispatchEvent(new CustomEvent('vs:analysis-result', {
  detail: { status, confidence, filename }
}));
```

This is how SmartAlerts (in the sidebar) listens for results without being directly coupled to the upload slots.

**Concurrent analysis:** All 4 slots can run simultaneously since each is independent. The backend handles concurrent POST requests.

### 12.2 Live Camera Mode

**File:** `frontend/src/components/LiveCamera.jsx`

Allows users to use their device's camera as a continuous input source.

**How it works:**

1. Calls `navigator.mediaDevices.enumerateDevices()` to list all video input devices
2. User selects device from dropdown (supports multiple cameras)
3. Calls `navigator.mediaDevices.getUserMedia({ video: { deviceId } })` to start stream
4. A `setInterval` fires every N seconds (user-configurable: 2–30s)
5. Each interval: captures current frame to a `<canvas>` element → `canvas.toBlob()` → creates a `File` object → POST to `/upload-video`
6. The backend receives it as a regular video file (JPEG frames are accepted as video/jpeg)

**Session statistics tracked (in component state, not persisted):**

- Total frames analyzed
- Safe frames count
- Unsafe frames count
- Safe rate percentage

**Snapshot strip:** Last 12 analyzed frames are shown as thumbnail images with SAFE/UNSAFE badge overlay.

**HUD overlay:** While a capture is being analyzed, a semi-transparent corner overlay with a pulsing indicator is shown on the video feed.

### 12.3 Smart Alert System

**File:** `frontend/src/components/SmartAlerts.jsx`

A configurable threshold-based alerting engine that runs entirely in the browser.

**Placement:** SmartAlerts is embedded in the Dashboard left sidebar (compact mode) and is always accessible without leaving the feed view. When an alert fires, flash banners appear above the sidebar content.

**Configuration (persisted in `vs-alert-settings` localStorage):**

- Unsafe event threshold: 1–20 events
- Time window: 10–300 seconds
- Browser push notifications: on/off
- Audio alert: on/off

**Trigger logic:**

```
Count UNSAFE results in the last [window] seconds.
If count >= threshold → fire alert
```

**When an alert fires:**

1. In-app red banner appears in the sidebar (animated, auto-dismisses after 8s)
2. Browser Notification API shows a system notification (if permitted)
3. Web Audio API generates an 880Hz square-wave beep (if enabled)
4. Event logged to `vs-alert-history` localStorage

**Alert history:** Last 100 entries stored in `vs-alert-history` localStorage. Viewable in the HISTORY sub-tab within SmartAlerts.

**TEST ALERT button:** Fires an immediate alert regardless of threshold, for verification during setup.

**Event source:** Listens on `window` for `vs:analysis-result` CustomEvents dispatched by upload slots and the live camera component. This loose coupling means the alert system works with any analysis source without direct prop drilling.

### 12.4 Video History & Confidence Filtering

**File:** `frontend/src/pages/History.jsx` + `frontend/src/components/VideoHistory.jsx`

The `/history` page has two tabs: **HISTORY** and **STATISTICS**.

**HISTORY tab (VideoHistory.jsx):**

- Fetches `GET /videos/history?email=user@email.com`
- Displays list of all processed videos
- Click a video → details panel slides in on the right
- Details show: filename, status, confidence, duration, prediction percentages
- If processed video exists → embedded `<video>` player with controls
- Detections panel: lists all saved frame-level detections with activity labels
- Delete button: calls `DELETE /videos/{id}` then removes from local state

**Confidence filtering (History.jsx):**

- Range slider (0–100%) above the video list
- `minConfidence` state filters: `(video.confidence * 100) >= minConfidence`
- Shows counter: "Showing X of Y videos with confidence ≥ Z%"
- CSS `--val` custom property on the slider input drives the colored fill:
  ```css
  input[type=range] {
    background: linear-gradient(to right, #3b82f6 var(--val), #334155 var(--val));
  }
  ```

**STATISTICS tab (DashboardStats.jsx):**

- Fetches `GET /videos/stats/{email}`
- 4 stat cards: Total Videos, Safe Videos, Unsafe Videos, Avg Confidence
- Pie chart: Safe vs Unsafe distribution
- Bar chart: Current avg confidence vs 95% target
- Safety score progress bar: `(100 - unsafe_percentage)%`

### 12.5 Dashboard Statistics

The statistics are always fetched fresh from the backend. The `DashboardStats` component has a "Refresh Stats" button that re-calls the stats endpoint.

The safety score bar uses a gradient fill: `from-emerald-500 to-blue-500`, width driven by `(100 - unsafe_percentage)%`.

### 12.6 Admin Panel

**File:** `frontend/src/pages/AdminPanel.jsx`

**Access control:** Only emails in `ADMIN_EMAILS` array can access this page. Non-admins are redirected to `/` via `useNavigate`. The same list is in `Navbar.jsx` to show/hide the ADMIN nav link.

```js
const ADMIN_EMAILS = ['anshu@stellatone.com', 'admin@visionsafe.io'];
```

The `/admin` route is a `ProtectedRoute` (must be logged in), and additionally has the email check inside AdminPanel itself.

**4 Tabs:**

**OVERVIEW tab:**

- Total videos, total users, unsafe videos, avg confidence (from all videos)
- Safety ratio progress bar
- Recent activity feed (last 10 videos across all users)

**ALL VIDEOS tab:**

- Fetches `GET /videos/history` (no email param → returns all videos)
- Search bar filters by filename
- Flag/unflag toggle per video (persisted in `vs-flagged` localStorage)
- Delete with confirmation modal

**FLAGGED tab:**

- Shows only videos flagged via the ALL VIDEOS tab
- Same details and delete capability
- Acts as a review queue for admins

**USERS tab:**

- Groups all videos by `user_email`
- Shows per-user: total videos, unsafe count, last activity date
- Sortable/browsable breakdown

### 12.7 Pricing Page

**File:** `frontend/src/pages/Pricing.jsx`

Three paid tiers (no free plan):

| Plan       | Monthly   | Yearly    | Analyses/mo                              | Key Features |
| ---------- | --------- | --------- | ---------------------------------------- | ------------ |
| Starter    | $9 | $7   | 25        | Basic analysis, history                  |              |
| Pro        | $29 | $23 | 200       | Live webcam, smart alerts, PDF reports   |              |
| Enterprise | $99 | $79 | Unlimited | RTSP streams, admin panel, full features |              |

**Monthly/Yearly toggle:** Clicking the toggle animates between price displays. Yearly prices show the per-month equivalent and calculate total savings.

**Feature comparison strip:** Visual grid showing which features each plan includes (checkmarks/crosses).

**FAQ section:** Expandable accordion-style questions.

**CTA section:** Links to `/contact` for enterprise inquiries.

### 12.8 Onboarding Tour

**File:** `frontend/src/components/OnboardingTour.jsx`

A 5-step modal walkthrough shown to first-time users only.

**Steps:**

1. Welcome to VisionSafe
2. Upload your video
3. AI Analysis in action
4. View your History
5. Export results

**Shown when:** `localStorage.getItem('vs-onboarded-' + user.email)` is `null`.

**After completing or skipping:** Sets `vs-onboarded-{email} = '1'` so it never shows again for that user.

**UI:** Full-screen overlay with centered card. Progress dots at bottom. Back, Next, and Skip buttons. The overlay has `pointer-events: none` on the background so clicking outside doesn't close it accidentally.

### 12.9 Dark / Light Mode

**File:** `frontend/src/contexts/ThemeContext.jsx`

Toggled via the sun/moon button in the Navbar (both desktop and mobile).

**State persistence:** `localStorage.setItem('vs-theme', theme)` — survives page reloads and browser restarts.

**Implementation:** `ThemeContext` adds `class="light"` or `class="dark"` to `document.documentElement`. All CSS variables are defined in `:root` (dark defaults) and overridden in `:root.light`. No JavaScript re-renders components — just a CSS class swap.

**Default:** Dark mode.

### 12.10 User Profile

**Files:** `frontend/src/pages/Profile.jsx`, `frontend/src/pages/EditProfile.jsx`

- Displays Firebase user info: display name, email, photo URL, account creation date
- Shows editable fields from the DB `users` table: mobile number, bio
- Edit form: `PUT /profile` with `Authorization` header
- Profile picture: uses Firebase `photoURL` if set (e.g., from Google Sign-In)

### 12.11 Contact & Newsletter

**File:** `frontend/src/pages/Contact.jsx`

- Contact form fields: name, email, subject, message
- On submit: `POST /contact` → triggers `send_contact_email()` via SMTP
- Newsletter subscription: `POST /newsletter/subscribe` with email
- Unsubscribe link in newsletter emails uses unique token: `GET /unsubscribe/{token}`

### 12.12 ChatBot Assistant

**File:** `frontend/src/components/ChatBot.jsx`

A fully client-side FAQ chatbot that floats over every page as a bubble in the bottom-right corner.

**Placement:** Fixed position `bottom-6 right-6`, `z-index: 9990` — renders above all other UI including the Dashboard. Available on every route for both logged-in and logged-out users.

**How it works:**

- No external API or backend required — all answers are computed in the browser
- A **knowledge base (KB)** array contains pattern sets and answer functions
- On each user message, the input is lowercased and checked against every entry's `patterns` array using `String.includes()`
- First matching entry's `answer()` function is called and returned
- If nothing matches → a fallback message lists what topics the bot can help with
- A 600–1000ms simulated typing delay makes responses feel natural

**Knowledge base topics (22 entries):**

- Greetings, What is VisionSafe, How to upload, SAFE/UNSAFE meaning
- Confidence score explanation, Live camera setup, Smart alerts
- Video history & export, Admin panel, Pricing & plans, Free tier
- Sign up / login, Profile & settings, Dark/light mode, Onboarding tour
- AI pipeline (YOLO + MediaPipe + PKL), Processing speed, Error troubleshooting
- Contact & support, Privacy & data security, Sidebar navigation, Batch upload

**UI features:**

- **Floating bubble** — cyan background with chat icon; glows on hover; red unread dot when closed
- **Chat window** — 520px tall, dark glassmorphism panel, smooth scale-in animation
- **Bot avatar** — "V" initial in cyan circle beside each bot message
- **Typing indicator** — 3 bouncing dots while answer is computing
- **Quick prompts** — 5 clickable chips shown on first open for common questions
- **Markdown-lite renderer** — `**bold**` renders as `<strong>`, newlines become separate lines
- **Clear button** — resets conversation history
- **Enter to send** — keyboard-friendly input
- **Auto-scroll** — chat always scrolls to the latest message

**Personalization:** If the user is logged in, the greeting uses their first name from `currentUser.displayName`.

---

## 13. Routing Map

| Path                 | Component                    | Auth Required               | Notes                                    |
| -------------------- | ---------------------------- | --------------------------- | ---------------------------------------- |
| `/`                | Hero + Features OR Dashboard | No (redirect for logged-in) | Conditional on auth state                |
| `/about`           | About                        | No                          |                                          |
| `/contact`         | Contact                      | No                          |                                          |
| `/pricing`         | Pricing                      | No                          |                                          |
| `/feature-details` | FeatureDetails               | No                          |                                          |
| `/history`         | History                      | Yes                         | Shows VideoHistory + DashboardStats tabs |
| `/profile`         | Profile                      | Yes                         |                                          |
| `/profile/edit`    | EditProfile                  | Yes                         |                                          |
| `/admin`           | AdminPanel                   | Yes + admin email           | Redirects non-admins to `/`            |
| `/features`        | StaticPage                   | No                          | Placeholder                              |
| `/api`             | StaticPage                   | No                          | Placeholder                              |
| `/documentation`   | StaticPage                   | No                          | Placeholder                              |
| `/blog`            | StaticPage                   | No                          | Placeholder                              |
| `*`                | Redirect to `/`            | —                          | Catch-all                                |

---

## 14. Data Flow: End-to-End Video Analysis

This traces one complete analysis from browser to database and back.

```
1. USER DROPS FILE on UploadSlot component
   │
   └── UploadSlot.analyze() called immediately

2. FRONTEND builds FormData:
   { file: <video>, user_email: currentUser.email }
   Gets fresh Firebase ID token: currentUser.getIdToken()
   Adds Authorization: Bearer <token> header

3. POST /upload-video (multipart/form-data)
   │
   ├── Backend verifies token → extracts email
   ├── Saves file to uploads/<uuid>.mp4
   ├── Broadcasts WS alert: "Processing video..."
   │
   └── Calls process_video(upload_path, output_path)
       │
       ├── Load YOLO, MediaPipe, PKL models (cached)
       ├── For each frame:
       │   ├── YOLO detects persons + vehicles
       │   ├── BoundingBoxTracker smooths boxes
       │   ├── MediaPipe extracts 33 pose landmarks
       │   ├── Extract 10 joint angles
       │   ├── PKL classifier predicts activity
       │   ├── Rule-based fallback if low confidence
       │   ├── Label as SAFE or UNSAFE
       │   └── Annotate frame with colored box + label
       ├── Calculate unsafe_pct = unsafe_frames / total_frames
       ├── overall_status = UNSAFE if unsafe_pct > 10 else SAFE
       ├── Write annotated frames to output/<uuid>.mp4
       └── Return result dict

4. Backend saves to PostgreSQL:
   ├── INSERT into videos (status, confidence, duration, ...)
   └── BULK INSERT first 100 detections into detections

5. Backend broadcasts WS alert: "UNSAFE detected" or "SAFE result"

6. Backend returns JSON response to frontend

7. FRONTEND UploadSlot receives response:
   ├── Shows SAFE (green) or UNSAFE (red) result banner
   ├── Shows confidence bar and percentages
   ├── Shows download link for annotated video
   └── Dispatches CustomEvent 'vs:analysis-result' on window

8. SmartAlerts component receives CustomEvent:
   ├── Checks if UNSAFE
   ├── Increments window counter
   └── If threshold exceeded → fires browser notification + beep

9. USER clicks "HISTORY ↗" tab
   │
   └── navigate('/history') → History page fetches
       GET /videos/history?email=user@email.com
       Displays paginated list with confidence filter
```

---

## 15. Safety Classification Logic

### Safe Activities

```python
SAFE_ACTIVITIES = {"Walking", "Running", "Standing", "Sitting", "Yoga"}
```

Any activity not in this set is classified UNSAFE.

### PKL Classifier

The `pose_activity_model.pkl` is a scikit-learn model trained on a dataset of human poses. Input: 10 joint angle values (in degrees). Output: activity label string + confidence probability.

### Rule-Based Fallback

If the PKL classifier returns low confidence (or fails), a rule-based fallback uses angle thresholds:

- Elbow angles < 90° + hip angles < 45° → `"Fighting"`
- Knee angle < 30° → `"Falling"`
- Standing upright angles → `"Standing"`
- etc.

### Video-Level Decision

```
unsafe_pct = (unsafe_frame_count / total_frame_count) × 100
video_status = "UNSAFE" if unsafe_pct > 10.0 else "SAFE"
confidence = 1.0 - (unsafe_pct / 100)
```

The 10% threshold means brief incidental gestures that look unsafe won't flag a whole video. A sustained unsafe activity will.

---

## 16. LocalStorage Keys

| Key                      | Value                     | Purpose                               |
| ------------------------ | ------------------------- | ------------------------------------- |
| `vs-theme`             | `"dark"` or `"light"` | Theme preference                      |
| `vs-onboarded-{email}` | `"1"`                   | Whether user has seen onboarding tour |
| `vs-alert-settings`    | JSON object               | SmartAlerts configuration             |
| `vs-alert-history`     | JSON array (max 100)      | History of fired alerts               |
| `vs-flagged`           | JSON object (video IDs)   | Admin-flagged video IDs               |

All keys are set via `localStorage.setItem()` and read via `localStorage.getItem()`. The alert settings and history survive page reloads; flagged videos persist across sessions for the same browser.

---

## 17. Deployment

### Frontend (Vercel)

The frontend is deployed to Vercel at `https://vision-ai-delta.vercel.app`.

- Build command: `npm run build`
- Output directory: `dist`
- All routes use client-side routing — configure Vercel to rewrite all paths to `index.html`
- `API_BASE` in `config/api.js` should point to the production backend URL

### Backend (Self-hosted)

The FastAPI backend runs on a server with:

```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

For production use a process manager like `supervisord` or `systemd` to keep it running.

**CORS origins** in `app.py` include both localhost ports and the Vercel domain:

```python
allow_origins=[
    "http://localhost:5173",
    "https://vision-ai-delta.vercel.app",
]
```

Add your production frontend URL here if different.

### Required Services

1. **PostgreSQL** — running and accessible at `DATABASE_URL`
2. **Firebase project** — with Authentication enabled (Email/Password + Google)
3. **Firebase service account JSON** — referenced by `GOOGLE_APPLICATION_CREDENTIALS`
4. **SMTP server** — for contact form and welcome emails

---

## 18. Known Constraints & Design Decisions

### Synchronous AI Processing

`process_video()` runs synchronously in the POST endpoint handler. For long videos (>5 min), this will block the request for minutes. The current architecture works at low concurrency. For production scale, move to an async task queue (Celery + Redis) with polling or WebSocket status updates.

### No Role System in Database

Admin access is controlled by a hardcoded email allowlist in the frontend code. There is no `role` column in the `users` table. This means admins are defined in source code, not a database. To add a new admin, update `ADMIN_EMAILS` in both `Navbar.jsx` and `AdminPanel.jsx`.

### Detection Truncation

Only the first 100 detections per video are saved to the database. For long videos with many people, this may miss later detections. The `overall_status` is still computed from all frames (in the AI engine), but the `detections` table only stores the first 100.

### Live Camera Sends JPEGs as "Video"

The live camera captures individual JPEG frames and sends them to `/upload-video` which expects a video file. This works because the backend passes the file directly to `process_video()` via OpenCV, which can handle single-frame "videos". The result will always show 1 frame analyzed.

### localStorage for Admin Flags

Flagged video IDs are stored in the browser's localStorage, not the database. This means flags are per-browser and are lost if the user clears storage or uses a different browser. A production version should store flags in the `videos` table with a `is_flagged` boolean column.

### WebSocket Broadcasts to All Users

The current WebSocket implementation broadcasts every alert to every connected client. A video analyzed by User A will appear as a notification for User B if they're both connected. For production, implement per-user WebSocket rooms with auth-gated connections.

### Confidence Display Quirk

The `confidence` field stored in the DB represents the safe frame proportion: `1.0 - (unsafe_pct / 100)`. This means a video that is 100% safe has confidence = 1.0. For an UNSAFE video with 50% unsafe frames, confidence = 0.5. The History page shows this as a percentage and also separately shows `safe_percentage` and `unsafe_percentage` fields from the API response.
