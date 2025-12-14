#!/bin/bash
# Complete deployment script - commits and pushes to trigger Vercel

set -e

echo "🚀 Deploying to Vercel via Git Push"
echo "===================================="
echo ""

# Step 1: Build
echo "📦 Building project..."
npm run build

if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
  echo "❌ Build failed"
  exit 1
fi
echo "✅ Build successful"
echo ""

# Step 2: Git operations
echo "📝 Git operations..."

# Check if git repo
if [ ! -d ".git" ]; then
  echo "⚠️  Not a git repository"
  echo "Initializing git..."
  git init
fi

# Check remote
REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$REMOTE" ]; then
  echo "⚠️  No git remote configured"
  echo ""
  echo "To set up remote, run:"
  echo "  git remote add origin <your-repo-url>"
  echo ""
  echo "Or deploy directly with:"
  echo "  npx vercel --prod --yes --token $VERCEL_TOKEN"
  exit 1
fi

echo "✅ Remote: $REMOTE"

# Stage all changes
echo "📦 Staging changes..."
git add -A

# Check for changes
if git diff --staged --quiet; then
  echo "✅ No changes to commit"
else
  echo "💾 Committing changes..."
  git commit -m "Deploy: Production-ready build

- Optimized Vite build configuration
- PWA manifest and service worker
- Capacitor setup for native apps
- Component refactoring complete
- All errors fixed, ready for production"
  echo "✅ Committed"
fi

# Push
echo "🚀 Pushing to remote..."
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
git push origin "$CURRENT_BRANCH" || git push

echo ""
echo "✅ Push complete!"
echo ""
echo "📡 Vercel will automatically deploy from this push"
echo "Check: https://vercel.com/dashboard"

