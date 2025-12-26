#!/bin/bash

# ========================================
# Magicwork Pipeline Verification Script
# ========================================

echo "🔍 Verifying Magicwork Pipeline Setup..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
echo "1️⃣  Checking .env file..."
if [ -f .env ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
else
    echo -e "${RED}❌ .env file not found${NC}"
    echo "   Create it using: touch .env"
    echo "   Then copy contents from YOUR_ENV_SETUP.md"
    exit 1
fi

# Load .env
export $(cat .env | grep -v '^#' | xargs)

# Check required variables
echo ""
echo "2️⃣  Checking environment variables..."

REQUIRED_VARS=(
    "POSTGRES_URL"
    "AWS_ACCESS_KEY_ID"
    "AWS_SECRET_ACCESS_KEY"
    "AWS_REGION"
    "S3_BUCKET"
    "CDN_BASE_URL"
    "GOOGLE_SHEET_ID"
    "GOOGLE_SHEET_NAME"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Missing: $var${NC}"
        MISSING_VARS+=("$var")
    else
        # Hide sensitive values
        if [[ "$var" == *"SECRET"* ]] || [[ "$var" == *"PASSWORD"* ]]; then
            echo -e "${GREEN}✅ $var is set (hidden)${NC}"
        else
            echo -e "${GREEN}✅ $var: ${!var}${NC}"
        fi
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}⚠️  Missing ${#MISSING_VARS[@]} required variable(s)${NC}"
    echo "   Please add them to your .env file"
    exit 1
fi

# Test PostgreSQL connection
echo ""
echo "3️⃣  Testing PostgreSQL connection..."
if psql "$POSTGRES_URL" -c "SELECT NOW();" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL connected successfully${NC}"
    
    # Check if content_assets table exists
    TABLE_EXISTS=$(psql "$POSTGRES_URL" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'content_assets');" 2>/dev/null | xargs)
    
    if [ "$TABLE_EXISTS" == "t" ]; then
        echo -e "${GREEN}✅ content_assets table exists${NC}"
    else
        echo -e "${YELLOW}⚠️  content_assets table not found${NC}"
        echo "   Run: npm run cms:setup"
    fi
else
    echo -e "${RED}❌ PostgreSQL connection failed${NC}"
    echo "   Check your POSTGRES_URL in .env"
fi

# Test Google Sheets access
echo ""
echo "4️⃣  Testing Google Sheets access..."
SHEET_URL="https://docs.google.com/spreadsheets/d/$GOOGLE_SHEET_ID/gviz/tq?tqx=out:csv&sheet=$GOOGLE_SHEET_NAME"

if curl -s -f "$SHEET_URL" > /dev/null; then
    echo -e "${GREEN}✅ Google Sheets accessible${NC}"
    
    # Count rows
    ROW_COUNT=$(curl -s "$SHEET_URL" | wc -l | xargs)
    echo "   Found $ROW_COUNT rows (including header)"
    
    if [ "$ROW_COUNT" -lt 2 ]; then
        echo -e "${YELLOW}⚠️  No data rows found in sheet${NC}"
        echo "   Add content rows to your Google Sheet"
    fi
else
    echo -e "${RED}❌ Cannot access Google Sheets${NC}"
    echo "   Make sure your sheet is publicly readable"
    echo "   URL: https://docs.google.com/spreadsheets/d/$GOOGLE_SHEET_ID/edit"
fi

# Test AWS S3 access (if AWS CLI is available)
echo ""
echo "5️⃣  Testing AWS S3 access..."
if command -v aws &> /dev/null; then
    # Configure AWS CLI temporarily
    export AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID"
    export AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY"
    export AWS_DEFAULT_REGION="$AWS_REGION"
    
    if aws s3 ls "s3://$S3_BUCKET" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ AWS S3 bucket accessible${NC}"
        
        # Count objects
        OBJECT_COUNT=$(aws s3 ls "s3://$S3_BUCKET" --recursive 2>/dev/null | wc -l | xargs)
        echo "   Bucket has $OBJECT_COUNT object(s)"
    else
        echo -e "${RED}❌ Cannot access S3 bucket${NC}"
        echo "   Check your AWS credentials and bucket name"
    fi
else
    echo -e "${YELLOW}⚠️  AWS CLI not installed (optional)${NC}"
    echo "   Install with: brew install awscli"
fi

# Test CDN
echo ""
echo "6️⃣  Testing CloudFront CDN..."
if curl -s -f -I "$CDN_BASE_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ CloudFront CDN accessible${NC}"
else
    echo -e "${YELLOW}⚠️  CDN may not be ready or configured${NC}"
    echo "   URL: $CDN_BASE_URL"
fi

# Check npm dependencies
echo ""
echo "7️⃣  Checking npm dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules installed${NC}"
else
    echo -e "${YELLOW}⚠️  node_modules not found${NC}"
    echo "   Run: npm install"
fi

# Final summary
echo ""
echo "========================================="
echo "📊 SUMMARY"
echo "========================================="

if [ ${#MISSING_VARS[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All environment variables configured${NC}"
    echo ""
    echo "🚀 Ready to sync! Run:"
    echo "   npm run cms:sync"
else
    echo -e "${RED}❌ Setup incomplete${NC}"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Fill in missing environment variables"
    echo "   2. Run this script again"
    echo "   3. See YOUR_ENV_SETUP.md for details"
fi

echo ""

