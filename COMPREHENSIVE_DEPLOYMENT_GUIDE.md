# 🚀 DEADLINE - Comprehensive Deployment Guide

> **Last Updated**: October 20, 2025
> **Status**: ✅ Both servers tested and running locally

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Local Development Setup](#local-development-setup)
3. [Environment Configuration](#environment-configuration)
4. [Railway Backend Deployment](#railway-backend-deployment)
5. [Vercel Frontend Deployment](#vercel-frontend-deployment)
6. [Firebase Setup](#firebase-setup)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Post-Deployment Verification](#post-deployment-verification)
9. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### ✅ Verified Local Setup

- [x] **Backend Server**: Running on `http://127.0.0.1:8000`
- [x] **Frontend Server**: Running on `http://localhost:3001`
- [x] **Database**: SQLite (development) → PostgreSQL (production)
- [x] **Dependencies Installed**:
  - Backend: Django 5.1.2, DRF, Firebase Admin SDK
  - Frontend: Next.js 15.5.2, React 19, Firebase 12.1.0

### 🔧 Project Structure

```
deadline/
├── capstone-client/          # Next.js Frontend (Deploy to Vercel)
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── next.config.ts
│   ├── vercel.json           # Vercel deployment config
│   └── .env.local            # Local environment variables
│
├── capstone-server/          # Django Backend (Deploy to Railway)
│   ├── deadline_api/
│   ├── workspaces/
│   ├── artifacts/
│   ├── auth_firebase/
│   ├── manage.py
│   ├── requirements.txt
│   ├── Procfile              # Railway start command
│   ├── railway.json          # Railway config
│   └── .env                  # Local environment variables
│
├── deploy-railway.sh         # Railway deployment script
├── deploy-vercel.sh          # Vercel deployment script
└── railway.json              # Root Railway config
```

---

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/omerakben/deadline.git
cd deadline
```

### 2. Backend Setup

```bash
cd capstone-server

# Install Python dependencies
pip install -r requirements.txt

# Create .env file (see section below)
cp .env.example .env

# Generate SECRET_KEY
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
# Add the output to .env as SECRET_KEY

# Run migrations
python3 manage.py migrate

# Create demo data (optional)
python3 manage.py populate_demo_workspace

# Start server
python3 manage.py runserver 8000
```

**Server running at**: `http://127.0.0.1:8000`

### 3. Frontend Setup

```bash
cd capstone-client

# Install Node.js dependencies
npm ci

# Create .env.local file (see section below)
cp .env.local.example .env.local

# Start development server
npm run dev
```

**Server running at**: `http://localhost:3000` (or next available port)

---

## Environment Configuration

### Backend (.env)

Create `capstone-server/.env`:

```bash
# ============================================
# DEADLINE API - Environment Variables
# ============================================

# Django Configuration
# --------------------
SECRET_KEY=<generate-with-command-above>
DEBUG=True  # Set to False in production
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (Auto-configured by Railway in production)
# DATABASE_URL will be set by Railway PostgreSQL

# CORS Configuration
# ------------------
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Firebase Admin SDK (Backend Authentication)
# --------------------------------------------
# Option 1: File path (recommended for local dev)
FIREBASE_CREDENTIALS_FILE=/absolute/path/to/firebase-adminsdk.json

# Option 2: Environment variables (recommended for production)
# Get these from Firebase Console → Service Accounts → Generate Private Key
# FIREBASE_TYPE=service_account
# FIREBASE_PROJECT_ID=your-project-id
# FIREBASE_PRIVATE_KEY_ID=your-private-key-id
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
# FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
# FIREBASE_CLIENT_ID=your-client-id
# FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...

# Demo Mode (Optional)
# --------------------
DEMO_MODE=True  # Set to False in production for real authentication
```

### Frontend (.env.local)

Create `capstone-client/.env.local`:

```bash
# ============================================
# DEADLINE Client - Environment Variables
# ============================================

# API Configuration
# -----------------
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# Firebase Web SDK (Frontend Authentication)
# -------------------------------------------
# Get these from Firebase Console → Project Settings → General → Your apps → Web app
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX  # Optional
```

---

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"** or select existing project
3. Follow setup wizard

### 2. Enable Authentication

1. Firebase Console → **Authentication** → **Sign-in method**
2. Enable providers:
   - ✅ **Email/Password**
   - ✅ **Google** (optional)

### 3. Get Frontend Credentials (Web App)

```bash
# Firebase Console → Project Settings → General → Your apps

# If no web app exists:
1. Click </> (Web) icon
2. Register app (nickname: "DEADLINE Web")
3. Copy firebaseConfig values

# Add to capstone-client/.env.local
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 4. Get Backend Credentials (Service Account)

```bash
# Firebase Console → Project Settings → Service Accounts
1. Click "Generate New Private Key"
2. Download JSON file
3. Save as capstone-server/firebase-credentials.json

# For local dev:
FIREBASE_CREDENTIALS_FILE=/path/to/firebase-credentials.json

# For Railway production (extract values from JSON):
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=...
```

### 5. Configure Authorized Domains

```bash
# Firebase Console → Authentication → Settings → Authorized domains
# Add these domains:

localhost                          # Local development
your-app.vercel.app               # Vercel frontend
your-project.up.railway.app       # Railway backend (if needed)
```

---

## Railway Backend Deployment

### Method 1: Using Railway CLI (Recommended)

#### A. Install Railway CLI

```bash
# macOS
brew install railway

# npm
npm install -g @railway/cli

# Verify installation
railway --version
```

#### B. Login and Initialize

```bash
cd capstone-server

# Login to Railway
railway login

# Link to existing project or create new
railway init
# Select: "Create new project"
# Name: "deadline-api" (or your preferred name)
```

#### C. Add PostgreSQL Database

```bash
# Add PostgreSQL addon
railway add --database postgresql

# Railway automatically sets DATABASE_URL
```

#### D. Set Environment Variables

```bash
# Generate SECRET_KEY
SECRET_KEY=$(python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")

# Set required variables
railway variables set SECRET_KEY="$SECRET_KEY"
railway variables set DEBUG=False
railway variables set DEMO_MODE=False

# Firebase credentials (extract from serviceAccountKey.json)
railway variables set FIREBASE_PROJECT_ID="your-project-id"
railway variables set FIREBASE_PRIVATE_KEY_ID="your-private-key-id"
railway variables set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
Your-Multi-Line-Key-Here
-----END PRIVATE KEY-----
"
railway variables set FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com"
railway variables set FIREBASE_CLIENT_ID="your-client-id"
railway variables set FIREBASE_CLIENT_X509_CERT_URL="https://www.googleapis.com/robot/v1/metadata/x509/..."

# Note: Add VERCEL_FRONTEND_URL after deploying frontend
```

#### E. Deploy

```bash
# Deploy to Railway
railway up

# View logs
railway logs

# Open in browser
railway open
```

#### F. Get Backend URL

```bash
# Get your Railway URL
railway open
# Copy the URL (e.g., https://deadline-api-production.up.railway.app)

# Test API
curl https://your-railway-url.up.railway.app/api/v1/schema/
```

### Method 2: Using Railway Web Dashboard

1. Go to [railway.app/new](https://railway.app/new)
2. **Deploy from GitHub repo** → Select `deadline` repository
3. **Root Directory**: Keep default (Railway will find `railway.json`)
4. **Add PostgreSQL**: Click **+ New** → **Database** → **PostgreSQL**
5. **Environment Variables**: Add all variables from section D above
6. **Deploy**: Railway auto-deploys on git push
7. **Get URL**: Settings → Domains → Generate Domain

### Using Deployment Script

```bash
# From project root
./deploy-railway.sh

# Follow prompts to set Firebase credentials
```

---

## Vercel Frontend Deployment

### Method 1: Using Vercel CLI (Recommended)

#### A. Install Vercel CLI

```bash
# npm
npm install -g vercel

# Verify installation
vercel --version
```

#### B. Login and Deploy

```bash
cd capstone-client

# Login to Vercel
vercel login

# Deploy (first time)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? deadline (or your preferred name)
# - Directory? ./ (current directory)
# - Override settings? No

# This deploys to preview URL
```

#### C. Set Environment Variables

```bash
# Get your Railway backend URL from previous step
RAILWAY_URL="https://your-railway-url.up.railway.app"

# Set backend API URL
vercel env add NEXT_PUBLIC_API_BASE_URL production
# Enter: https://your-railway-url.up.railway.app/api/v1

# Set Firebase credentials (one by one)
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
# Enter value from Firebase Console

vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
```

#### D. Deploy to Production

```bash
# Deploy with environment variables
vercel --prod

# Get URL
vercel inspect
# Copy production URL (e.g., https://deadline.vercel.app)
```

#### E. Update Railway CORS

```bash
cd ../capstone-server

# Add Vercel URL to Railway
railway variables set VERCEL_FRONTEND_URL="https://your-app.vercel.app"

# Or update CORS_ALLOWED_ORIGINS
railway variables set CORS_ALLOWED_ORIGINS="https://your-app.vercel.app,http://localhost:3000"

# Redeploy Railway
railway up
```

### Method 2: Using Vercel Web Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. **Import Git Repository** → Select `deadline` repository
3. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `capstone-client`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
4. **Environment Variables**: Add all from section C above
5. **Deploy**: Click "Deploy"
6. **Get URL**: View deployment → Copy production URL

### Using Deployment Script

```bash
# From project root
./deploy-vercel.sh

# Enter Railway backend URL when prompted
# Set Firebase environment variables when prompted
```

---

## CI/CD Pipeline

### GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Railway and Vercel

on:
  push:
    branches:
      - main
      - develop

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Railway CLI
        run: npm install -g @railway/cli

      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          cd capstone-server
          railway up --service backend

  deploy-frontend:
    runs-on: ubuntu-latest
    needs: deploy-backend
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
        run: |
          npm install -g vercel
          cd capstone-client
          vercel --prod --token=$VERCEL_TOKEN
```

#### Setup Secrets

```bash
# GitHub Repository → Settings → Secrets → Actions

# Railway
RAILWAY_TOKEN=<get-from-railway-account>

# Vercel
VERCEL_TOKEN=<get-from-vercel-account-settings>
VERCEL_ORG_ID=<get-from-vercel-cli: vercel whoami>
VERCEL_PROJECT_ID=<get-from-vercel-project-settings>
```

### Automated Deployment Flow

1. **Push to GitHub** → Triggers GitHub Actions
2. **Backend deploys to Railway** → Runs migrations, starts server
3. **Frontend deploys to Vercel** → Builds and deploys to CDN
4. **Notifications** → Success/failure via email or Slack

---

## Post-Deployment Verification

### 1. Backend Health Check

```bash
# Test API schema endpoint
curl https://your-railway-url.up.railway.app/api/v1/schema/

# Test authentication
curl -X POST https://your-railway-url.up.railway.app/api/v1/auth/demo/login/

# Check admin (if superuser created)
open https://your-railway-url.up.railway.app/admin/
```

### 2. Frontend Health Check

```bash
# Open in browser
open https://your-app.vercel.app

# Test demo login
open https://your-app.vercel.app/login

# Check API connection (browser console should show no CORS errors)
```

### 3. Database Verification

```bash
# Railway CLI
railway run python3 manage.py shell

# Check models
>>> from workspaces.models import Workspace
>>> Workspace.objects.count()
>>> exit()
```

### 4. Monitoring

#### Railway Logs

```bash
railway logs --service backend
```

#### Vercel Logs

```bash
vercel logs
# Or view in Vercel Dashboard → Project → Deployments → View Function Logs
```

---

## Troubleshooting

### Common Issues

#### 🔴 **Backend: "SECRET_KEY not found"**

```bash
# Railway dashboard → Environment Variables → Add SECRET_KEY
railway variables set SECRET_KEY="$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')"
```

#### 🔴 **Backend: "Firebase credentials not configured"**

```bash
# Check Firebase variables are set correctly
railway variables

# Verify FIREBASE_PRIVATE_KEY has proper newlines (\n)
# Should look like: "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

#### 🔴 **Frontend: "Failed to fetch" or CORS errors**

```bash
# Update Railway CORS settings
railway variables set CORS_ALLOWED_ORIGINS="https://your-app.vercel.app"

# Or update .env:
VERCEL_FRONTEND_URL=https://your-app.vercel.app

# Redeploy
railway up
```

#### 🔴 **Frontend: "Firebase API key invalid"**

```bash
# Verify all NEXT_PUBLIC_FIREBASE_* variables are set
vercel env ls

# Check Firebase Console → Project Settings → Web app config
# Make sure values match exactly (no extra quotes or spaces)
```

#### 🔴 **Database: "relation does not exist"**

```bash
# Run migrations
railway run python3 manage.py migrate

# Or add to Procfile (already configured):
# web: python3 manage.py migrate --noinput && gunicorn ...
```

#### 🔴 **Build fails on Vercel**

```bash
# Check build logs in Vercel Dashboard
# Common fixes:

# 1. Node version mismatch
# Add to package.json:
"engines": {
  "node": ">=18.0.0"
}

# 2. TypeScript errors
npm run typecheck  # Fix any TS errors

# 3. Missing environment variables
vercel env pull  # Check .env.local
```

### Debug Commands

```bash
# Railway
railway logs --service backend
railway run python3 manage.py check
railway run python3 manage.py showmigrations

# Vercel
vercel logs
vercel env pull
vercel inspect
```

---

## Environment Variables Summary

### Railway (Backend)

| Variable                        | Required | Example                                                         |
| ------------------------------- | -------- | --------------------------------------------------------------- |
| `SECRET_KEY`                    | ✅ Yes    | `django-insecure-abc123...`                                     |
| `DEBUG`                         | ✅ Yes    | `False`                                                         |
| `ALLOWED_HOSTS`                 | No       | Auto-configured                                                 |
| `DATABASE_URL`                  | Auto     | Provided by Railway PostgreSQL                                  |
| `FIREBASE_PROJECT_ID`           | ✅ Yes    | `deadline-capstone`                                             |
| `FIREBASE_PRIVATE_KEY`          | ✅ Yes    | `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n` |
| `FIREBASE_CLIENT_EMAIL`         | ✅ Yes    | `firebase-adminsdk-xxx@...`                                     |
| `FIREBASE_CLIENT_ID`            | ✅ Yes    | `123456789012345678901`                                         |
| `FIREBASE_CLIENT_X509_CERT_URL` | ✅ Yes    | `https://www.googleapis.com/robot/...`                          |
| `CORS_ALLOWED_ORIGINS`          | No       | `https://your-app.vercel.app`                                   |
| `VERCEL_FRONTEND_URL`           | No       | `https://your-app.vercel.app`                                   |
| `DEMO_MODE`                     | No       | `False`                                                         |

### Vercel (Frontend)

| Variable                                   | Required | Example                                      |
| ------------------------------------------ | -------- | -------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`                 | ✅ Yes    | `https://your-railway.up.railway.app/api/v1` |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | ✅ Yes    | `AIzaSyC...`                                 |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | ✅ Yes    | `your-project.firebaseapp.com`               |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | ✅ Yes    | `your-project-id`                            |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | ✅ Yes    | `your-project.appspot.com`                   |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅ Yes    | `123456789012`                               |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | ✅ Yes    | `1:123456789012:web:abc123`                  |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`      | No       | `G-XXXXXXXXXX`                               |

---

## Quick Reference

### Local Development

```bash
# Backend
cd capstone-server
python3 manage.py runserver 8000

# Frontend
cd capstone-client
npm run dev

# Access
Backend:  http://localhost:8000/api/v1/
Frontend: http://localhost:3000
Admin:    http://localhost:8000/admin/
API Docs: http://localhost:8000/api/schema/
```

### Deploy Commands

```bash
# Railway (from capstone-server/)
railway up
railway logs

# Vercel (from capstone-client/)
vercel --prod
vercel logs

# Or use scripts (from project root)
./deploy-railway.sh
./deploy-vercel.sh
```

### Useful Commands

```bash
# Generate SECRET_KEY
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Check Django config
python3 manage.py check

# Create superuser
python3 manage.py createsuperuser

# Run migrations
python3 manage.py migrate

# Collect static files
python3 manage.py collectstatic --noinput

# Populate demo data
python3 manage.py populate_demo_workspace

# Frontend build
npm run build
npm run lint
npm run typecheck
```

---

## Support

- **Documentation**: See `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/omerakben/deadline/issues)
- **Firebase**: [Firebase Console](https://console.firebase.google.com)
- **Railway**: [Railway Dashboard](https://railway.app)
- **Vercel**: [Vercel Dashboard](https://vercel.com/dashboard)

---

## License

This project is licensed under the MIT License.

---

**Last Verified**: October 20, 2025
**Backend Status**: ✅ Running on http://127.0.0.1:8000
**Frontend Status**: ✅ Running on http://localhost:3001
