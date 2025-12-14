#!/bin/bash
# Deploy to Vercel script

set -e

echo "🚀 Starting Vercel deployment..."

if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ VERCEL_TOKEN is not set. Export it, then re-run this script."
  echo "   Example: export VERCEL_TOKEN=\"<your_vercel_token>\""
  exit 1
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Build the project
echo "📦 Building project..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
  echo "❌ Build failed - dist folder not found"
  exit 1
fi

echo "✅ Build successful!"

# Link to Vercel project if not already linked
if [ ! -d ".vercel" ]; then
  echo "🔗 Linking to Vercel project..."
  echo "prj_dndWKafuHj6qtj6VAFveIuDaTNq" | npx vercel link --yes --token "$VERCEL_TOKEN"
fi

# Deploy to production
echo "🚀 Deploying to Vercel production..."
npx vercel --prod --yes --token "$VERCEL_TOKEN"

echo "✅ Deployment complete!"

