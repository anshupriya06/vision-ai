# VisionSafe - AI-Powered Surveillance Safety Detection System

An enterprise-grade intelligent video surveillance platform that leverages computer vision and deep learning to detect and classify safety-critical activities in real-time. Designed for security monitoring, workplace safety, and activity recognition across multi-camera systems.

## 🎯 Key Features

- **Real-time Video Processing** - Upload and process surveillance videos with advanced AI models
- **AI-Powered Activity Detection** - Multi-model detection using YOLOv8 (objects) + MediaPipe (pose/gestures)
- **Intelligent Safety Classification** - Automatic categorization of detected activities as SAFE or UNSAFE
- **Multi-Activity Recognition** - Detects 8+ safety-critical activities (Fighting, Fire, Smoking, Unauthorized Vehicles, etc.)
- **User Authentication** - Secure Firebase Authentication with Google Sign-In & Email/Password
- **Video History & Archives** - Complete audit trail of all processed videos with metadata
- **Analytics Dashboard** - Real-time statistics and historical trends visualization
- **Email Notifications** - Automated alerts and newsletter subscription system
- **RESTful API** - Comprehensive API for integration with third-party systems

## 🚀 Getting Started

### System Requirements

- **Python** 3.10 or higher
- **Node.js** 18 or higher  
- **PostgreSQL** 14 or higher (local or remote)
- **RAM** Minimum 4GB (8GB recommended for video processing)
- **GPU** Optional but recommended (NVIDIA CUDA for faster inference)

### Prerequisites Configuration

Before installation, ensure the following services are running:

1. **PostgreSQL Database**
   - Install PostgreSQL 14+
   - Ensure server is running on `localhost:5432` (or configure via `.env`)
   - Default credentials: `postgres:1234` (change in production!)

2. **Firebase Project**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication methods (Google & Email/Password)
   - Download service account key (`serviceAccountKey.json`)
   - Enable Firestore/Realtime Database (if needed)

### Step-by-Step Installation

#### 1. Clone Repository
```bash
git clone <your-repo-url>
cd vision-ai
```

#### 2. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### 3. Configure Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:1234@localhost:5432/visionsafe

# Firebase Configuration
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json

# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your-app-password

# API Configuration
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

# Environment
DEBUG=True
```

#### 4. Initialize Database

This step creates all required tables and schema:

```bash
python migrate_db.py
```

Expected output:
```
Starting VisionSafe Database Migration
Connecting to database: visionsafe on localhost:5432
Migration completed successfully!
'users' table verified
'videos' table verified  
'detections' table verified
```

#### 5. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

VITE_API_URL=http://localhost:8000
```

#### 6. Run Application

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

#### 7. Access Application

- **Frontend**: Open `http://localhost:5173` in your browser
- **Backend API**: `http://localhost:8000`
- **API Docs**: `http://localhost:8000/docs` (Swagger UI)
- **API Redocs**: `http://localhost:8000/redoc` (ReDoc)

## � API Documentation

### Core Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user

#### Video Processing
- `POST /videos/upload` - Upload and process video
- `GET /videos/history` - Get user's video history
- `GET /videos/{video_id}` - Get video details
- `GET /videos/{video_id}/detections` - Get detections for a video
- `DELETE /videos/{video_id}` - Delete video record

#### User Profile
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `GET /users/stats` - Get user statistics

#### Analytics
- `GET /analytics/dashboard` - Get dashboard statistics
- `GET /analytics/activities` - Get activity breakdown
- `GET /analytics/safety-trends` - Get safety trends over time

#### Email
- `POST /email/subscribe` - Subscribe to newsletter
- `POST /email/contact` - Send contact form email

### Example Request

```bash
# Upload and process a video
curl -X POST http://localhost:8000/videos/upload \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -F "file=@surveillance_video.mp4"

# Get video history
curl -X GET http://localhost:8000/videos/history \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

For complete API documentation, visit `http://localhost:8000/docs`

## 🏗️ Architecture & Tech Stack

