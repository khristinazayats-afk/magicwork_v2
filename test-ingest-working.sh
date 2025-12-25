#!/bin/bash
# Test ingest with KNOWN WORKING URLs
# These URLs don't have IP blocking

set -e

DEPLOY_URL="${1:-https://magiwork-gdskxmruo-khristinazayats-afks-projects.vercel.app}"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🎵 Testing Audio Ingest with Working URLs${NC}"
echo "Deploy: $DEPLOY_URL"
echo ""

# Test 1: SoundHelix (known to work)
echo -e "${YELLOW}Test 1: SoundHelix MP3${NC}"
RESPONSE=$(curl -s -X POST "$DEPLOY_URL/api/ingest" \
  -H "Content-Type: application/json" \
  -d '{
    "directMp3Url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "title": "SoundHelix Song 1",
    "author": "SoundHelix"
  }')

echo "$RESPONSE"
echo ""

if echo "$RESPONSE" | grep -q "uuid"; then
  UUID=$(echo "$RESPONSE" | grep -o '"uuid":"[^"]*"' | cut -d'"' -f4)
  CDN_URL=$(echo "$RESPONSE" | grep -o '"cdnUrl":"[^"]*"' | cut -d'"' -f4)
  
  echo -e "${GREEN}✓ Success!${NC}"
  echo "UUID: $UUID"
  echo "CDN: $CDN_URL"
  echo ""
  
  echo -e "${YELLOW}Testing CDN delivery...${NC}"
  sleep 2
  
  CDN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -I "$CDN_URL")
  if [ "$CDN_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ CDN delivery working! (HTTP $CDN_STATUS)${NC}"
    echo ""
    echo "File is available at:"
    echo "  $CDN_URL"
  else
    echo -e "${RED}✗ CDN returned HTTP $CDN_STATUS${NC}"
    echo "Note: CloudFront may need 1-2 minutes to propagate"
  fi
else
  echo -e "${RED}✗ Failed!${NC}"
  ERROR=$(echo "$RESPONSE" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
  echo "Error: $ERROR"
fi

echo ""
echo -e "${GREEN}✅ Test complete!${NC}"
echo ""
echo "To test with your own file:"
echo "  1. Upload an MP3 to any public URL"
echo "  2. Run: curl -X POST '$DEPLOY_URL/api/ingest' \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"directMp3Url\": \"YOUR_URL\", \"title\": \"Title\", \"author\": \"Artist\"}'"

