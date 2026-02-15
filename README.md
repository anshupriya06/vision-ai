# Vision AI - Surveillance Safety Detection System

An intelligent video surveillance system that uses AI to detect and classify safety-critical activities in real-time.

## 🎯 Features

- **Real-time Video Processing** - Upload and analyze surveillance videos
- **AI-Powered Detection** - YOLOv8 + MediaPipe for activity recognition
- **Safety Classification** - Automatically categorizes activities as SAFE or UNSAFE
- **User Authentication** - Firebase Authentication (Google Sign-In & Email/Password)
- **Video History** - Track and review all processed videos
- **Dashboard & Analytics** - Visualize detection statistics
- **Email Notifications** - Newsletter subscription system

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd vision-ai
   ```

2. **Setup Backend**
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   ```

4. **Configure Environment**
   - See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions
   - Create `.env` files in both `backend/` and `frontend/` folders
   - Setup Firebase and PostgreSQL

5. **Run the Application**
   
   Backend:
   ```bash
   cd backend
   uvicorn app:app --reload
   ```
   
   Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access** - Open `http://localhost:5173` in your browser

## 📖 Documentation

For detailed setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md)

## 🏗️ Tech Stack

**Frontend:**
- React + Vite
- TailwindCSS
- Firebase Authentication
- Axios

**Backend:**
- FastAPI
- PostgreSQL + SQLAlchemy
- Firebase Admin SDK
- YOLOv8 (Ultralytics)
- MediaPipe

**AI/ML:**
- YOLOv8 for object detection
- MediaPipe for pose estimation
- Custom activity classifier

## 📁 Project Structure

```
vision-ai/
├── backend/          # FastAPI backend
│   ├── app.py
│   ├── ai_engine.py
│   ├── database.py
│   └── model/
├── frontend/         # React frontend
│   └── src/
└── model/           # AI model training
```



## 📝 License

This project is for educational purposes.

## 🐛 Troubleshooting

See [SETUP_GUIDE.md](SETUP_GUIDE.md#troubleshooting) for common issues and solutions.
