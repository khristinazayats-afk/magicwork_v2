#!/bin/bash
set -e

cd /Users/leightonbingham/Downloads/magicwork-main

echo "=== STEP 1: Git Status ===" > /tmp/deploy-log.txt
git status --short >> /tmp/deploy-log.txt 2>&1

echo "" >> /tmp/deploy-log.txt
echo "=== STEP 2: Staging Changes ===" >> /tmp/deploy-log.txt
git add -A >> /tmp/deploy-log.txt 2>&1

echo "" >> /tmp/deploy-log.txt
echo "=== STEP 3: Committing ===" >> /tmp/deploy-log.txt
git commit -m "Fix: Wrap all console statements in dev-only helpers for clean production build" >> /tmp/deploy-log.txt 2>&1 || echo "Nothing to commit or already committed" >> /tmp/deploy-log.txt

echo "" >> /tmp/deploy-log.txt
echo "=== STEP 4: Pushing to Remote ===" >> /tmp/deploy-log.txt
git push >> /tmp/deploy-log.txt 2>&1

echo "" >> /tmp/deploy-log.txt
echo "=== STEP 5: Building ===" >> /tmp/deploy-log.txt
npm run build >> /tmp/deploy-log.txt 2>&1

echo "" >> /tmp/deploy-log.txt
echo "=== STEP 6: Deploying to Vercel ===" >> /tmp/deploy-log.txt
npx vercel --prod --yes --token "$VERCEL_TOKEN" >> /tmp/deploy-log.txt 2>&1

cat /tmp/deploy-log.txt

