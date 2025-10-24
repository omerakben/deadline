# Vercel Deployment Guide - Deadline Frontend

## Quick Start Checklist

- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Login to Vercel: `vercel login`
- [ ] Configure environment variables in Vercel dashboard
- [ ] Deploy: `cd capstone-client && vercel --prod`
- [ ] Update CORS settings in Railway backend
- [ ] Test authentication flow end-to-end

---

## Prerequisites

1. **Vercel Account**: Sign up at <https://vercel.com>
2. **Vercel CLI**: Install globally

   ```bash
   npm install -g vercel
   ```

3. **Railway Backend**: Deployed and running at `https://deadline-production.up.railway.app`
4. **Firebase Config**: Already set in Railway (fetched via `/api/v1/auth/config/`)

---

## Step 1: Prepare Environment Variables

The frontend needs **ONE** environment variable for production:

### Required Variable

```bash
NEXT_PUBLIC_API_BASE_URL=https://deadline-production.up.railway.app/api/v1
```

**Note**: Firebase config is **dynamically fetched** from the backend at runtime, so you don't need to set `NEXT_PUBLIC_FIREBASE_*` variables in Vercel.

---

## Step 2: Deploy via Vercel CLI

### Option A: Command Line Deployment (Recommended)

```bash
# Navigate to frontend directory
cd capstone-client

# Login to Vercel (if not already)
vercel login

# Deploy to production
vercel --prod
```

**During deployment, answer:**

- Set up and deploy?: `Y`
- Which scope?: Choose your account
- Link to existing project?: `N` (first time) or `Y` (subsequent)
- Project name: `deadline` or `deadline-frontend`
- In which directory is your code located?: `./` (already in capstone-client)
- Want to override settings?: `N` (vercel.json is already configured)

### Option B: GitHub Integration (Alternative)

1. Go to <https://vercel.com/dashboard>
2. Click **"Add New Project"**
3. Import `omerakben/deadline` repository
4. **Root Directory**: Set to `capstone-client`
5. **Framework Preset**: Next.js (auto-detected)
6. **Build Command**: `npm run build` (from vercel.json)
7. **Environment Variables**: Add `NEXT_PUBLIC_API_BASE_URL`
8. Click **"Deploy"**

---

## Step 3: Configure Environment Variables in Vercel Dashboard

After first deployment (or before deploying):

1. Go to: <https://vercel.com/your-username/deadline/settings/environment-variables>
2. Add the following:

| Key                        | Value                                               | Environment |
| -------------------------- | --------------------------------------------------- | ----------- |
| `NEXT_PUBLIC_API_BASE_URL` | `https://deadline-production.up.railway.app/api/v1` | Production  |

3. **Redeploy** if you added variables after initial deployment:

   ```bash
   vercel --prod
   ```

---

## Step 4: Update Backend CORS Settings

Once you get your Vercel URL (e.g., `https://deadline.vercel.app`):

### In Railway Dashboard

1. Go to: <https://railway.app/project/[your-project]/service/[deadline-service>]
2. Navigate to **Variables** tab
3. Update or add these variables:

| Variable               | Current Value                                                      | New Value                                                                                      |
| ---------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,https://deadline-production.up.railway.app` | `http://localhost:3000,https://deadline-production.up.railway.app,https://deadline.vercel.app` |
| `ALLOWED_HOSTS`        | `deadline-production.up.railway.app,localhost,127.0.0.1`           | `deadline-production.up.railway.app,localhost,127.0.0.1`                                       |

4. Add new variable:

```bash
VERCEL_FRONTEND_URL=https://deadline.vercel.app
```

5. Click **"Deploy"** to restart with new CORS settings

### Alternative: Update via Railway CLI

```bash
railway variables --set CORS_ALLOWED_ORIGINS="http://localhost:3000,https://deadline-production.up.railway.app,https://deadline.vercel.app"
railway variables --set VERCEL_FRONTEND_URL="https://deadline.vercel.app"
```

---

## Step 5: Verify Deployment

### A. Check Build Logs

```bash
# View deployment logs
vercel logs [deployment-url]
```

### B. Test Frontend Routes

1. **Homepage**: `https://deadline.vercel.app/`
2. **Login**: `https://deadline.vercel.app/login`
3. **Dashboard**: `https://deadline.vercel.app/dashboard`
4. **Workspaces**: `https://deadline.vercel.app/workspaces`

### C. Test API Connection

Open browser console on your Vercel site and check:

```javascript
// Should log Firebase config fetched from backend
console.log('API Base:', process.env.NEXT_PUBLIC_API_BASE_URL);

// Test fetch
fetch('https://deadline-production.up.railway.app/api/v1/auth/config/')
  .then(r => r.json())
  .then(console.log);
```

### D. Test Authentication Flow

1. Go to `/login`
2. Sign up with a test email
3. Verify Firebase authentication works
4. Check if token is sent to backend
5. Verify workspace access

---

