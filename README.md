# DEADLINE - Developer Command Center

[![Django](https://img.shields.io/badge/Django-5.1-092E20?style=flat&logo=django)](https://www.djangoproject.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-57%2F57%20Passing-success?style=flat)]()

DEADLINE is a full-stack command center that centralizes environment variables, reusable prompts, and documentation links across multiple workspaces and environments (development, staging, production). Firebase authentication enforces strict access controls and every artifact is scoped to its owning workspace.

## Overview

- Secure storage for environment variables with server-side masking
- Prompt library for engineering and support teams
- Documentation hub with tagging and workspace-level filtering
- First-class support for multiple environments per workspace

## Key Features

### Workspace Management

- Multiple workspaces per user, each with environment-specific artifacts
- Tagging and search APIs for quick lookups
- Import and export routines for backup and sharing

### Security

- Firebase authentication (email/password and Google OAuth)
- Workspace ownership enforced in every query
- Masked environment variable values with explicit reveal endpoints
- Immutable audit log for every ENV_VAR reveal (captures user, IP, context)
- Built-in rate limiting (10 ENV_VAR reveals/minute, 60 searches/hour per user)

### Interface and Performance

- Responsive UI built with Next.js 15, React 19, and Tailwind CSS 4
- Server-side rendering and edge-friendly API usage
- Optimized API client with shared caching and retry logic

## Tech Stack

### Backend

- Django 5.1 with Django REST Framework
- PostgreSQL in production (SQLite for development)
- Firebase Admin SDK for authentication
- drf-spectacular for OpenAPI documentation
- Railway deployment targets with gunicorn

### Frontend

- Next.js 15 App Router with TypeScript 5
- React Query style data fetching via dedicated API clients
- Tailwind CSS 4 utility-first styling
- Vercel deployment configuration

## Quick Start

### Prerequisites

- Python 3.12 or newer
- Node.js 20 or newer
- Firebase project with Authentication enabled
- PostgreSQL (optional for local development)

### Backend

```bash
cd capstone-server
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

The API is available at `http://127.0.0.1:8000/api/v1/`.

> **Firebase Setup:** Populate the `FIREBASE_WEB_*` variables in
> `capstone-server/.env`. These feed the `/api/v1/auth/config/` endpoint that
> the frontend consumes during startup.

> **Tip:** After authenticating from the frontend, you can seed curated
> showcase workspaces by calling `POST /api/v1/workspaces/templates/apply/`
> (exposed in the UI as the **Use Showcase Template** button on the dashboard).

### Frontend

```bash
cd capstone-client
npm install
cp .env.example .env.local
npm run dev
```

The application runs at `http://localhost:3000`.

> **Client Config:** Only `NEXT_PUBLIC_API_BASE_URL` is required locally. The
> Firebase web credentials are retrieved automatically from the backend.

## Testing and Quality Gates

```bash
cd capstone-server
python manage.py test -v 2

cd ../capstone-client
npm run lint
npm run typecheck
npm run build
```

All commands must complete without warnings before opening a pull request.

## Audit Logging & Rate Limits

- ENV_VAR reveal responses now emit `ArtifactAccessLog` entries containing the
  user UID, IP address, user agent, and workspace context.
- The Django admin (`/admin/artifacts/artifactaccesslog/`) or direct database
  queries can be used to review the access history.
- Rate limits are enforced per authenticated Firebase UID:
  - `GET /api/v1/workspaces/:id/artifacts/:artifact_id/reveal_value/` → **10 requests/minute**
  - `GET /api/v1/workspaces/:id/artifacts/` (and search) → **60 requests/hour**
- Exceeding a limit returns HTTP 429 (Too Many Requests); limits reset after the
  interval window.

## Showcase Templates

- First-time users can click **Use Showcase Template** on the dashboard to
  provision PRD Acme Full Stack Suite, PRD AI Delivery Lab, and PRD Project Ops
  Command workspaces, complete with artifacts and tags.
- The same flow is available via API: send an authenticated `POST` request to
  `/api/v1/workspaces/templates/apply/` with a Firebase ID token in the
  `Authorization: Bearer <token>` header.
- Templates are idempotent per user and will create uniquely suffixed names if
  run repeatedly, ensuring production logins stay clean without demo accounts.

## Project Structure

```text
deadline/
|-- capstone-server/          # Django REST API backend
|   |-- deadline_api/         # Project settings and root config
|   |-- workspaces/           # Workspace models and endpoints
|   |-- artifacts/            # Artifact models and endpoints
|   `-- auth_firebase/        # Firebase authentication backend
`-- capstone-client/          # Next.js frontend
    |-- src/app/              # App Router pages
    |-- src/components/       # Reusable UI components
    |-- src/contexts/         # React contexts (auth, workspace)
    |-- src/lib/              # API clients and utilities
    `-- src/types/            # Type definitions
```

## Deployment

- Backend: Railway with PostgreSQL and gunicorn
- Frontend: Vercel (uses `.env.local` for build-time configuration)
- CI workflow runs backend tests, frontend linting, type checking, and builds before deploying

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/use-case`)
3. Run backend tests and frontend QA commands
4. Commit using Conventional Commit prefixes (`feat:`, `fix:`, `docs:`, etc.)
5. Open a pull request with a clear summary, test evidence, and any relevant screenshots

## License and Attribution

This project is published for portfolio and community reference. Questions and suggestions are welcome via issues or pull requests.
