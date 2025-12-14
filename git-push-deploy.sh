#!/bin/bash
# Git push to trigger Vercel deployment

set -e

echo "=========================================="
echo "🚀 Git Push to Trigger Vercel Deployment"
echo "=========================================="
echo ""

cd /Users/leightonbingham/Downloads/magicwork-main

# Check if git is initialized
if [ ! -d ".git" ]; then
  echo "📦 Initializing git repository..."
  git init
  echo "✅ Git initialized"
fi

# Check for remote
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")

if [ -z "$REMOTE_URL" ]; then
  echo "⚠️  WARNING: No git remote configured!"
  echo ""
  echo "To set up your remote, run:"
  echo "  git remote add origin <your-github-repo-url>"
  echo ""
  echo "Or if you want to deploy directly to Vercel:"
  echo "  npx vercel --prod --yes --token $VERCEL_TOKEN"
  echo ""
  exit 1
fi

echo "✅ Remote configured: $REMOTE_URL"
echo ""

# Stage all changes
echo "📦 Staging all changes..."
git add -A

# Check if there are changes
if git diff --staged --quiet; then
  echo "✅ No changes to commit (everything is up to date)"
  HAS_CHANGES=false
else
  echo "💾 Committing changes..."
  git commit -m "Deploy: Production-ready build with optimizations, PWA, and Capacitor setup

- Optimized Vite build configuration
- PWA manifest and service worker configured  
- Capacitor setup for iOS/Android native apps
- Component refactoring complete
- All syntax errors fixed
- Ready for production deployment"
  echo "✅ Changes committed"
  HAS_CHANGES=true
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
echo "📌 Current branch: $CURRENT_BRANCH"
echo ""

# Push to remote
if [ "$HAS_CHANGES" = true ] || [ -n "$(git log origin/$CURRENT_BRANCH..HEAD 2>/dev/null)" ]; then
  echo "🚀 Pushing to remote..."
  git push origin "$CURRENT_BRANCH" || git push
  echo ""
  echo "✅ Push complete!"
  echo ""
  echo "📡 Vercel should automatically detect the push and start deploying..."
  echo "Check your Vercel dashboard: https://vercel.com/dashboard"
else
  echo "ℹ️  No new commits to push"
fi

echo ""
echo "=========================================="
echo "✅ Done!"
echo "=========================================="

