#!/bin/bash
set -e

cd /Users/leightonbingham/Downloads/magicwork-main

echo "=========================================="
echo "COMPLETE DEPLOYMENT - All Console Statements Fixed"
echo "=========================================="
echo ""

echo "Step 1: Building project..."
if npm run build; then
    echo "✅ Build successful"
else
    echo "❌ Build failed!"
    exit 1
fi
echo ""

echo "Step 2: Staging all changes..."
git add -A
echo ""

echo "Step 3: Committing..."
git commit -m "Fix: Wrap all console statements in dev-only helpers for clean production build" || echo "Nothing new to commit"
echo ""

echo "Step 4: Pushing to remote..."
if git push; then
    echo "✅ Git push successful"
else
    echo "❌ Git push failed!"
    exit 1
fi
echo ""

echo "Step 5: Deploying to Vercel..."
if npx vercel --prod --yes --token "$VERCEL_TOKEN"; then
    echo "✅ Vercel deployment successful"
else
    echo "❌ Vercel deployment failed!"
    exit 1
fi
echo ""

echo "=========================================="
echo "✅ DEPLOYMENT COMPLETE - All Done!"
echo "=========================================="

