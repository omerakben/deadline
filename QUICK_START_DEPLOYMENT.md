# ⚡ Quick Start - Deploy DEADLINE in Under 1 Hour

> **Fast-track deployment guide** - Follow these steps to get DEADLINE live in production.

## Before You Start

**Time Required**: ~65 minutes
**Prerequisites**:
- Git repository access
- Credit card (for Railway/Vercel - free tiers available)
- Terminal access

---

## Step 1: Firebase Setup (15 min)

### A. Create Project

1. Go to https://console.firebase.google.com
2. Click "Add project" → Name it "deadline-capstone"
3. Disable Google Analytics (optional) → Create

### B. Enable Authentication

1. Build → Authentication → Get Started
2. Sign-in method → Enable "Email/Password"
3. (Optional) Enable "Google"

### C. Get Frontend Credentials

1. Project Settings (⚙️) → General
2. Your apps → Click Web icon (</>)
3. App nickname: "DEADLINE Web" → Register app
4. Copy the `firebaseConfig` values:
   ```javascript
   apiKey: "AIzaSy..."
   authDomain: "deadline-capstone.firebaseapp.com"
   projectId: "deadline-capstone"
   storageBucket: "deadline-capstone.appspot.com"
   messagingSenderId: "123456789012"
   appId: "1:123456789012:web:abc123"
   ```
5. **Save these** - you'll need them for Vercel

### D. Get Backend Credentials

1. Project Settings (⚙️) → Service Accounts
2. Generate New Private Key → Download JSON
3. **Save this file** - you'll need it for Railway

✅ **Checkpoint**: You should have a `serviceAccountKey.json` file and frontend config values

---

## Step 2: Railway Backend (20 min)

### A. Install CLI & Login

```bash
npm install -g @railway/cli
railway login
```

### B. Create Project

```bash
cd capstone-server
railway init
# Choose: Create new project
# Name: "deadline-api"
```

### C. Add Database

```bash
railway add --database postgresql
# Railway automatically configures DATABASE_URL
```

### D. Set Environment Variables

```bash
# 1. Generate SECRET_KEY
SECRET_KEY=$(python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")

# 2. Set Django variables
railway variables set SECRET_KEY="$SECRET_KEY"
railway variables set DEBUG=False
railway variables set DEMO_MODE=False

# 3. Set Firebase variables from the JSON file you downloaded
# Open serviceAccountKey.json and extract these values:

railway variables set FIREBASE_PROJECT_ID="deadline-capstone"

railway variables set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----
"
# ⚠️ Include the BEGIN/END lines and actual newlines

railway variables set FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxx@deadline-capstone.iam.gserviceaccount.com"

railway variables set FIREBASE_CLIENT_ID="123456789012345678901"

railway variables set FIREBASE_CLIENT_X509_CERT_URL="https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxx%40deadline-capstone.iam.gserviceaccount.com"
```

### E. Deploy

```bash
railway up
```

Wait 2-3 minutes for deployment...

### F. Get Your Railway URL

```bash
railway open
# Copy the URL (e.g., https://deadline-api-production.up.railway.app)
```

### G. Test It

```bash
curl https://YOUR-RAILWAY-URL.up.railway.app/api/v1/schema/
# Should return JSON schema
```

✅ **Checkpoint**: Backend is live at Railway URL

---

## Step 3: Vercel Frontend (15 min)

### A. Install CLI & Login

```bash
npm install -g vercel
vercel login
```

### B. Deploy Initial Version

```bash
cd capstone-client
vercel
# Follow prompts:
# - Set up and deploy? Y
# - Which scope? [Your account]
# - Link to existing project? N
# - Project name? deadline
# - Directory? ./
# - Override settings? N
```

This creates a preview deployment.

### C. Set Environment Variables

```bash
# 1. Set backend API URL (use your Railway URL from Step 2F)
vercel env add NEXT_PUBLIC_API_BASE_URL production
# Enter: https://YOUR-RAILWAY-URL.up.railway.app/api/v1

# 2. Set Firebase credentials (from Step 1C)
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
# Enter: AIzaSy...

vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
# Enter: deadline-capstone.firebaseapp.com

vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
# Enter: deadline-capstone

vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
# Enter: deadline-capstone.appspot.com

vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
# Enter: 123456789012

vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
# Enter: 1:123456789012:web:abc123
```

### D. Deploy to Production

```bash
vercel --prod
```

Wait 1-2 minutes...

### E. Get Your Vercel URL

```bash
vercel inspect
# Copy production URL (e.g., https://deadline.vercel.app)
```

✅ **Checkpoint**: Frontend is live at Vercel URL

---

