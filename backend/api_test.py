# API Integration Test Suite for VisionSafe Backend
import requests
import json
from pathlib import Path

# Configuration
API_BASE = "http://localhost:8000"
USER_EMAIL = "test@example.com"
TEST_VIDEO_PATH = "backend/uploads/test_video.mp4"  # Replace with actual video path

def print_header(title):
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def print_response(response, label="Response"):
    print(f"\n{label}:")
    print(f"Status Code: {response.status_code}")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)

# ============================================================================
# ENDPOINT TESTS
# ============================================================================

def test_health():
    """Test health endpoint"""
    print_header("1. Health Check")
    response = requests.get(f"{API_BASE}/health")
    print_response(response)
    return response.status_code == 200

def test_get_video_history():
    """Test GET /videos/history"""
    print_header("2. Get Video History")
    response = requests.get(
        f"{API_BASE}/videos/history",
        params={"user_email": USER_EMAIL}
    )
    print_response(response)
    
    if response.status_code == 200:
        videos = response.json().get('videos', [])
        return videos
    return []

def test_get_video_details(video_id):
    """Test GET /videos/{video_id}"""
    print_header(f"3. Get Video Details (ID: {video_id[:8]}...)")
    response = requests.get(f"{API_BASE}/videos/{video_id}")
    print_response(response)
    return response.status_code == 200

def test_get_video_detections(video_id):
    """Test GET /videos/{video_id}/detections"""
    print_header(f"4. Get Video Detections (ID: {video_id[:8]}...)")
    response = requests.get(f"{API_BASE}/videos/{video_id}/detections")
    print_response(response)
    return response.status_code == 200

def test_get_user_stats():
    """Test GET /videos/stats/{user_email}"""
    print_header("5. Get User Statistics")
    response = requests.get(
        f"{API_BASE}/videos/stats/{USER_EMAIL}"
    )
    print_response(response)
    return response.status_code == 200

def test_upload_video(video_path):
    """Test POST /upload-video"""
    print_header("6. Upload Video with Database Integration")
    
    if not Path(video_path).exists():
        print(f"❌ Video file not found: {video_path}")
        print("   To test, create a test video or use an existing one")
        return None
    
    with open(video_path, 'rb') as f:
        files = {'file': f}
        data = {'user_email': USER_EMAIL}
        response = requests.post(
            f"{API_BASE}/upload-video",
            files=files,
            data=data
        )
    
    print_response(response, "Upload Response")
    
    if response.status_code == 200:
        return response.json()
    return None

def test_delete_video(video_id):
    """Test DELETE /videos/{video_id}"""
    print_header(f"7. Delete Video (ID: {video_id[:8]}...)")
    response = requests.delete(f"{API_BASE}/videos/{video_id}")
    print_response(response, "Delete Response")
    return response.status_code == 200

# ============================================================================
# TEST RUNNER
# ============================================================================

def run_all_tests():
    """Run all API tests"""
    print("\n" + "█"*60)
    print("█  VisionSafe API Integration Test Suite                  █")
    print("█"*60)
    
    results = {}
    
    # Test 1: Health Check
    results['health'] = test_health()
    
    # Test 2: Get existing video history
    videos = test_get_video_history()
    
    if videos:
        # Test 3: Get details for first video
        first_video_id = videos[0]['id']
        results['get_details'] = test_get_video_details(first_video_id)
        
        # Test 4: Get detections for first video
        results['get_detections'] = test_get_video_detections(first_video_id)
        
        # Test 5: Get user stats
        results['user_stats'] = test_get_user_stats()
        
        # Test 7 (optional): Delete a test video
        # Uncomment to delete first video (BE CAREFUL!)
        # results['delete_video'] = test_delete_video(first_video_id)
    
    # Test 6 (optional): Upload new video
    # Uncomment and set TEST_VIDEO_PATH to test upload
    # upload_result = test_upload_video(TEST_VIDEO_PATH)
    # results['upload'] = upload_result is not None
    
    # Print summary
    print_header("TEST SUMMARY")
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    print(f"\nTotal: {passed}/{total} tests passed")

# ============================================================================
# MANUAL TESTING EXAMPLES
# ============================================================================

