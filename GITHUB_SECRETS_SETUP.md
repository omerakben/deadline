# GitHub Secrets Setup for CI/CD

This document explains how to configure GitHub Actions secrets for automated deployment.

## Required Secrets

Navigate to your repository: **Settings → Secrets and variables → Actions → New repository secret**

### 1. Django Secret Key

**Name**: `DJANGO_SECRET_KEY`

**Value**: Generate with this command:
```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Example output: `django-insecure-abc123xyz789...`

---

### 2. Railway Token

**Name**: `RAILWAY_TOKEN`

**How to get**:
1. Go to [Railway Account Settings](https://railway.app/account/tokens)
2. Click **"Create Token"**
3. Name it: "GitHub Actions"
4. Copy the token

**Value**: `railway_token_xxxxxxxxxxxxxxxx`

---

### 3. Vercel Token

**Name**: `VERCEL_TOKEN`

**How to get**:
1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Click **"Create Token"**
3. Name it: "GitHub Actions"
4. Scope: Full Account (or specific projects)
5. Copy the token

**Value**: `xxxxxxxxxxxxxxxxxxxxxxxxxx`

---

### 4. Vercel Organization ID

**Name**: `VERCEL_ORG_ID`

**How to get**:
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Get your org ID
vercel whoami
# Look for "id:" in the output
```

**Value**: `team_xxxxxxxxxxxxxxxx` or `user_xxxxxxxxxxxxxxxx`

---

### 5. Vercel Project ID

**Name**: `VERCEL_PROJECT_ID`

**How to get**:

**Option 1: From Vercel Dashboard**
1. Go to your project in Vercel Dashboard
2. Settings → General
3. Copy "Project ID"

**Option 2: From CLI**
```bash
cd capstone-client
vercel link  # If not already linked
cat .vercel/project.json
```

**Value**: `prj_xxxxxxxxxxxxxxxx`

---

## Verification

After adding all secrets, verify in your repository:

**Settings → Secrets and variables → Actions**

You should see:
- ✅ `DJANGO_SECRET_KEY`
- ✅ `RAILWAY_TOKEN`
- ✅ `VERCEL_TOKEN`
- ✅ `VERCEL_ORG_ID`
- ✅ `VERCEL_PROJECT_ID`

---

## Testing the Workflow

1. Push to `develop` or `main` branch
2. Go to **Actions** tab in GitHub
3. Watch the workflow run
4. Check deployment status

---

## Environment Variables (Not Secrets)

These are set directly in Railway and Vercel (not GitHub):

### Railway Environment Variables

Set in Railway dashboard:
- `SECRET_KEY`
- `DEBUG=False`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_CLIENT_ID`
- `FIREBASE_CLIENT_X509_CERT_URL`
- `CORS_ALLOWED_ORIGINS`
- `VERCEL_FRONTEND_URL`

### Vercel Environment Variables

Set in Vercel dashboard:
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

---

## Troubleshooting

### Workflow fails with "Secret not found"

1. Check secret name matches exactly (case-sensitive)
2. Verify secret was added to repository (not organization)
3. Re-create the secret if needed

### Railway deployment fails

1. Check `RAILWAY_TOKEN` is valid
2. Verify Railway project exists
3. Check Railway logs: `railway logs`

### Vercel deployment fails

1. Verify all three Vercel secrets are set correctly
2. Check project is linked: `cd capstone-client && vercel link`
3. Check Vercel deployment logs in dashboard

---

## Security Best Practices

- ✅ Never commit secrets to Git
- ✅ Rotate tokens periodically (every 90 days)
- ✅ Use least-privilege tokens (Railway project-specific, Vercel scoped)
- ✅ Monitor GitHub Actions logs for exposed secrets
- ✅ Revoke tokens immediately if compromised

---

**Last Updated**: October 20, 2025
