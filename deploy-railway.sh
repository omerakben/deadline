#!/bin/bash
# DEADLINE - Railway Backend Deployment Script
# Run this in your terminal: bash deploy-railway.sh

set -e  # Exit on error

echo "🚂 DEADLINE Railway Deployment"
echo "================================"
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/capstone-server"

echo "📁 Current directory: $(pwd)"
echo ""

# Step 1: Link or initialize Railway project (monorepo root)
echo "Step 1: Link Railway project..."
echo "---------------------------------------"
cd ..
if railway status >/dev/null 2>&1; then
  echo "✅ Railway already linked"
else
  railway init
fi
cd capstone-server
echo ""

# Step 2: Add PostgreSQL database
echo "Step 2: Add PostgreSQL database..."
echo "-----------------------------------"
echo "Run this command manually:"
echo "  railway add"
echo "Then select: PostgreSQL"
echo ""
read -p "Press ENTER after you've added PostgreSQL database..."

# Step 3: Set environment variables
echo ""
echo "Step 3: Setting environment variables..."
echo "-----------------------------------------"

# Generate a strong SECRET_KEY
echo "Generating Django SECRET_KEY..."
SECRET_KEY=$(python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")

railway variables set SECRET_KEY="$SECRET_KEY"
railway variables set DEBUG=False
railway variables set DEMO_MODE=False

echo "✅ Basic variables set"
echo ""

# Step 4: Set Firebase credentials
echo "Step 4: Firebase credentials..."
echo "--------------------------------"
echo "You need to set these Firebase environment variables:"
echo ""
echo "  railway variables set FIREBASE_PROJECT_ID=your-project-id"
echo "  railway variables set FIREBASE_PRIVATE_KEY_ID=your-private-key-id"
echo "  railway variables set FIREBASE_PRIVATE_KEY=\"-----BEGIN PRIVATE KEY-----\nYour-Key\n-----END PRIVATE KEY-----\n\""
echo "  railway variables set FIREBASE_CLIENT_EMAIL=your-client-email"
echo "  railway variables set FIREBASE_CLIENT_ID=your-client-id"
echo ""
echo "Get these from your Firebase service account JSON file:"
echo "  capstone-server/deadline-capstone-firebase-adminsdk-*.json"
echo ""
read -p "Press ENTER after you've set Firebase variables..."

# Step 5: Deploy
echo ""
echo "Step 5: Deploying to Railway..."
echo "--------------------------------"
railway up --service backend

echo ""
echo "🎉 Deployment initiated!"
echo ""
echo "Next steps:"
echo "1. Wait for deployment to complete"
echo "2. Get your Railway URL: railway open"
echo "3. Note the URL for Vercel frontend configuration"
echo ""
