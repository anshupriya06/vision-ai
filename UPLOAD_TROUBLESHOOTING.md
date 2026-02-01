# Video Upload Troubleshooting Guide

## Quick Diagnostic Checklist

### 1. Backend Server
- [ ] Backend is running on http://localhost:8000
- [ ] See "✅ Firebase Admin initialized" in logs
- [ ] See "✅ Database initialized successfully" in logs
- [ ] No errors in backend console

**Fix if failing:**
```bash
cd backend
python app.py
```

### 2. Frontend Server
- [ ] Frontend is running on http://localhost:3000 (or 3001/3002)
- [ ] No errors in browser console
- [ ] Can log in successfully

**Fix if failing:**
```bash
cd frontend
npm start
```

### 3. Firebase Configuration
- [ ] Firebase credentials downloaded: `backend/firebase-credentials.json` exists
- [ ] `.env` file has `GOOGLE_APPLICATION_CREDENTIALS=firebase-credentials.json`
- [ ] Run verification: `python backend/verify_firebase.py`

**Should see:**
```
✅ GOOGLE_APPLICATION_CREDENTIALS set
✅ Credentials file found
✅ Valid JSON structure
✅ All required fields present
✅ Firebase Admin initialized successfully
```

### 4. Database
- [ ] PostgreSQL is running
- [ ] Database 'visionsafe' exists
- [ ] `users`, `videos`, `detections` tables created

**Check:**
```bash
cd backend
python -c "
from database import SessionLocal
db = SessionLocal()
print('✅ Database connection OK')
db.close()
"
```

### 5. CORS Configuration
- [ ] Backend has CORS enabled for localhost
- [ ] Browser dev tools show no CORS errors

**Check backend logs for:**
```
CORS Origin: http://localhost:3000
```

---

## Error Messages & Fixes

### "Network error: Cannot reach backend"

**Cause:** Backend not running or wrong port

**Fixes:**
1. Check backend is running:
   ```bash
   cd backend && python app.py
   ```
2. Check port 8000 is not blocked:
   ```powershell
   netstat -ano | findstr :8000
   ```
3. If port 8000 is in use, kill the process:
   ```powershell
   taskkill /F /PID <PID>
   ```

---

### "Authentication failed. Please log in again"

**Cause:** Firebase token invalid or expired

**Fixes:**
1. Re-login to Firebase
2. Check Firebase credentials are configured
3. Check backend logs for token verification error

**Backend logs should show:**
```
Extracted email from token: user@example.com
```

---

### "Invalid file format. Please upload a video file"

**Cause:** File is not a video or MIME type not recognized

**Fixes:**
1. Use a valid video format: MP4, AVI, MOV, MKV
2. Check file size isn't too large
3. Ensure file isn't corrupted

---

### "Server error: Video processing failed"

**Cause:** Video processing engine failed

**Fixes:**
1. Check backend logs for specific error
2. Check video file is valid
3. Check enough disk space for processing
4. Check `ai_engine.py` is configured correctly

**Common issues:**
- Missing video codec libraries
- Insufficient memory
- Invalid video format

---

### "Failed to upload video. Please try again"

**Cause:** Generic error, check backend logs

**Fixes:**
1. Check backend console for detailed error message
2. Check firewall isn't blocking requests
3. Check CORS is enabled in backend

---

## Real-time Debugging

### Enable Verbose Logging

**Frontend (browser console):**
```javascript
// Already enabled - check Network tab for request/response details
```

**Backend:**
```python
# Already has logging - check console for:
# - "Extracted email from token:"
# - "File saved successfully"
# - "AI processing complete"
# - Error messages for failures
```

### Monitor Network Requests

1. Open browser DevTools (F12)
2. Go to Network tab
3. Upload a video
4. Check POST to `http://localhost:8000/upload-video`:
   - **Status:** Should be 200 (success) or specific error code
   - **Headers:** Should have `Authorization: Bearer ...`
   - **Response:** Should have `video_url` and `status`

### Check Backend Logs for Upload

Expected log sequence:
```
INFO:__main__:Received video upload request: filename.mp4
INFO:__main__:Extracted email from token: user@example.com
INFO:__main__:Saving uploaded file to: ...
INFO:__main__:File saved successfully. Size: 123456 bytes
INFO:__main__:Starting AI video processing...
INFO:__main__:AI processing complete. Status: SAFE
INFO:__main__:✅ Video record created: {uuid}
INFO:__main__:Response: {...}
```

---

## Performance Optimization

### If upload is slow:

1. **Check file size** - Large videos (>500MB) will take longer
2. **Check backend performance** - Monitor CPU/memory
3. **Check network** - Use `speedtest-cli` to check bandwidth
4. **Check processing** - Video processing can take 30-60 seconds

### Typical timings:
- Small video (10-20MB): 10-15 seconds total
- Medium video (50-100MB): 30-45 seconds total
- Large video (200MB+): 1-2 minutes total

---

## Database Connection Issues

### If database connection fails:

```bash
# Check PostgreSQL is running
psql -U postgres -d postgres -c "SELECT 1"

# Check database exists
psql -U postgres -c "\l" | grep visionsafe

# Reconnect to database
cd backend
python -c "
from database import engine
try:
    with engine.connect() as conn:
        print('✅ Database connection successful')
except Exception as e:
    print(f'❌ Connection failed: {e}')
"
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Address already in use" | Port 8000 busy. Kill process: `taskkill /F /IM python.exe` |
| "No Firebase credentials" | Download from Firebase Console. Save to `backend/firebase-credentials.json` |
| "CORS error" | Backend CORS not configured for frontend URL |
| "Token expired" | Re-login in frontend |
| "Database migration failed" | Run `python backend/migrate_db.py` |
| "Video not processing" | Check `ai_engine.py`, ensure dependencies installed |

---

## Support Commands

```bash
# Check backend status
python backend/verify_firebase.py

# Check full diagnostics
python backend/firebase_diagnostic.py

# Migrate database
python backend/migrate_db.py

# Check frontend health
npm --version

# Check Python version
python --version

# Check required packages
pip list | grep -i "fastapi\|sqlalchemy\|firebase"
```

---

## When to Check What

**Upload fails immediately?**
→ Check network error (backend running?)

**Upload succeeds but shows no results?**
→ Check backend logs for processing error

**Upload shows error after processing?**
→ Check response JSON in Network tab

**Video plays but shows wrong status?**
→ Check AI model output vs. expected status

---

## Getting Help

When reporting an issue, include:
1. Error message shown to user
2. Backend console logs (last 20 lines)
3. Browser console errors (Network tab response)
4. Steps to reproduce
5. Video file type and size

