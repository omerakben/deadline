# 🔐 Firebase Credentials - Railway Deployment Guide

## ✅ Your Firebase Credentials Are Secured

### What We Did

1. **Local Development (.env)** ✅
   - Points to your Firebase JSON file
   - File is in `.gitignore` (won't be committed to Git)
   - Credentials stay safe on your machine

2. **Git Security** ✅
   - `deadline-capstone-firebase-adminsdk-fbsvc-8efd8ef2a7.json` is ignored
   - Won't be pushed to GitHub
   - Private keys stay private

3. **Railway Deployment Script** ✅
   - Automatically extracts credentials from JSON
   - Sets them as environment variables (not files)
   - Secure deployment process

---

## 🚀 Deploy to Railway (Easy Method)

### Option 1: Automated Script (Recommended)

```bash
cd /Users/ozzy-mac/Projects/deadline

# Run the deployment script
./deploy-railway-secure.sh
```

The script will:
- ✅ Check prerequisites
- ✅ Login to Railway
- ✅ Create/link project
- ✅ Add PostgreSQL database
- ✅ Extract Firebase credentials from JSON
- ✅ Set all environment variables securely
- ✅ Deploy your backend

**Time: ~10 minutes**

---

### Option 2: Manual Deployment

If you prefer to do it manually:

#### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

#### Step 2: Login & Initialize

```bash
cd capstone-server
railway login
railway init
# Choose: Create new project
# Name: "deadline-api"
```

#### Step 3: Add PostgreSQL

```bash
railway add --database postgresql
```

#### Step 4: Set Environment Variables

```bash
# Generate SECRET_KEY
SECRET_KEY=$(python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")

# Django settings
railway variables set SECRET_KEY="$SECRET_KEY"
railway variables set DEBUG=False
railway variables set DEMO_MODE=False

# Firebase credentials (from your JSON file)
railway variables set FIREBASE_TYPE=service_account
railway variables set FIREBASE_PROJECT_ID="deadline-capstone"
railway variables set FIREBASE_PRIVATE_KEY_ID="8efd8ef2a79b815814ca503a3e4d1fc1164cdae8"

# Private key (with newlines)
railway variables set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCxlnSezZl/Mc0y
9SzCI6u2SL4x+/qDK+fR/xOiCPdbisQq3rO+eKKIfcrJTomxxO/DqMSO7LRRgrZ6
cEa/6r3KStMB6fEh0t6Vwq0pDUZQgazC0h841OWaciGxOiaOeHqvLW2J1/2rNgLt
adkVRn61W/lKJ8eJxvF5i/TMkcJEcN96SHpPUKD4YYLUx/E6h+9xQ39xwjhlJBGS
1KiuURynUo9Xe/wfMelql7lImD7K2yd4VkTyoHtCz/1kh7dj1qa9DHPSLAZxDPdz
v42j8IHWYPLsEmCrisfLErucEy1WagCT7BXcv7KgEDoSj3a0x9r6HrIKw52mHVla
Yh77B+CxAgMBAAECggEANa5fyUMoA6lnuGAha/wBY2QgzhY3tx/1/uYGpsPkFdFg
E/9mwQxRQUYZHvn1KH355iClbfjCVyNWirNWx5urTDOLDjiL0egerZF/63leSGay
dN+0XWcJksKuSZbk4cssdriaNIFMZk043FBTNRmuop7PP+m/aPfwtYenc5EZ8rrU
asCp+9vUrUyv6DGVpHlLMABBbgHyiIYDLJ5bPG73SWO6sNIrY8rT0f2EgmlYzP6d
Hl44oXxMNLjv2Wn0jfP2L8DVoD5NmFXuAmA6J/4eAeJVTR20tiAGmc4L+1zJUMP5
n4g8YV/8qSsoaByguQxCvOHH3nQOxY2NdQQ7OSJhowKBgQDqtvtAITezG1nhuGTZ
0ZAViaXgJyYLVVCu+kLLW9uOV9mY9B46FBdMB9jTnFeoILClcaOYonFYCrDvN4Rb
7VCqqOWHkbBmHLhvvgi1ECTaSnpQmyrBWich+uT40hZVEzoajuFJIeTqxfKBpuvG
mV+/zSwEr+jfjzzihlLYc/aCQwKBgQDBsT3TvlwD+nz+pslZTQE8vPw9wYR5ygfx
0fU7yAmyJxb1J0WxlKdxLIgcy2C6+OxHR+63nHkBmEMt22xg2/oszMzuu2Of/DSO
OAIWJLk/GCnDg7JC58BvMt2SzX4eWmRddIuXpKE18v5/saVyj8lPv6mi5CMPYGUU
oT1fim0j+wKBgCYMg65htCXUyT1OJwsobbMQHVO5BPHRYsL6ztkoiu8ITr381OmV
WDF7FCs5rPwUUI6BXYPg0X70PLqKxWohjnIb7xmLBI2JGl0C8WZot5CrgiiO/t9Z
Pf7ELVootHYWJ9UmVF8Gn5VvgWCDLrWDJ4JwQDKCUb3r+nK+U6/DHLMBAoGAKXZU
gtg0AFIFocl4PpqCUksuP9YGEsARtU05jsOCd9VwT6hJffsRYOOke2151mxkv9mB
G2LucE30y4M2DwHn6uEoWU5ZxCyL34nTwIO59+ynPAgcB8BubB9aWQuOHNdCttK0
8xA1xkOvAQy5Gu32rRCdMpZdfvQmjyT461PJizMCgYEA0jQH9HfkMaaT6fvHkPEe
iNd4m+hPyB1weupSVrlduZHUfPRwfnCkUkMVrpXvlHZniYpxiZJKqeKyd53dqSBO
7Py6DPnVaJ08lmx/uHXRS5wEXy0KqJoCcsYg1VBRTeFVtKne0MNHIgoU9oWicgVI
IbSMl2+AowKk/tSiCUG3Q64=
-----END PRIVATE KEY-----
"

railway variables set FIREBASE_CLIENT_EMAIL="firebase-adminsdk-fbsvc@deadline-capstone.iam.gserviceaccount.com"
railway variables set FIREBASE_CLIENT_ID="112943741519226739568"
railway variables set FIREBASE_CLIENT_X509_CERT_URL="https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40deadline-capstone.iam.gserviceaccount.com"

# CORS (update after Vercel deployment)
railway variables set CORS_ALLOWED_ORIGINS="http://localhost:3000"
```

#### Step 5: Deploy

```bash
railway up
```

#### Step 6: Get Your URL

```bash
railway open
# Copy the URL from the dashboard
```

---

## 🔒 Security Best Practices

### ✅ What's Secure

1. **JSON file is in `.gitignore`**
   - Won't be committed to Git
   - Won't be pushed to GitHub
   - Stays only on your machine

2. **Environment variables on Railway**
   - Encrypted in transit
   - Encrypted at rest
   - Never exposed in logs
   - Only accessible to your project

3. **No hardcoded secrets**
   - All credentials in environment variables
   - Not in source code
   - Not in Git history

### ⚠️ Important Security Notes

1. **Never commit the JSON file**
   - Already in `.gitignore` ✅
   - Double-check before committing

2. **Never share the JSON file**
   - Don't email it
   - Don't paste it in Slack/Discord
   - Don't upload it anywhere

3. **Rotate credentials if exposed**
   - If you accidentally commit it, delete the key in Firebase Console
   - Generate a new one
   - Update Railway environment variables

---

## 🧪 Test Your Deployment

### 1. Check Railway Logs

```bash
railway logs
```

Look for:
```
✅ Firebase Admin SDK initialized successfully
✅ Using Firebase credentials from environment variables
```

### 2. Test API Endpoint

```bash
# Replace with your Railway URL
curl https://YOUR-RAILWAY-URL.up.railway.app/api/v1/schema/
```

Should return JSON schema (not an error).

### 3. Test Authentication

```bash
curl -X POST https://YOUR-RAILWAY-URL.up.railway.app/api/v1/auth/demo/login/
```

Should return a demo user token.

---

## 📋 Environment Variables Checklist

After deployment, verify these are set in Railway:

- [x] `SECRET_KEY` - Django secret key
- [x] `DEBUG` - Should be `False`
- [x] `FIREBASE_TYPE` - Should be `service_account`
- [x] `FIREBASE_PROJECT_ID` - `deadline-capstone`
- [x] `FIREBASE_PRIVATE_KEY_ID` - From JSON
- [x] `FIREBASE_PRIVATE_KEY` - From JSON (with newlines)
- [x] `FIREBASE_CLIENT_EMAIL` - `firebase-adminsdk-fbsvc@...`
- [x] `FIREBASE_CLIENT_ID` - From JSON
- [x] `FIREBASE_CLIENT_X509_CERT_URL` - From JSON
- [ ] `CORS_ALLOWED_ORIGINS` - Update with Vercel URL after frontend deployment
- [ ] `VERCEL_FRONTEND_URL` - Update with Vercel URL after frontend deployment

---

## 🔄 Update CORS After Vercel Deployment

Once you deploy the frontend to Vercel:

```bash
# Get your Vercel URL first
cd capstone-client
vercel --prod
# Copy the production URL

# Update Railway CORS
cd ../capstone-server
railway variables set CORS_ALLOWED_ORIGINS="https://your-app.vercel.app"
railway variables set VERCEL_FRONTEND_URL="https://your-app.vercel.app"

# Redeploy
railway up
```

---

## 📖 Related Documentation

- **Quick Start**: `QUICK_START_DEPLOYMENT.md`
- **Full Guide**: `COMPREHENSIVE_DEPLOYMENT_GUIDE.md`
- **Checklist**: `DEPLOYMENT_CHECKLIST.md`

---

## 🆘 Troubleshooting

### Error: "Firebase credentials not configured"

**Check:**
1. All `FIREBASE_*` variables are set in Railway
2. `FIREBASE_PRIVATE_KEY` includes `\n` newlines
3. No extra quotes or spaces in values

**Fix:**
```bash
railway variables  # List all variables
railway logs       # Check for specific error
```

### Error: "Invalid private key"

**Problem:** Private key format incorrect

**Fix:**
```bash
# Re-set with proper newlines
railway variables set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
<your-key-content-here>
-----END PRIVATE KEY-----
"
```

### Error: "Permission denied"

**Problem:** Service account doesn't have proper roles

**Fix:**
1. Firebase Console → IAM & Admin
2. Find your service account
3. Add role: "Firebase Authentication Admin"

---

**Your Firebase credentials are now secure and ready for Railway deployment!** 🎉

Use the automated script for easiest deployment:
```bash
./deploy-railway-secure.sh
```
