#!/bin/bash
# Final Vercel Deployment Script
# Run this script to deploy to Vercel

set -e  # Exit on error

echo "=========================================="
echo "🚀 Vercel Deployment Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="prj_dndWKafuHj6qtj6VAFveIuDaTNq"
VERCEL_TOKEN="${VERCEL_TOKEN:-}"

if [ -z "$VERCEL_TOKEN" ]; then
  echo -e "${RED}❌ VERCEL_TOKEN is not set. Export it, then re-run this script.${NC}"
  echo "   Example: export VERCEL_TOKEN=\"<your_vercel_token>\""
  exit 1
fi

# Step 1: Build
echo -e "${YELLOW}Step 1: Building project...${NC}"
rm -rf dist
npm run build

if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
  echo -e "${RED}❌ Build failed - dist folder or index.html not found${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"
echo ""

# Step 2: Check Vercel CLI
echo -e "${YELLOW}Step 2: Checking Vercel CLI...${NC}"
if ! command -v npx &> /dev/null; then
  echo -e "${RED}❌ npx not found${NC}"
  exit 1
fi

VERCEL_VERSION=$(npx vercel --version 2>&1 || echo "not installed")
echo "Vercel CLI: $VERCEL_VERSION"
echo ""

# Step 3: Link project (if needed)
echo -e "${YELLOW}Step 3: Linking to Vercel project...${NC}"
if [ ! -d ".vercel" ]; then
  echo "Linking to project: $PROJECT_ID"
  echo "$PROJECT_ID" | npx vercel link --yes --token "$VERCEL_TOKEN" 2>&1 || {
    echo -e "${YELLOW}⚠️  Link command had issues, but continuing...${NC}"
  }
else
  echo -e "${GREEN}✅ Already linked to Vercel${NC}"
fi
echo ""

# Step 4: Deploy
echo -e "${YELLOW}Step 4: Deploying to Vercel production...${NC}"
echo "This may take a few minutes..."
echo ""

DEPLOY_OUTPUT=$(npx vercel --prod --yes --token "$VERCEL_TOKEN" 2>&1)
DEPLOY_EXIT_CODE=$?

if [ $DEPLOY_EXIT_CODE -eq 0 ]; then
  echo ""
  echo -e "${GREEN}=========================================="
  echo "✅ Deployment Successful!"
  echo "==========================================${NC}"
  echo ""
  echo "$DEPLOY_OUTPUT" | grep -E "(https://|Production:|Deployed)" || echo "$DEPLOY_OUTPUT"
  echo ""
  echo -e "${GREEN}Your app is now live on Vercel!${NC}"
else
  echo ""
  echo -e "${RED}=========================================="
  echo "❌ Deployment Failed"
  echo "==========================================${NC}"
  echo ""
  echo "$DEPLOY_OUTPUT"
  exit 1
fi

