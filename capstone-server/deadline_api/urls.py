"""
URL configuration for deadline_api project.

DEADLINE - Developer Command Center
API endpoints for managing workspaces, artifacts, and authentication.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""

from artifacts.views import ArtifactGlobalSearchView, DocsGlobalListView
from django.conf import settings
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from .views import api_root

urlpatterns = [
    path("admin/", admin.site.urls),
    # API root
    path("api/v1/", api_root, name="api-root"),
    # API endpoints
    path("api/v1/workspaces/", include("workspaces.urls")),  # Workspace management
    path(
        "api/v1/workspaces/<int:workspace_id>/artifacts/", include("artifacts.urls")
    ),  # Nested artifact management
    path(
        "api/v1/auth/", include("auth_firebase.urls")
    ),  # Firebase authentication endpoints
    path(
        "api/v1/search/artifacts/",
        ArtifactGlobalSearchView.as_view(),
        name="artifact-global-search",
    ),
    path(
        "api/v1/docs/",
        DocsGlobalListView.as_view(),
        name="docs-global-list",
    ),
    # API documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
]

# Debug toolbar for local development
if settings.DEBUG:
    import debug_toolbar

    urlpatterns = [
        path("__debug__/", include(debug_toolbar.urls)),
    ] + urlpatterns
