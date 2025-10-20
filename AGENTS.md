# Repository Guidelines

## Project Structure & Module Organization
The monorepo splits into `capstone-server/` (Django REST API) and `capstone-client/` (Next.js 15). Keep backend features inside `artifacts/`, `workspaces/`, or `auth_firebase/`, and pair them with nearby `tests/` modules (e.g., `workspaces/tests/test_models.py`). Frontend routes live in `src/app/`, shared UI in `src/components/`, and API helpers in `src/lib/`. Use `logs/` for transient output. Treat `deadline-capstone-firebase-adminsdk-fbsvc-8efd8ef2a7.json` as read-only and keep it aligned with your env vars.

## Build, Test, and Development Commands
- `cd capstone-server && python manage.py runserver` (API on `http://127.0.0.1:8000/api/v1/`).
- `python manage.py migrate` and optional `python manage.py seed_demo_data` for schema + fixtures.
- `python manage.py test -v 2` keeps all 57 backend checks passing.
- `cd capstone-client && npm run dev` (Turbopack dev server on `http://localhost:3000`).
- `npm run lint`, `npm run typecheck`, `npm run qa` - required QA gates before pushing.

## Coding Style & Naming Conventions
Python code follows PEP 8: 4-space indentation, `snake_case` functions, `PascalCase` classes, and settings isolated in `deadline_api/settings/`. Prefer slim views plus service/helpers inside each app. TypeScript is strict (`tsconfig.json`) and linted via `eslint.config.mjs`; components and contexts use `PascalCase`, hooks `useCamelCase`, and App Router segments stay `kebab-case`. Tailwind utilities live inline; rerun `npm run lint` to catch ordering issues.

## Testing Guidelines
Add backend tests beside the feature inside a `tests/` package named `test_*.py`; reuse fixtures where possible and assert status plus serialized payloads. Frontend quality currently leans on static analysis, so document manual UI validation in the PR and add Vitest/Playwright checks only when regressions are likely. Changes touching authentication or workspace boundaries need at least one new backend test and a note about coverage impact.

## Commit & Pull Request Guidelines
Commits use Conventional Commits (`feat:`, `fix:`, `docs:`) as shown in `git log`; keep scopes terse (`fix: workspace perm`). Work from feature branches such as `feature/workspace-filters` - the `.githooks/pre-push` script blocks direct pushes to `main` or `master`. PRs need a problem/solution summary, linked issue, local command output (tests, lint, build), and UI screenshots for customer-facing changes. Call out migrations, env keys, or manual follow-up before requesting review.

## Security & Configuration Tips
Copy `.env.example` files into `.env` or `.env.local` and load secrets through `python-decouple`/Next instead of committing real values. Rotate Firebase admin keys via the console, then update the JSON credential and server env vars together. Redact tokens or workspace IDs before sharing logs.
