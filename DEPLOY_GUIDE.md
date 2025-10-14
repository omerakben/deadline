# Quick Deployment Guide

## Prerequisites Checklist

- [x] Railway CLI installed and authenticated (`railway whoami`)
- [x] Vercel CLI installed and authenticated (`vercel whoami`)
- [x] GitHub repository pushed (`git remote -v`)
- [ ] Firebase project created with Authentication enabled
- [ ] Firebase service account JSON file ready

---

## Step-by-Step Deployment

### PART 1: Railway Backend Deployment (15-20 minutes)

#### 1. Navigate to Backend Directory
```bash
cd capstone-server
```

#### 2. Initialize Railway Project
```bash
railway init
```
- Select: **Create new project**
- Project name: `deadline-api`
- Press ENTER

#### 3. Add PostgreSQL Database
```bash
railway add
```
- Select: **PostgreSQL**
- Wait for database to provision (~30 seconds)

#### 4. Generate Django SECRET_KEY
```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```
Copy the output - you'll need it next.

#### 5. Set Environment Variables

**Basic Django Settings:**
```bash
railway variables set SECRET_KEY="<paste-generated-key-here>"
railway variables set DEBUG=False
railway variables set DEMO_MODE=False
```

**Firebase Credentials:**

Open your Firebase service account JSON file:
```bash
cat deadline-capstone-firebase-adminsdk-*.json
```

Then set each variable:
```bash
railway variables set FIREBASE_PROJECT_ID="your-project-id"
railway variables set FIREBASE_PRIVATE_KEY_ID="your-private-key-id"
railway variables set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
Your-Multi-Line-Key-Here
-----END PRIVATE KEY-----"
railway variables set FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
railway variables set FIREBASE_CLIENT_ID="your-client-id"
railway variables set FIREBASE_CLIENT_X509_CERT_URL="https://www.googleapis.com/robot/v1/metadata/x509/..."
```

**Note**: For `FIREBASE_PRIVATE_KEY`, include the quotes and newlines exactly as shown in the JSON.

#### 6. Deploy to Railway
```bash
railway up
```
- Wait for build and deployment (~2-3 minutes)
- Note any errors in the logs

#### 7. Get Your Railway URL
```bash
railway open
```
or
```bash
railway status
```

**Save this URL** - you'll need it for Vercel! It will look like:
`https://deadline-api-production-xxxx.up.railway.app`

---

### PART 2: Vercel Frontend Deployment (10-15 minutes)

#### 1. Navigate to Frontend Directory
```bash
cd ../capstone-client
```

#### 2. Deploy to Vercel
```bash
vercel --prod
```

Answer the prompts:
- **Set up and deploy?** → `Y`
- **Which scope?** → Select your account
- **Link to existing project?** → `N`
- **Project name?** → `deadline` (or your choice)
- **In which directory is your code located?** → `./`
- **Want to override settings?** → `N`

Wait for deployment (~2-3 minutes)

#### 3. Set Environment Variables

Get your Firebase Web config from Firebase Console → Project Settings → General → Your apps → Web app

```bash
# API URL (use your Railway URL from Step 1.7)
vercel env add NEXT_PUBLIC_API_BASE_URL production
# Enter: https://your-railway-url.up.railway.app/api/v1

# Firebase config
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
```

For each command, it will prompt you to enter the value.

#### 4. Redeploy with Environment Variables
```bash
vercel --prod
```

#### 5. Get Your Vercel URL
```bash
vercel inspect
```
or check: https://vercel.com/dashboard

**Save this URL** - Example:
`https://deadline-yourname.vercel.app`

---

### PART 3: Connect Frontend & Backend (5 minutes)

#### 1. Update Railway CORS Settings
```bash
cd ../capstone-server
railway variables set VERCEL_FRONTEND_URL="https://your-vercel-url.vercel.app"
```

#### 2. Update Railway ALLOWED_HOSTS
```bash
# Get your Railway domain first
railway status  # Look for "Deployment"

# Add to ALLOWED_HOSTS
railway variables set ALLOWED_HOSTS="\${{RAILWAY_PUBLIC_DOMAIN}},localhost,127.0.0.1"
```

#### 3. Redeploy Railway
```bash
railway up
```

---

## Verification Checklist

### Backend Health Check
```bash
curl https://your-railway-url.up.railway.app/api/v1/schema/
```
Should return OpenAPI schema JSON.

### Frontend Check
1. Open: `https://your-vercel-url.vercel.app`
2. Should see DEADLINE login page
3. No errors in browser console (F12)

### Authentication Test
1. Click "Launch Demo" or "Sign Up"
2. Should successfully authenticate
3. Dashboard should load with workspaces

### Full Integration Test
1. Create a workspace
2. Add an ENV_VAR artifact
3. Add a DOC_LINK artifact
4. Verify search works
5. Try environment filtering

---

## Troubleshooting

### Railway Issues

**Build fails:**
```bash
railway logs
```
Look for Python/Django errors.

**Database connection issues:**
```bash
railway variables
```
Verify `DATABASE_URL` is set (automatic from PostgreSQL addon).

**Static files not loading:**
```bash
railway run python manage.py collectstatic --noinput
```

### Vercel Issues

**Build fails:**
```bash
vercel logs
```
Look for npm/TypeScript errors.

**Environment variables not working:**
```bash
vercel env ls
```
Verify all `NEXT_PUBLIC_*` variables are set for production.

**CORS errors:**
Check Railway `VERCEL_FRONTEND_URL` matches your Vercel domain exactly.

### Firebase Issues

**Authentication not working:**
1. Firebase Console → Authentication → Settings → Authorized domains
2. Add your Vercel domain: `your-app.vercel.app`
3. Add your Railway domain: `your-api.up.railway.app`

---

## Post-Deployment

### Optional Enhancements

1. **Custom Domains:**
   - Railway: Settings → Domains → Add custom domain
   - Vercel: Settings → Domains → Add domain

2. **Monitoring:**
   - Railway: Built-in metrics in dashboard
   - Vercel: Analytics tab in dashboard

3. **Database Backups:**
   - Railway: PostgreSQL plugin → Backups

4. **Demo Data:**
```bash
railway run python manage.py seed_demo_data
railway run python manage.py populate_demo_workspace
```

---

## Quick Commands Reference

### Railway
```bash
railway status          # Check deployment status
railway logs            # View logs
railway open            # Open in browser
railway variables       # List environment variables
railway run <command>   # Run Django management commands
```

### Vercel
```bash
vercel                  # Deploy
vercel --prod           # Deploy to production
vercel logs             # View logs
vercel inspect          # Get deployment info
vercel env ls           # List environment variables
```

---

## Support

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Firebase Docs: https://firebase.google.com/docs

---

**Estimated Total Time: 30-40 minutes**

Good luck with your deployment! 🚀
