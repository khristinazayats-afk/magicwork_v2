#!/bin/bash

echo "🧪 Testing Audio Ingest Endpoint"
DEPLOY_URL="https://magiwork.vercel.app"
echo "Deploy URL: $DEPLOY_URL"

echo ""
echo "Test 1: Direct MP3 URL (with metadata)"
curl -X POST "$DEPLOY_URL/api/ingest" \
  -H "Content-Type: application/json" \
  -d '{
    "directMp3Url": "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3",
    "title": "Bell Ring Test",
    "author": "Test Artist"
  }' | jq '.'

echo ""
echo "Test 2: S3 Staging URL (if you have one)"
curl -X POST "$DEPLOY_URL/api/ingest" \
  -H "Content-Type: application/json" \
  -d '{
    "directMp3Url": "https://magiwork-staging.s3.amazonaws.com/test-track.mp3",
    "title": "S3 Test Track",
    "author": "S3 Test"
  }' | jq '.'

echo ""
echo "✅ Testing complete!"
echo ""
echo "Next steps:"
echo "1. Check S3 bucket: aws s3 ls s3://magiwork-prod-assets/tracks/ --recursive"
echo "2. Test in browser: Open the CDN URL in a browser"
echo "3. Check Vercel logs: npx vercel logs"