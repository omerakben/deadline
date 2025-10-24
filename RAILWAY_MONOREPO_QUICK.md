# Railway Monorepo - Quick Setup

## 🎯 The Issue
Your repo has both backend and frontend:
```
deadline/
├── capstone-server/  ← Deploy THIS to Railway
└── capstone-client/  ← Deploy THIS to Vercel
```

Railway needs to know which folder to use!

## ✅ Solution: 3 Steps in Railway Dashboard

### Step 1: Set Root Directory
```
Railway Dashboard → Your Service → Settings → Root Directory
Value: capstone-server
```

### Step 2: Set Watch Paths (Optional)
```
Railway Dashboard → Your Service → Settings → Watch Paths
Value: capstone-server/**
```

### Step 3: Deploy
```bash
git push origin main
# Or manually: cd capstone-server && railway up
```

## 📋 Configuration Files

### `capstone-server/railway.json` ✅
```json
{
  "build": {
    "builder": "NIXPACKS",
    "watchPatterns": ["capstone-server/**"]
  }
}
```

### All paths in scripts are relative to `capstone-server/` ✅
- `start.sh` → `python scripts/generate_firebase_creds.py`
- `nixpacks.toml` → `/app/.venv/bin/pip install -r requirements.txt`

## 🚨 Common Mistakes

❌ **Not setting Root Directory**
→ Railway tries to build from repo root, fails to find Django files

❌ **Running `railway up` from wrong folder**
→ Must run from `capstone-server/` directory

❌ **Using absolute paths in scripts**
→ Use relative paths from `capstone-server/`

## ✅ Verification

After setup, check Railway build logs for:
- "Using root directory: capstone-server"
- "Using Nixpacks" or "Running start.sh"
- "✅ Firebase credentials written"
- "✅ X migrations applied"

---

**See `RAILWAY_MONOREPO_SETUP.md` for detailed explanation.**
