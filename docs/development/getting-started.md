# Local Development Setup

This guide walks through setting up the DEADLINE monorepo for local development. The backend lives in `capstone-server/` (Django + DRF) and the frontend in `capstone-client/` (Next.js 15).

## Prerequisites

- Python 3.12+
- Node.js 20+ (align with the version used by Vercel)
- npm 10+
- Railway CLI (optional, for remote deployments)
- Firebase project with service account credentials

## 1. Clone and Install Dependencies

```bash
# Clone repository
git clone https://github.com/<your-org>/deadline.git
cd deadline

# Python dependencies
cd capstone-server
python -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Node dependencies
cd ../capstone-client
npm install
```

## 2. Environment Variables

Copy the provided templates and fill in real values. Never commit secrets.

```bash
# Backend
cd capstone-server
cp .env.example .env

# Frontend (fetches firebase config from backend, so only optional overrides)
cd ../capstone-client
cp .env.example .env.local  # optional, only if you need overrides
```

Populate Firebase Admin SDK values in `capstone-server/.env`. The frontend will read the public configuration from `/api/v1/auth/config/` during runtime.

## 3. Run Database Migrations

```bash
cd capstone-server
python manage.py migrate
```

Load optional showcase data via the template endpoint (requires the server to be running):

```bash
python manage.py runserver
# In another terminal
echo '{"template": "showcase"}' \
  | http POST http://127.0.0.1:8000/api/v1/workspaces/templates/apply/ \
      "Authorization: Bearer <firebase-id-token>"
```

## 4. Start Development Servers

```bash
# Backend (http://127.0.0.1:8000/api/v1/)
cd capstone-server
python manage.py runserver

# Frontend (http://localhost:3000)
cd ../capstone-client
npm run dev
```

The frontend expects the backend to be reachable at `http://127.0.0.1:8000`. Update `next.config.ts` if you proxy through a different host.

## 5. Useful Commands

- Backend tests: `python manage.py test -v 2`
- Backend coverage: `coverage run manage.py test && coverage report`
- Frontend lint: `npm run lint`
- Frontend types: `npm run typecheck`
- Frontend QA bundle: `npm run qa` (lint + typecheck + build)

## 6. Troubleshooting

- If Firebase tokens fail locally, verify the service account credentials in `.env` and ensure your Firebase project allows email/password sign-in.
- Delete `capstone-server/db.sqlite3` if migrations drift; rerun `python manage.py migrate`.
- Use `logs/` for transient debugging output only; remove files before committing.

You now have both services running locally. Continue with `docs/development/testing.md` for validation workflows and `docs/development/architecture.md` for a deeper system overview.
