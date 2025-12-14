#!/bin/bash
cd /Users/leightonbingham/Downloads/magicwork-main

echo "Building..."
npm run build || exit 1

echo "Committing..."
git add -A
git commit -m "Fix: Wrap all console statements in dev-only helpers for clean production build" || echo "Nothing to commit"

echo "Pushing..."
git push || exit 1

echo "Deploying to Vercel..."
npx vercel --prod --yes --token "$VERCEL_TOKEN" || exit 1

echo "✅ Done!"