## Step 6: Domain Configuration (Optional)

### Add Custom Domain

1. Go to Vercel dashboard → Project → Settings → Domains
2. Add your domain (e.g., `deadline.yourdomain.com`)
3. Follow Vercel's DNS configuration instructions
4. Update `CORS_ALLOWED_ORIGINS` in Railway with new domain

---

## Troubleshooting

### Issue: CORS Errors in Browser Console

**Symptoms:**

```
Access to fetch at 'https://deadline-production.up.railway.app/api/v1/...'
from origin 'https://deadline.vercel.app' has been blocked by CORS policy
```

**Solution:**

1. Verify `CORS_ALLOWED_ORIGINS` in Railway includes your Vercel URL
2. Ensure no trailing slashes in CORS origins
3. Check Railway logs: `railway logs`
4. Restart Railway service after CORS changes

### Issue: Firebase Config Not Loading

**Symptoms:**

- `/api/v1/auth/config/` returns 500 error
- Frontend shows "Firebase not initialized"

**Solution:**

1. Check Railway logs for Firebase credential errors
2. Verify `FIREBASE_PROJECT_ID` and all Firebase env vars are set in Railway
3. Ensure `generate_firebase_creds.py` ran successfully (check logs)

### Issue: 404 on Next.js Routes

**Symptoms:**

- Direct navigation to `/dashboard` shows 404
- Works when navigating from homepage

**Solution:**

- Already configured in `vercel.json` with rewrites
- If still happens, check Vercel build logs for errors
- Ensure all pages are in `src/app/` directory structure

### Issue: Environment Variables Not Working

**Symptoms:**

- `process.env.NEXT_PUBLIC_API_BASE_URL` is undefined
- API calls go to localhost instead of Railway

**Solution:**

1. Check variable name starts with `NEXT_PUBLIC_`
2. Verify in Vercel dashboard: Settings → Environment Variables
3. **Redeploy** after adding variables:

   ```bash
   vercel --prod
   ```

### Issue: Build Fails on Vercel

**Symptoms:**

```
Error: Build failed with exit code 1
```

**Solution:**

1. Test build locally first:

   ```bash
   cd capstone-client
   npm run build
   ```

2. Check for TypeScript errors: `npm run typecheck`
3. Check for ESLint errors: `npm run lint`
4. Review Vercel build logs for specific error

---

## Monitoring & Logs

### View Vercel Logs

```bash
# Real-time logs
vercel logs --follow

# Logs for specific deployment
vercel logs [deployment-url]
```

### View Railway Backend Logs

```bash
# Real-time logs
railway logs --follow

# Recent logs
railway logs
```

---

## Post-Deployment Checklist

- [ ] Vercel deployment successful (green checkmark)
- [ ] Frontend URL accessible: `https://deadline.vercel.app`
- [ ] `/login` page loads correctly
- [ ] Firebase config fetched from backend (check Network tab)
- [ ] No CORS errors in browser console
- [ ] Authentication flow works (sign up → login → dashboard)
- [ ] Workspace CRUD operations work
- [ ] Artifact upload/download works
- [ ] Railway backend CORS updated with Vercel URL
- [ ] Environment variables set correctly
- [ ] Custom domain configured (if applicable)

---

## Next Steps

1. **Create Test User**: Sign up via `/login` to test authentication
2. **Test Workspace Features**: Create, edit, delete workspaces
3. **Test Artifact Upload**: Upload files to verify storage
4. **Monitor Logs**: Watch both Vercel and Railway logs for errors
5. **Performance**: Check Vercel Analytics for performance metrics
6. **Create Superuser**: Still need to create Django admin user via Railway

---

## Quick Command Reference

```bash
# Deploy to production
cd capstone-client && vercel --prod

# View logs
vercel logs --follow

# List deployments
vercel ls

# Remove deployment
vercel rm [deployment-url]

# Check environment variables
vercel env ls

# Pull environment variables to local
vercel env pull .env.local

# Open Vercel dashboard
vercel dashboard
```

---

## Important URLs

- **Frontend (Vercel)**: Will be `https://deadline.vercel.app` (or similar)
- **Backend (Railway)**: `https://deadline-production.up.railway.app`
- **API Docs**: `https://deadline-production.up.railway.app/api/v1/schema/`
- **Django Admin**: `https://deadline-production.up.railway.app/admin/`
- **Vercel Dashboard**: `https://vercel.com/dashboard`
- **Railway Dashboard**: `https://railway.app/project/[your-project]`

---

## Environment Variable Summary

### Vercel (Frontend)

- `NEXT_PUBLIC_API_BASE_URL=https://deadline-production.up.railway.app/api/v1`

### Railway (Backend) - UPDATE AFTER VERCEL DEPLOYMENT

- Add Vercel URL to `CORS_ALLOWED_ORIGINS`
- Add `VERCEL_FRONTEND_URL` variable

---

**Ready to deploy?** Run:

```bash
cd capstone-client && vercel --prod
```
