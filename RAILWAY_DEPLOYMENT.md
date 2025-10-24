# Railway Deployment Guide for DEADLINE

## ⚠️ CRITICAL: Monorepo Configuration Required First

**This repository contains both backend and frontend.** Before following this guide:

1. **Set Root Directory in Railway Dashboard:**
   - Go to your service → Settings → Root Directory
   - Set to: `capstone-server`
   - This tells Railway to build from the server directory only

2. **See detailed monorepo setup:**
   - Quick guide: `RAILWAY_MONOREPO_QUICK.md`
   - Full explanation: `RAILWAY_MONOREPO_SETUP.md`

---

## Important: Build System Configuration

Railway now uses **Railpack** by default (their new build system). Your project includes both configurations:

- `railway.json` - Forces Railway to use **Nixpacks** (recommended)
- `start.sh` - Fallback for **Railpack** if needed
- `nixpacks.toml` - Nixpacks build configuration
- `Procfile` - Legacy Heroku-style configuration

**Recommended approach:** Keep `railway.json` to use Nixpacks. If you remove it, Railway will use `start.sh` via Railpack.

## Quick Fixes for Common Issues

### Issue 1: Firebase Authentication Errors

**Symptoms:** `Firebase credentials not configured` or `Firebase initialization failed`

**Solution:** Set these environment variables in Railway:

```bash
# Core Firebase Admin SDK (Required)
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com

# Firebase Web Config (Required for frontend)
FIREBASE_WEB_API_KEY=your-web-api-key
FIREBASE_WEB_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_WEB_PROJECT_ID=your-project-id
FIREBASE_WEB_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_WEB_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_WEB_APP_ID=1:your-app-id:web:your-web-app-id
```

**Important:** The `FIREBASE_PRIVATE_KEY` must include `\n` for newlines (literal backslash-n, not actual newlines).

### Issue 2: SECRET_KEY Error

**Symptoms:** `ImproperlyConfigured: SECRET_KEY must be set securely`

**Solution:** Generate and set a strong secret key:

```bash
# Generate a key locally:
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Set in Railway:
SECRET_KEY=your-generated-secret-key-here
```

### Issue 3: Database Connection Issues

**Symptoms:** Database connection errors, missing `DATABASE_URL`

**Solution:**

1. Add a PostgreSQL service in Railway
2. Railway automatically provides `DATABASE_URL` - verify it's set:

   ```bash
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```

### Issue 4: ALLOWED_HOSTS / CORS Errors

**Symptoms:** `Invalid HTTP_HOST header` or CORS errors

**Solution:** Update these variables with your Railway domain:

```bash
# Example with Railway domain
ALLOWED_HOSTS=deadline-api-production.up.railway.app,localhost,127.0.0.1

# Add your frontend URL
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
VERCEL_FRONTEND_URL=https://your-frontend.vercel.app
```

### Issue 5: Static Files Not Loading

**Symptoms:** 404 errors for admin CSS/JS

**Solution:** The startup script now runs `collectstatic` automatically. Verify:

- `whitenoise` is in `requirements.txt` ✅
- `STATIC_ROOT` is set in settings ✅
- Start command includes `collectstatic` ✅

## Complete Railway Environment Variables Checklist

### ✅ Required Variables

```bash
# Django Core
SECRET_KEY=<generate-with-django-command>
DEBUG=False
ALLOWED_HOSTS=<your-railway-domain>.up.railway.app,localhost

# Database (auto-provided by Railway Postgres)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Firebase Admin SDK
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=<your-project-id>
FIREBASE_PRIVATE_KEY_ID=<key-id>
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=<service-account-email>
FIREBASE_CLIENT_ID=<client-id>
FIREBASE_CLIENT_X509_CERT_URL=<cert-url>

# Firebase Web Config
FIREBASE_WEB_API_KEY=<web-api-key>
FIREBASE_WEB_AUTH_DOMAIN=<project-id>.firebaseapp.com
FIREBASE_WEB_PROJECT_ID=<project-id>
FIREBASE_WEB_STORAGE_BUCKET=<project-id>.appspot.com
FIREBASE_WEB_MESSAGING_SENDER_ID=<sender-id>
FIREBASE_WEB_APP_ID=<app-id>

# CORS (Frontend URL)
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
VERCEL_FRONTEND_URL=https://your-frontend.vercel.app
```

### 🔄 Optional Variables

```bash
# Firebase Optional
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_WEB_MEASUREMENT_ID=G-XXXXXXXXXX

# Production Security (uncomment after testing)
# SECURE_SSL_REDIRECT=True
# SESSION_COOKIE_SECURE=True
# CSRF_COOKIE_SECURE=True
```

## Deployment Steps

