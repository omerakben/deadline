#!/usr/bin/env python3
"""
Generate Firebase credentials JSON from environment variables for Railway deployment.
This script should be run before starting the Django server.
"""

import json
import os
import sys


def generate_firebase_credentials():
    """Generate firebase credentials JSON file from environment variables."""

    # Required Firebase fields
    required_fields = {
        "type": "FIREBASE_TYPE",
        "project_id": "FIREBASE_PROJECT_ID",
        "private_key_id": "FIREBASE_PRIVATE_KEY_ID",
        "private_key": "FIREBASE_PRIVATE_KEY",
        "client_email": "FIREBASE_CLIENT_EMAIL",
        "client_id": "FIREBASE_CLIENT_ID",
        "auth_uri": "FIREBASE_AUTH_URI",
        "token_uri": "FIREBASE_TOKEN_URI",
        "auth_provider_x509_cert_url": "FIREBASE_AUTH_PROVIDER_X509_CERT_URL",
        "client_x509_cert_url": "FIREBASE_CLIENT_X509_CERT_URL",
    }

    credentials = {}
    missing = []

    for json_key, env_var in required_fields.items():
        value = os.getenv(env_var, "")
        if not value:
            # Only project_id, private_key, and client_email are truly required
            if env_var in [
                "FIREBASE_PROJECT_ID",
                "FIREBASE_PRIVATE_KEY",
                "FIREBASE_CLIENT_EMAIL",
            ]:
                missing.append(env_var)
        else:
            # Handle private key newlines
            if json_key == "private_key":
                value = value.replace("\\n", "\n")
            credentials[json_key] = value

    if missing:
        print(
            f"ERROR: Missing required Firebase environment variables: {', '.join(missing)}",
            file=sys.stderr,
        )
        print(
            "Set these in your Railway service environment variables.", file=sys.stderr
        )
        return False

    # Set defaults for optional fields
    if "auth_uri" not in credentials:
        credentials["auth_uri"] = "https://accounts.google.com/o/oauth2/auth"
    if "token_uri" not in credentials:
        credentials["token_uri"] = "https://oauth2.googleapis.com/token"
    if "auth_provider_x509_cert_url" not in credentials:
        credentials["auth_provider_x509_cert_url"] = (
            "https://www.googleapis.com/oauth2/v1/certs"
        )

    # Write to /tmp (Railway has this writable)
    output_path = "/tmp/firebase-credentials.json"
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(credentials, f, indent=2)
        print(f"✅ Firebase credentials written to {output_path}")
        return True
    except Exception as e:
        print(f"ERROR: Failed to write credentials file: {e}", file=sys.stderr)
        return False


if __name__ == "__main__":
    success = generate_firebase_credentials()
    sys.exit(0 if success else 1)
