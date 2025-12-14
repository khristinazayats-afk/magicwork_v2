#!/bin/bash
# Check Vercel deployment status after git push

echo "🔍 Checking Vercel Deployment Status..."
echo ""

cd /Users/leightonbingham/Downloads/magicwork-main

# 1. Check if git push happened
echo "1️⃣ Checking Git Status:"
echo "----------------------"
git status
echo ""
git log --oneline -1
echo ""

# 2. Check if remote is configured
echo "2️⃣ Checking Git Remote:"
echo "----------------------"
git remote -v
echo ""

# 3. Check if pushed to remote
echo "3️⃣ Checking Push Status:"
echo "----------------------"
LOCAL=$(git rev-parse @ 2>/dev/null)
REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "")
if [ -n "$REMOTE" ] && [ "$LOCAL" = "$REMOTE" ]; then
  echo "✅ Code is pushed to remote"
else
  echo "⚠️  Code may not be pushed yet"
  echo "   Run: git push"
fi
echo ""

# 4. Check Vercel project link
echo "4️⃣ Checking Vercel Project:"
echo "----------------------"
if [ -d ".vercel" ]; then
  echo "✅ Vercel project is linked"
  if [ -f ".vercel/project.json" ]; then
    echo "Project details:"
    cat .vercel/project.json | python3 -m json.tool 2>/dev/null || cat .vercel/project.json
  fi
else
  echo "⚠️  Not linked to Vercel"
  echo "   Run: npx vercel link"
fi
echo ""

# 5. List recent deployments
echo "5️⃣ Recent Vercel Deployments:"
echo "----------------------"
npx vercel ls --token "$VERCEL_TOKEN" 2>&1 | head -15 || echo "Could not fetch deployments"
echo ""

# 6. Check latest deployment
echo "6️⃣ Latest Deployment Info:"
echo "----------------------"
npx vercel inspect --token "$VERCEL_TOKEN" 2>&1 | head -20 || echo "Could not inspect deployment"
echo ""

echo "✅ Status check complete!"
echo ""
echo "📊 To check in browser:"
echo "   https://vercel.com/dashboard"
echo "   Look for project: magicwork"

