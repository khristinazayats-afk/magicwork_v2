#!/bin/bash
cd /Users/leightonbingham/Downloads/magicwork-main

echo "=== Checking Git Status ==="
git status --short

echo ""
echo "=== Checking for uncommitted changes ==="
git diff --stat

echo ""
echo "=== Last 3 commits ==="
git log --oneline -3

echo ""
echo "=== Checking remote ==="
git remote -v

echo ""
echo "=== Staging all changes ==="
git add -A
git status --short

echo ""
echo "=== Committing changes ==="
git commit -m "Fix: Wrap all console statements in dev-only helpers for clean production build" || echo "Nothing to commit"

echo ""
echo "=== Pushing to remote ==="
git push 2>&1

echo ""
echo "=== Building project ==="
npm run build 2>&1 | tail -20

echo ""
echo "=== Deploying to Vercel ==="
npx vercel --prod --yes --token "$VERCEL_TOKEN" 2>&1 | tail -30
