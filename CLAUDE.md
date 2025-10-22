# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DEADLINE** is a full-stack Developer Command Center - a unified web application for managing workspace-scoped development artifacts across multiple environments. It centralizes environment variables, reusable prompts, and documentation links with strict Firebase-based access controls.

**Architecture**: Django 5.1 REST API backend + Next.js 15 (App Router) TypeScript frontend

## Development Commands

### Backend (capstone-server/)

```bash
# Setup
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Configure FIREBASE_WEB_* keys
python manage.py migrate

# Development
python manage.py runserver              # API: http://127.0.0.1:8000/api/v1/
python manage.py test -v 2              # Run 57 tests (must pass)
python manage.py test workspaces.tests.test_views -v 2  # Single app
python manage.py shell                  # Interactive shell
python manage.py makemigrations         # Create migrations

# Showcase Templates (post-auth)
# POST /api/v1/workspaces/templates/apply/ (Bearer token required)
# Creates: PRD Acme Full Stack Suite, PRD AI Delivery Lab, PRD Project Ops Command
```

### Frontend (capstone-client/)

```bash
# Setup
npm install
cp .env.example .env.local  # Only NEXT_PUBLIC_API_BASE_URL required

# Development
npm run dev                 # Dev server: http://localhost:3000 (Turbopack)
npm run lint                # ESLint (zero warnings required)
npm run typecheck           # TypeScript strict checks
npm run qa                  # Run lint + typecheck + build (full QA gate)
npm run build               # Production build
npm run start               # Run production build locally
```

### Quality Gates (Required Before PR)

```bash
# Backend: All tests must pass
cd capstone-server && python manage.py test -v 2

# Frontend: No lint/type errors, successful build
cd capstone-client && npm run qa
```

## High-Level Architecture

### Authentication Flow

1. Frontend fetches Firebase config from `/api/v1/auth/config/` (backend endpoint)
2. Firebase SDK initializes with config (no need to duplicate keys in frontend .env)
3. User authenticates via Firebase (email/password or Google OAuth)
4. Frontend obtains ID token via `getIdToken()`
5. Token included as `Authorization: Bearer <token>` in all API requests
6. Backend validates token with Firebase Admin SDK
7. Request attaches `FirebaseUser` with `uid` for query scoping

**Critical**: All backend queries MUST filter by `request.user.uid` for workspace ownership enforcement.

### Data Model Hierarchy

**Workspace System**:
- `Workspace`: Owner-scoped container (unique: `owner_uid + name`)
  - Relations: artifacts, workspace_environments, tags
- `EnvironmentType`: Master environment list (DEV, STAGING, PROD)
  - Seeded at startup, shared across workspaces
- `WorkspaceEnvironment`: M2M join (unique: `workspace + environment_type`)

**Artifact Polymorphism** (Single model with `kind` field):
- `ENV_VAR`: Key/value pairs (secrets/config)
  - Values masked by default; explicit `/artifacts/{id}/reveal/` endpoint for owners
  - Unique: `workspace + kind + key + environment`
- `PROMPT`: AI/code prompts (markdown content, max 10K chars)
  - Unique: `workspace + kind + title + environment`
- `DOC_LINK`: Documentation URLs
  - Unique: `workspace + kind + title + environment`
- Type-specific validation in model `clean()` method

**Tagging System**:
- `Tag`: Workspace-scoped tags (unique: `workspace + name`)
- `ArtifactTag`: Explicit M2M through table for clean deletion/auditing

### Backend Patterns

**ViewSet Architecture**:
- ModelViewSet-based views with automatic serialization
- Custom actions: `/templates/apply/`, `/export/`, `/reveal/`
- Query optimization: `select_related()` / `prefetch_related()` in ViewSets
- Pagination: 20 items per page (PageNumberPagination)

**Permission System**:
- `FirebaseAuthentication` class validates Bearer tokens (DRF backend)
- `IsAuthenticated` + `IsOwner` permission classes
- `IsOwner` checks workspace ownership via `obj.workspace.owner_uid`
- All queries scoped to `request.user.uid`

**API Design**:
- RESTful CRUD for workspaces, artifacts
- Filtering: By workspace, artifact kind, environment, tags
- Search: Full-text search endpoint `/search/artifacts/`
- Rate limiting: `django-ratelimit` per endpoint

### Frontend Patterns

**State Management**:
- `AuthContext`: Firebase auth state (user, loading, token caching with 5-min TTL)
- `WorkspaceContext`: Current workspace selection & artifact listing
- Server state: React Query-style via custom API client hooks
- Local state: `useState` for forms/UI

