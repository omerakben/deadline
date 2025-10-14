# 🔥 Get Real Firebase Web App Credentials

## Current Issue
Your `.env.local` has placeholder Firebase credentials that don't work. You need REAL credentials from Firebase Console.

## Steps to Fix (5 minutes):

### 1. Go to Firebase Console
https://console.firebase.google.com/project/deadline-capstone/settings/general

### 2. Add a Web App (if not already added)
- Click "Add app" → Choose Web (</>) icon
- Give it a nickname: "DEADLINE Web Client"
- **Don't check** "Also set up Firebase Hosting"
- Click "Register app"

### 3. Copy the Firebase Config
You'll see something like:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",  // ← Copy this
  authDomain: "deadline-capstone.firebaseapp.com",
  projectId: "deadline-capstone",
  storageBucket: "deadline-capstone.appspot.com",
  messagingSenderId: "112943...",
  appId: "1:112943...:web:...",
  measurementId: "G-..."  // Optional
};
```

### 4. Update `.env.local`
Replace the values in `capstone-client/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# Replace these with YOUR actual values from step 3:
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...  # ← REAL API KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=deadline-capstone.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=deadline-capstone
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=deadline-capstone.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=112943...
NEXT_PUBLIC_FIREBASE_APP_ID=1:112943...:web:...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-...  # Optional
```

### 5. Restart Frontend
```bash
cd capstone-client
# Kill current process and restart
npm run dev
```

### 6. Test Demo Login
Navigate to http://localhost:3000/login and click "Launch Demo"

---

## Quick Check: Is Firebase Auth Enabled?

Make sure Firebase Authentication is enabled:
1. Go to: https://console.firebase.google.com/project/deadline-capstone/authentication
2. Click "Get Started" if not enabled
3. Enable "Email/Password" sign-in method
4. No need to create users manually - demo mode handles it

---

## Alternative: Use Firebase CLI (Faster)

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login
firebase login

# Get project info
firebase projects:list

# Get web app config
firebase apps:sdkconfig web
```

Copy the output directly to `.env.local`!

---

## After Getting Real Credentials

The demo login will work automatically! It will:
1. Call backend `/api/v1/auth/demo/login/`
2. Receive Firebase custom token
3. Sign in with `signInWithCustomToken(auth, token)`
4. Redirect to dashboard

**This is a ONE-TIME setup!** Once you have the real Firebase Web App credentials, demo mode will work for all recruiters.
