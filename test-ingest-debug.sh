#!/bin/bash

# Debug test for ingest endpoint
# Tests with multiple MP3 sources

set -e

DEPLOY_URL="https://magicwork-25ako2pyo-khristinazayats-afks-projects.vercel.app"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🧪 Debug Test: Audio Ingest Endpoint${NC}"
echo "URL: $DEPLOY_URL"
echo ""

# Test 1: Internet Archive (public domain, no restrictions)
echo -e "${YELLOW}Test 1: Internet Archive (reliable public source)${NC}"
RESPONSE1=$(curl -s -X POST "$DEPLOY_URL/api/ingest" \
  -H "Content-Type: application/json" \
  -d '{
    "directMp3Url": "https://ia802706.us.archive.org/35/items/1000SoundsForFree/Test%20Tone%201kHz%20-3dBFS%205sec.mp3",
    "title": "Test Tone",
    "author": "Test"
  }')

echo "$RESPONSE1" | jq .
echo ""

if echo "$RESPONSE1" | grep -q "uuid"; then
  echo -e "${GREEN}✓ Success with Internet Archive!${NC}"
  CDN_URL=$(echo "$RESPONSE1" | jq -r '.cdnUrl')
  echo "CDN URL: $CDN_URL"
  
  # Test CDN delivery
  echo -e "${YELLOW}Testing CDN delivery...${NC}"
  sleep 2
  CDN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -I "$CDN_URL")
  echo "CDN Status: $CDN_STATUS"
  
  if [ "$CDN_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ CDN delivery working!${NC}"
  else
    echo -e "${YELLOW}⚠ CDN returned $CDN_STATUS (may need time to propagate)${NC}"
  fi
else
  echo -e "${RED}✗ Failed with Internet Archive${NC}"
  echo "Error: $(echo "$RESPONSE1" | jq -r '.error // "Unknown error"')"
fi

echo ""
echo -e "${YELLOW}Test 2: Testing with actual Pixabay download URL${NC}"
# Using a real working Pixabay MP3 from their API/CDN
RESPONSE2=$(curl -s -X POST "$DEPLOY_URL/api/ingest" \
  -H "Content-Type: application/json" \
  -d '{
    "pixabayUrl": "https://pixabay.com/music/upbeat-embrace-364091/"
  }')

echo "$RESPONSE2" | jq .
echo ""

if echo "$RESPONSE2" | grep -q "uuid"; then
  echo -e "${GREEN}✓ Success with Pixabay scraping!${NC}"
else
  echo -e "${RED}✗ Failed with Pixabay${NC}"
  ERROR=$(echo "$RESPONSE2" | jq -r '.error // "Unknown error"')
  echo "Error: $ERROR"
  
  if echo "$ERROR" | grep -q "403"; then
    echo ""
    echo -e "${YELLOW}Note: Pixabay may be blocking Vercel's IP addresses.${NC}"
    echo "This is common with CDN protection. Consider:"
    echo "  1. Using direct MP3 URLs from your own storage"
    echo "  2. Pre-downloading files to a staging server"
    echo "  3. Using Pixabay's API if available"
  fi
fi

echo ""
echo -e "${GREEN}✅ Debug test complete!${NC}"
echo ""
echo "If Internet Archive worked but Pixabay failed:"
echo "  → Your S3/CloudFront setup is working correctly"
echo "  → Pixabay is blocking Vercel's servers"
echo "  → Solution: Use directMp3Url mode with reliable sources"