**API Client Architecture** (`lib/api/`):
- Axios instance in `lib/api/http.ts` with auth middleware
- Token injection from `AuthContext`
- Automatic retry on 401 (token refresh + retry)
- Module organization: `workspaces.ts`, `artifacts.ts`, `docs.ts`, `search.ts`

**Component Patterns**:
- Page components (`app/`): Server-aware, async components allowed
- UI primitives (`components/ui/`): Radix UI wrapped in Tailwind
- Feature components: High-level workspace/artifact management
- Error boundaries: Catch and display errors gracefully
- Auth guard: Middleware + component-level checks

**Form Handling**:
- React Hook Form for state management
- Zod schema validation with TypeScript integration
- Uncontrolled components (input refs) for performance

### Directory Structure

```
capstone-server/                    # Django REST API
├── deadline_api/                   # Project settings & root URLs
├── workspaces/                     # Workspace models, views, serializers
│   ├── models.py                   # Workspace, EnvironmentType, WorkspaceEnvironment
│   ├── views.py                    # WorkspaceViewSet with custom actions
│   ├── services.py                 # Template application logic
│   └── tests/                      # Test suite
├── artifacts/                      # Artifact models, views, serializers
│   ├── models.py                   # Polymorphic Artifact, Tag, ArtifactTag
│   ├── views.py                    # ArtifactViewSet with search/filtering
│   ├── serializers.py              # Type-specific serialization + masking
│   └── tests/                      # Test suite
└── auth_firebase/                  # Firebase authentication backend
    ├── authentication.py           # FirebaseAuthentication class
    ├── permissions.py              # IsOwner permission class
    └── views.py                    # Config endpoint for frontend

capstone-client/                    # Next.js frontend
├── src/app/                        # App Router pages (kebab-case segments)
│   ├── login/page.tsx              # Authentication
│   ├── dashboard/page.tsx          # Main dashboard
│   ├── workspaces/                 # Workspace management
│   └── artifacts/                  # Artifact management
├── src/components/                 # Reusable UI components
│   ├── AuthGuard.tsx               # Protected route wrapper
│   ├── SiteHeader.tsx              # Navigation header
│   └── ui/                         # Radix UI primitive wrappers
├── src/contexts/                   # React Context providers
│   ├── AuthContext.tsx             # Firebase auth state + token caching
│   └── WorkspaceContext.tsx        # Workspace state
├── src/lib/api/                    # API client modules
│   ├── config.ts                   # Fetch Firebase config
│   ├── http.ts                     # Axios instance with auth
│   ├── workspaces.ts               # Workspace API calls
│   └── artifacts.ts                # Artifact API calls
└── src/types/                      # TypeScript type definitions
```

## Critical Conventions

### Python (Backend)
- **Naming**: `snake_case` functions/variables, `PascalCase` classes
- **Validation**: Model-level `clean()` method called in `save()`
- **Permissions**: Always check workspace ownership in custom actions
- **Tests**: Co-located in `tests/test_*.py` within app directories
- **Indentation**: 4 spaces (PEP 8)

### TypeScript (Frontend)
- **Naming**: `camelCase` variables/functions, `PascalCase` components/types
- **Strict Mode**: TypeScript strict checks enabled (`tsconfig.json`)
- **App Router**: Route segments use `kebab-case` (e.g., `/env-check/page.tsx`)
- **API Calls**: Always through dedicated API client modules (never inline fetch)
- **Components**: Functional components with hooks

### Git Workflow
- **Branches**: Feature branches only (e.g., `feature/workspace-filters`)
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)
- **Protection**: `.githooks/pre-push` blocks direct pushes to main/master
- **PRs**: Require summary, test evidence, screenshots for UI changes

## Security & Configuration

### Environment Variables

**Backend** (`capstone-server/.env`):
- `SECRET_KEY`: Django secret key (generate with `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`)
- `FIREBASE_WEB_*`: Firebase web config keys (feeds `/api/v1/auth/config/`)
- `FIREBASE_TYPE`, `FIREBASE_PROJECT_ID`, etc.: Firebase Admin SDK credentials
- `DATABASE_URL`: PostgreSQL connection (Railway provides in production)

