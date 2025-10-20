"""
Root API views for DEADLINE
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def api_root(request):
    """
    API root endpoint - provides overview of available endpoints
    """
    return Response(
        {
            "message": "DEADLINE API - Developer Command Center",
            "version": "v1",
            "endpoints": {
                "workspaces": "/api/v1/workspaces/",
                "authentication": "/api/v1/auth/",
                "search": "/api/v1/search/artifacts/",
                "docs": "/api/v1/docs/",
                "schema": "/api/schema/",
                "swagger": "/api/docs/",
            },
            "status": "operational",
        }
    )
