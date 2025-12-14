#!/bin/bash
set -e

cd /Users/leightonbingham/Downloads/magicwork-main

echo "=========================================="
echo "FINAL DEPLOYMENT - Clean Build"
echo "=========================================="
echo ""

echo "1. Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
echo "✅ Build successful"
echo ""

echo "2. Staging changes..."
git add -A
echo ""

echo "3. Committing..."
git commit -m "Fix: Wrap all console statements in dev-only helpers for clean production build" || echo "Nothing to commit"
echo ""

echo "4. Pushing to remote..."
git push
if [ $? -ne 0 ]; then
    echo "❌ Git push failed!"
    exit 1
fi
echo "✅ Git push successful"
echo ""

echo "5. Deploying to Vercel..."
npx vercel --prod --yes --token "$VERCEL_TOKEN"
if [ $? -ne 0 ]; then
    echo "❌ Vercel deployment failed!"
    exit 1
fi
echo "✅ Vercel deployment successful"
echo ""

echo "=========================================="
echo "✅ DEPLOYMENT COMPLETE"
echo "=========================================="

