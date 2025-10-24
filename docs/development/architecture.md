# System Architecture

DEADLINE is a monorepo that ships a Django REST API and a Next.js 15 frontend. The backend provides secure workspace-scoped APIs while the frontend renders the developer command center UI.

## High-Level Diagram

```
┌─────────────┐        HTTPS         ┌───────────────────┐
│ Next.js 15  │  ─────────────────→ │ Django REST API   │
│ (Frontend)  │                     │ (capstone-server)  │
└─────┬───────┘                     └──────┬────────────┘
      │                                     │
      │ Firebase ID tokens                  │ PostgreSQL / SQLite
      │                                     │
      ▼                                     ▼
┌─────────────┐                     ┌───────────────────┐
│ Firebase    │                     │ Artifact &        │
│ Auth        │                     │ Workspace models  │
└─────────────┘                     └───────────────────┘
```

## Monorepo Layout

- `capstone-server/` – Django project (`deadline_api`) with domain apps:
  - `workspaces/` – Workspace, environment, and membership models with DRF viewsets
  - `artifacts/` – Polymorphic artifact model (ENV_VAR, PROMPT, DOC_LINK) and audit logging
  - `auth_firebase/` – Firebase Admin integration, authentication backends, and permission classes
  - `scripts/` – Operational utilities (e.g. Firebase credential generator)
- `capstone-client/` – Next.js App Router application
  - `src/app/` – Route segments (dashboard, workspaces, artifacts, auth)
  - `src/components/` – Shared UI primitives (cards, tables, buttons)
  - `src/lib/` – API client wrappers, Firebase helpers, form schemas
  - `public/` – Static assets and icons

## Backend Architecture

- **Authentication:** Firebase ID tokens are verified with the Admin SDK inside custom DRF authentication classes.
- **Authorization:** Viewsets enforce workspace ownership via queryset filters and custom permissions.
- **Data Model:** Each artifact is tied to a workspace + environment. ENV_VAR values are stored encrypted and only revealed through a dedicated action that logs to `ArtifactAccessLog`.
- **Rate Limiting:** `django-ratelimit` protects sensitive endpoints (ENV_VAR reveal, global search).
- **Schema:** `drf-spectacular` generates `/api/v1/schema/` (OpenAPI 3) consumed by Swagger UI.

## Frontend Architecture

- **Rendering:** Uses Next.js App Router with Server Actions for authenticated API calls where possible.
- **State Management:** React hooks + `react-hook-form` for forms; minimal global state.
- **Styling:** Tailwind CSS 4 with design tokens composed inline; `class-variance-authority` for variants.
- **API Access:** `src/lib/api` centralises axios client configuration with Firebase token injection.
- **Auth:** Firebase Web SDK handles sign-in; server-provided config fetched from `/api/v1/auth/config/`.

## Deployment Topology

- Backend deploys to Railway using Nixpacks (`capstone-server/railway.json`).
- Frontend deploys to Vercel using `vercel.json` and Next.js build pipeline.
- Firebase hosts authentication and issues ID tokens for both local and production environments.

Refer to the project README or your deployment runbooks for environment-specific instructions.