### Frontend Architecture
- **Framework**: React 18.2.0 with TypeScript support
- **Build Tool**: Vite 5.0+ (Lightning-fast development)
- **Styling**: Tailwind CSS 3.3+ with PostCSS
- **HTTP Client**: Axios for API communication
- **Charts**: Recharts for analytics visualization
- **PDF Export**: jsPDF + jsPDF-AutoTable for report generation
- **Authentication**: Firebase SDK for user management
- **Routing**: React Router DOM v6 for client-side navigation

### Backend Architecture
- **Framework**: FastAPI 0.104+ (async, high-performance)
- **Server**: Uvicorn ASGI server
- **Database**: PostgreSQL 14+ with SQLAlchemy ORM
- **Authentication**: Firebase Admin SDK + JWT tokens
- **Video Processing**: OpenCV for frame extraction & manipulation
- **Email Service**: SMTP integration (Gmail, SendGrid, etc.)
- **Async Support**: WebSockets for real-time updates

### AI/ML Stack
- **Object Detection**: YOLOv8 Nano (Ultralytics)
- **Pose Estimation**: MediaPipe (Google)
- **Activity Classification**: Custom scikit-learn models
- **Data Processing**: NumPy, Pandas, scikit-learn

### Database Schema
- **Videos**: Metadata for all processed surveillance videos
- **Detections**: Frame-level activity detections with confidence scores
- **Users**: User profiles and authentication data
- **Views**: Pre-computed analytics and reporting queries

### Infrastructure
- **Development**: Local PostgreSQL + Firebase Emulator
- **Production Ready**: Cloud deployment support (AWS, Azure, GCP)
- **API Documentation**: Auto-generated Swagger UI & ReDoc

## 📁 Project Structure

```
vision-ai/
│
├── backend/                    # FastAPI Backend Server
│   ├── app.py                 # Main FastAPI application
│   ├── ai_engine.py           # Video processing & AI inference
│   ├── database.py            # SQLAlchemy ORM models
│   ├── database_schema.sql    # PostgreSQL schema definition
│   ├── migrate_db.py          # Database initialization script
│   ├── email_service.py       # Email notification system
│   ├── requirements.txt       # Python dependencies
│   ├── Procfile               # Heroku deployment config
│   ├── serviceAccountKey.json # Firebase credentials (git-ignored)
│   ├── uploads/               # Temporary video uploads
│   ├── output/                # Processed video outputs
│   ├── model/                 # AI model weights
│   │   └── yolov8n.pt        # YOLOv8 Nano pretrained weights
│   └── __pycache__/           # Python cache
│
├── frontend/                   # React + Vite Frontend
│   ├── src/
│   │   ├── App.jsx            # Root component
│   │   ├── main.jsx           # Application entry point
│   │   ├── firebase.js        # Firebase configuration
│   │   ├── index.css          # Global styles
│   │   ├── components/        # Reusable React components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── VideoHistory.jsx
│   │   │   ├── AlertNotifications.jsx
│   │   │   └── ...
│   │   ├── pages/             # Page components
│   │   │   ├── Profile.jsx
│   │   │   ├── History.jsx
│   │   │   └── ...
│   │   ├── contexts/          # React contexts (state management)
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/             # Custom React hooks
│   │   │   └── useAuth.js
│   │   └── config/            # Configuration files
│   │       └── api.js
│   ├── package.json           # Node.js dependencies
│   ├── vite.config.js         # Vite configuration
│   ├── tailwind.config.js     # Tailwind CSS config
│   ├── postcss.config.js      # PostCSS config
│   ├── index.html             # HTML entry point
│   └── .env                   # Frontend environment variables
│
├── model/                      # AI Model Training
│   ├── main.py                # Training pipeline
│   ├── train_pose_model.py    # Pose model trainer
│   ├── vision_safe_final.py   # Final model evaluation
│   ├── pose_dataset.csv       # Training dataset
│   ├── requirement.txt        # ML dependencies
│   ├── dataset/               # Training data
│   │   ├── train/
│   │   ├── val/
│   │   └── test/
│   ├── input/                 # Model input samples
│   └── output/                # Training artifacts
│
├── README.md                  # Project documentation (this file)
└── SETUP_GUIDE.md            # Detailed setup instructions
```



## 📝 License

This project is for educational purposes.

## 🐛 Troubleshooting

See [SETUP_GUIDE.md](SETUP_GUIDE.md#troubleshooting) for common issues and solutions.
