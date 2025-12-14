#!/bin/bash

# ========================================
# Upload Content Set (Visual + Audio)
# ========================================
# Uploads both visual and audio files for a content set
#
# Usage: ./scripts/upload-content-set.sh <visual-file> <audio-file> <content-set-id>
# Example: ./scripts/upload-content-set.sh video.mp4 audio.mp3 breathe-set-001

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check arguments
if [ "$#" -ne 3 ]; then
    echo -e "${RED}❌ Error: Wrong number of arguments${NC}"
    echo ""
    echo "Usage: $0 <visual-file> <audio-file> <content-set-id>"
    echo ""
    echo "Examples:"
    echo "  $0 ~/Downloads/video.mp4 ~/Downloads/audio.mp3 breathe-set-001"
    echo "  $0 image.png sound.mp3 morning-set-001"
    echo ""
    exit 1
fi

VISUAL_FILE=$1
AUDIO_FILE=$2
CONTENT_SET_ID=$3

# Check files exist
if [ ! -f "$VISUAL_FILE" ]; then
    echo -e "${RED}❌ Error: Visual file not found: $VISUAL_FILE${NC}"
    exit 1
fi

if [ ! -f "$AUDIO_FILE" ]; then
    echo -e "${RED}❌ Error: Audio file not found: $AUDIO_FILE${NC}"
    exit 1
fi

# Generate asset IDs
VISUAL_ASSET_ID="${CONTENT_SET_ID}-visual"
AUDIO_ASSET_ID="${CONTENT_SET_ID}-audio"

echo ""
echo -e "${BLUE}📦 Uploading Content Set: $CONTENT_SET_ID${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Upload visual
echo -e "${YELLOW}1️⃣  Uploading visual asset...${NC}"
./upload-to-s3.sh "$VISUAL_FILE" "$VISUAL_ASSET_ID"
VISUAL_CDN_URL=$(./upload-to-s3.sh "$VISUAL_FILE" "$VISUAL_ASSET_ID" 2>&1 | grep -o 'https://[^ ]*' | head -1)

echo ""
echo -e "${YELLOW}2️⃣  Uploading audio asset...${NC}"
./upload-to-s3.sh "$AUDIO_FILE" "$AUDIO_ASSET_ID"
AUDIO_CDN_URL=$(./upload-to-s3.sh "$AUDIO_FILE" "$AUDIO_ASSET_ID" 2>&1 | grep -o 'https://[^ ]*' | head -1)

echo ""
echo -e "${GREEN}✅ Content set uploaded successfully!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📋 CDN URLs:${NC}"
echo ""
echo -e "${GREEN}Visual:${NC}"
echo "$VISUAL_CDN_URL"
echo ""
echo -e "${GREEN}Audio:${NC}"
echo "$AUDIO_CDN_URL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}🔄 Next steps:${NC}"
echo "1. Open your Google Sheet"
echo "2. Add two rows for this content set:"
echo ""
echo "   Row 1 (Visual):"
echo "   - id: $VISUAL_ASSET_ID"
echo "   - content_set_id: $CONTENT_SET_ID"
echo "   - asset_role: visual"
echo "   - paired_asset_id: $AUDIO_ASSET_ID"
echo "   - cdn_url: $VISUAL_CDN_URL"
echo ""
echo "   Row 2 (Audio):"
echo "   - id: $AUDIO_ASSET_ID"
echo "   - content_set_id: $CONTENT_SET_ID"
echo "   - asset_role: audio"
echo "   - paired_asset_id: $VISUAL_ASSET_ID"
echo "   - cdn_url: $AUDIO_CDN_URL"
echo ""
echo "3. Set status to 'live' for both"
echo "4. Run: npm run cms:sync"
echo ""

