#!/bin/bash
# Simple test for ingest endpoint
# Usage: ./test-ingest-simple.sh <your-domain>
# Example: ./test-ingest-simple.sh magicwork.app

if [ -z "$1" ]; then
  echo "Usage: ./test-ingest-simple.sh <your-domain>"
  echo "Example: ./test-ingest-simple.sh magicwork.app"
  exit 1
fi

DOMAIN="$1"
URL="https://$DOMAIN/api/ingest"

echo "Testing: $URL"
echo ""

curl -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d '{
    "directMp3Url": "https://cdn.pixabay.com/download/audio/2024/11/12/audio_6ebe85e3ef.mp3",
    "title": "Test Track",
    "author": "Test Artist"
  }' | jq .

