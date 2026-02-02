# 🚀 VisionSafe Deployment Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Domain & SSL](#domain--ssl)
7. [CI/CD Setup](#cicd-setup)
8. [Monitoring](#monitoring)

---

## Prerequisites

### Required Accounts
- [ ] GitHub account
- [ ] Cloud hosting provider (choose one):
  - Railway (easiest, free tier)
  - Heroku
  - AWS
  - Azure
  - DigitalOcean
- [ ] PostgreSQL hosting (ElephantSQL, Supabase, or Railway)
- [ ] Frontend hosting (Vercel or Netlify - free)
- [ ] Firebase project (for authentication)
- [ ] SMTP service (Gmail or SendGrid)

### System Requirements
- Python 3.12+
- Node.js 18+
- Git

---

## Environment Setup

### 1. Prepare Environment Variables

Create `.env.production` in backend folder:
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Firebase
GOOGLE_APPLICATION_CREDENTIALS=/path/to/firebase-key.json
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@project.iam.gserviceaccount.com

# SMTP Email
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Security
SECRET_KEY=generate-random-secret-key-here
```

### 2. Create Production Config Files

**backend/Procfile** (for Heroku/Railway):
```
web: uvicorn app:app --host 0.0.0.0 --port $PORT
```

**backend/runtime.txt**:
```
python-3.12.0
```

**backend/requirements.txt** (ensure all deps are listed):
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
websockets==12.0
firebase-admin==6.5.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
alembic==1.13.0
python-dotenv==1.0.0
ultralytics>=8.0.0
opencv-python-headless>=4.8.0
mediapipe>=0.10.0
numpy>=1.24.0
pandas>=2.0.0
scikit-learn>=1.3.0
joblib>=1.3.0
```

**Important:** Use `opencv-python-headless` for production (no GUI dependencies)!

---

## Database Setup

### Option 1: Railway (Recommended - Easy)
1. Go to [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy the `DATABASE_URL` from Variables tab
4. Add to your backend `.env`

### Option 2: Supabase (Free Tier)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Format: `postgresql://postgres:[password]@[host]:5432/postgres`

### Option 3: ElephantSQL (Free Tier)
1. Go to [elephantsql.com](https://www.elephantsql.com)
2. Create new instance (Tiny Turtle - Free)
3. Copy the URL from Details page

### Initialize Database Tables
```bash
cd backend
python migrate_db.py
```

---

## Backend Deployment

### 🌟 Option 1: Railway (Easiest - Recommended)

#### Step-by-Step:
1. **Push Code to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy on Railway:**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `vision-ai` repository
   - Choose `backend` as root directory

3. **Configure Environment:**
   - Click on your service → Variables
   - Add all environment variables from `.env.production`
   - Set `PORT=8000`

4. **Configure Build:**
   - Settings → Build Command: (leave default)
   - Settings → Start Command: `uvicorn app:app --host 0.0.0.0 --port $PORT`

5. **Generate Domain:**
   - Settings → Generate Domain
   - Copy the URL (e.g., `vision-ai-backend.up.railway.app`)

6. **Upload Model Files:**
   - Use Railway CLI or add models to GitHub (if <100MB)
   - For large files, use GitHub LFS or cloud storage

#### Railway Deployment Structure:
```
backend/
├── app.py
├── ai_engine.py
├── requirements.txt
├── Procfile
├── runtime.txt
└── model/
    ├── yolov8n.pt
    └── models/
        ├── pose_activity_model.pkl
        ├── pose_scaler.pkl
        └── pose_feature_cols.pkl
```

---

### Option 2: Heroku

```bash
# Install Heroku CLI
# Windows: Download from heroku.com
# Mac: brew tap heroku/brew && brew install heroku

# Login
heroku login

# Create app
cd backend
heroku create vision-ai-backend

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set FIREBASE_PROJECT_ID=your-project-id
heroku config:set SMTP_USERNAME=your-email@gmail.com
# ... add all other env vars

# Add buildpack for Python with system dependencies
heroku buildpacks:add --index 1 heroku-community/apt
echo "libgl1-mesa-glx" > Aptfile
echo "libglib2.0-0" >> Aptfile

# Deploy
git push heroku main

# Run migrations
heroku run python migrate_db.py

# Open app
heroku open
```

---

### Option 3: AWS EC2

#### 1. Launch EC2 Instance:
- Ubuntu 22.04 LTS
- t3.medium (2 vCPU, 4GB RAM) - for AI processing
- Security Group: Allow ports 22, 80, 443, 8000

#### 2. SSH and Setup:
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.12
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt install python3.12 python3.12-venv python3-pip -y

# Install system dependencies
sudo apt install -y libgl1-mesa-glx libglib2.0-0 postgresql-client

# Clone repository
git clone https://github.com/yourusername/vision-ai.git
cd vision-ai/backend

# Create virtual environment
python3.12 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
nano .env  # Add your environment variables

# Run migrations
python migrate_db.py

# Install and configure Nginx
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/vision-ai
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /ws {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/vision-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup systemd service
sudo nano /etc/systemd/system/vision-ai.service
```

**Systemd service:**
```ini
[Unit]
Description=VisionSafe Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/vision-ai/backend
Environment="PATH=/home/ubuntu/vision-ai/backend/venv/bin"
ExecStart=/home/ubuntu/vision-ai/backend/venv/bin/uvicorn app:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable vision-ai
sudo systemctl start vision-ai
sudo systemctl status vision-ai
```

---

### Option 4: Docker Deployment

**backend/Dockerfile:**
```dockerfile
FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Copy model files
COPY model/ /app/model/

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/visionai
    env_file:
      - ./backend/.env
    depends_on:
      - db
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/output:/app/output

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=visionai
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Deploy:
```bash
docker-compose up -d
```

---

## Frontend Deployment

### 🌟 Option 1: Vercel (Recommended)

#### Step 1: Update API URL
**frontend/.env.production:**
```env
VITE_API_URL=https://your-backend-domain.railway.app
```

**frontend/src/components/Dashboard.jsx** (update all API calls):
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Example usage:
const response = await axios.post(`${API_URL}/upload-video`, formData);
```

#### Step 2: Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod
```

**Or via Vercel Dashboard:**
1. Go to [vercel.com](https://vercel.com)
2. Import Git Repository
3. Select `vision-ai` repo
4. Framework Preset: Vite
5. Root Directory: `frontend`
6. Environment Variables: Add `VITE_API_URL`
7. Deploy!

**vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

### Option 2: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd frontend
netlify deploy --prod
```

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  VITE_API_URL = "https://your-backend-domain.railway.app"
```

---

### Option 3: AWS S3 + CloudFront

```bash
cd frontend

# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --acl public-read

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

---

## Domain & SSL

### Using Custom Domain

#### Backend (Railway):
1. Go to Railway project → Settings
2. Add custom domain: `api.yourdomain.com`
3. Add CNAME record in your DNS:
   ```
   Type: CNAME
   Name: api
   Value: vision-ai-backend.up.railway.app
   ```

#### Frontend (Vercel):
1. Go to Vercel project → Settings → Domains
2. Add domain: `yourdomain.com`
3. Add DNS records as shown

**SSL is automatic on Vercel, Railway, Netlify!**

---

## CI/CD Setup

### GitHub Actions

**.github/workflows/deploy.yml:**
```yaml
name: Deploy VisionSafe

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: backend

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
```

---

## Monitoring

### 1. Application Monitoring

**Backend Health Check Endpoint:**
```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "models_loaded": yolo_model is not None
    }
```

### 2. Error Tracking

**Install Sentry:**
```bash
pip install sentry-sdk
```

**backend/app.py:**
```python
import sentry_sdk

sentry_sdk.init(
    dsn="your-sentry-dsn",
    traces_sample_rate=1.0,
)
```

### 3. Performance Monitoring

Use Railway/Heroku built-in metrics or:
- New Relic
- DataDog
- Prometheus + Grafana

---

## Post-Deployment Checklist

- [ ] Backend is accessible at your domain
- [ ] Frontend loads correctly
- [ ] Video upload works end-to-end
- [ ] AI processing completes successfully
- [ ] Database stores videos correctly
- [ ] Email notifications work
- [ ] WebSocket alerts function
- [ ] SSL certificates active (HTTPS)
- [ ] Environment variables secured
- [ ] CORS configured for frontend domain
- [ ] Model files deployed correctly
- [ ] Health check endpoint responds
- [ ] Error monitoring active
- [ ] Backups configured for database

---

## Troubleshooting

### Backend Issues

**Models not loading:**
```bash
# Check if model files exist
ls -la model/
ls -la model/models/

# Check file permissions
chmod +r model/yolov8n.pt
```

**Database connection fails:**
```bash
# Test connection
python -c "from database import init_db; init_db()"
```

**Out of memory:**
- Increase instance size (2GB minimum for AI models)
- Reduce MediaPipe complexity
- Enable frame skipping

### Frontend Issues

**API calls fail:**
- Check CORS settings in backend
- Verify API URL in frontend .env
- Check browser console for errors

**Build fails:**
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

---

## Cost Estimation

### Free Tier Deployment:
- **Backend:** Railway (500 hours/month free)
- **Frontend:** Vercel (unlimited)
- **Database:** Supabase (500MB free)
- **Total:** $0/month

### Production Deployment:
- **Backend:** Railway Starter ($5/month) or AWS t3.medium ($30/month)
- **Database:** Railway ($5/month) or AWS RDS ($15/month)
- **Frontend:** Vercel Pro ($20/month) or Netlify Pro ($19/month)
- **Storage:** AWS S3 (~$5/month for videos)
- **Total:** $35-70/month

---

## Quick Start Commands

```bash
# 1. Prepare for deployment
git add .
git commit -m "Production ready"
git push origin main

# 2. Deploy backend to Railway (via web UI)
# - Connect GitHub repo
# - Set environment variables
# - Deploy

# 3. Deploy frontend to Vercel
cd frontend
vercel --prod

# 4. Update frontend API URL
# Edit frontend/.env.production with Railway URL
# Redeploy

# 5. Test
curl https://your-backend.railway.app/health
```

---

## Support

For deployment issues:
- Railway: [docs.railway.app](https://docs.railway.app)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- FastAPI: [fastapi.tiangolo.com/deployment](https://fastapi.tiangolo.com/deployment/)

---

**Deployment Date:** February 2026
**Status:** ✅ Ready for Production
