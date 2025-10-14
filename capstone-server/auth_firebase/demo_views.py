"""
Demo Mode Authentication Views

Provides session-based authentication bypass for demo mode deployment.
"""

import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from workspaces.models import Workspace

logger = logging.getLogger(__name__)

User = get_user_model()


@api_view(["POST"])
@authentication_classes([])  # No authentication required - bypasses CSRF
@permission_classes([AllowAny])
def demo_login(request):
    """
    Demo mode authentication endpoint.

    Generates a Firebase custom token for demo user authentication.
    Only works when DEMO_MODE environment variable is set to True.

    Returns:
        JSON response with custom token and demo user info:
        {
            "custom_token": "firebase_custom_token",
            "uid": "demo_user_uid",
            "is_authenticated": true,
            "auth_method": "firebase_custom_token",
            "workspace": {...}
        }
    """
    # Check if demo mode is enabled
    if not getattr(settings, "DEMO_MODE", False):
        return Response(
            {"error": "Demo mode is not enabled"},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Get or create demo workspace
    demo_uid = "demo_user_deadline_2025"
    workspace, created = Workspace.objects.get_or_create(
        owner_uid=demo_uid,
        name="Demo Workspace",
        defaults={"description": "Demo workspace for exploring DEADLINE features"},
    )

    if created:
        logger.info("Created new demo workspace")

    # Generate Firebase custom token for demo user
    try:
        import firebase_admin
        from firebase_admin import auth, credentials

        # Initialize Firebase Admin if not already initialized
        if len(firebase_admin._apps) == 0:
            # Try to initialize from settings
            import os

            firebase_creds_file = getattr(settings, "FIREBASE_CREDENTIALS_FILE", "")
            if firebase_creds_file and os.path.exists(firebase_creds_file):
                cred = credentials.Certificate(firebase_creds_file)
                firebase_admin.initialize_app(cred)
                logger.info("Initialized Firebase Admin SDK for demo mode")
            else:
                raise Exception(
                    "Firebase credentials not configured. Cannot generate demo token."
                )

        custom_token = auth.create_custom_token(demo_uid)

        # Set session data as backup
        request.session["demo_mode"] = True
        request.session["demo_uid"] = demo_uid
        request.session["workspace_id"] = workspace.id

        response_data = {
            "custom_token": (
                custom_token.decode("utf-8")
                if isinstance(custom_token, bytes)
                else custom_token
            ),
            "uid": demo_uid,
            "is_authenticated": True,
            "auth_method": "firebase_custom_token",
            "workspace": {
                "id": workspace.id,
                "name": workspace.name,
                "description": workspace.description,
            },
        }

        logger.info(
            "Demo login successful with Firebase custom token for UID: %s", demo_uid
        )
        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error("Failed to generate Firebase custom token: %s", str(e))
        return Response(
            {
                "error": "Failed to generate demo authentication token. Please check server configuration."
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def demo_logout(request):
    """
    Demo mode logout endpoint.

    Clears the demo session data.

    Returns:
        JSON response confirming logout:
        {
            "message": "Logged out successfully"
        }
    """
    if request.session.get("demo_mode"):
        request.session.flush()
        logger.info("Demo logout successful")

    return Response(
        {"message": "Logged out successfully"},
        status=status.HTTP_200_OK,
    )
