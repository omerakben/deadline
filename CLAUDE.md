# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DEADLINE** is a full-stack developer command center for managing environment variables, code prompts, and documentation links across multiple workspaces and environments. The system uses Firebase authentication with workspace-scoped ownership isolation.

**Monorepo structure:**
- `capstone-server/` — Django REST API backend
- `capstone-client/` — Next.js 15 frontend (React 19)

## Development Commands

### Backend (Django)

```bash
cd capstone-server

# Setup
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env

# Database
python manage.py migrate
python manage.py test -v 2  # Run test suite

# Run server
python manage.py runserver  # http://127.0.0.1:8000

# Demo data seeding
python manage.py seed_demo_data
python manage.py populate_demo_workspace

# Admin
python manage.py createsuperuser

# Deployment check
python manage.py check --deploy
```

### Frontend (Next.js)

```bash
cd capstone-client

# Setup
npm install
# Create .env.local with Firebase config and API URL

# Development
npm run dev  # http://localhost:3000

# Quality gates
npm run lint       # ESLint (zero warnings enforced)
npm run typecheck  # TypeScript check
npm run qa         # Run all checks + build

# Production
npm run build
npm start
```

## Architecture

### Backend Architecture

**Core Django apps:**
- `deadline_api/` — Root settings, URL configuration
- `workspaces/` — Workspace and environment models + CRUD endpoints
- `artifacts/` — Polymorphic artifact model (ENV_VAR | PROMPT | DOC_LINK) with workspace+environment scoping
- `auth_firebase/` — Firebase token validation, custom authentication backend, demo mode middleware

**Key models:**
- `Workspace` — Container for artifacts, owned by Firebase UID with unique name constraint per user
- `EnvironmentType` — Master environment types (DEV, STAGING, PROD) seeded via migration
- `WorkspaceEnvironment` — Join table enabling M2M between Workspace and EnvironmentType
- `Artifact` — Polymorphic model with type-specific fields (key/value for ENV_VAR, title/content for PROMPT, title/url for DOC_LINK). Environment-aware uniqueness constraints on `(workspace, kind, key/title, environment)`.
- `Tag` — Many-to-many tagging via explicit `ArtifactTag` through table

**Authentication flow:**
1. Client sends Firebase ID token in `Authorization: Bearer <token>` header
2. `auth_firebase.authentication.FirebaseAuthentication` verifies token using Firebase Admin SDK
3. Lightweight user object with `uid` attached to request
4. All endpoints enforce ownership filtering via `owner_uid`
5. Demo mode (`DEMO_MODE=True`) bypasses Firebase via middleware for public deployment

**Database:** SQLite (local dev), PostgreSQL (production via `dj-database-url`)

**Important settings:**
- `DEMO_MODE` — Enable demo access without Firebase (sets demo user in middleware)
- `FIREBASE_CREDENTIALS_FILE` or individual `FIREBASE_*` env vars for service account
- Firebase initialized at `/tmp/firebase-credentials.json` (Railway) or from `FIREBASE_CREDENTIALS_FILE`

**Validation patterns:**
- All models call `full_clean()` in `save()` to enforce validation
- ENV_VAR keys: uppercase alphanumeric + underscores only (`^[A-Z0-9_]+$`)
- PROMPT content: max 10,000 characters
- Workspace names: alphanumeric + spaces/hyphens/underscores/periods

**Deletion behavior:**
- Workspace deletion pre-deletes all artifacts to avoid `PROTECT` constraint on `workspace_env` FK
- Artifact → WorkspaceEnvironment uses `on_delete=PROTECT` to prevent accidental environment removal

### Frontend Architecture

**Tech stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Firebase 12, Axios

**Directory structure:**
- `src/app/` — App Router pages (client components)
- `src/components/` — Reusable UI components (shadcn/ui + custom)
- `src/contexts/` — `AuthContext` (Firebase auth state), `WorkspaceContext` (selected workspace)
- `src/lib/` — API client wrappers, Firebase config, utilities
- `src/hooks/` — Custom React hooks (e.g., `useWorkspaces`)
- `src/types/` — TypeScript type definitions

**Authentication:**
- `AuthContext` manages Firebase auth state, exposes `user`, `loading`, `signIn`, `signOut`
- `AuthGuard` component protects routes (must wrap protected pages)
- Axios interceptor in `HttpAuthProvider` injects Firebase ID token into all API requests
- Token refresh handled automatically by Firebase SDK

**API integration:**
- Base URL from `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:8000/api/v1`)
- Axios client in `src/lib/api/http.ts` with error normalization
- API modules: `artifacts.ts`, `workspaces.ts`, `docs.ts`, `search.ts`
- All API wrappers handle both paginated (`{count, results}`) and array responses

**Demo mode:**
- "Launch Demo" button hits `/api/v1/auth/demo/login/` endpoint
- Backend must be configured with `DEMO_MODE=True` for public deployment
- Demo authentication creates Firebase custom token for seamless client auth
- Recent fix: Demo login now fully functional with proper Firebase token flow

**Known issues:**

- Workspace discovery assumes array response but API is paginated (affects deep-linking)
- Multiple redundant `/workspaces/` fetches across dashboard/settings/docs
- Missing Firebase env validation in `validatePublicEnv()`
- No caching layer (consider React Query/SWR)
- No frontend test suite (gap identified for production readiness)