## Step 4: Connect Backend & Frontend (5 min)

### A. Update Railway CORS

```bash
cd ../capstone-server

# Add your Vercel URL to allowed origins
railway variables set CORS_ALLOWED_ORIGINS="https://YOUR-VERCEL-URL.vercel.app"
railway variables set VERCEL_FRONTEND_URL="https://YOUR-VERCEL-URL.vercel.app"

# Redeploy
railway up
```

### B. Update Firebase Authorized Domains

1. Firebase Console → Authentication → Settings
2. Authorized domains → Add domain
3. Add: `YOUR-VERCEL-URL.vercel.app`
4. Add: `YOUR-RAILWAY-URL.up.railway.app` (if needed)

✅ **Checkpoint**: Backend and frontend are connected

---

## Step 5: Verify Deployment (10 min)

### A. Test Backend

```bash
# Health check
curl https://YOUR-RAILWAY-URL.up.railway.app/api/v1/schema/

# Check logs
railway logs
```

### B. Test Frontend

1. Open `https://YOUR-VERCEL-URL.vercel.app` in browser
2. Go to `/login`
3. Click "Launch Demo" or sign in
4. Verify you can access dashboard

### C. Test End-to-End

1. Login with demo account
2. Create a workspace
3. Create an artifact
4. Upload a file
5. Refresh page - verify data persists

### D. Check for Errors

**Browser Console**:
- Open Developer Tools (F12)
- Check Console tab - should be no CORS errors
- Check Network tab - API calls should return 200 OK

**Railway Logs**:
```bash
railway logs
# Look for errors
```

**Vercel Logs**:
- Go to Vercel Dashboard → Your Project → Deployments
- Click latest deployment → View Function Logs
- Should show no errors

✅ **Success!** Your app is deployed and running!

---

## 🎉 You're Done!

### Your Live URLs

- **Frontend**: `https://YOUR-APP.vercel.app`
- **Backend**: `https://YOUR-API.up.railway.app`
- **Admin**: `https://YOUR-API.up.railway.app/admin/`
- **API Docs**: `https://YOUR-API.up.railway.app/api/schema/`

### Share These URLs

```
Frontend: https://deadline.vercel.app
API: https://deadline-api.up.railway.app/api/v1/
```

---

## Next Steps (Optional)

### 1. Create Admin User

```bash
railway run python3 manage.py createsuperuser
# Then access: https://YOUR-API.up.railway.app/admin/
```

### 2. Set Up Custom Domain

**Vercel**:
1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `deadline.yourdomain.com`)
3. Update DNS records as shown

**Railway**:
1. Railway Dashboard → Your Project → Settings → Domains
2. Add custom domain
3. Update DNS records

### 3. Enable GitHub Actions CI/CD

1. Follow `GITHUB_SECRETS_SETUP.md`
2. Add secrets to GitHub repository
3. Push to `main` → Auto-deploy!

---

## Troubleshooting

### ❌ "CORS policy error"

**Fix**:
```bash
railway variables set CORS_ALLOWED_ORIGINS="https://your-vercel-url.vercel.app"
railway up
```

### ❌ "Firebase authentication failed"

**Fix**:
1. Check all `NEXT_PUBLIC_FIREBASE_*` variables are set correctly
2. Verify Vercel URL is in Firebase authorized domains
3. Check Firebase Console → Authentication is enabled

### ❌ "Failed to fetch API"

**Fix**:
1. Check `NEXT_PUBLIC_API_BASE_URL` ends with `/api/v1`
2. Verify Railway backend is running: `railway logs`
3. Test API directly: `curl https://YOUR-API-URL/api/v1/schema/`

### ❌ Build fails

**Backend**:
```bash
railway logs  # Check error
railway run python3 manage.py check
```

**Frontend**:
```bash
vercel logs  # Check build logs
# Fix TypeScript/lint errors locally first
npm run typecheck
npm run lint
```

---

## Getting Help

- 📘 Full Guide: `COMPREHENSIVE_DEPLOYMENT_GUIDE.md`
- ✅ Checklist: `DEPLOYMENT_CHECKLIST.md`
- 🔐 CI/CD Setup: `GITHUB_SECRETS_SETUP.md`
- 🐛 Issues: https://github.com/omerakben/deadline/issues

---

## What You Learned

✅ Deploy Django to Railway
✅ Deploy Next.js to Vercel
✅ Configure Firebase Authentication
✅ Set up PostgreSQL database
✅ Configure CORS & environment variables
✅ Test production deployment

---

**Deployment Time**: ~65 minutes
**Cost**: $0 (free tiers)
**Status**: ✅ Production Ready
