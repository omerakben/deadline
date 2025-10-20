# 🚀 DEADLINE Deployment Checklist

> **Quick Reference Guide for Production Deployment**

## ✅ Pre-Deployment Status (October 20, 2025)

- [x] **Local Backend Server**: Running on http://127.0.0.1:8000
- [x] **Local Frontend Server**: Running on http://localhost:3001
- [x] **Database Migrations**: Completed successfully
- [x] **Dependencies**: All installed and working
- [x] **Environment Files**: Created (`.env` and `.env.local`)

---

## 📋 Deployment Steps

### Phase 1: Firebase Setup (15 minutes)

- [ ] Create/access Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
- [ ] Enable Authentication → Email/Password provider
- [ ] Generate Web App credentials (for frontend)
- [ ] Generate Service Account key (for backend)
- [ ] Configure authorized domains

**Output Needed**:
- Frontend: `NEXT_PUBLIC_FIREBASE_*` variables
- Backend: Service account JSON file

---

### Phase 2: Railway Backend Deployment (20 minutes)

#### Setup

- [ ] Install Railway CLI: `npm install -g @railway/cli`
- [ ] Login: `railway login`
- [ ] Initialize project: `railway init`
- [ ] Add PostgreSQL: `railway add --database postgresql`

#### Environment Variables

- [ ] Generate SECRET_KEY:
  ```bash
  python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
  ```
- [ ] Set required variables:
  ```bash
  railway variables set SECRET_KEY="<generated-key>"
  railway variables set DEBUG=False
  railway variables set DEMO_MODE=False
  ```
- [ ] Set Firebase credentials (extract from service account JSON):
  ```bash
  railway variables set FIREBASE_PROJECT_ID="..."
  railway variables set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
  railway variables set FIREBASE_CLIENT_EMAIL="..."
  railway variables set FIREBASE_CLIENT_ID="..."
  railway variables set FIREBASE_CLIENT_X509_CERT_URL="..."
  ```

#### Deploy

- [ ] Deploy: `railway up`
- [ ] View logs: `railway logs`
- [ ] Get URL: `railway open`
- [ ] Test API: `curl https://YOUR-URL.up.railway.app/api/v1/schema/`

**Output**: Railway backend URL (e.g., `https://deadline-api-production.up.railway.app`)

---

### Phase 3: Vercel Frontend Deployment (15 minutes)

#### Setup

- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login: `vercel login`
- [ ] Navigate to frontend: `cd capstone-client`

#### Environment Variables

- [ ] Set backend API URL:
  ```bash
  vercel env add NEXT_PUBLIC_API_BASE_URL production
  # Enter: https://YOUR-RAILWAY-URL.up.railway.app/api/v1
  ```
- [ ] Set Firebase credentials (from Phase 1):
  ```bash
  vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
  vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
  vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
  vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
  vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
  vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
  ```

#### Deploy

- [ ] Deploy: `vercel --prod`
- [ ] Get URL: `vercel inspect`
- [ ] Test: Open `https://YOUR-APP.vercel.app` in browser

**Output**: Vercel frontend URL (e.g., `https://deadline.vercel.app`)

---

### Phase 4: Connect Backend & Frontend (5 minutes)

#### Update Railway CORS

- [ ] Add Vercel URL to Railway:
  ```bash
  cd ../capstone-server
  railway variables set VERCEL_FRONTEND_URL="https://YOUR-APP.vercel.app"
  railway variables set CORS_ALLOWED_ORIGINS="https://YOUR-APP.vercel.app"
  ```
- [ ] Redeploy Railway: `railway up`

#### Update Firebase Authorized Domains

- [ ] Firebase Console → Authentication → Settings → Authorized domains
- [ ] Add domains:
  - `YOUR-APP.vercel.app`
  - `YOUR-RAILWAY-PROJECT.up.railway.app`

---

### Phase 5: Verification (10 minutes)

#### Backend Tests

- [ ] API schema: `curl https://YOUR-RAILWAY-URL/api/v1/schema/`
- [ ] Health check: `curl https://YOUR-RAILWAY-URL/api/v1/auth/demo/login/`
- [ ] Logs: `railway logs`

