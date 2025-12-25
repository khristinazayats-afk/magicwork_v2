#!/bin/bash

# ========================================
# Magiwork S3 Upload Script
# ========================================
# Upload Canva exports to S3 and get CDN URL
#
# Usage: ./upload-to-s3.sh <file> <asset-id>
# Example: ./upload-to-s3.sh ~/Downloads/video.mp4 breathe-to-relax-video

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check arguments
if [ "$#" -ne 2 ]; then
    echo -e "${RED}❌ Error: Wrong number of arguments${NC}"
    echo ""
    echo "Usage: $0 <file> <asset-id>"
    echo ""
    echo "Examples:"
    echo "  $0 ~/Downloads/video.mp4 breathe-to-relax-video"
    echo "  $0 background.png home-hero-image"
    echo ""
    exit 1
fi

FILE=$1
ASSET_ID=$2

# Check file exists
if [ ! -f "$FILE" ]; then
    echo -e "${RED}❌ Error: File not found: $FILE${NC}"
    exit 1
fi

# Get file extension
EXTENSION="${FILE##*.}"
EXTENSION=$(echo "$EXTENSION" | tr '[:upper:]' '[:lower:]')

# Determine content type
case "$EXTENSION" in
    mp4)
        CONTENT_TYPE="video/mp4"
        FOLDER="videos"
        ;;
    webm)
        CONTENT_TYPE="video/webm"
        FOLDER="videos"
        ;;
    png)
        CONTENT_TYPE="image/png"
        FOLDER="images"
        ;;
    jpg|jpeg)
        CONTENT_TYPE="image/jpeg"
        FOLDER="images"
        ;;
    gif)
        CONTENT_TYPE="image/gif"
        FOLDER="images"
        ;;
    mp3)
        CONTENT_TYPE="audio/mpeg"
        FOLDER="audio"
        ;;
    *)
        echo -e "${YELLOW}⚠️  Warning: Unknown extension '$EXTENSION', using application/octet-stream${NC}"
        CONTENT_TYPE="application/octet-stream"
        FOLDER="files"
        ;;
esac

# Build S3 paths
S3_KEY="canva/${FOLDER}/${ASSET_ID}.${EXTENSION}"
S3_URI="s3://magiwork-canva-assets/${S3_KEY}"
CDN_URL="https://d3hajr7xji31qq.cloudfront.net/${S3_KEY}"

# Get file size
FILE_SIZE=$(du -h "$FILE" | cut -f1)

echo ""
echo -e "${BLUE}📦 Uploading to S3...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "File:         $(basename "$FILE")"
echo "Size:         $FILE_SIZE"
echo "Type:         $CONTENT_TYPE"
echo "Asset ID:     $ASSET_ID"
echo "S3 Key:       $S3_KEY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Upload to S3 (with public-read ACL for CDN access)
aws s3 cp "$FILE" "$S3_URI" \
  --region eu-north-1 \
  --content-type "$CONTENT_TYPE" \
  --cache-control "public, max-age=31536000, immutable" \
  --metadata "asset-id=$ASSET_ID" \
  --acl public-read

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Upload successful!${NC}"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}📋 CDN URL (copy this):${NC}"
    echo ""
    echo -e "${GREEN}$CDN_URL${NC}"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "${YELLOW}🔄 Next steps:${NC}"
    echo "1. Copy the CDN URL above"
    echo "2. Open your Google Sheet"
    echo "3. Find row with ID: $ASSET_ID"
    echo "4. Paste CDN URL in 'cdn_url' column"
    echo "5. Set 'status' to 'live'"
    echo "6. Run: npm run cms:sync"
    echo ""
    
    # Copy to clipboard if available
    if command -v pbcopy &> /dev/null; then
        echo "$CDN_URL" | pbcopy
        echo -e "${GREEN}✅ CDN URL copied to clipboard!${NC}"
        echo ""
    fi
else
    echo ""
    echo -e "${RED}❌ Upload failed!${NC}"
    echo ""
    echo "Check:"
    echo "1. AWS credentials are configured (run: aws configure)"
    echo "2. You have access to bucket: magiwork-canva-assets"
    echo "3. Region is correct: eu-north-1"
    echo ""
    exit 1
fi

