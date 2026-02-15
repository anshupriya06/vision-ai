# Vision AI - Local Setup Guide

This guide walks you through running Vision AI on your local machine.

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Git (optional)

## 1) Get the Code

**Option A: Git**
```bash
git clone <your-repo-url>
cd vision-ai
```

**Option B: ZIP**
Extract the project folder to a location of your choice.

## 2) Database Setup (PostgreSQL)

### 2.1 Create Database
```sql
CREATE DATABASE visionsafe;
```

### 2.2 Apply Schema
```bash
psql -U postgres -d visionsafe
\i backend/database_schema.sql
```

## 3) Backend Setup (FastAPI)

### 3.1 Create and Activate Virtual Environment
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 3.2 Install Dependencies
```bash
pip install -r requirements.txt
```

### 3.3 Backend Environment Variables
Create `backend/.env` with:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/visionsafe
GOOGLE_APPLICATION_CREDENTIALS=serviceAccountKey.json

# Optional email settings
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com
```

## 4) Firebase Setup

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Create a project or use an existing one
3. Enable **Authentication** → **Email/Password** and **Google**
4. Go to **Project Settings** → **Service Accounts** → **Generate new private key**
5. Save the file as `backend/serviceAccountKey.json`

## 5) Frontend Setup (React + Vite)

### 5.1 Install Dependencies
```bash
cd frontend
npm install
```

### 5.2 Frontend Environment Variables
Create `frontend/.env` with:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

Get these values from **Firebase Console → Project Settings → General → Your apps**.

## 6) Run the App

### Backend
```bash
cd backend
venv\Scripts\activate
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

## Troubleshooting

**Database errors**
- Ensure PostgreSQL is running
- Verify `DATABASE_URL`
- Ensure the `visionsafe` database exists

**Firebase auth errors**
- Confirm Email/Password auth is enabled
- Confirm `frontend/.env` values
- Ensure `backend/serviceAccountKey.json` is present

**Module not found**
```bash
cd backend
pip install -r requirements.txt

cd frontend
npm install
```

**Port in use**
- Backend: `uvicorn app:app --reload --port 8001`
- Frontend: change `vite.config.js` port
