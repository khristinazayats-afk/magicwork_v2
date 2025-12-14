#!/bin/bash
set -e

cd /Users/leightonbingham/Downloads/magicwork-main

LOG_FILE="deployment-log-$(date +%Y%m%d-%H%M%S).txt"

echo "==========================================" | tee -a "$LOG_FILE"
echo "DEPLOYMENT VERIFICATION AND PUSH" | tee -a "$LOG_FILE"
echo "Started: $(date)" | tee -a "$LOG_FILE"
echo "==========================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

echo "1. Checking git status..." | tee -a "$LOG_FILE"
git status >> "$LOG_FILE" 2>&1 || echo "Git status check failed" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

echo "2. Staging all changes..." | tee -a "$LOG_FILE"
git add -A >> "$LOG_FILE" 2>&1
git status --short >> "$LOG_FILE" 2>&1
echo "" | tee -a "$LOG_FILE"

echo "3. Committing changes..." | tee -a "$LOG_FILE"
git commit -m "Fix: Wrap all console statements in dev-only helpers for clean production build" >> "$LOG_FILE" 2>&1 || echo "Nothing new to commit or commit failed" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

echo "4. Building project..." | tee -a "$LOG_FILE"
npm run build >> "$LOG_FILE" 2>&1
BUILD_EXIT=$?
if [ $BUILD_EXIT -eq 0 ]; then
    echo "✅ Build successful" | tee -a "$LOG_FILE"
else
    echo "❌ Build failed with exit code $BUILD_EXIT" | tee -a "$LOG_FILE"
    exit 1
fi
echo "" | tee -a "$LOG_FILE"

echo "5. Verifying build output..." | tee -a "$LOG_FILE"
if [ -f "dist/index.html" ]; then
    echo "✅ dist/index.html exists" | tee -a "$LOG_FILE"
    ls -lh dist/index.html >> "$LOG_FILE" 2>&1
else
    echo "❌ dist/index.html not found" | tee -a "$LOG_FILE"
    exit 1
fi
echo "" | tee -a "$LOG_FILE"

echo "6. Pushing to git remote..." | tee -a "$LOG_FILE"
git push >> "$LOG_FILE" 2>&1
PUSH_EXIT=$?
if [ $PUSH_EXIT -eq 0 ]; then
    echo "✅ Git push successful" | tee -a "$LOG_FILE"
else
    echo "❌ Git push failed with exit code $PUSH_EXIT" | tee -a "$LOG_FILE"
    cat "$LOG_FILE" | tail -20
    exit 1
fi
echo "" | tee -a "$LOG_FILE"

echo "7. Deploying to Vercel..." | tee -a "$LOG_FILE"
npx vercel --prod --yes --token "$VERCEL_TOKEN" >> "$LOG_FILE" 2>&1
VERCEL_EXIT=$?
if [ $VERCEL_EXIT -eq 0 ]; then
    echo "✅ Vercel deployment successful" | tee -a "$LOG_FILE"
else
    echo "❌ Vercel deployment failed with exit code $VERCEL_EXIT" | tee -a "$LOG_FILE"
    cat "$LOG_FILE" | tail -30
    exit 1
fi
echo "" | tee -a "$LOG_FILE"

echo "==========================================" | tee -a "$LOG_FILE"
echo "✅ DEPLOYMENT COMPLETE" | tee -a "$LOG_FILE"
echo "Completed: $(date)" | tee -a "$LOG_FILE"
echo "Log file: $LOG_FILE" | tee -a "$LOG_FILE"
echo "==========================================" | tee -a "$LOG_FILE"

# Show last 30 lines of log
echo ""
echo "Last 30 lines of deployment log:"
tail -30 "$LOG_FILE"

