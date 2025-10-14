#!/bin/bash
# DEADLINE - Vercel Frontend Deployment Script
# Run this AFTER Railway deployment: bash deploy-vercel.sh

set -e  # Exit on error

echo "▲ DEADLINE Vercel Deployment"
echo "============================="
echo ""

# Navigate to frontend directory
cd "$(dirname "$0")/capstone-client"

echo "📁 Current directory: $(pwd)"
echo ""

# Step 1: Deploy to Vercel
echo "Step 1: Deploy to Vercel..."
echo "----------------------------"
echo "This will prompt you for:"
echo "  - Set up and deploy? [Y/n] → Y"
echo "  - Which scope? → Select your account"
echo "  - Link to existing project? [y/N] → N"
echo "  - What's your project's name? → deadline"
echo "  - In which directory is your code located? → ./"
echo "  - Want to modify settings? [y/N] → N"
echo ""
read -p "Press ENTER to start Vercel deployment..."

vercel --prod

echo ""
echo "✅ Vercel deployment initiated!"
echo ""
echo "Step 2: Configure environment variables..."
echo "-------------------------------------------"
echo ""
echo "Get your Railway backend URL first:"
echo "  1. Open https://railway.app"
echo "  2. Find your deadline-api project"
echo "  3. Copy the public URL (e.g., https://deadline-api-production.up.railway.app)"
echo ""
read -p "Enter your Railway backend URL: " RAILWAY_URL

# Remove trailing slash if present
RAILWAY_URL=${RAILWAY_URL%/}

echo ""
echo "Now we'll set the environment variables in Vercel..."
echo "You'll need your Firebase config values."
echo ""

# Set API URL
vercel env add NEXT_PUBLIC_API_BASE_URL production <<EOF
${RAILWAY_URL}/api/v1
EOF

echo ""
echo "Set these Firebase environment variables manually:"
echo "  vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production"
echo "  vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production"
echo "  vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production"
echo "  vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production"
echo "  vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production"
echo "  vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production"
echo ""
echo "Or use the Vercel dashboard: https://vercel.com/dashboard"
echo ""
read -p "Press ENTER after setting Firebase variables..."

# Redeploy with environment variables
echo ""
echo "Redeploying with environment variables..."
vercel --prod

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Step 3: Update Railway CORS settings..."
echo "----------------------------------------"
echo "Get your Vercel URL and update Railway:"
echo "  1. Get Vercel URL: vercel inspect"
echo "  2. Add to Railway: railway variables set VERCEL_FRONTEND_URL=https://your-app.vercel.app"
echo "  3. Redeploy Railway: cd ../capstone-server && railway up"
echo ""
