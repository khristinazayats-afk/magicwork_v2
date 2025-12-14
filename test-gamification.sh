#!/bin/bash
# Test script for gamification API
# Usage: ./test-gamification.sh [production-url]

API_BASE="${1:-http://localhost:3000}"
USER_ID="test-user-$(date +%s)"

echo "🧪 Testing Gamification API"
echo "📍 API Base: $API_BASE"
echo "👤 User ID: $USER_ID"
echo ""

# Test 1: Practice complete
echo "1️⃣ Testing practice_complete..."
RESPONSE=$(curl -s -X POST "$API_BASE/api/events" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_ID\",
    \"event_type\": \"practice_complete\",
    \"metadata\": {
      \"space\": \"Slow Morning\",
      \"duration\": 120
    }
  }")

echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Test 2: Share post
echo "2️⃣ Testing share_post..."
RESPONSE=$(curl -s -X POST "$API_BASE/api/events" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_ID\",
    \"event_type\": \"share_post\",
    \"metadata\": {
      \"space\": \"Gentle De-Stress\",
      \"privacy\": \"public\"
    }
  }")

echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Test 3: Light send
echo "3️⃣ Testing light_send..."
RESPONSE=$(curl -s -X POST "$API_BASE/api/events" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_ID\",
    \"event_type\": \"light_send\",
    \"metadata\": {}
  }")

echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Test 4: Tune play
echo "4️⃣ Testing tune_play (60 seconds)..."
RESPONSE=$(curl -s -X POST "$API_BASE/api/events" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_ID\",
    \"event_type\": \"tune_play\",
    \"metadata\": {
      \"duration_sec\": 60
    }
  }")

echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Test 5: Get progress
echo "5️⃣ Testing GET /api/progress..."
RESPONSE=$(curl -s "$API_BASE/api/progress?user_id=$USER_ID")
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

echo "✅ Tests complete!"
