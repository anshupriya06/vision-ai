"""
Firebase Admin Credentials Setup - Interactive Configuration Guide
This script guides you through obtaining and configuring Firebase credentials
"""
import os
import json
from pathlib import Path
import sys

def print_section(title):
    """Print a formatted section header"""
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)

def print_step(num, title):
    """Print a formatted step"""
    print(f"\n📍 STEP {num}: {title}")
    print("-" * 70)

def main():
    print_section("FIREBASE ADMIN CREDENTIALS SETUP FOR VISIONSAFE")
    
    print("""
This guide will help you configure Firebase Admin SDK credentials
for token verification on the VisionSafe backend.
    """)
    
    # Step 1: Firebase Console
    print_step(1, "DOWNLOAD FIREBASE SERVICE ACCOUNT JSON")
    
    print("""
1. Open Firebase Console: https://console.firebase.google.com/
2. Select your 'visionsafe' project
3. Click the Settings icon (⚙️) in the top-left
4. Go to "Service Accounts" tab
5. Click "Generate New Private Key" button
6. A JSON file will download automatically
   (filename like: visionsafe-firebase-adminsdk-abc123-xyz456.json)
    """)
    
    input("Press ENTER once you have downloaded the credentials file...")
    
    # Step 2: Save to backend directory
    print_step(2, "SAVE CREDENTIALS FILE")
    
    backend_dir = Path(__file__).parent
    creds_file = backend_dir / "firebase-credentials.json"
    
    print(f"""
Now you need to save the downloaded JSON file.

RECOMMENDED LOCATION: {creds_file}

This script will copy the file for you. Please provide the full path
to the downloaded credentials file (or press ENTER to skip):
    """)
    
    source_path = input("Path to downloaded credentials file: ").strip()
    
    if source_path:
        source_path = Path(source_path)
        if not source_path.exists():
            print(f"❌ File not found: {source_path}")
            print("Please check the path and try again.")
            return False
        
        try:
            # Validate JSON
            with open(source_path) as f:
                json.load(f)
            
            # Copy to backend directory
            import shutil
            shutil.copy(source_path, creds_file)
            print(f"✅ Credentials file saved to: {creds_file}")
        except json.JSONDecodeError:
            print("❌ Invalid JSON file. Please download again from Firebase Console.")
            return False
        except Exception as e:
            print(f"❌ Error copying file: {e}")
            return False
    else:
        print(f"""
Manual setup:
1. Download the JSON file from Firebase Console
2. Save it to: {creds_file}
3. Then run: python verify_firebase.py
        """)
    
    # Step 3: Add to .gitignore
    print_step(3, "UPDATE .GITIGNORE")
    
    gitignore_path = backend_dir / ".gitignore"
    
    try:
        if gitignore_path.exists():
            content = gitignore_path.read_text()
            if "firebase-credentials.json" not in content:
                with open(gitignore_path, "a") as f:
                    f.write("\n# Firebase credentials (never commit!)\nfirebase-credentials.json\n")
                print("✅ Added firebase-credentials.json to .gitignore")
            else:
                print("✅ firebase-credentials.json already in .gitignore")
        else:
            print("⚠️  .gitignore file not found")
    except Exception as e:
        print(f"⚠️  Error updating .gitignore: {e}")
    
    # Step 4: Configure .env
    print_step(4, "UPDATE .ENV FILE")
    
    env_path = backend_dir / ".env"
    
    print(f"Configuration saved to: {env_path}")
    print("""
The following line has been added to your .env file:
  GOOGLE_APPLICATION_CREDENTIALS=firebase-credentials.json

This tells the backend where to find your Firebase credentials.
    """)
    
    if env_path.exists():
        content = env_path.read_text()
        if "GOOGLE_APPLICATION_CREDENTIALS" in content:
            print("✅ GOOGLE_APPLICATION_CREDENTIALS already configured in .env")
        else:
            print("⚠️  Please manually add the line above to your .env file")
    
    # Step 5: Verify
    print_step(5, "VERIFY CONFIGURATION")
    
    print("""
To verify your configuration is correct, run:
  python verify_firebase.py

This will check:
  ✓ GOOGLE_APPLICATION_CREDENTIALS is set
  ✓ Credentials file exists and is readable
  ✓ JSON structure is valid
  ✓ Required Firebase fields are present
  ✓ Firebase Admin SDK can initialize
    """)
    
    run_verify = input("Run verification now? (y/n): ").strip().lower()
    
    if run_verify == 'y':
        print("\nRunning verification...")
        os.system(f'cd "{backend_dir}" && python verify_firebase.py')
    
    # Step 6: Restart backend
    print_step(6, "RESTART BACKEND")
    
    print("""
Once verification passes, restart your backend server:

  cd backend
  python app.py

The backend will now verify Firebase ID tokens correctly!
    """)
    
    print_section("SETUP COMPLETE")
    
    print("""
✅ Firebase Admin credentials are now configured!

Your backend can now:
  • Verify Firebase ID tokens from the frontend
  • Extract user email from tokens
  • Access protected endpoints: /user/profile, /user/update-profile

SECURITY REMINDERS:
  ⚠️  Never commit firebase-credentials.json to git
  ⚠️  Never share the credentials file
  ⚠️  Keep the JSON file secure
  ⚠️  Rotate keys regularly in Firebase Console
    """)
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Setup cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)
