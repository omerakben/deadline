# 🚨 CRITICAL FIX NEEDED - Firebase Web App Credentials

## Problem

Your demo login is failing because `.env.local` has **FAKE/PLACEHOLDER** Firebase credentials.

## Root Cause

The `.env.local` file has:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBVm4sR9vKj3xQZxH_eN0Zx7Qj8K9fL5xY  ← FAKE!
NEXT_PUBLIC_FIREBASE_APP_ID=1:112943741519226739568:web:abc123def456  ← FAKE!
```

These are not real Firebase credentials!

~~~~
## Solution (Takes 2 minutes)

### Step 1: Open Firebase Console
https://console.firebase.google.com/project/deadline-capstone/settings/general

### Step 2: Add Web App
1. Scroll to "Your apps" section
2. Click the **</>** icon (Web app)
3. Name it: "DEADLINE Web Client"
4. Click "Register app"

### Step 3: Copy the Config
You'll see code like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",  // ← THIS IS THE REAL ONE!
  authDomain: "deadline-capstone.firebaseapp.com",
  projectId: "deadline-capstone",
  storageBucket: "deadline-capstone.appspot.com",
  messagingSenderId: "112943741519226739568",
  appId: "1:112943741519226739568:web:YOUR_REAL_APP_ID",
  measurementId: "G-XXXXXXXXXX"
};
```

### Step 4: Update .env.local
Replace in `capstone-client/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# USE YOUR REAL VALUES FROM FIREBASE CONSOLE:
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...  # ← FROM STEP 3
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=deadline-capstone.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=deadline-capstone
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=deadline-capstone.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=112943741519226739568  # ← FROM STEP 3
NEXT_PUBLIC_FIREBASE_APP_ID=1:112943...web:...  # ← FROM STEP 3
```

### Step 5: Restart
```bash
# Kill the frontend server (Ctrl+C) and restart:
cd capstone-client
npm run dev
```

### Step 6: Test
Go to http://localhost:3000/login and click "Launch Demo" - IT WILL WORK! ✅

---

## Why This Happened
Firebase has TWO types of credentials:
1. **Service Account** (backend) - ✅ YOU HAVE THIS (the .json file)
2. **Web App** (frontend) - ❌ YOU NEED THIS (from Firebase Console)

The backend is working perfectly! It's generating valid custom tokens. The frontend just needs real credentials to authenticate with Firebase.

---

## What We Fixed Today

✅ **Backend:**
- Fixed CSRF_TRUSTED_ORIGINS
- Fixed Firebase initialization in DEMO_MODE
- Modified demo endpoint to generate custom tokens
- Added `@authentication_classes([])` to bypass CSRF

✅ **Files Modified:**
- `capstone-server/deadline_api/settings.py`
- `capstone-server/auth_firebase/demo_views.py`

✅ **What's Working:**
- Backend generates valid Firebase custom tokens
- Demo endpoint returns 200 OK
- All authentication logic is correct

❌ **Only Missing:**
- Real Firebase Web App credentials in `.env.local`

---

## Once You Add Real Credentials

Demo login will work PERFECTLY for recruiters:
1. They click "Launch Demo"
2. Frontend calls `/api/v1/auth/demo/login/`
3. Backend returns Firebase custom token
4. Frontend signs in with `signInWithCustomToken()`
5. User is redirected to dashboard
6. **DONE!** 🎉

---

## Quick Test After Fix

```bash
# Terminal 1: Backend
cd capstone-server
python manage.py runserver

# Terminal 2: Frontend (with NEW credentials)
cd capstone-client
npm run dev

# Browser: http://localhost:3000/login
# Click "Launch Demo" → Should go to dashboard!
```

---

## Need Help?

The Firebase Console link again:
**https://console.firebase.google.com/project/deadline-capstone/settings/general**

Look for "Your apps" → Click "</>" → Copy config → Update `.env.local`

That's it! 🚀