### 1. Initial Railway Setup

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
cd capstone-server
railway link
```

### 2. Add PostgreSQL Database

```bash
# In Railway Dashboard:
# 1. Click "New" → "Database" → "PostgreSQL"
# 2. Railway automatically sets DATABASE_URL reference
```

### 3. Set Environment Variables

**Option A: Via Dashboard**

1. Go to your service → Variables
2. Add each variable from the checklist above
3. Click "Deploy" to restart

**Option B: Via CLI**

```bash
railway variables set SECRET_KEY="your-secret-key"
railway variables set DEBUG=False
railway variables set ALLOWED_HOSTS="your-domain.up.railway.app,localhost"
# ... continue for all variables
```

### 4. Deploy

```bash
# Deploy from CLI
railway up

# Or push to main branch (CI/CD via GitHub Actions)
git push origin main
```

### 5. Verify Deployment

```bash
# Check service logs
railway logs

# Health check
curl https://your-domain.up.railway.app/api/v1/schema/

# Test Firebase config endpoint
curl https://your-domain.up.railway.app/api/v1/auth/config/
```

## Troubleshooting Commands

### Check Logs

```bash
railway logs --follow
```

### SSH into Container

```bash
railway shell
```

### Run Management Commands

```bash
railway run python manage.py check
railway run python manage.py migrate
railway run python manage.py createsuperuser
```

### Test Environment Variables

```bash
railway run python -c "import os; print('SECRET_KEY:', 'SET' if os.getenv('SECRET_KEY') else 'MISSING')"
railway run python -c "import os; print('DATABASE_URL:', 'SET' if os.getenv('DATABASE_URL') else 'MISSING')"
```

## Common Error Messages & Fixes

### Error: "No module named 'firebase_admin'"

**Fix:** Verify `firebase-admin>=6.4.0` is in `requirements.txt` and redeploy

### Error: "could not connect to server"

**Fix:** Ensure PostgreSQL service is running and `DATABASE_URL` is set correctly

### Error: "Invalid HTTP_HOST header: 'xxx.up.railway.app'"

**Fix:** Add the Railway domain to `ALLOWED_HOSTS`

### Error: "Firebase private key must be a string"

**Fix:** Ensure `FIREBASE_PRIVATE_KEY` includes `\n` characters (literal backslash-n)

### Error: "collectstatic failed"

**Fix:** Check that `STATIC_ROOT` is set and `whitenoise` is installed

## CI/CD Integration

Your GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:

1. Tests backend (migrations, checks, test suite)
2. Tests frontend (lint, typecheck, build)
3. Deploys to Railway on push to `main`
4. Runs health checks

**Required GitHub Secrets:**

- `RAILWAY_TOKEN` - Get from Railway dashboard → Account Settings → Tokens
- `DJANGO_SECRET_KEY` - For CI testing only (separate from production)

## Performance Optimization

### Gunicorn Workers

Current: 3 workers (nixpacks.toml) or 2 workers (Procfile)

**Recommended formula:** `(2 × CPU cores) + 1`

For Railway Hobby plan (2 vCPU): Use 5 workers
For Railway Pro plan (4 vCPU): Use 9 workers

Update in `nixpacks.toml`:

```toml
cmd = "... --workers 5 ..."
```

### Database Connection Pooling

Already configured via `dj-database-url` with:

- `conn_max_age=600` (10 minutes)
- `conn_health_checks=True`

## Security Checklist

- [ ] `SECRET_KEY` is strong and unique
- [ ] `DEBUG=False` in production
- [ ] `ALLOWED_HOSTS` restricts to your domains only
- [ ] `CORS_ALLOWED_ORIGINS` includes only your frontend
- [ ] Firebase private key is kept secure (never commit)
- [ ] PostgreSQL uses Railway's managed service (encrypted)
- [ ] SSL enabled via Railway (automatic)
- [ ] Consider enabling security headers after initial deploy

## Next Steps

1. **Monitor Logs:** Use `railway logs` to watch for errors during first deploy
2. **Test Auth Flow:** Try signing in via your frontend
3. **Create Superuser:** `railway run python manage.py createsuperuser`
4. **Verify API:** Test all endpoints via `/api/v1/schema/` docs
5. **Enable Templates:** POST to `/api/v1/workspaces/templates/apply/` to seed showcase data

## Support Resources

- Railway Docs: <https://docs.railway.app/>
- Django Deployment: <https://docs.djangoproject.com/en/5.1/howto/deployment/>
- Firebase Admin SDK: <https://firebase.google.com/docs/admin/setup>

## Contact

If you encounter issues not covered here, check:

1. Railway service logs
2. GitHub Actions workflow output
3. Django `manage.py check --deploy` warnings