### Data Flow

**Typical artifact CRUD:**
1. User selects workspace (stored in `WorkspaceContext`)
2. Component calls API wrapper (e.g., `createArtifact(workspaceId, data)`)
3. Axios interceptor injects Firebase token
4. Backend validates token, checks ownership, enforces uniqueness constraints
5. Response normalized by API wrapper, component updates UI

**Environment handling:**
- Workspaces enable specific environments via `WorkspaceEnvironment` join table
- Artifacts reference `workspace_env` FK (nullable during migration, later required)
- Frontend shows environment toggle to filter/scope artifact views
- Uniqueness enforced per `(workspace, kind, key/title, environment)`

**Tag relationships:**
- M2M via explicit `ArtifactTag` through model for auditing
- Tags scoped per workspace with unique constraint on `(workspace, name)`
- Artifacts can have multiple tags, tags track usage count

## API Conventions

**Base URL:** `/api/v1/`

**Key endpoints:**
- `GET/POST /workspaces/` — List/create workspaces
- `GET/PUT/DELETE /workspaces/{id}/` — Workspace detail
- `GET/POST /workspaces/{id}/artifacts/` — Artifact list/create (supports `?kind=`, `?environment=`, `?search=`)
- `GET/PUT/DELETE /workspaces/{id}/artifacts/{aid}/` — Artifact detail
- `POST /workspaces/{id}/artifacts/{aid}/reveal_value/` — Unmask ENV_VAR value
- `GET /search/artifacts/?q=<term>` — Global artifact search
- `GET /docs/` — Global DOC_LINK aggregation

**Response format:** Paginated endpoints return `{count, results}`. Some legacy endpoints return bare arrays (frontend handles both).

**Authentication:** All endpoints require `Authorization: Bearer <firebase-token>` except schema endpoints and demo login.

## Testing

**Backend:**
- Test suite: `python manage.py test -v 2`
- Tests in `workspaces/tests/`, `workspaces/testsuite/`, `artifacts/tests.py`
- Uses Django TestCase, covers model validation, serializers, viewsets

**Frontend:**
- No test suite currently (gap identified in Analyze.md)
- Recommended: Add smoke tests for auth routing, workspace CRUD, demo flow

## Configuration

**Backend `.env` essentials:**
```bash
SECRET_KEY=<strong-key>
DEBUG=True  # False in production
ALLOWED_HOSTS=localhost,127.0.0.1
DEMO_MODE=False  # True for public demo deployment
FIREBASE_CREDENTIALS_FILE=/path/to/serviceAccountKey.json
# OR individual FIREBASE_* vars
```

**Frontend `.env.local` essentials:**
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_FIREBASE_API_KEY=<key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<project>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<project-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<app-id>
# Also need: STORAGE_BUCKET, MESSAGING_SENDER_ID (not validated but required)
```

## Production Deployment

**Backend checklist:**
- Set `DEBUG=False`, strong `SECRET_KEY`, proper `ALLOWED_HOSTS`
- Configure Firebase credentials via `FIREBASE_CREDENTIALS_FILE` or env vars
- Use PostgreSQL via `DATABASE_URL` (dj-database-url auto-configures)
- Collect static files: `python manage.py collectstatic`
- Run with Gunicorn: `gunicorn deadline_api.wsgi:application --bind 0.0.0.0:8000`
- Add HTTPS reverse proxy (Nginx/Cloud Load Balancer)
- Run `python manage.py check --deploy`

**Frontend checklist:**
- Set all `NEXT_PUBLIC_*` env vars in hosting provider
- Use `npm run build` for production build
- Serve with `npm start` or deploy to Vercel
- Configure `VERCEL_FRONTEND_URL` in backend for CORS

## Development Guidelines

Both backend and frontend have detailed copilot instruction files with comprehensive patterns:

- `capstone-server/.github/copilot-instructions.md` — Django patterns, TODO workflow, quality gates
- `capstone-client/.github/copilot-instructions.md` — Next.js patterns, auth flow, component guidelines

These files contain:

- Quality gate checklists (lint, typecheck, tests before push)
- Memory management patterns for tracking implementation decisions
- Consistent code organization and import ordering
- Form validation patterns and accessibility requirements

## Technical Debt & Improvements

See `TODO.md` for comprehensive technical debt tracking with:

- **P0 Critical**: Security and functionality blockers (5 items)
- **P1 High Priority**: Production readiness items (7 items)
- **P2 Medium**: Code quality and architecture improvements (15 items)
- **P3 Low Priority**: Nice-to-have enhancements (18 items)

Each task includes file locations, time estimates, and verification steps.

## Debugging Scripts

Located in `capstone-server/` root:

- `debug_tags.py`, `debug_artifacts.py`, `debug_tags_relationship.py` — Standalone Django shell scripts
- `scripts/manual_api_probe.py` — API testing utility
- All bootstrap Django via `deadline_api.settings`, use local SQLite DB
- Not loaded in production

## Git Workflow

- Feature branches recommended for all development work
- CI workflows exist in both `capstone-server/.github/workflows/` and `capstone-client/.github/workflows/`
- No pre-commit hooks currently configured
