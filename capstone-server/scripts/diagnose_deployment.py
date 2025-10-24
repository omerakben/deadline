#!/usr/bin/env python3
"""
Pre-deployment diagnostics for Railway deployment.
Run this locally to verify your configuration before deploying.
"""

import os
import sys
from pathlib import Path

# Add project to path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

# Set minimal environment for import
os.environ.setdefault("SECRET_KEY", "test-key-for-diagnostics")
os.environ.setdefault("DEBUG", "True")


def check_env_var(name, required=True):
    """Check if environment variable is set."""
    value = os.getenv(name)
    if value:
        # Mask sensitive values
        if any(x in name for x in ["KEY", "SECRET", "PASSWORD", "TOKEN"]):
            display = f"{value[:10]}..." if len(value) > 10 else "***"
        else:
            display = value[:50] + "..." if len(value) > 50 else value
        print(f"  ✅ {name}: {display}")
        return True
    else:
        symbol = "❌" if required else "⚠️ "
        status = "MISSING (required)" if required else "Not set (optional)"
        print(f"  {symbol} {name}: {status}")
        return not required


def main():
    """Run deployment diagnostics."""
    print("=" * 70)
    print("🔍 DEADLINE Railway Deployment Diagnostics")
    print("=" * 70)

    all_ok = True

    # Django Core
    print("\n📦 Django Core Settings:")
    all_ok &= check_env_var("SECRET_KEY", required=True)
    all_ok &= check_env_var("DEBUG", required=False)
    all_ok &= check_env_var("ALLOWED_HOSTS", required=True)

    # Database
    print("\n💾 Database Configuration:")
    has_db = check_env_var("DATABASE_URL", required=False)
    if not has_db:
        print(
            "  ℹ️  Will use SQLite (dev mode) - Railway provides DATABASE_URL in production"
        )

    # Firebase Admin SDK
    print("\n🔥 Firebase Admin SDK:")
    all_ok &= check_env_var("FIREBASE_PROJECT_ID", required=True)
    all_ok &= check_env_var("FIREBASE_PRIVATE_KEY", required=True)
    all_ok &= check_env_var("FIREBASE_CLIENT_EMAIL", required=True)
    check_env_var("FIREBASE_TYPE", required=False)
    check_env_var("FIREBASE_PRIVATE_KEY_ID", required=False)
    check_env_var("FIREBASE_CLIENT_ID", required=False)

    # Firebase Web Config
    print("\n🌐 Firebase Web Config (for frontend):")
    all_ok &= check_env_var("FIREBASE_WEB_API_KEY", required=True)
    all_ok &= check_env_var("FIREBASE_WEB_AUTH_DOMAIN", required=True)
    all_ok &= check_env_var("FIREBASE_WEB_PROJECT_ID", required=True)
    all_ok &= check_env_var("FIREBASE_WEB_APP_ID", required=True)
    check_env_var("FIREBASE_WEB_STORAGE_BUCKET", required=False)
    check_env_var("FIREBASE_WEB_MESSAGING_SENDER_ID", required=False)

    # CORS
    print("\n🔒 CORS Configuration:")
    all_ok &= check_env_var("CORS_ALLOWED_ORIGINS", required=False)
    check_env_var("VERCEL_FRONTEND_URL", required=False)

    # Check requirements.txt
    print("\n📋 Dependencies Check:")
    req_file = BASE_DIR / "requirements.txt"
    if req_file.exists():
        content = req_file.read_text()
        critical_packages = {
            "Django": "Django",
            "djangorestframework": "djangorestframework",
            "gunicorn": "gunicorn",
            "firebase-admin": "firebase-admin",
            "psycopg2": "psycopg2",
            "dj-database-url": "dj-database-url",
            "whitenoise": "whitenoise",
            "python-decouple": "python-decouple",
        }

        for display_name, package_name in critical_packages.items():
            if package_name.lower() in content.lower():
                print(f"  ✅ {display_name}")
            else:
                print(f"  ❌ {display_name} - MISSING from requirements.txt")
                all_ok = False
    else:
        print("  ❌ requirements.txt not found!")
        all_ok = False

    # Check key files
    print("\n📁 Configuration Files:")
    files_to_check = [
        ("nixpacks.toml", True),
        ("Procfile", True),
        ("manage.py", True),
        ("deadline_api/settings.py", True),
        ("scripts/generate_firebase_creds.py", True),
    ]

    for file_path, required in files_to_check:
        full_path = BASE_DIR / file_path
        if full_path.exists():
            print(f"  ✅ {file_path}")
        else:
            symbol = "❌" if required else "⚠️ "
            print(f"  {symbol} {file_path} - Not found")
            if required:
                all_ok = False

    # Try importing Django settings
    print("\n⚙️  Django Configuration Check:")
    try:
        import django
        from django.conf import settings

        # Configure Django
        os.environ.setdefault("DJANGO_SETTINGS_MODULE", "deadline_api.settings")
        django.setup()

        print(f"  ✅ Django version: {django.get_version()}")
        print("  ✅ Settings module loaded: deadline_api.settings")
        print(f"  ✅ Installed apps: {len(settings.INSTALLED_APPS)} apps")

        # Check critical settings
        if hasattr(settings, "DATABASES"):
            print(
                f"  ✅ Database configured: {settings.DATABASES['default']['ENGINE']}"
            )

        if hasattr(settings, "REST_FRAMEWORK"):
            print("  ✅ DRF configured")

        if hasattr(settings, "FIREBASE_WEB_CONFIG"):
            firebase_web = settings.FIREBASE_WEB_CONFIG
            if firebase_web.get("apiKey") and firebase_web.get("projectId"):
                print("  ✅ Firebase Web Config present")
            else:
                print("  ❌ Firebase Web Config incomplete")
                all_ok = False

    except ImportError as e:
        print(f"  ❌ Django import error: {e}")
        all_ok = False
    except Exception as e:
        print(f"  ❌ Django setup error: {e}")
        all_ok = False

    # Final summary
    print("\n" + "=" * 70)
    if all_ok:
        print("✅ All checks passed! Ready for Railway deployment.")
        print("\nNext steps:")
        print("  1. Commit and push changes: git push origin main")
        print("  2. Or deploy via CLI: railway up")
        print("  3. Monitor logs: railway logs --follow")
        return 0
    else:
        print("❌ Some checks failed. Fix the issues above before deploying.")
        print("\nCommon fixes:")
        print("  • Copy .env.example to .env and fill in values")
        print("  • Set Firebase environment variables in Railway dashboard")
        print("  • Ensure all dependencies are in requirements.txt")
        return 1


if __name__ == "__main__":
    sys.exit(main())
