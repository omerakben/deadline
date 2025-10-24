# Testing & Quality Gates

DEADLINE enforces automated checks on both the Django API and the Next.js frontend. Run these commands before opening a pull request.

## Backend (capstone-server)

```bash
cd capstone-server
python manage.py test -v 2         # Run Django test suite
coverage run manage.py test         # Optional: collect coverage
coverage report                     # Summarise coverage (target ≥ 85%)
```

### Test Layout

- Place new tests beside the code under `*/tests/test_*.py`.
- Reuse fixtures from existing apps (e.g. `workspaces/tests/fixtures.py`).
- Assert HTTP status codes and serialized payloads for API tests.

### Manual Verification

- `python manage.py runserver` and exercise Firebase authentication with a test user.
- Use `POST /api/v1/workspaces/templates/apply/` to seed demo data for smoke tests.

## Frontend (capstone-client)

```bash
cd capstone-client
npm run lint        # ESLint (0 warnings enforced)
npm run typecheck   # TypeScript strict mode
npm run build       # Production build
npm run qa          # Runs lint + typecheck + build
```

### Manual QA Checklist

- `/` – Dashboard welcome screen renders without console errors.
- `/login` – Firebase authentication flow (email/password + Google) works.
- `/dashboard` – Workspace overview loads and queries the API.
- `/workspaces` & `/workspaces/new` – Create workspace lifecycle succeeds.
- `/w/[id]` – Workspace detail shows scoped artifacts.
- `/artifacts/[id]/edit` – Edit form persists updates.
- `/settings` – User profile updates persist.
- `/docs` – Documentation hub displays markdown.

### Debug Tips

- Use `npm run dev` with the browser devtools open; watch network requests to `http://127.0.0.1:8000`.
- If Firebase config fails, confirm the backend `/api/v1/auth/config/` endpoint is reachable.

## Integration Smoke Test

After both servers are running:

1. Sign in with a Firebase test account.
2. Create a new workspace.
3. Add an ENV_VAR artifact and reveal its value (expect audit log entry).
4. Run a search query (enforces 60 requests/hour rate limit).
5. Delete the workspace and ensure cascading cleanup succeeds.

Document any manual QA performed in your pull request description. Continuous integration should mirror this checklist once GitHub Actions workflows are added.
