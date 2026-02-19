# VisionSafe - AI Surveillance Safety Detection

An intelligent video surveillance system that uses AI to detect and classify safety-critical activities in real-time.

## Features

- Real-time video processing and analysis
- AI-powered detection using YOLOv8 + MediaPipe
- Activity classification (SAFE/UNSAFE)
- User authentication with Firebase
- Video history and analytics dashboard
- Email notifications

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Firebase account

## Installation

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
   python migrate_db.py  # Initialize database
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   ```

4. **Configure Environment**
   - Create `.env` in `backend/` with database and Firebase credentials
   - Create `.env` in `frontend/` with Firebase config
   - See [SETUP_GUIDE.md](SETUP_GUIDE.md) for details

5. **Run Application**
   
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

6. **Access**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Tech Stack

**Frontend:**
- React + Vite
- Tailwind CSS
- Firebase Authentication
- Axios

**Backend:**
- FastAPI
- PostgreSQL + SQLAlchemy
- Firebase Admin
- YOLOv8 + MediaPipe
- OpenCV

## Project Structure

```
vision-ai/
├── backend/          # FastAPI backend server
├── frontend/         # React frontend application
└── model/            # AI model training
```

## Troubleshooting

- **Database connection error**: Check PostgreSQL is running and DATABASE_URL in `.env` is correct
- **Firebase auth failed**: Verify `serviceAccountKey.json` exists in backend directory
- **Port already in use**: Change port with `uvicorn app:app --port 8001`

For more help, see [SETUP_GUIDE.md](SETUP_GUIDE.md)

## License

This project is for educational purposes.
