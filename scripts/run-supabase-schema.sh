#!/bin/bash

# Run Supabase Schema Setup
# This script uses psql to execute the SQL schema

set -e

echo "📊 Setting up Supabase Database Schema..."
echo ""

# Get Postgres URL from environment or use default
POSTGRES_URL="${POSTGRES_URL:-postgres://postgres.pujvtikwdmxlfrqfsjpu:eKKGH2JiMc6u8rT0@aws-1-eu-central-2.pooler.supabase.com:5432/postgres?sslmode=require}"

if [ -z "$POSTGRES_URL" ]; then
  echo "❌ POSTGRES_URL not set"
  echo "   Please set POSTGRES_URL environment variable or edit this script"
  exit 1
fi

SCHEMA_FILE="database/setup_complete_schema.sql"

if [ ! -f "$SCHEMA_FILE" ]; then
  echo "❌ Schema file not found: $SCHEMA_FILE"
  exit 1
fi

echo "🔵 Connecting to Supabase Postgres..."
echo "   File: $SCHEMA_FILE"
echo ""

# Use psql to execute the schema
if command -v psql &> /dev/null; then
  echo "✅ Using psql..."
  psql "$POSTGRES_URL" -f "$SCHEMA_FILE"
  echo ""
  echo "✅ Schema setup complete!"
else
  echo "❌ psql not found. Please install PostgreSQL client tools"
  echo ""
  echo "📋 Alternative: Run SQL manually in Supabase Dashboard:"
  echo "   1. Go to: https://supabase.com/dashboard/project/pujvtikwdmxlfrqfsjpu/sql"
  echo "   2. Open: $SCHEMA_FILE"
  echo "   3. Copy and paste the entire SQL script"
  echo "   4. Click 'Run' to execute"
  exit 1
fi










