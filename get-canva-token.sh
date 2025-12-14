#!/bin/bash

# Get Canva Access Token
# This exchanges your Client ID and Secret for an access token

echo "🔑 Getting Canva Access Token..."
echo ""

RESPONSE=$(curl -s -X POST https://api.canva.com/rest/v1/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=OC-AZrF8HYc5n6T" \
  -d "client_secret=cnvcavgda3OexHwJb6d_wjA_0kefV_Fc3h3NzDbdwcsVXx14fd152309")

echo "Response:"
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo ""

# Try to extract access token
ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.access_token' 2>/dev/null)

if [ "$ACCESS_TOKEN" != "null" ] && [ ! -z "$ACCESS_TOKEN" ]; then
    echo "✅ Success! Your access token:"
    echo ""
    echo "$ACCESS_TOKEN"
    echo ""
    echo "Add this to your .env file:"
    echo "CANVA_API_KEY=$ACCESS_TOKEN"
else
    echo "❌ Failed to get access token"
    echo ""
    echo "Possible issues:"
    echo "1. Check your Client ID and Secret are correct"
    echo "2. Make sure your Canva app has the right scopes enabled"
    echo "3. Verify your app is approved and active"
fi

