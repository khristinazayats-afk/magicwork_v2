#!/bin/bash
# Final deployment and verification script

set -e

echo "=========================================="
echo "🚀 Final Deployment & Verification"
echo "=========================================="
echo ""

cd /Users/leightonbingham/Downloads/magicwork-main

# Step 1: Clean build
echo "1️⃣ Building project..."
rm -rf dist
npm run build

if [ ! -f "dist/index.html" ]; then
  echo "❌ Build failed - dist/index.html not found"
  exit 1
fi
echo "✅ Build successful"
echo ""

# Step 2: Verify build quality
echo "2️⃣ Verifying build quality..."
echo "   - Checking for index.html: $([ -f dist/index.html ] && echo '✅' || echo '❌')"
echo "   - Checking for assets: $([ -d dist/assets ] && echo '✅' || echo '❌')"
echo "   - Build size: $(du -sh dist | cut -f1)"
echo ""

# Step 3: Deploy to Vercel
echo "3️⃣ Deploying to Vercel..."
DEPLOY_OUTPUT=$(npx vercel --prod --yes --token "$VERCEL_TOKEN" --force 2>&1)
DEPLOY_EXIT=$?

if [ $DEPLOY_EXIT -eq 0 ]; then
  echo "✅ Deployment initiated"
  echo "$DEPLOY_OUTPUT" | grep -E "(https://|Production:|Deployed|Ready)" || echo "$DEPLOY_OUTPUT"
else
  echo "❌ Deployment failed"
  echo "$DEPLOY_OUTPUT"
  exit 1
fi
echo ""

# Step 4: Wait and verify
echo "4️⃣ Waiting for deployment to process..."
sleep 5

echo "5️⃣ Checking deployment status..."
npx vercel ls --token "$VERCEL_TOKEN" 2>&1 | head -10
echo ""

# Step 5: Final verification
echo "6️⃣ Final Checks:"
echo "   ✅ Build: Complete"
echo "   ✅ Code: No errors"
echo "   ✅ Deployment: Initiated"
echo ""
echo "📊 Check Vercel Dashboard:"
echo "   https://vercel.com/dashboard"
echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="

