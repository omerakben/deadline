# 🔥 Firebase Configuration Guide

This guide will help you set up Firebase authentication for the DEADLINE application.

## 📋 Prerequisites

- A Google/Gmail account
- Access to [Firebase Console](https://console.firebase.google.com/)

## 🎯 Step-by-Step Setup

### 1. Create or Select Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Enter project name (e.g., "deadline-dev" or "deadline-prod")
4. Disable Google Analytics (optional for this project)
5. Click **"Create project"**

### 2. Enable Authentication Methods

1. In Firebase Console, click **"Authentication"** in the left sidebar
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable the following providers:
   - ✅ **Email/Password** - Click, toggle "Enable", click "Save"
   - ✅ **Google** - Click, toggle "Enable", add support email, click "Save"

### 3. Get Web App Credentials (Frontend)

These credentials are needed for `capstone-client/.env.local`

1. Go to **Project Settings** (gear icon ⚙️ in left sidebar)
2. Scroll down to **"Your apps"** section
3. If you don't see a web app:
   - Click **"Add app"** button
   - Select **Web** (</> icon)
   - Enter app nickname (e.g., "deadline-web")
   - Don't check "Firebase Hosting"
   - Click **"Register app"**
4. You'll see a config object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

5. Copy these values to `capstone-client/.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Get Service Account Credentials (Backend)

These credentials are needed for `capstone-server/.env`

#### Option A: Local Development (Credentials File)

1. Go to **Project Settings** → **Service Accounts** tab
2. Click **"Generate new private key"** button
3. Confirm and download the JSON file
4. Save it securely (e.g., `capstone-server/firebase-credentials.json`)
5. **⚠️ NEVER commit this file to Git!** (already in `.gitignore`)
6. Add to `capstone-server/.env`:

```bash
FIREBASE_CREDENTIALS_FILE=/absolute/path/to/firebase-credentials.json
SECRET_KEY=your-django-secret-key-here
DEBUG=True
```

#### Option B: Production Deployment (Environment Variables)

1. Download the JSON file (same as Option A)
2. Open the file and extract values
3. Set these environment variables in Railway/Vercel:

```bash
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=abc123def456...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789012345678901
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...

# Also set:
SECRET_KEY=your-secure-django-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.railway.app,your-domain.vercel.app
VERCEL_FRONTEND_URL=https://your-app.vercel.app
```

**⚠️ Important for `FIREBASE_PRIVATE_KEY`:**
- Keep the quotes around the value
- Keep the `\n` characters (they represent line breaks)
- The value should start with `-----BEGIN PRIVATE KEY-----\n` and end with `\n-----END PRIVATE KEY-----\n`

### 5. Configure Authorized Domains

1. Go to **Authentication** → **Settings** tab
2. Scroll to **"Authorized domains"**
3. Add your domains:
   - ✅ `localhost` (already there)
   - ✅ Your Vercel domain (e.g., `your-app.vercel.app`)
   - ✅ Your Railway domain (if using custom domain)

### 6. Generate Django SECRET_KEY

1. Run this command:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

2. Copy the output to your `.env` file

## ✅ Verification Checklist

### Frontend (Next.js)

- [ ] `capstone-client/.env.local` exists with all `NEXT_PUBLIC_FIREBASE_*` variables
- [ ] `NEXT_PUBLIC_API_URL` points to backend (local or deployed)
- [ ] No placeholder values (like `your-api-key-here`)

### Backend (Django)

- [ ] `capstone-server/.env` exists with Firebase credentials
- [ ] `SECRET_KEY` is set to a secure random value (NOT the default insecure key)
- [ ] `DEBUG=True` for local dev, `DEBUG=False` for production
- [ ] `ALLOWED_HOSTS` includes your domains
- [ ] `VERCEL_FRONTEND_URL` is set for CORS

### Test Authentication

1. Start backend: `cd capstone-server && python manage.py runserver`
2. Start frontend: `cd capstone-client && npm run dev`
3. Open http://localhost:3000/login
4. You should see the login page without errors
5. Try creating an account with email/password
6. Try signing in with Google

## 🚨 Security Best Practices

1. **Never commit credentials to Git**
   - ✅ `.env` and `.env.local` are in `.gitignore`
   - ❌ Never commit `firebase-credentials.json`

2. **Use different Firebase projects for dev/staging/prod**
   - Development: `deadline-dev`
   - Production: `deadline-prod`

3. **Rotate secrets if exposed**
   - If credentials are leaked, regenerate them immediately
   - Delete old service accounts
   - Generate new private keys

4. **Set up Firebase security rules** (future enhancement)
   - Restrict database access
   - Configure Storage rules

## 🐛 Troubleshooting

### "Firebase initialization failed"

- Check that all env vars are set correctly
- Verify no typos in variable names
- Ensure `FIREBASE_PRIVATE_KEY` has proper `\n` escaping

### "Invalid API key" or "auth/api-key-not-valid"

- Verify `NEXT_PUBLIC_FIREBASE_API_KEY` is correct
- Check Firebase Console → Project Settings → General
- Make sure you copied the Web App config (not Android/iOS)

### "auth/unauthorized-domain"

- Add your domain to Authorized Domains
- Authentication → Settings → Authorized domains

### Backend can't authenticate users

- Check service account credentials are correct
- Verify `FIREBASE_PROJECT_ID` matches between frontend and backend
- Ensure service account has "Firebase Authentication Admin" role

## 📚 Additional Resources

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [Django Decouple Documentation](https://pypi.org/project/python-decouple/)

## 🎯 Quick Commands

```bash
# Generate Django SECRET_KEY
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Test Firebase connection (backend)
cd capstone-server
python manage.py shell
>>> import firebase_admin
>>> print(firebase_admin.get_app())

# Run migrations
python manage.py migrate

# Create demo data
python manage.py seed_demo_data

# Start servers
cd capstone-server && python manage.py runserver  # Backend
cd capstone-client && npm run dev                  # Frontend
```

---

**Need help?** Check the main [README.md](./README.md) or open an issue on GitHub.

