#!/bin/bash
# Push to Git to trigger Vercel auto-deployment

set -e

echo "🔍 Checking Git repository status..."
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
  echo "❌ Not a git repository. Initializing..."
  git init
  echo "✅ Git repository initialized"
fi

# Check for remote
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")

if [ -z "$REMOTE_URL" ]; then
  echo "⚠️  No remote repository configured"
  echo "Please add your remote with:"
  echo "  git remote add origin <your-repo-url>"
  echo ""
  echo "Or if you want to deploy directly to Vercel, use:"
  echo "  npx vercel --prod --yes --token $VERCEL_TOKEN"
  exit 1
fi

echo "✅ Remote found: $REMOTE_URL"
echo ""

# Check current branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
echo "Current branch: $CURRENT_BRANCH"
echo ""

# Stage all changes
echo "📦 Staging all changes..."
git add -A

# Check if there are changes to commit
if git diff --staged --quiet; then
  echo "✅ No changes to commit (everything is up to date)"
else
  echo "💾 Committing changes..."
  git commit -m "Deploy: Clean build with optimized config, PWA setup, and Capacitor ready

- Optimized Vite build configuration
- PWA manifest and service worker configured
- Capacitor setup for iOS/Android
- Component refactoring complete
- All syntax errors fixed
- Ready for production deployment"
  
  echo "✅ Changes committed"
fi

echo ""
echo "🚀 Pushing to remote repository..."
git push origin "$CURRENT_BRANCH" 2>&1

echo ""
echo "✅ Push complete!"
echo ""
echo "📡 Vercel should automatically detect the push and start deploying..."
echo "Check your Vercel dashboard for deployment status:"
echo "https://vercel.com/dashboard"

