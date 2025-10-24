# Railway Quick Reference - Environment Variables

## Copy-Paste Template for Railway Dashboard

### Step 1: Required Variables (Set these first!)

```bash
# Django Core
SECRET_KEY=<run: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())">
DEBUG=False
ALLOWED_HOSTS=<your-service-name>.up.railway.app,localhost,127.0.0.1

# Database (auto-set when you add PostgreSQL service)
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### Step 2: Firebase Admin SDK (from Firebase Console → Project Settings → Service Accounts)

```bash
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=<from-firebase-console>
FIREBASE_PRIVATE_KEY_ID=<from-service-account-json>
FIREBASE_PRIVATE_KEY=<paste-full-key-with-\n-for-newlines>
FIREBASE_CLIENT_EMAIL=<firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com>
FIREBASE_CLIENT_ID=<from-service-account-json>
FIREBASE_CLIENT_X509_CERT_URL=<from-service-account-json>
```

### Step 3: Firebase Web Config (from Firebase Console → Project Settings → General)

```bash
FIREBASE_WEB_API_KEY=<web-api-key>
FIREBASE_WEB_AUTH_DOMAIN=<project-id>.firebaseapp.com
FIREBASE_WEB_PROJECT_ID=<project-id>
FIREBASE_WEB_STORAGE_BUCKET=<project-id>.appspot.com
FIREBASE_WEB_MESSAGING_SENDER_ID=<sender-id>
FIREBASE_WEB_APP_ID=1:<app-id>:web:<web-id>
```

### Step 4: Frontend URL (after deploying to Vercel)

```bash
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:3000
VERCEL_FRONTEND_URL=https://your-app.vercel.app
```

## How to Get Firebase Private Key

The private key needs special formatting for Railway:

1. Download service account JSON from Firebase Console
2. Open the file and find the `private_key` field
3. Copy the ENTIRE value including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
4. In Railway, paste it with literal `\n` for newlines:

```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BA...\n...\n-----END PRIVATE KEY-----\n"
```

**Important:** Use double quotes and literal backslash-n (`\n`), NOT actual newlines!

## Verification Commands

After setting variables, verify in Railway shell:

```bash
# SSH into Railway container
railway shell

# Check if variables are set
echo $SECRET_KEY
echo $DATABASE_URL
echo $FIREBASE_PROJECT_ID

# Test Django
python manage.py check
python manage.py showmigrations
```

## Common Mistakes

❌ **Wrong:** FIREBASE_PRIVATE_KEY with actual newlines (multiline)
✅ **Right:** FIREBASE_PRIVATE_KEY with `\n` characters in one line

❌ **Wrong:** Missing quotes around FIREBASE_PRIVATE_KEY
✅ **Right:** `FIREBASE_PRIVATE_KEY="-----BEGIN..."`

❌ **Wrong:** ALLOWED_HOSTS=your-app.railway.app (wrong TLD)
✅ **Right:** ALLOWED_HOSTS=your-app.up.railway.app

❌ **Wrong:** DEBUG=true (string)
✅ **Right:** DEBUG=False (case-sensitive for Python boolean)

## Need Help?

1. Run diagnostic locally: `python scripts/diagnose_deployment.py`
2. Check Railway logs: `railway logs --follow`
3. Review full guide: See `RAILWAY_DEPLOYMENT.md`
