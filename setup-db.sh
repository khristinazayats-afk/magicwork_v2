#!/bin/bash
# Alternative method: Setup database using Vercel CLI

echo "📦 Setting up Vercel Postgres database..."
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "❌ psql not found. Please install PostgreSQL client tools."
    echo "   Or use the Vercel dashboard SQL Editor instead."
    exit 1
fi

echo "✅ Vercel CLI found"
echo ""
echo "📝 Steps:"
echo "1. Run: vercel link (if not already linked)"
echo "2. Get POSTGRES_URL from Vercel dashboard:"
echo "   Storage → Your DB → Settings → Connection String"
echo "3. Run: export POSTGRES_URL='your-connection-string'"
echo "4. Run: psql \$POSTGRES_URL < api/db/schema.sql"
echo ""
echo "Or use the Vercel dashboard SQL Editor (easier method above) ✅"

