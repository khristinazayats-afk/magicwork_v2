#!/bin/bash
# Verify deployment status and output to file

OUTPUT_FILE="deployment-status.txt"

cd /Users/leightonbingham/Downloads/magicwork-main

{
  echo "=========================================="
  echo "🚀 Deployment Status Check"
  echo "=========================================="
  echo ""
  echo "Timestamp: $(date)"
  echo ""
  
  echo "📝 Git Status:"
  echo "---"
  git status
  echo ""
  
  echo "📌 Recent Commits:"
  echo "---"
  git log --oneline -5
  echo ""
  
  echo "🔗 Git Remote:"
  echo "---"
  git remote -v
  echo ""
  
  echo "📤 Push Status:"
  echo "---"
  LOCAL=$(git rev-parse @ 2>/dev/null || echo "unknown")
  REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "no-remote")
  echo "Local: $LOCAL"
  echo "Remote: $REMOTE"
  if [ "$LOCAL" = "$REMOTE" ] && [ "$REMOTE" != "no-remote" ]; then
    echo "✅ In sync with remote"
  else
    echo "⚠️  May need to push"
  fi
  echo ""
  
  echo "🚀 Vercel Status:"
  echo "---"
  if [ -d ".vercel" ]; then
    echo "✅ Vercel project linked"
    if [ -f ".vercel/project.json" ]; then
      echo "Project info:"
      cat .vercel/project.json
    fi
  else
    echo "⚠️  Not linked to Vercel"
  fi
  echo ""
  
  echo "📋 Checking Vercel Deployments:"
  echo "---"
  npx vercel ls --token "$VERCEL_TOKEN" 2>&1 | head -20 || echo "Could not fetch deployments"
  echo ""
  
  echo "=========================================="
  echo "✅ Status check complete"
  echo "=========================================="
} > "$OUTPUT_FILE" 2>&1

cat "$OUTPUT_FILE"

