#!/bin/bash
set -e

echo "🚀 Starting Vercel Deployment..."
echo ""

if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ VERCEL_TOKEN is not set. Export it, then re-run this script."
  echo "   Example: export VERCEL_TOKEN=\"<your_vercel_token>\""
  exit 1
fi

# Step 1: Clean and build
echo "📦 Step 1: Building project..."
rm -rf dist
npm run build

if [ ! -d "dist" ]; then
  echo "❌ Build failed - dist folder not found"
  exit 1
fi

echo "✅ Build successful!"
echo ""

# Step 2: Link to Vercel project
echo "🔗 Step 2: Linking to Vercel project..."
if [ ! -d ".vercel" ]; then
  echo "prj_dndWKafuHj6qtj6VAFveIuDaTNq" | npx vercel link --yes --token "$VERCEL_TOKEN" 2>&1 || {
    echo "⚠️  Link may have failed, but continuing..."
  }
else
  echo "✅ Already linked to Vercel"
fi
echo ""

# Step 3: Deploy to production
echo "🚀 Step 3: Deploying to Vercel production..."
npx vercel --prod --yes --token "$VERCEL_TOKEN" 2>&1

echo ""
echo "✅ Deployment complete!"