#### Frontend Tests

- [ ] Open homepage: `https://YOUR-APP.vercel.app`
- [ ] Test demo login: `https://YOUR-APP.vercel.app/login`
- [ ] Check browser console (no CORS errors)
- [ ] Verify Firebase authentication works

#### End-to-End Test

- [ ] Login with demo account
- [ ] Create workspace
- [ ] Create artifact
- [ ] Upload file
- [ ] Verify data persistence

---

## 🔧 Quick Fixes

### Backend Issues

**CORS Error:**
```bash
railway variables set CORS_ALLOWED_ORIGINS="https://your-app.vercel.app"
railway up
```

**Firebase Not Working:**
```bash
railway variables  # Check all FIREBASE_* vars are set
railway logs       # Check for Firebase initialization errors
```

**Database Error:**
```bash
railway run python3 manage.py migrate
```

### Frontend Issues

**Build Fails:**
```bash
npm run typecheck  # Fix TypeScript errors
npm run lint       # Fix linting errors
vercel logs        # Check build logs
```

**Environment Variables:**
```bash
vercel env ls                    # List all variables
vercel env pull .env.production  # Download to check
```

**Firebase Authentication:**
- Verify all `NEXT_PUBLIC_FIREBASE_*` values match Firebase Console
- Check Firebase Console → Authorized domains includes Vercel URL

---

## 📊 Environment Variables Reference

### Backend (Railway)

| Variable                        | Source        | Example                                |
| ------------------------------- | ------------- | -------------------------------------- |
| `SECRET_KEY`                    | Generated     | `django-insecure-abc123...`            |
| `DEBUG`                         | Manual        | `False`                                |
| `FIREBASE_PROJECT_ID`           | Firebase JSON | `deadline-capstone`                    |
| `FIREBASE_PRIVATE_KEY`          | Firebase JSON | `-----BEGIN PRIVATE KEY-----\n...\n`   |
| `FIREBASE_CLIENT_EMAIL`         | Firebase JSON | `firebase-adminsdk-xxx@...`            |
| `FIREBASE_CLIENT_ID`            | Firebase JSON | `123456789012345678901`                |
| `FIREBASE_CLIENT_X509_CERT_URL` | Firebase JSON | `https://www.googleapis.com/robot/...` |
| `CORS_ALLOWED_ORIGINS`          | Manual        | `https://your-app.vercel.app`          |
| `VERCEL_FRONTEND_URL`           | Manual        | `https://your-app.vercel.app`          |

### Frontend (Vercel)

| Variable                                   | Source           | Example                                      |
| ------------------------------------------ | ---------------- | -------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`                 | Railway URL      | `https://your-railway.up.railway.app/api/v1` |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | Firebase Console | `AIzaSyC...`                                 |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Firebase Console | `your-project.firebaseapp.com`               |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | Firebase Console | `your-project-id`                            |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | Firebase Console | `your-project.appspot.com`                   |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Console | `123456789012`                               |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | Firebase Console | `1:123456789012:web:abc123`                  |

---

## 🎯 Success Criteria

- [ ] Backend API accessible at Railway URL
- [ ] Frontend UI accessible at Vercel URL
- [ ] Demo login works end-to-end
- [ ] No CORS errors in browser console
- [ ] Database operations persist
- [ ] Firebase authentication functional
- [ ] No errors in Railway logs
- [ ] No errors in Vercel logs

---

## 📞 Support Resources

- **Documentation**: `COMPREHENSIVE_DEPLOYMENT_GUIDE.md`
- **Firebase Console**: https://console.firebase.google.com
- **Railway Dashboard**: https://railway.app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Issues**: https://github.com/omerakben/deadline/issues

---

## ⏱️ Estimated Total Time

- Firebase Setup: **15 minutes**
- Railway Backend: **20 minutes**
- Vercel Frontend: **15 minutes**
- Connection & CORS: **5 minutes**
- Verification: **10 minutes**

**Total**: ~65 minutes (1 hour)

---

**Created**: October 20, 2025
**Status**: ✅ Ready for deployment
