# Railway Deployment - Issue Resolution Summary

## Problem Identified ✅

Your Railway deployment was failing because:
1. **Railway is using Railpack** (new build system) instead of Nixpacks
2. **Railpack was looking for `start.sh`** which didn't exist
3. **Your `nixpacks.toml` config was being ignored**

## Solutions Implemented ✅

### 1. Created `railway.json` (Primary Solution)
Forces Railway to use **Nixpacks** builder, which respects your `nixpacks.toml` configuration.

**Location:** `capstone-server/railway.json`

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  }
}
```

### 2. Created `start.sh` (Backup Solution)
If Railway still uses Railpack, this script will be detected and used.

**Location:** `capstone-server/start.sh`

Handles:
- Firebase credential generation
- Database migrations
- Static file collection
- Gunicorn server startup

### 3. Updated Deployment Scripts
- `generate_firebase_creds.py` - Creates Firebase credentials at runtime
- `diagnose_deployment.py` - Pre-deployment verification tool

### 4. Comprehensive Documentation
- `RAILWAY_DEPLOYMENT.md` - Full deployment guide
- `RAILWAY_ENV_TEMPLATE.md` - Quick env var reference

## What Changed in Your Build

### Before (Failing):
```
❌ Railpack looking for start.sh
❌ Script start.sh not found
❌ Railpack could not determine how to build the app
```

### After (Fixed):
```
✅ Railway.json forces Nixpacks
✅ Nixpacks reads nixpacks.toml
✅ start.sh available as fallback
✅ All startup scripts in place
```

## Next Steps - Action Required

### 1. Commit Changes
```bash
cd /Users/ozzy-mac/Projects/deadline
git add .
git commit -m "fix: Add Railway deployment configuration (railway.json, start.sh, Firebase credential generation)"
git push origin main
```

### 2. Set Environment Variables in Railway

**Critical Variables (Must Set):**

```bash
# Django Core
SECRET_KEY=<generate-with-command-below>
DEBUG=False
ALLOWED_HOSTS=<your-railway-domain>.up.railway.app,localhost

# Database (auto-set when you add Postgres)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Firebase Admin SDK
FIREBASE_PROJECT_ID=deadline-capstone
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@deadline-capstone.iam.gserviceaccount.com

# Firebase Web Config
FIREBASE_WEB_API_KEY=<from-firebase-console>
FIREBASE_WEB_AUTH_DOMAIN=deadline-capstone.firebaseapp.com
FIREBASE_WEB_PROJECT_ID=deadline-capstone
FIREBASE_WEB_APP_ID=<from-firebase-console>
```

**Generate SECRET_KEY:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 3. Add PostgreSQL Database

In Railway Dashboard:
1. Click "New" → "Database" → "PostgreSQL"
2. Railway automatically connects it (sets `DATABASE_URL`)

### 4. Deploy

```bash
# Option A: Via GitHub (Recommended)
git push origin main  # Triggers CI/CD

# Option B: Via Railway CLI
railway up
```

### 5. Monitor Deployment

```bash
railway logs --follow
```

**What to look for:**
- ✅ "Using Nixpacks" or "Running start.sh"
- ✅ "Firebase credentials written to /tmp/firebase-credentials.json"
- ✅ "Applying migrations"
- ✅ "Collecting static files"
- ✅ "Booting worker with pid"

### 6. Verify Deployment

```bash
# Health check
curl https://your-app.up.railway.app/api/v1/schema/

# Firebase config endpoint
curl https://your-app.up.railway.app/api/v1/auth/config/
```

## Files Created/Modified

### New Files ✨
- `capstone-server/railway.json` - Forces Nixpacks builder
- `capstone-server/start.sh` - Railpack startup script
- `capstone-server/scripts/generate_firebase_creds.py` - Firebase credential generator
- `capstone-server/scripts/diagnose_deployment.py` - Pre-deployment diagnostics
- `RAILWAY_DEPLOYMENT.md` - Complete deployment guide
- `RAILWAY_ENV_TEMPLATE.md` - Environment variable quick reference

### Modified Files 📝
- `capstone-server/nixpacks.toml` - Updated start command
- `capstone-server/Procfile` - Updated for consistency

## Troubleshooting

### If deployment still fails:

1. **Check Build Logs:**
   ```bash
   railway logs --filter build
   ```
   Look for: Which builder is being used (Nixpacks or Railpack)?

2. **Run Diagnostics Locally:**
   ```bash
   cd capstone-server
   python scripts/diagnose_deployment.py
   ```

3. **Verify Environment Variables:**
   ```bash
   railway variables
   ```

4. **Check if PostgreSQL is connected:**
   ```bash
   railway variables | grep DATABASE_URL
   ```

### Common Issues After This Fix:

❌ **"Firebase credentials not configured"**
→ Set FIREBASE_* environment variables (see RAILWAY_ENV_TEMPLATE.md)

❌ **"ImproperlyConfigured: SECRET_KEY"**
→ Generate and set SECRET_KEY in Railway

❌ **"Invalid HTTP_HOST header"**
→ Add your Railway domain to ALLOWED_HOSTS

## Success Indicators

You'll know it's working when:
- ✅ Build completes without "start.sh not found" error
- ✅ Deployment shows "Running" status in Railway dashboard
- ✅ `/api/v1/schema/` endpoint responds with 200
- ✅ `/api/v1/auth/config/` returns Firebase config
- ✅ Frontend can authenticate users

## Resources

- **Full Guide:** `RAILWAY_DEPLOYMENT.md`
- **Env Vars:** `RAILWAY_ENV_TEMPLATE.md`
- **Railway Docs:** https://docs.railway.app/
- **Django Deployment:** https://docs.djangoproject.com/en/5.1/howto/deployment/

## Questions?

1. Run `railway logs --follow` and share any errors
2. Check Railway Dashboard → Settings → What does "Build Method" say?
3. Run `python scripts/diagnose_deployment.py` locally for pre-deployment checks

---

**Ready to deploy?** Follow steps 1-6 above! 🚀
