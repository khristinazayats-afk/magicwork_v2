#!/bin/bash
set -e

cd /Users/leightonbingham/Downloads/magicwork-main

echo "=========================================="
echo "DEPLOYMENT VERIFICATION AND PUSH SCRIPT"
echo "=========================================="
echo ""

echo "1. Checking git status..."
git status

echo ""
echo "2. Staging all changes..."
git add -A
git status --short

echo ""
echo "3. Committing changes..."
git commit -m "Fix: Wrap all console statements in dev-only helpers for clean production build" || echo "Nothing new to commit"

echo ""
echo "4. Building project..."
npm run build

echo ""
echo "5. Checking build output..."
if [ -f "dist/index.html" ]; then
    echo "✅ Build successful - dist/index.html exists"
    ls -lh dist/index.html
else
    echo "❌ Build failed - dist/index.html not found"
    exit 1
fi

echo ""
echo "6. Pushing to git remote..."
git push

echo ""
echo "7. Deploying to Vercel..."
npx vercel --prod --yes --token "$VERCEL_TOKEN"

echo ""
echo "=========================================="
echo "✅ DEPLOYMENT COMPLETE"
echo "=========================================="

