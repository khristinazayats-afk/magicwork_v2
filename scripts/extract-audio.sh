#!/bin/bash

# ========================================
# Extract Audio from Video
# ========================================
# Extracts audio track from MP4 video files
#
# Usage: ./scripts/extract-audio.sh <video-file> [output-file]
# Example: ./scripts/extract-audio.sh ~/Downloads/video.mp4 ~/Downloads/audio.mp3

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}❌ Error: ffmpeg is not installed${NC}"
    echo ""
    echo "Install ffmpeg:"
    echo "  macOS: brew install ffmpeg"
    echo "  Ubuntu: sudo apt install ffmpeg"
    echo "  Windows: Download from https://ffmpeg.org/download.html"
    exit 1
fi

# Check arguments
if [ "$#" -lt 1 ]; then
    echo -e "${RED}❌ Error: Missing video file${NC}"
    echo ""
    echo "Usage: $0 <video-file> [output-file]"
    echo ""
    echo "Examples:"
    echo "  $0 ~/Downloads/video.mp4"
    echo "  $0 ~/Downloads/video.mp4 ~/Downloads/audio.mp3"
    echo ""
    exit 1
fi

VIDEO_FILE=$1
OUTPUT_FILE=${2:-${VIDEO_FILE%.*}.mp3}

# Check video file exists
if [ ! -f "$VIDEO_FILE" ]; then
    echo -e "${RED}❌ Error: Video file not found: $VIDEO_FILE${NC}"
    exit 1
fi

# Get file size
VIDEO_SIZE=$(du -h "$VIDEO_FILE" | cut -f1)

echo ""
echo -e "${BLUE}🎵 Extracting audio from video...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Video:        $(basename "$VIDEO_FILE")"
echo "Size:         $VIDEO_SIZE"
echo "Output:       $(basename "$OUTPUT_FILE")"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Extract audio using ffmpeg
ffmpeg -i "$VIDEO_FILE" \
  -vn \
  -acodec libmp3lame \
  -ab 192k \
  -ar 44100 \
  -y \
  "$OUTPUT_FILE" \
  2>&1 | grep -E "(Duration|Stream|Output)" || true

if [ $? -eq 0 ]; then
    AUDIO_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo ""
    echo -e "${GREEN}✅ Audio extracted successfully!${NC}"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}📋 Output file:${NC}"
    echo ""
    echo -e "${GREEN}$OUTPUT_FILE${NC}"
    echo "Size: $AUDIO_SIZE"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "${YELLOW}🔄 Next steps:${NC}"
    echo "1. Upload video: ./upload-to-s3.sh \"$VIDEO_FILE\" <visual-asset-id>"
    echo "2. Upload audio: ./upload-to-s3.sh \"$OUTPUT_FILE\" <audio-asset-id>"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Extraction failed!${NC}"
    echo ""
    echo "Check:"
    echo "1. Video file has audio track"
    echo "2. ffmpeg has proper codecs installed"
    echo ""
    exit 1
fi

