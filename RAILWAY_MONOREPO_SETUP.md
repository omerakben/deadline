# Railway Monorepo Configuration Guide

## ⚠️ CRITICAL: Root Directory Configuration Required

Since your repository contains both `capstone-server/` (Django) and `capstone-client/` (Next.js), Railway needs to know which directory contains the backend service.

## Setup Steps for Railway Dashboard

### 1. Configure Root Directory (REQUIRED)

**In Railway Dashboard:**

1. Go to your **backend service** (the Django API)
2. Click **Settings** tab
3. Scroll to **Root Directory** section
4. Set: `capstone-server`
5. Click **Save**

**What this does:**
- Railway will only look inside `capstone-server/` for build files
- Changes to `capstone-client/` won't trigger backend rebuilds
- Builds run faster (smaller context)

### 2. Configure Watch Paths (OPTIONAL but Recommended)

**In Railway Dashboard:**

1. Same service → **Settings** tab
2. Scroll to **Watch Paths**
3. Add: `capstone-server/**`
4. Click **Save**

**What this does:**
- Only rebuilds when files in `capstone-server/` change
- Ignores changes to frontend code, docs, etc.
- Saves build minutes

### 3. Verify Build Configuration

**Your service should show:**

- ✅ **Root Directory:** `capstone-server`
- ✅ **Watch Paths:** `capstone-server/**`
- ✅ **Builder:** Nixpacks (detected from `railway.json`)
- ✅ **Start Command:** Auto-detected from `start.sh` or `nixpacks.toml`

## File Structure & Deployment Paths

```
deadline/                          # Repository root
├── capstone-server/              # ← Railway Root Directory set to here
│   ├── railway.json              # Railway config (builder, watch patterns)
│   ├── nixpacks.toml             # Nixpacks build configuration
│   ├── start.sh                  # Startup script (Railpack fallback)
│   ├── Procfile                  # Legacy Heroku-style config
│   ├── manage.py                 # Django management
│   ├── requirements.txt          # Python dependencies
│   ├── deadline_api/             # Django project
│   ├── workspaces/               # Django app
│   ├── artifacts/                # Django app
│   └── scripts/
│       ├── generate_firebase_creds.py
│       └── diagnose_deployment.py
└── capstone-client/              # Frontend (deploy to Vercel)
    ├── vercel.json
    ├── package.json
    └── src/
```

## Configuration Files Explained

### `capstone-server/railway.json`
```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "watchPatterns": [
      "capstone-server/**"  // Only rebuild on server changes
    ]
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Note:** `watchPatterns` here is relative to the **repository root**, not the root directory. It ensures Railway monitors the correct path even when the root directory is set.

### `capstone-server/nixpacks.toml`
```toml
[phases.setup]
nixPkgs = ["python312", "postgresql_16", "pkg-config"]

[phases.install]
cmds = [
    "python -m venv /app/.venv",
    "/app/.venv/bin/pip install --upgrade pip",
    "/app/.venv/bin/pip install -r requirements.txt"
]

[start]
cmd = "/app/.venv/bin/python scripts/generate_firebase_creds.py && ..."
```

**Paths in nixpacks.toml are relative to the root directory** (`capstone-server/`).

### `capstone-server/start.sh`
```bash
#!/bin/bash
python scripts/generate_firebase_creds.py
python manage.py migrate --noinput
python manage.py collectstatic --noinput
exec gunicorn deadline_api.wsgi:application ...
```

**Paths in start.sh are also relative to the root directory.**

## GitHub Actions CI/CD Configuration

Your workflow already handles the monorepo correctly:

```yaml
- name: Deploy to Railway
  env:
      RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
  run: |
      cd capstone-server          # ← Changes directory first
      railway up --service backend
