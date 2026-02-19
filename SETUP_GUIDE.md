# VisionSafe - Complete Setup Guide

A step-by-step guide to set up VisionSafe locally for development.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Firebase Setup](#firebase-setup)
3. [PostgreSQL Setup](#postgresql-setup)
4. [Backend Setup](#backend-setup)
5. [Frontend Setup](#frontend-setup)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Specifications
- **OS**: Windows, macOS, or Linux
- **RAM**: 4GB (8GB recommended)
- **Storage**: 5GB free space
- **Processor**: Dual-core or better

### Required Software

#### Windows
1. **Python 3.10+**
   - Download from [python.org](https://www.python.org/downloads/)
   - During installation, check "Add Python to PATH"
   - Verify: `python --version`

2. **Node.js 18+**
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version` and `npm --version`

3. **PostgreSQL 14+**
   - Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - During installation, remember the password for `postgres` user
   - Verify: `psql --version`

4. **Git**
   - Download from [git-scm.com](https://git-scm.com/)

#### macOS/Linux
```bash
# macOS (using Homebrew)
brew install python@3.10 node postgresql git

# Ubuntu/Debian
sudo apt-get install python3.10 nodejs postgresql postgresql-contrib git
```

---

## Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name: `VisionSafe` (or your preferred name)
4. Accept terms and select **"Create project"**
5. Wait for project creation to complete

### Step 2: Enable Authentication

1. In Firebase Console, go to **Build** > **Authentication**
2. Click **"Get started"**
3. Enable these sign-in methods:
   - **Email/Password**: Click enable
   - **Google**: Click enable, add your email as test user

### Step 3: Get Firebase Credentials

#### For Backend (serviceAccountKey.json)
1. Go to **Project Settings** (gear icon)
2. Click **"Service Accounts"** tab
3. Select **Python** from dropdown
4. Click **"Generate new private key"**
5. Save file as `serviceAccountKey.json` in `backend/` folder

#### For Frontend (Web SDK Config)
1. In Project Settings, go to **Your apps**
2. Click the **Web app** icon (or create one)
3. Copy the firebaseConfig object
4. Save these values for later:
   ```
   VITE_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN
   VITE_FIREBASE_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID
   VITE_FIREBASE_APP_ID
   VITE_FIREBASE_MEASUREMENT_ID
   ```

---

## PostgreSQL Setup

### Step 1: Install PostgreSQL

**Windows:**
- Run installer from [postgresql.org](https://www.postgresql.org/download/windows/)
- Note the password you set for `postgres` user
- Default port: 5432

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

### Step 2: Create Database

Open terminal/command prompt and run:

```bash
# Connect to PostgreSQL
psql -U postgres

# Inside psql, create database
CREATE DATABASE visionsafe;
CREATE USER visionsafe_user WITH PASSWORD 'your_secure_password';
ALTER ROLE visionsafe_user SET client_encoding TO 'utf8';
ALTER ROLE visionsafe_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE visionsafe_user SET default_transaction_deferrable TO on;
ALTER ROLE visionsafe_user SET default_transaction_level TO 'read committed';
GRANT ALL PRIVILEGES ON DATABASE visionsafe TO visionsafe_user;
\q
```

### Step 3: Verify Connection

```bash
psql -U visionsafe_user -d visionsafe -h localhost
```

If successful, you should see the `visionsafe=#` prompt.

---

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd vision-ai
cd backend
```

### Step 2: Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` at the start of your terminal prompt.

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- FastAPI & Uvicorn (web server)
- PostgreSQL driver (psycopg2)
- Firebase Admin SDK
- YOLOv8 & MediaPipe (AI models)
- And other required packages

### Step 4: Create Backend .env File

In `backend/` folder, create `.env` file:

```env
# Database Configuration
DATABASE_URL=postgresql://visionsafe_user:your_secure_password@localhost:5432/visionsafe

# Firebase Configuration
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json

# Email Configuration (Gmail)
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

**For Gmail:**
- Create an [App Password](https://myaccount.google.com/apppasswords) (2FA must be enabled)
- Use the 16-character password

### Step 5: Initialize Database

```bash
# Make sure serviceAccountKey.json is in backend folder
python migrate_db.py
```

Expected output:
```
Starting VisionSafe Database Migration
Connecting to database: visionsafe on localhost:5432
Connected to database
Migration completed successfully!
'users' table verified
'videos' table verified
'detections' table verified
```

### Step 6: Verify Backend

```bash
python -c "import fastapi; print('FastAPI OK')"
python -c "import firebase_admin; print('Firebase OK')"
python -c "import cv2; print('OpenCV OK')"
```

---

## Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
cd ../frontend
# or from project root: cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs React, Vite, Tailwind CSS, and other packages.

### Step 3: Create Frontend .env File

In `frontend/` folder, create `.env` file:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# API Configuration
VITE_API_URL=http://localhost:8000
```

Replace with values from Firebase console (Step 2 of Firebase Setup).

### Step 4: Verify Frontend

```bash
npm run build
```

If no errors, build succeeded.

---

## Running the Application

### Prerequisites Check

Before starting, ensure:
- ✅ PostgreSQL is running
- ✅ `.env` files exist in both `backend/` and `frontend/`
- ✅ `serviceAccountKey.json` exists in `backend/`
- ✅ Virtual environment is activated (for backend)

### Terminal 1 - Start Backend

```bash
cd backend
# Make sure (venv) is in prompt
uvicorn app:app --reload
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

### Terminal 2 - Start Frontend

```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v5.0.0  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Step 3: Access Application

- **Frontend**: Open [http://localhost:5173](http://localhost:5173)
- **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Alternative API Docs**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Step 4: Test Login

1. Visit [http://localhost:5173](http://localhost:5173)
2. Click "Sign In"
3. Choose Google Sign-In or Email/Password
4. Complete authentication
5. You should see the dashboard

---

## Troubleshooting

### Backend Issues

#### Port Already in Use (8000)

```bash
# Windows - Find and kill process
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9
```

Or use a different port:
```bash
uvicorn app:app --port 8001 --reload
```

#### Database Connection Error

```
psycopg2.OperationalError: could not connect to server
```

**Solutions:**
1. Verify PostgreSQL is running:
   ```bash
   psql -U postgres  # If this fails, PostgreSQL isn't running
   ```

2. Check DATABASE_URL in `.env`:
   ```
   DATABASE_URL=postgresql://visionsafe_user:password@localhost:5432/visionsafe
   ```

3. Verify database exists:
   ```bash
   psql -U postgres -l  # List all databases
   ```

4. Recreate database if needed:
   ```bash
   dropdb -U postgres visionsafe
   createdb -U postgres visionsafe
   python migrate_db.py
   ```

#### Firebase Connection Error

```
Error: Firebase Admin initialization failed
```

**Solutions:**
1. Check `serviceAccountKey.json` exists in `backend/`
2. Verify file permissions (should be readable)
3. Check file isn't corrupted (open and verify JSON format)
4. Ensure `GOOGLE_APPLICATION_CREDENTIALS` in `.env` is correct

#### Models Not Downloading

```
FileNotFoundError: model/yolov8n.pt
```

**Solution:**
- Models auto-download on first use (~100MB, may take 1-2 minutes)
- Ensure internet connection is active
- Check `backend/model/` folder has write permissions

### Frontend Issues

#### Port Already in Use (5173)

```bash
npm run dev -- --port 5174
```

#### npm install Fails

```bash
npm cache clean --force
rm package-lock.json
npm install
```

#### Firebase Config Error

```
ConfigError: Invalid Firebase configuration
```

**Solutions:**
1. Verify all `VITE_FIREBASE_*` variables in `.env`
2. Ensure values match Firebase console exactly
3. Check no extra spaces in `.env`
4. Restart frontend: `npm run dev`

#### CORS Error

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
- This usually means backend isn't running
- Start backend first: `uvicorn app:app --reload`
- Verify BACKEND_URL in frontend `.env` is correct

### General Issues

#### Virtual Environment Not Activated

You should see `(venv)` in terminal prompt:
```
(venv) PS C:\path\to\backend>
```

If not activated:
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

#### Environment Variables Not Loading

1. Ensure `.env` files are in correct directories:
   - `backend/.env`
   - `frontend/.env`

2. Restart the application after creating/modifying `.env`

3. Check `.env` syntax (no spaces around `=`):
   ```env
   DATABASE_URL=postgresql://user:pass@localhost:5432/db  # Correct
   DATABASE_URL = postgresql://user:pass@localhost:5432/db  # Wrong (extra spaces)
   ```

#### "Can't find python/node/npm"

Make sure to add to system PATH:
- Python installation directory
- Node.js installation directory

Then restart terminal/command prompt.

---

## Helpful Commands

### Backend
```bash
# Activate virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Run with different port
uvicorn app:app --port 8001 --reload

# Access database
psql -U visionsafe_user -d visionsafe

# Reset database
python migrate_db.py
```

### Frontend
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Clean node_modules
rm -rf node_modules package-lock.json
npm install
```

### PostgreSQL
```bash
# Connect to database
psql -U visionsafe_user -d visionsafe

# Common commands (inside psql):
\dt              # List tables
\q               # Quit
SELECT * FROM users;  # Query data
```

---

## Next Steps

After successful setup:

1. **Explore the Application**
   - Upload a test video
   - Check video history
   - View analytics

2. **Check API Documentation**
   - Visit [http://localhost:8000/docs](http://localhost:8000/docs)
   - Try different endpoints

3. **Understand the Code**
   - Read [README.md](README.md)
   - Check `backend/app.py` and `frontend/src/App.jsx`
   - Explore AI logic in `backend/ai_engine.py`

4. **Customization**
   - Modify activity detection labels
   - Change UI colors in Tailwind config
   - Adjust email notifications

---

## Getting Help

If you encounter issues:

1. Check [Troubleshooting](#troubleshooting) section above
2. Check application logs in terminal
3. Verify all `.env` variables are correct
4. Ensure all services (PostgreSQL, Firebase) are running
5. Try clearing cache and reinstalling dependencies

---

**Last Updated**: February 2026  
**Version**: 1.0.0
