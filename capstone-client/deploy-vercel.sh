#!/bin/bash
# Vercel Deployment - Quick Start Script
# ========================================

set -e  # Exit on error

echo "🚀 Deadline Frontend - Vercel Deployment"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from capstone-client/ directory"
    echo "   Run: cd capstone-client && ./deploy-vercel.sh"
    exit 1
fi

echo "📋 Pre-Deployment Checklist:"
echo ""
echo "✅ Backend deployed: https://deadline-production.up.railway.app"
echo "✅ Firebase config endpoint: https://deadline-production.up.railway.app/api/v1/auth/config/"
echo "✅ Vercel CLI installed: $(which vercel)"
echo ""

# Ask user to confirm
read -p "Continue with deployment? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

echo ""
echo "🔍 Step 1: Running QA checks..."
echo "--------------------------------"

# Run lint
echo "  → Running ESLint..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Lint failed. Fix errors before deploying."
    exit 1
fi

# Run typecheck
echo "  → Running TypeScript check..."
npm run typecheck
if [ $? -ne 0 ]; then
    echo "❌ Type check failed. Fix errors before deploying."
    exit 1
fi

# Run build
echo "  → Building production bundle..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Fix errors before deploying."
    exit 1
fi

echo "✅ All QA checks passed!"
echo ""

echo "🌐 Step 2: Deploying to Vercel..."
echo "--------------------------------"
echo ""

# Check if logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Not logged in to Vercel. Logging in..."
    vercel login
fi

echo ""
echo "🚀 Deploying to production..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Post-Deployment Steps:"
echo "-------------------------"
echo "1. Copy your Vercel URL from above (e.g., https://deadline.vercel.app)"
echo "2. Update CORS in Railway:"
echo "   - Go to: https://railway.app"
echo "   - Navigate to your project > deadline service > Variables"
echo "   - Update CORS_ALLOWED_ORIGINS to include your Vercel URL:"
echo "     http://localhost:3000,https://deadline-production.up.railway.app,https://YOUR-VERCEL-URL"
echo "3. Test authentication flow:"
echo "   - Visit your Vercel URL"
echo "   - Go to /login"
echo "   - Sign up with a test email"
echo "   - Verify dashboard access"
echo ""
echo "🎉 Done! Your frontend is live!"
