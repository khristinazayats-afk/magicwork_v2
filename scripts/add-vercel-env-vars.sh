#!/bin/bash

# Script to add environment variables to Vercel using Vercel CLI
# Usage: VERCEL_TOKEN=your_token ./scripts/add-vercel-env-vars.sh
# Or: export VERCEL_TOKEN=your_token && ./scripts/add-vercel-env-vars.sh

set -e

PROJECT_ID="prj_Jzeqro18ZIkV8tJPcTkHaHoacjtU"

# Check if VERCEL_TOKEN is set
if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ VERCEL_TOKEN environment variable is not set!"
    echo ""
    echo "Please set your Vercel token in one of these ways:"
    echo "1. VERCEL_TOKEN=your_token ./scripts/add-vercel-env-vars.sh"
    echo "2. export VERCEL_TOKEN=your_token && ./scripts/add-vercel-env-vars.sh"
    echo ""
    echo "Get your token from: https://vercel.com/account/tokens"
    exit 1
fi

echo "🔧 Setting environment variables for project: $PROJECT_ID"
echo "📝 Variables to set: ELEVENLABS_API_KEY, HIGGSFIELD_API_KEY_ID, HIGGSFIELD_API_KEY_SECRET"
echo ""

# Export token for vercel CLI
export VERCEL_TOKEN

# Set ELEVENLABS_API_KEY
echo "Setting ELEVENLABS_API_KEY..."
echo "sk_654d070bd8fe7043b341bbc4d0b1b35cbe75eb2e8930bdf8" | VERCEL_TOKEN="$VERCEL_TOKEN" npx vercel env add ELEVENLABS_API_KEY production --yes
echo "sk_654d070bd8fe7043b341bbc4d0b1b35cbe75eb2e8930bdf8" | VERCEL_TOKEN="$VERCEL_TOKEN" npx vercel env add ELEVENLABS_API_KEY preview --yes
echo "sk_654d070bd8fe7043b341bbc4d0b1b35cbe75eb2e8930bdf8" | VERCEL_TOKEN="$VERCEL_TOKEN" npx vercel env add ELEVENLABS_API_KEY development --yes
echo "✅ ELEVENLABS_API_KEY set for all environments"
echo ""

# Set HIGGSFIELD_API_KEY_ID
echo "Setting HIGGSFIELD_API_KEY_ID..."
echo "a04c96c9-c475-4c8e-870f-750389b1180f" | VERCEL_TOKEN="$VERCEL_TOKEN" npx vercel env add HIGGSFIELD_API_KEY_ID production --yes
echo "a04c96c9-c475-4c8e-870f-750389b1180f" | VERCEL_TOKEN="$VERCEL_TOKEN" npx vercel env add HIGGSFIELD_API_KEY_ID preview --yes
echo "a04c96c9-c475-4c8e-870f-750389b1180f" | VERCEL_TOKEN="$VERCEL_TOKEN" npx vercel env add HIGGSFIELD_API_KEY_ID development --yes
echo "✅ HIGGSFIELD_API_KEY_ID set for all environments"
echo ""

# Set HIGGSFIELD_API_KEY_SECRET
echo "Setting HIGGSFIELD_API_KEY_SECRET..."
echo "48f7adf01dc11f69df3cf21d3e2f8b3c53b760ccd732b0e24bb5ddc5fc563580" | VERCEL_TOKEN="$VERCEL_TOKEN" npx vercel env add HIGGSFIELD_API_KEY_SECRET production --yes
echo "48f7adf01dc11f69df3cf21d3e2f8b3c53b760ccd732b0e24bb5ddc5fc563580" | VERCEL_TOKEN="$VERCEL_TOKEN" npx vercel env add HIGGSFIELD_API_KEY_SECRET preview --yes
echo "48f7adf01dc11f69df3cf21d3e2f8b3c53b760ccd732b0e24bb5ddc5fc563580" | VERCEL_TOKEN="$VERCEL_TOKEN" npx vercel env add HIGGSFIELD_API_KEY_SECRET development --yes
echo "✅ HIGGSFIELD_API_KEY_SECRET set for all environments"
echo ""

echo "🎉 All environment variables set successfully!"
echo ""
echo "⚠️  Important: You may need to redeploy your project for changes to take effect."
echo "   Go to: https://vercel.com/dashboard -> Your Project -> Deployments -> Redeploy"
