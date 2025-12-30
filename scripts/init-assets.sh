#!/bin/bash

# MagicWork Asset Initialization Script
# Generates all required images, badges, and previews for the meditation app
# Run this after cloning the repository to populate all visual assets

set -e  # Exit on error

echo "🚀 MagicWork Asset Generation Pipeline"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo -e "${YELLOW}❌ Error: package.json not found!${NC}"
  echo "Please run this script from the project root directory"
  exit 1
fi

echo -e "${BLUE}📦 Installing dependencies if needed...${NC}"
if [ ! -d "node_modules" ]; then
  npm install
fi

echo ""
echo -e "${BLUE}🎨 Generating all assets...${NC}"
echo ""

# Generate practice preview gradients
echo -e "${BLUE}Step 1: Generating practice preview images...${NC}"
npm run generate:previews
echo -e "${GREEN}✅ Practice previews complete${NC}"
echo ""

# Generate meditation preview images
echo -e "${BLUE}Step 2: Generating meditation preview images...${NC}"
npm run generate:meditations
echo -e "${GREEN}✅ Meditation previews complete${NC}"
echo ""

# Generate themed meditation images
echo -e "${BLUE}Step 3: Generating themed meditation images...${NC}"
npm run generate:themed
echo -e "${GREEN}✅ Themed meditations complete${NC}"
echo ""

# Generate achievement badges
echo -e "${BLUE}Step 4: Generating achievement badges...${NC}"
npm run generate-badges
echo -e "${GREEN}✅ Badges complete${NC}"
echo ""

echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ All assets generated successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "📁 Generated assets location:"
echo "   • Practice previews: public/assets/practice-previews/ (9 images)"
echo "   • Meditation previews: public/assets/meditation-previews/ (27 images)"
echo "   • Achievement badges: public/assets/badges/ (10 images)"
echo ""
echo "🚀 You can now start the dev server:"
echo "   npm run dev"
echo ""
