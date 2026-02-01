"""
Firebase Configuration Diagnostic Tool
Checks all components of the Firebase setup and backend readiness
"""
import os
import sys
import json
from pathlib import Path
from importlib import import_module

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def check(description, passed, details=""):
    """Print a check result"""
    status = f"{Colors.GREEN}✅{Colors.END}" if passed else f"{Colors.RED}❌{Colors.END}"
    print(f"{status} {description}")
    if details:
        print(f"   {details}")

def section(title):
    """Print a section header"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.END}")
    print(f"{Colors.BLUE}{title}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.END}\n")

def diagnose():
    """Run full diagnostics"""
    print(f"\n{Colors.BOLD}🔍 Firebase Configuration Diagnostic Tool{Colors.END}\n")
    
    backend_dir = Path(__file__).parent
    all_good = True
    
    # Section 1: Environment
    section("1. ENVIRONMENT CONFIGURATION")
    
    creds_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    check("GOOGLE_APPLICATION_CREDENTIALS set", 
          bool(creds_path),
          f"Value: {creds_path}" if creds_path else "Not found in environment")
    
    if not creds_path:
        all_good = False
        print(f"   {Colors.YELLOW}ℹ️  Load from .env: source .env (Linux/Mac) or .\\backend\\.env (Windows){Colors.END}")
    
    # Section 2: Files
    section("2. CREDENTIAL FILES")
    
    env_file = backend_dir / ".env"
    check(".env file exists", env_file.exists(), str(env_file))
    
    if env_file.exists():
        try:
            content = env_file.read_text()
            has_gac = "GOOGLE_APPLICATION_CREDENTIALS" in content
            check("GOOGLE_APPLICATION_CREDENTIALS in .env", 
                  has_gac,
                  "Add it manually if missing")
            if not has_gac:
                all_good = False
        except Exception as e:
            check(".env readable", False, str(e))
            all_good = False
    else:
        all_good = False
    
    gitignore_file = backend_dir / ".gitignore"
    check(".gitignore exists", gitignore_file.exists(), str(gitignore_file))
    
    if gitignore_file.exists():
        try:
            content = gitignore_file.read_text()
            has_ignore = "firebase-credentials.json" in content
            check("firebase-credentials.json in .gitignore", 
                  has_ignore,
                  "Prevents accidental credential commits")
            if not has_ignore:
                print(f"   {Colors.YELLOW}⚠️  Should add firebase-credentials.json to .gitignore{Colors.END}")
        except Exception as e:
            check(".gitignore readable", False, str(e))
    
    # Section 3: Credentials File
    section("3. CREDENTIALS FILE")
    
    creds_file = backend_dir / "firebase-credentials.json"
    creds_exists = creds_file.exists()
    check("firebase-credentials.json file exists", 
          creds_exists,
          str(creds_file) if creds_exists else "Not found - run: python setup_firebase.py")
    
    if not creds_exists:
        all_good = False
    else:
        # Validate JSON
        try:
            creds_data = json.loads(creds_file.read_text())
            check("Valid JSON format", True)
            
            # Check required fields
            required = ['type', 'project_id', 'private_key_id', 'private_key', 
                       'client_email', 'client_id', 'auth_uri', 'token_uri']
            missing = [f for f in required if f not in creds_data]
            
            check("All required fields present", 
                  not missing,
                  f"Missing: {', '.join(missing)}" if missing else f"Project: {creds_data.get('project_id')}")
            
            if missing:
                all_good = False
            else:
                print(f"   Service Account: {creds_data.get('client_email')}")
                print(f"   Type: {creds_data.get('type')}")
        except json.JSONDecodeError as e:
            check("JSON validation", False, str(e))
            all_good = False
        except Exception as e:
            check("Credentials file readable", False, str(e))
            all_good = False
    
    # Section 4: Python Packages
    section("4. REQUIRED PACKAGES")
    
    packages = {
        'firebase_admin': 'firebase-admin',
        'fastapi': 'fastapi',
        'sqlalchemy': 'sqlalchemy',
        'psycopg2': 'psycopg2-binary',
    }
    
    for module_name, package_name in packages.items():
        try:
            import_module(module_name)
            check(f"{package_name} installed", True)
        except ImportError:
            check(f"{package_name} installed", False, f"Install with: pip install {package_name}")
            all_good = False
    
    # Section 5: Database
    section("5. DATABASE SETUP")
    
    db_url = os.getenv('DATABASE_URL')
    check("DATABASE_URL configured", 
          bool(db_url),
          f"Connecting to PostgreSQL" if db_url else "Not set")
    
    if db_url:
        try:
            # Try importing database module to check connection
            sys.path.insert(0, str(backend_dir))
            from database import SessionLocal, UserProfile
            
            try:
                db = SessionLocal()
                # Check if users table exists
                result = db.execute("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='users')")
                users_exists = result.scalar()
                
                check("'users' table exists", 
                      users_exists,
                      "Run: python migrate_db.py" if not users_exists else "Ready")
                
                if not users_exists:
                    all_good = False
                else:
                    # Check columns
                    result = db.execute("""
                        SELECT column_name FROM information_schema.columns 
                        WHERE table_name='users' ORDER BY ordinal_position
                    """)
                    columns = [row[0] for row in result]
                    required_cols = ['id', 'email', 'mobile_number', 'bio', 'created_at']
                    missing_cols = [c for c in required_cols if c not in columns]
                    
                    check("All required columns present", 
                          not missing_cols,
                          f"Columns: {', '.join(columns)}")
                
                db.close()
            except Exception as e:
                check("Database connection test", False, str(e))
                all_good = False
        except ImportError:
            check("Database module imported", False, "Check app.py and database.py")
            all_good = False
    
    # Section 6: Backend Setup
    section("6. BACKEND APP")
    
    app_file = backend_dir / "app.py"
    check("app.py exists", app_file.exists(), str(app_file))
    
    if app_file.exists():
        try:
            app_content = app_file.read_text()
            
            checks = [
                ("Firebase Admin import", "from firebase_admin import"),
                ("get_email_from_token function", "def get_email_from_token"),
                ("/user/profile endpoint", "def.*user.*profile", "POST /user/profile"),
                ("/user/update-profile endpoint", "def.*update.*profile", "POST /user/update-profile"),
            ]
            
            for check_name, *patterns in checks:
                import re
                found = any(re.search(p, app_content) for p in patterns)
                check(check_name, found)
                if not found:
                    all_good = False
        except Exception as e:
            check("app.py readable", False, str(e))
            all_good = False
    else:
        all_good = False
    
    # Final Summary
    section("SUMMARY")
    
    if all_good:
        print(f"{Colors.GREEN}{Colors.BOLD}✅ ALL CHECKS PASSED!{Colors.END}\n")
        print("Your Firebase configuration is ready. Next steps:")
        print("  1. Start backend: python app.py")
        print("  2. Test profile endpoints with Firebase ID token")
        print("  3. Verify mobile_number and bio are saved correctly")
    else:
        print(f"{Colors.RED}{Colors.BOLD}⚠️  SOME CHECKS FAILED{Colors.END}\n")
        print("Please fix the issues above, then run this diagnostic again.")
        print("\nQuick fixes:")
        print("  • Setup credentials: python setup_firebase.py")
        print("  • Verify setup: python verify_firebase.py")
        print("  • Run migrations: python migrate_db.py")
    
    print()
    return all_good

if __name__ == "__main__":
    try:
        success = diagnose()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n{Colors.RED}Error running diagnostics: {e}{Colors.END}")
        sys.exit(1)
