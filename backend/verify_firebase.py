"""
Firebase Admin Credentials Verification Script
Validates that GOOGLE_APPLICATION_CREDENTIALS is properly configured
"""
import os
import json
import sys
from pathlib import Path

def verify_firebase_setup():
    """Verify Firebase Admin SDK setup"""
    print("🔍 Verifying Firebase Admin Credentials Setup...\n")
    
    # Step 1: Check environment variable
    print("Step 1: Checking GOOGLE_APPLICATION_CREDENTIALS environment variable")
    creds_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    
    if not creds_path:
        print("❌ GOOGLE_APPLICATION_CREDENTIALS environment variable not set")
        print("   Please set it in backend/.env file")
        return False
    
    print(f"✅ GOOGLE_APPLICATION_CREDENTIALS={creds_path}")
    
    # Step 2: Resolve path (handle relative and absolute paths)
    print("\nStep 2: Resolving credentials file path")
    
    # Try relative path first (relative to script location)
    backend_dir = Path(__file__).parent
    resolved_path = backend_dir / creds_path if not Path(creds_path).is_absolute() else Path(creds_path)
    
    print(f"   Looking for: {resolved_path}")
    
    if not resolved_path.exists():
        print(f"❌ Credentials file not found at: {resolved_path}")
        print(f"   Expected location: {backend_dir / 'firebase-credentials.json'}")
        print("\n   To fix:")
        print("   1. Download credentials from Firebase Console:")
        print("      → Project Settings → Service Accounts → Generate New Private Key")
        print(f"   2. Save to: {backend_dir / 'firebase-credentials.json'}")
        print("   3. Add to .gitignore: echo 'firebase-credentials.json' >> .gitignore")
        return False
    
    print(f"✅ Credentials file found")
    
    # Step 3: Validate JSON structure
    print("\nStep 3: Validating JSON structure")
    
    try:
        with open(resolved_path, 'r') as f:
            creds_data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON in credentials file: {e}")
        return False
    except Exception as e:
        print(f"❌ Error reading credentials file: {e}")
        return False
    
    print("✅ Valid JSON structure")
    
    # Step 4: Check required fields
    print("\nStep 4: Checking required Firebase service account fields")
    
    required_fields = [
        'type', 'project_id', 'private_key_id', 'private_key',
        'client_email', 'client_id', 'auth_uri', 'token_uri'
    ]
    
    missing_fields = [f for f in required_fields if f not in creds_data]
    
    if missing_fields:
        print(f"❌ Missing required fields: {', '.join(missing_fields)}")
        return False
    
    print("✅ All required fields present")
    
    # Step 5: Display credentials info
    print("\nStep 5: Credentials Information")
    print(f"   Project ID: {creds_data.get('project_id')}")
    print(f"   Service Account Email: {creds_data.get('client_email')}")
    print(f"   Type: {creds_data.get('type')}")
    
    # Step 6: Test Firebase Admin initialization
    print("\nStep 6: Testing Firebase Admin SDK initialization")
    
    try:
        import firebase_admin
        from firebase_admin import credentials, auth as firebase_auth
        
        # Check if already initialized
        if firebase_admin._apps:
            print("✅ Firebase Admin already initialized")
        else:
            # Initialize with credentials
            cred = credentials.Certificate(str(resolved_path))
            firebase_admin.initialize_app(cred)
            print("✅ Firebase Admin initialized successfully")
        
    except Exception as e:
        print(f"❌ Firebase Admin initialization failed: {e}")
        print("\n   Possible causes:")
        print("   - Invalid credentials file")
        print("   - Missing firebase-admin package: pip install firebase-admin")
        print("   - Network connectivity issue")
        return False
    
    print("\n" + "="*60)
    print("✅ FIREBASE ADMIN CREDENTIALS CONFIGURED SUCCESSFULLY")
    print("="*60)
    print("\n✔️ Your backend can now verify Firebase ID tokens!")
    print("✔️ Profile endpoints (/user/profile, /user/update-profile) are ready")
    print("\nNext steps:")
    print("  1. Restart the backend server: python app.py")
    print("  2. Test profile endpoint with a valid Firebase ID token")
    print("  3. Check that mobile_number and bio are saved correctly")
    
    return True


if __name__ == "__main__":
    success = verify_firebase_setup()
    sys.exit(0 if success else 1)
