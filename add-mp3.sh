#!/bin/bash

# Helper script to add MP3 file to the project
# Usage: ./add-mp3.sh /path/to/your/embrace-364091.mp3

echo "🎵 MagicWork - Add MP3 File Helper"
echo "===================================="
echo ""

if [ -z "$1" ]; then
    echo "❌ Error: Please provide the path to your MP3 file"
    echo ""
    echo "Usage:"
    echo "  ./add-mp3.sh /path/to/embrace-364091.mp3"
    echo ""
    echo "Examples:"
    echo "  ./add-mp3.sh ~/Downloads/embrace-364091.mp3"
    echo "  ./add-mp3.sh ~/Desktop/embrace-364091.mp3"
    echo ""
    exit 1
fi

MP3_FILE="$1"
TARGET_DIR="public/Feed_mp3"
TARGET_FILE="$TARGET_DIR/embrace-364091.mp3"

# Check if source file exists
if [ ! -f "$MP3_FILE" ]; then
    echo "❌ Error: File not found: $MP3_FILE"
    exit 1
fi

# Check if it's an mp3 file
if [[ ! "$MP3_FILE" == *.mp3 ]]; then
    echo "⚠️  Warning: File doesn't have .mp3 extension"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Copy file
echo "📂 Copying file to project..."
cp "$MP3_FILE" "$TARGET_FILE"

if [ $? -eq 0 ]; then
    echo "✅ File copied successfully!"
    echo ""
    
    # Show file info
    FILE_SIZE=$(ls -lh "$TARGET_FILE" | awk '{print $5}')
    echo "📊 File Details:"
    echo "   Location: $TARGET_FILE"
    echo "   Size: $FILE_SIZE"
    echo ""
    
    # Check if file size is large
    FILE_SIZE_BYTES=$(stat -f%z "$TARGET_FILE" 2>/dev/null || stat -c%s "$TARGET_FILE" 2>/dev/null)
    if [ "$FILE_SIZE_BYTES" -gt 10485760 ]; then  # 10 MB
        echo "⚠️  Warning: File is larger than 10 MB"
        echo "   Consider compressing it for faster deployment"
        echo ""
    fi
    
    echo "📝 Next Steps:"
    echo "   1. Update artist info in public/data/stations.json"
    echo "   2. Test locally: npm run dev"
    echo "   3. Deploy: git add . && git commit -m 'Add mp3 file' && git push"
    echo ""
else
    echo "❌ Error: Failed to copy file"
    exit 1
fi