def example_curl_commands():
    """Print example curl commands for manual testing"""
    
    print("\n" + "="*60)
    print("  CURL Command Examples for Manual Testing")
    print("="*60)
    
    examples = [
        ("Health Check", f'curl {API_BASE}/health'),
        
        ("Get Video History", 
         f'curl "{API_BASE}/videos/history?user_email={USER_EMAIL}"'),
        
        ("Get Video Details (replace VIDEO_ID)",
         f'curl "{API_BASE}/videos/VIDEO_ID"'),
        
        ("Get Video Detections (replace VIDEO_ID)",
         f'curl "{API_BASE}/videos/VIDEO_ID/detections"'),
        
        ("Get User Stats",
         f'curl "{API_BASE}/videos/stats/{USER_EMAIL}"'),
        
        ("Delete Video (replace VIDEO_ID)",
         f'curl -X DELETE "{API_BASE}/videos/VIDEO_ID"'),
        
        ("Upload Video",
         f'curl -X POST -F "file=@/path/to/video.mp4" -F "user_email={USER_EMAIL}" {API_BASE}/upload-video'),
    ]
    
    for name, command in examples:
        print(f"\n{name}:")
        print(f"  {command}")

# ============================================================================
# PYTHON REQUESTS EXAMPLES
# ============================================================================

def example_python_code():
    """Print example Python code for API integration"""
    
    code = f'''
# Example Python Code for API Integration

import requests

API_BASE = "{API_BASE}"
USER_EMAIL = "{USER_EMAIL}"

# 1. Get video history
response = requests.get(
    f"{{API_BASE}}/videos/history",
    params={{"user_email": USER_EMAIL}}
)
videos = response.json()['videos']

# 2. Get details for a video
video_id = videos[0]['id']
response = requests.get(f"{{API_BASE}}/videos/{{video_id}}")
video_details = response.json()['video']

# 3. Get detections for a video
response = requests.get(f"{{API_BASE}}/videos/{{video_id}}/detections")
detections = response.json()['detections']

# 4. Get user statistics
response = requests.get(f"{{API_BASE}}/videos/stats/{{USER_EMAIL}}")
stats = response.json()

# 5. Delete a video
response = requests.delete(f"{{API_BASE}}/videos/{{video_id}}")
result = response.json()

# 6. Upload a video
with open('video.mp4', 'rb') as f:
    files = {{'file': f}}
    data = {{'user_email': USER_EMAIL}}
    response = requests.post(f"{{API_BASE}}/upload-video", files=files, data=data)
    upload_result = response.json()
'''
    
    print("\n" + "="*60)
    print("  Python Requests Examples")
    print("="*60)
    print(code)

# ============================================================================
# JAVASCRIPT/FETCH EXAMPLES
# ============================================================================

def example_javascript_code():
    """Print example JavaScript code for API integration"""
    
    code = f'''
// Example JavaScript Code for API Integration

const API_BASE = "{API_BASE}";
const USER_EMAIL = "{USER_EMAIL}";

// 1. Get video history
async function getVideoHistory() {{
  const response = await fetch(`${{API_BASE}}/videos/history?user_email=${{USER_EMAIL}}`);
  const data = await response.json();
  return data.videos;
}}

// 2. Get video details
async function getVideoDetails(videoId) {{
  const response = await fetch(`${{API_BASE}}/videos/${{videoId}}`);
  const data = await response.json();
  return data.video;
}}

// 3. Get video detections
async function getVideoDetections(videoId) {{
  const response = await fetch(`${{API_BASE}}/videos/${{videoId}}/detections`);
  const data = await response.json();
  return data.detections;
}}

// 4. Get user statistics
async function getUserStats() {{
  const response = await fetch(`${{API_BASE}}/videos/stats/${{USER_EMAIL}}`);
  const data = await response.json();
  return data;
}}

// 5. Delete a video
async function deleteVideo(videoId) {{
  const response = await fetch(`${{API_BASE}}/videos/${{videoId}}`, {{
    method: 'DELETE'
  }});
  const data = await response.json();
  return data;
}}

// 6. Upload a video
async function uploadVideo(file) {{
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_email', USER_EMAIL);
  
  const response = await fetch(`${{API_BASE}}/upload-video`, {{
    method: 'POST',
    body: formData
  }});
  const data = await response.json();
  return data;
}}
'''
    
    print("\n" + "="*60)
    print("  JavaScript Fetch Examples")
    print("="*60)
    print(code)

# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    import sys
    
    print("""
Available test modes:
  1. all      - Run all API tests
  2. curl     - Print example curl commands
  3. python   - Print example Python code
  4. javascript - Print example JavaScript code
  
Usage: python api_test.py [mode]
       python api_test.py all
       python api_test.py curl
    """)
    
    mode = sys.argv[1] if len(sys.argv) > 1 else "all"
    
    if mode == "all":
        run_all_tests()
    elif mode == "curl":
        example_curl_commands()
    elif mode == "python":
        example_python_code()
    elif mode == "javascript":
        example_javascript_code()
    else:
        print(f"Unknown mode: {mode}")
        print("Use: all, curl, python, or javascript")
