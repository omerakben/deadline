#!/usr/bin/env python3
"""
Get Firebase Web App Configuration
This script uses Firebase Admin SDK to fetch web app configuration
"""

import json
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "deadline_api.settings")

# Initialize Django
import django

django.setup()

# Now we can use Firebase Admin
import firebase_admin
from firebase_admin import credentials, project_management


def get_web_app_config():
    """Get Firebase web app configuration"""

    print("🔍 Fetching Firebase Web App Configuration...")
    print("=" * 60)

    try:
        # List all apps
        apps = project_management.list_android_apps()
        ios_apps = project_management.list_ios_apps()

        print(f"\n📱 Found {len(list(apps))} Android apps")
        print(f"🍎 Found {len(list(ios_apps))} iOS apps")

        # Try to list web apps (if API supports it)
        print("\n🌐 Checking for Web Apps...")
        print("   Note: Web app listing requires Firebase Management API")
        print("   You may need to check Firebase Console manually:")
        print(
            "   https://console.firebase.google.com/project/deadline-capstone/settings/general"
        )

        # Get project details
        app = firebase_admin.get_app()
        project_id = app.project_id

        print(f"\n📋 Project Details:")
        print(f"   Project ID: {project_id}")
        print(f"   Auth Domain: {project_id}.firebaseapp.com")
        print(f"   Storage Bucket: {project_id}.appspot.com")

        print("\n" + "=" * 60)
        print("✅ NEXT STEPS:")
        print("=" * 60)
        print("\n1. Go to Firebase Console:")
        print(
            f"   https://console.firebase.google.com/project/{project_id}/settings/general"
        )
        print("\n2. Under 'Your apps', look for a Web app (</>)")
        print("   - If you see one, click 'Config' to get credentials")
        print("   - If none exists, click 'Add app' and choose Web")
        print("\n3. Copy the config values to capstone-client/.env.local")
        print("\n4. See GET_FIREBASE_CREDENTIALS.md for detailed instructions")

    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n💡 This is expected if you haven't set up a Web App yet.")
        print("   Follow the instructions in GET_FIREBASE_CREDENTIALS.md")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(get_web_app_config())
