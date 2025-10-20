#!/bin/bash

# ============================================
# DEADLINE - Railway Backend Deployment
# ============================================
# This script helps deploy the Django backend to Railway
# with secure Firebase credentials

set -e  # Exit on error

echo "🚂 DEADLINE - Railway Backend Deployment"
echo "========================================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found!"
    echo "Install it with: npm install -g @railway/cli"
    exit 1
fi

# Check if Firebase credentials file exists
FIREBASE_CREDS_FILE="/deadline-capstone-firebase-adminsdk-fbsvc-8efd8ef2a7.json"
if [ ! -f "$FIREBASE_CREDS_FILE" ]; then
    echo "❌ Firebase credentials file not found at: $FIREBASE_CREDS_FILE"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Step 1: Login to Railway
echo "Step 1: Login to Railway"
echo "------------------------"
railway login
echo ""

# Step 2: Link or create project
echo "Step 2: Initialize Railway Project"
echo "-----------------------------------"
echo "Choose an option:"
echo "1. Link to existing project"
echo "2. Create new project"
read -p "Enter choice (1 or 2): " choice

if [ "$choice" == "1" ]; then
    railway link
else
    railway init
fi
echo ""

# Step 3: Add PostgreSQL database
echo "Step 3: Add PostgreSQL Database"
echo "--------------------------------"
read -p "Do you need to add PostgreSQL database? (y/n): " add_db

if [ "$add_db" == "y" ] || [ "$add_db" == "Y" ]; then
    railway add --database postgresql
    echo "✅ PostgreSQL database added"
else
    echo "⏩ Skipping database setup"
fi
echo ""

# Step 4: Generate and set Django SECRET_KEY
echo "Step 4: Generate Django SECRET_KEY"
echo "-----------------------------------"
SECRET_KEY=$(python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
echo "Generated SECRET_KEY: ${SECRET_KEY:0:20}..."
echo ""

# Step 5: Extract Firebase credentials from JSON
echo "Step 5: Extract Firebase Credentials"
echo "-------------------------------------"
echo "Reading Firebase credentials from JSON file..."

# Use Python to safely extract JSON values
FIREBASE_PROJECT_ID=$(python3 -c "import json; print(json.load(open('$FIREBASE_CREDS_FILE'))['project_id'])")
FIREBASE_PRIVATE_KEY_ID=$(python3 -c "import json; print(json.load(open('$FIREBASE_CREDS_FILE'))['private_key_id'])")
FIREBASE_PRIVATE_KEY=$(python3 -c "import json; print(json.load(open('$FIREBASE_CREDS_FILE'))['private_key'])")
FIREBASE_CLIENT_EMAIL=$(python3 -c "import json; print(json.load(open('$FIREBASE_CREDS_FILE'))['client_email'])")
FIREBASE_CLIENT_ID=$(python3 -c "import json; print(json.load(open('$FIREBASE_CREDS_FILE'))['client_id'])")
FIREBASE_CLIENT_X509_CERT_URL=$(python3 -c "import json; print(json.load(open('$FIREBASE_CREDS_FILE'))['client_x509_cert_url'])")

echo "✅ Firebase credentials extracted"
echo "   Project ID: $FIREBASE_PROJECT_ID"
echo "   Client Email: $FIREBASE_CLIENT_EMAIL"
echo ""

# Step 6: Set all environment variables
echo "Step 6: Setting Environment Variables"
echo "--------------------------------------"
echo "Setting Railway environment variables..."
echo ""

# Django settings
railway variables set SECRET_KEY="$SECRET_KEY"
railway variables set DEBUG=False
railway variables set DEMO_MODE=False

# Firebase credentials
railway variables set FIREBASE_TYPE=service_account
railway variables set FIREBASE_PROJECT_ID="$FIREBASE_PROJECT_ID"
railway variables set FIREBASE_PRIVATE_KEY_ID="$FIREBASE_PRIVATE_KEY_ID"
railway variables set FIREBASE_PRIVATE_KEY="$FIREBASE_PRIVATE_KEY"
railway variables set FIREBASE_CLIENT_EMAIL="$FIREBASE_CLIENT_EMAIL"
railway variables set FIREBASE_CLIENT_ID="$FIREBASE_CLIENT_ID"
railway variables set FIREBASE_CLIENT_X509_CERT_URL="$FIREBASE_CLIENT_X509_CERT_URL"

echo "✅ All environment variables set"
echo ""

# Step 7: Set CORS (will be updated after Vercel deployment)
echo "Step 7: CORS Configuration"
echo "--------------------------"
echo "Note: You'll need to update CORS_ALLOWED_ORIGINS after deploying frontend"
railway variables set CORS_ALLOWED_ORIGINS="http://localhost:3000"
echo "✅ CORS set to localhost (update later with Vercel URL)"
echo ""

# Step 8: Deploy
echo "Step 8: Deploy to Railway"
echo "-------------------------"
read -p "Ready to deploy? (y/n): " deploy_now

if [ "$deploy_now" == "y" ] || [ "$deploy_now" == "Y" ]; then
    echo "🚀 Deploying..."
    railway up
    echo ""
    echo "✅ Deployment initiated!"
else
    echo "⏩ Skipping deployment"
    echo "You can deploy later with: railway up"
fi
echo ""

# Step 9: Get Railway URL
echo "Step 9: Get Your Railway URL"
echo "----------------------------"
echo "Opening Railway dashboard..."
railway open
echo ""
echo "Copy your Railway URL from the dashboard"
echo "It will look like: https://deadline-api-production.up.railway.app"
echo ""

# Step 10: Next steps
echo "========================================="
echo "🎉 Railway Backend Setup Complete!"
echo "========================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Copy your Railway URL from the dashboard"
echo "2. Test the API:"
echo "   curl https://YOUR-RAILWAY-URL.up.railway.app/api/v1/schema/"
echo ""
echo "3. After deploying frontend to Vercel, update CORS:"
echo "   railway variables set CORS_ALLOWED_ORIGINS=\"https://YOUR-APP.vercel.app\""
echo "   railway variables set VERCEL_FRONTEND_URL=\"https://YOUR-APP.vercel.app\""
echo "   railway up"
echo ""
echo "4. Check deployment logs:"
echo "   railway logs"
echo ""
echo "📖 Full deployment guide: ../COMPREHENSIVE_DEPLOYMENT_GUIDE.md"
echo ""