**Frontend** (`capstone-client/.env.local`):
- `NEXT_PUBLIC_API_BASE_URL`: Backend API URL (http://127.0.0.1:8000 locally)
- Firebase config is fetched from backend - no need to duplicate

### Firebase Setup
1. Copy `.env.example` files → `.env` / `.env.local`
2. Populate `FIREBASE_WEB_*` keys in backend `.env` (from Firebase console)
3. Place Firebase Admin SDK JSON in `capstone-server/` (or use env vars)
4. Frontend automatically fetches config from `/api/v1/auth/config/`

### Access Control
- All artifacts scoped to workspace owner's Firebase UID
- `IsOwner` permission enforces workspace membership
- ENV_VAR values masked by default; explicit reveal required
- CORS restricted to localhost:3000 and Vercel domain

## Deployment

### CI/CD Pipeline (GitHub Actions)
1. **Test Backend**: Install deps → Django checks → migrations dry-run → 57 tests
2. **Test Frontend**: Install deps → ESLint → TypeScript check → production build
3. **Deploy Backend**: Railway deployment + health check (`/api/v1/schema/`)
4. **Deploy Frontend**: Vercel deployment (production on main, preview on branches)

### Production Configuration
- **Backend**: Railway with PostgreSQL, gunicorn (2 workers), WhiteNoise static files
- **Frontend**: Vercel with Serverless Functions
- **Python**: 3.12 (nixpacks detection via Procfile)
- **Node**: 18 (Vercel default)

## Testing Strategy

### Backend
- **Framework**: Django test runner (`python manage.py test -v 2`)
- **Coverage**: Auth flow, permissions, artifact validation, workspace isolation
- **Requirement**: All 57 tests must pass before PR merge
- **Pattern**: Tests co-located in `tests/` directory within each app

### Frontend
- **Approach**: Static analysis (ESLint + TypeScript) + manual validation
- **Commands**: `npm run lint` (zero warnings), `npm run typecheck`, `npm run build`
- **Future**: Vitest + Playwright planned for regression testing

## Common Tasks

### Adding a New Artifact Type
1. Add new `kind` choice to `Artifact.ArtifactKind` enum (artifacts/models.py:20)
2. Update `clean()` validation logic (artifacts/models.py:80)
3. Create type-specific serializer (artifacts/serializers.py)
4. Add frontend type definition (capstone-client/src/types/artifacts.ts)
5. Update UI forms and validation (capstone-client/src/app/artifacts/)
6. Add tests for new type (artifacts/tests/test_models.py)

### Adding a New API Endpoint
1. Add action to ViewSet with `@action` decorator (e.g., workspaces/views.py:45)
2. Implement permission checks (`IsOwner`, `IsAuthenticated`)
3. Add tests in `tests/test_views.py`
4. Add frontend API client method (capstone-client/src/lib/api/)
5. Update OpenAPI schema (automatic via drf-spectacular)

### Modifying Authentication
1. Backend changes in `auth_firebase/authentication.py`
2. Update Firebase config endpoint if needed (`auth_firebase/views.py`)
3. Frontend changes in `AuthContext.tsx`
4. Test token validation flow end-to-end
5. Update permission classes if authorization logic changes

## Key Dependencies

| Dependency | Purpose | Notes |
|------------|---------|-------|
| Django 5.1 | Web framework | LTS version |
| Django REST Framework | API framework | ViewSets, serializers |
| firebase-admin | Auth token verification | Critical - handles all auth |
| Next.js 15 | Frontend framework | App Router with React 19 |
| Tailwind CSS 4 | Styling | Utility-first CSS |
| Radix UI | UI primitives | Unstyled, accessible components |
| drf-spectacular | OpenAPI docs | Swagger UI at `/api/v1/schema/` |
| gunicorn | WSGI server | Production deployment |
| WhiteNoise | Static files | Production static serving |

## Troubleshooting

### Backend Issues
- **Auth failures**: Check Firebase Admin SDK credentials and token expiration
- **Permission errors**: Verify workspace ownership scoping in queries
- **Migration conflicts**: Reset database and re-run migrations in dev
- **Test failures**: Run with `-v 2` for detailed output

### Frontend Issues
- **Auth loop**: Check token caching TTL (5 min) and refresh logic
- **API errors**: Verify `NEXT_PUBLIC_API_BASE_URL` and backend CORS config
- **Build failures**: Run `npm run typecheck` to isolate TypeScript errors
- **Lint warnings**: Use `npm run lint -- --fix` for auto-fixes

### Common Fixes
- **Token expired**: Frontend auto-retries with refresh on 401
- **Workspace not found**: Check ownership filter in ViewSet
- **ENV_VAR not visible**: Use explicit `/reveal/` endpoint
- **Template conflicts**: Templates are idempotent with unique suffixes

