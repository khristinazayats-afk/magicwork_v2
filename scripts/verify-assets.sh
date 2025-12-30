#!/bin/bash

# MagicWork Asset Verification Script
# Checks that all required assets have been generated successfully

set -e

echo "🔍 MagicWork Asset Verification"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

check_directory() {
  local dir=$1
  local expected_count=$2
  local description=$3
  
  if [ ! -d "$dir" ]; then
    echo -e "${RED}❌ Missing directory: $dir${NC}"
    return 1
  fi
  
  local actual_count=$(find "$dir" -type f \( -name "*.jpg" -o -name "*.png" -o -name "*.mp3" -o -name "*.wav" \) | wc -l)
  
  if [ "$actual_count" -ge "$expected_count" ]; then
    echo -e "${GREEN}✅ $description: $actual_count assets (expected $expected_count+)${NC}"
    return 0
  else
    echo -e "${RED}❌ $description: Only $actual_count assets found (expected $expected_count+)${NC}"
    return 1
  fi
}

echo -e "${BLUE}Checking generated assets...${NC}"
echo ""

all_good=true

# Check practice previews
if ! check_directory "public/assets/practice-previews" 9 "Practice previews"; then
  all_good=false
fi

# Check meditation previews
if ! check_directory "public/assets/meditation-previews" 27 "Meditation previews"; then
  all_good=false
fi

# Check badges
if ! check_directory "public/assets/badges" 10 "Achievement badges"; then
  all_good=false
fi

echo ""
echo -e "${BLUE}Checking API endpoints...${NC}"
echo ""

# Check API files exist
apis=("generate-ambient" "generate-image" "generate-practice" "generate-preview" "generate-video" "generate-voice")

for api in "${apis[@]}"; do
  if [ -f "api/$api.js" ]; then
    echo -e "${GREEN}✅ API endpoint exists: $api${NC}"
  else
    echo -e "${RED}❌ Missing API endpoint: $api${NC}"
    all_good=false
  fi
done

echo ""
echo -e "${BLUE}Checking npm scripts...${NC}"
echo ""

# Check package.json for scripts
required_scripts=("generate:all" "generate:previews" "generate:meditations" "generate:themed" "generate-badges")

for script in "${required_scripts[@]}"; do
  if grep -q "\"$script\":" package.json; then
    echo -e "${GREEN}✅ npm script exists: $script${NC}"
  else
    echo -e "${RED}❌ Missing npm script: $script${NC}"
    all_good=false
  fi
done

echo ""
echo -e "${BLUE}Checking initialization scripts...${NC}"
echo ""

if [ -f "scripts/init-assets.sh" ]; then
  echo -e "${GREEN}✅ Asset initialization script exists${NC}"
else
  echo -e "${RED}❌ Missing scripts/init-assets.sh${NC}"
  all_good=false
fi

if [ -f "ASSET_GENERATION.md" ]; then
  echo -e "${GREEN}✅ Asset generation documentation exists${NC}"
else
  echo -e "${RED}❌ Missing ASSET_GENERATION.md${NC}"
  all_good=false
fi

echo ""
echo "================================"

if [ "$all_good" = true ]; then
  echo -e "${GREEN}✨ All verifications passed!${NC}"
  echo ""
  echo "Ready to develop and deploy."
  exit 0
else
  echo -e "${RED}⚠️  Some assets are missing!${NC}"
  echo ""
  echo "Run: npm run generate:all"
  echo "to generate all missing assets."
  exit 1
fi
