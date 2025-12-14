#!/bin/bash
set -e

cd /Users/leightonbingham/Downloads/magicwork-main

REPO_URL="https://github.com/VelarIQ-AI/magicwork.git"
DEFAULT_BRANCH="main"

echo "=== STEP 1: Building ==="
npm run build

echo "=== STEP 2: Git Init/Commit/Push ==="
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Git repo detected ✅"
else
  echo "No git repo found — initializing..."
  git init
  git branch -M "$DEFAULT_BRANCH"
fi

# Ensure origin remote is set to the provided repo
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REPO_URL"
else
  git remote add origin "$REPO_URL"
fi

git add -A
git commit -m "Build: clean production build" || echo "Nothing to commit"

if ! git push -u origin "$DEFAULT_BRANCH"; then
  echo "❌ Git push failed."
  echo "   - If this repo already has commits, either merge or force-push:"
  echo "     - Merge: git pull origin $DEFAULT_BRANCH --allow-unrelated-histories"
  echo "     - Force (OVERWRITES remote): git push -u origin $DEFAULT_BRANCH --force"
  exit 1
fi

echo "=== STEP 5: Vercel Deploy ==="
if [ -n "$VERCEL_TOKEN" ]; then
  CLEAN_VERCEL_TOKEN="$(printf "%s" "$VERCEL_TOKEN" | tr -d ' ()')"
  if [ -z "$CLEAN_VERCEL_TOKEN" ]; then
    echo "❌ VERCEL_TOKEN was set but became empty after cleanup. Set it to the raw token (no spaces/parentheses)."
    exit 1
  fi
  if [ "$CLEAN_VERCEL_TOKEN" != "$VERCEL_TOKEN" ]; then
    echo "⚠️  Cleaned VERCEL_TOKEN (removed spaces/parentheses) for Vercel CLI compatibility."
  fi
  npx vercel --prod --yes --token "$CLEAN_VERCEL_TOKEN"
else
  echo "⚠️  VERCEL_TOKEN is not set. Trying deploy with your local Vercel login..."
  npx vercel --prod --yes
fi

echo "=== ✅ DEPLOYMENT COMPLETE ==="

