# DEADLINE Deployment Guide

This guide covers deploying DEADLINE to Railway (backend) and Vercel (frontend) from GitHub.

## Prerequisites

1. **GitHub Repository**: Push your code to a GitHub repository
2. **Firebase Project**: Set up Firebase Authentication and obtain credentials
3. **Railway Account**: Sign up at [railway.app](https://railway.app)
4. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)

## Backend Deployment (Railway)

### Step 1: Create Railway Project

1. Go to [railway.app/new](https://railway.app/new)
2. Click **"Deploy from GitHub repo"**
3. Select your DEADLINE repository
4. Railway will detect the Django project automatically

### Step 2: Add PostgreSQL Database

1. In your Railway project, click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway automatically sets `DATABASE_URL` environment variable

### Step 3: Configure Environment Variables

In Railway project settings, add these environment variables:

```bash
# Django Settings
SECRET_KEY=<generate-strong-random-key>
DEBUG=False
ALLOWED_HOSTS=${{RAILWAY_PUBLIC_DOMAIN}},localhost,127.0.0.1

# Demo Mode (optional - set to True for public demo)
DEMO_MODE=False

# Firebase Service Account (use one of these methods)

# Method 1: Individual environment variables (recommended)
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id

# Method 2: Create /tmp/firebase-credentials.json via Railway init script (alternative)
# Upload your serviceAccountKey.json content as FIREBASE_CREDENTIALS_JSON
# Then use Railway's init command to write it to /tmp/firebase-credentials.json

# CORS Settings (add after deploying frontend)
VERCEL_FRONTEND_URL=https://your-frontend.vercel.app
```

### Step 4: Generate SECRET_KEY

Run this in your local terminal:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Step 5: Deploy

1. Railway automatically deploys on git push
2. Your API will be available at: `https://your-project.up.railway.app/api/v1/`
3. Check logs for any errors
4. Run migrations (Railway does this automatically via start command)

### Step 6: Verify Deployment

Test your API:
```bash
curl https://your-project.up.railway.app/api/v1/schema/
```

## Frontend Deployment (Vercel)

### Step 1: Import Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your DEADLINE repository
4. Vercel auto-detects Next.js configuration

### Step 2: Configure Project

1. **Root Directory**: Set to `capstone-client`
2. **Framework Preset**: Next.js (auto-detected)
3. **Build Command**: `npm run build`
4. **Output Directory**: `.next` (default)

### Step 3: Configure Environment Variables

Add these environment variables in Vercel project settings:

```bash
# Backend API URL (use your Railway URL)
NEXT_PUBLIC_API_BASE_URL=https://your-project.up.railway.app/api/v1

# Firebase Web Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Vercel builds and deploys automatically
3. Your app will be available at: `https://your-project.vercel.app`

### Step 5: Update Backend CORS

Go back to Railway and update `VERCEL_FRONTEND_URL`:
```bash
VERCEL_FRONTEND_URL=https://your-project.vercel.app
```

Redeploy the Railway backend for CORS changes to take effect.

## Firebase Setup

### Backend (Service Account)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → **Project Settings** → **Service Accounts**
3. Click **"Generate New Private Key"**
4. Save the JSON file securely
5. Use the values from this JSON for Railway environment variables

### Frontend (Web Config)

1. Firebase Console → **Project Settings** → **General**
2. Scroll to **"Your apps"** → **Web app**
3. Copy the config values to Vercel environment variables

### Enable Authentication Providers

1. Firebase Console → **Authentication** → **Sign-in method**
2. Enable **Email/Password** and **Google** providers
3. Add authorized domains:
   - `localhost` (for development)
   - `your-project.vercel.app` (your Vercel domain)

## Post-Deployment

### 1. Test Authentication Flow

- Visit your Vercel URL
- Try signing up with email/password
- Test Google sign-in
- Test demo mode (if enabled)

### 2. Create Admin User (Optional)

SSH into Railway container or use Railway CLI:
```bash
railway run python manage.py createsuperuser
```

### 3. Seed Demo Data (Optional)

```bash
railway run python manage.py seed_demo_data
railway run python manage.py populate_demo_workspace
```

### 4. Monitor Logs

- **Railway**: Dashboard → Deployments → Logs
- **Vercel**: Dashboard → Deployments → Function Logs

## Environment Variables Summary

### Railway (Backend)

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | Yes | Django secret key (generate randomly) |
| `DEBUG` | Yes | Set to `False` in production |
| `ALLOWED_HOSTS` | Yes | Use `${{RAILWAY_PUBLIC_DOMAIN}}` |
| `DATABASE_URL` | Auto | Provided by Railway PostgreSQL |
| `DEMO_MODE` | No | Set to `True` for public demo |
| `FIREBASE_*` | Yes | Firebase service account credentials |
| `VERCEL_FRONTEND_URL` | Yes | Your Vercel frontend URL for CORS |

### Vercel (Frontend)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Your Railway backend URL + `/api/v1` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | Firebase app ID |

## Continuous Deployment

Both Railway and Vercel support automatic deployments:

- **Main Branch**: Deploys to production automatically
- **Other Branches**: Create preview deployments (Vercel does this automatically)
- **Pull Requests**: Generate preview URLs for testing

## Troubleshooting

### Backend Issues

1. **Migrations failing**: Check Railway logs, ensure DATABASE_URL is set
2. **Firebase auth failing**: Verify all FIREBASE_* env vars are correctly set
3. **CORS errors**: Ensure VERCEL_FRONTEND_URL is set and matches your Vercel domain
4. **Static files 404**: Railway runs `collectstatic` in build command automatically

### Frontend Issues

1. **Firebase initialization error**: Check that all NEXT_PUBLIC_FIREBASE_* variables are set
2. **API requests failing**: Verify NEXT_PUBLIC_API_BASE_URL points to Railway URL
3. **Build failing**: Run `npm run build` locally to catch errors early
4. **Auth not working**: Ensure Railway backend has correct CORS settings

### Common Fixes

```bash
# Railway: View logs
railway logs

# Railway: Run Django management commands
railway run python manage.py migrate
railway run python manage.py check --deploy

# Vercel: Check build logs in dashboard
# Vercel: Redeploy from dashboard
```

## Security Checklist

- [ ] `DEBUG=False` in production
- [ ] Strong `SECRET_KEY` generated and set
- [ ] `ALLOWED_HOSTS` properly configured
- [ ] All Firebase credentials secured in environment variables
- [ ] HTTPS enabled (automatic on Railway and Vercel)
- [ ] CORS properly configured with specific domains
- [ ] PostgreSQL database secured (Railway handles this)
- [ ] No secrets committed to Git repository

## Monitoring

- **Railway**: Built-in metrics and logs in dashboard
- **Vercel**: Analytics and Web Vitals available in dashboard
- **Firebase**: Authentication metrics in Firebase Console

## Cost Estimates

- **Railway**: $5/month (Hobby plan) + database costs
- **Vercel**: Free for personal projects, $20/month Pro if needed
- **Firebase**: Free tier is generous (50K reads/day, 20K writes/day)

## Next Steps

1. Set up custom domain on Vercel (optional)
2. Configure Railway custom domain (optional)
3. Set up monitoring/alerting
4. Enable Firebase App Check for additional security
5. Configure backup strategy for PostgreSQL database

---

**Need Help?**
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Firebase Docs: https://firebase.google.com/docs