```

✅ No changes needed for GitHub Actions.

## Railway CLI Usage (Local Development)

### Linking to Your Service

```bash
# From repository root
cd capstone-server
railway link
# Select: Project → Service → Environment
```

### Deploying Manually

```bash
# From capstone-server directory
cd capstone-server
railway up
```

### Viewing Logs

```bash
cd capstone-server
railway logs --follow
```

### Running Commands

```bash
cd capstone-server
railway run python manage.py migrate
railway run python manage.py createsuperuser
```

## Common Mistakes & Fixes

### ❌ Mistake 1: Root Directory Not Set
**Symptom:** Railway tries to build from repository root, can't find `manage.py`

**Fix:** Set Root Directory to `capstone-server` in Railway Dashboard → Settings

### ❌ Mistake 2: Railway CLI Run from Wrong Directory
**Symptom:** `railway up` fails with "No service found"

**Fix:**
```bash
cd capstone-server  # Must be in server directory
railway up
```

### ❌ Mistake 3: Absolute Paths in Scripts
**Symptom:** Scripts fail because paths reference wrong location

**Fix:** All paths in `start.sh`, `nixpacks.toml` should be relative to `capstone-server/`:
```bash
# ✅ Good - relative path
python scripts/generate_firebase_creds.py

# ❌ Bad - absolute path
python /Users/you/Projects/deadline/capstone-server/scripts/...
```

### ❌ Mistake 4: Watch Paths Not Set
**Symptom:** Backend rebuilds when frontend code changes

**Fix:** Set Watch Paths to `capstone-server/**` in Railway Dashboard

## Verification Checklist

After configuration, verify:

- [ ] Root Directory is set to `capstone-server` in Railway Dashboard
- [ ] Watch Paths is set to `capstone-server/**` (optional but recommended)
- [ ] Build succeeds without "file not found" errors
- [ ] Deployment shows "Using Nixpacks" or "Running start.sh"
- [ ] Logs show: "✅ Firebase credentials written"
- [ ] Logs show: "✅ X migrations applied"
- [ ] API responds: `curl https://your-app.up.railway.app/api/v1/schema/`

## Testing Monorepo Configuration

### Test 1: Frontend Changes Don't Trigger Backend Rebuild

```bash
# Make a change to frontend
echo "// test" >> capstone-client/src/app/page.tsx
git commit -am "test: frontend change"
git push

# Check Railway: Backend should NOT rebuild
```

### Test 2: Backend Changes DO Trigger Rebuild

```bash
# Make a change to backend
echo "# test" >> capstone-server/README.md
git commit -am "test: backend change"
git push

# Check Railway: Backend SHOULD rebuild
```

## Separate Frontend Deployment (Vercel)

Your frontend deploys separately to Vercel. No monorepo configuration needed there because Vercel auto-detects `capstone-client/` via `vercel.json`:

```json
{
  "buildCommand": "cd capstone-client && npm run build",
  "outputDirectory": "capstone-client/.next"
}
```

## Quick Reference

| Configuration   | Location                        | Purpose                                        |
| --------------- | ------------------------------- | ---------------------------------------------- |
| Root Directory  | Railway Dashboard → Settings    | Tells Railway to build from `capstone-server/` |
| Watch Paths     | Railway Dashboard → Settings    | Only rebuild on server changes                 |
| `railway.json`  | `capstone-server/railway.json`  | Forces Nixpacks builder                        |
| `nixpacks.toml` | `capstone-server/nixpacks.toml` | Nixpacks build config                          |
| `start.sh`      | `capstone-server/start.sh`      | Railpack startup script                        |

## Summary

✅ **For Railway Dashboard:**
1. Set Root Directory: `capstone-server`
2. Set Watch Paths: `capstone-server/**`

✅ **For Railway CLI:**
```bash
cd capstone-server
railway link
railway up
```

✅ **For GitHub Actions:**
Already configured correctly (uses `cd capstone-server`)

✅ **All file paths are relative to `capstone-server/`**

---

**Next Step:** Set the Root Directory in Railway Dashboard before deploying!
