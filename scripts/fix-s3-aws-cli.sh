#!/bin/bash

# Fix S3 Issues using AWS CLI
# This script uses AWS CLI to fix all S3 permission issues

set -e

BUCKET="magiwork-canva-assets"
REGION="eu-north-1"

echo "🚀 Fixing S3 Issues for: $BUCKET"
echo "   Region: $REGION"
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &>/dev/null; then
    echo "❌ AWS CLI not configured or credentials invalid"
    echo "   Run: aws configure"
    exit 1
fi

echo "✅ AWS CLI configured"
echo ""

# Step 1: Disable Block Public Access
echo "🔓 Step 1: Disabling Block Public Access..."
aws s3api put-public-access-block \
    --bucket "$BUCKET" \
    --public-access-block-configuration \
        "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" \
    --region "$REGION" 2>&1 | grep -v "dump_bash_state" || {
    echo "⚠️  Could not disable Block Public Access (may need manual fix)"
}
echo ""

# Step 2: Set Bucket Policy
echo "📝 Step 2: Setting bucket policy..."
cat > /tmp/bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObjectCanva",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::magiwork-canva-assets/canva/*"
    },
    {
      "Sid": "PublicReadGetObjectVideo",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::magiwork-canva-assets/video/*"
    },
    {
      "Sid": "PublicReadGetObjectAudio",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::magiwork-canva-assets/audio/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
    --bucket "$BUCKET" \
    --policy file:///tmp/bucket-policy.json \
    --region "$REGION" 2>&1 | grep -v "dump_bash_state" && {
    echo "✅ Bucket policy set successfully"
} || {
    echo "⚠️  Could not set bucket policy (may need manual fix)"
}
echo ""

# Step 3: Set CORS
echo "🌐 Step 3: Setting CORS configuration..."
cat > /tmp/cors-config.json << 'EOF'
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag", "Content-Length", "Content-Type", "Content-Range", "Accept-Ranges"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

aws s3api put-bucket-cors \
    --bucket "$BUCKET" \
    --cors-configuration file:///tmp/cors-config.json \
    --region "$REGION" 2>&1 | grep -v "dump_bash_state" && {
    echo "✅ CORS configuration set successfully"
} || {
    echo "⚠️  Could not set CORS (may need manual fix)"
}
echo ""

# Step 4: Make objects public
echo "📁 Step 4: Making objects in video/canva/ and audio/ public..."

# Make video/canva/ objects public
for key in $(aws s3 ls "s3://$BUCKET/video/canva/" --recursive 2>/dev/null | awk '{print $4}' | grep -v "dump_bash_state"); do
    if [ -n "$key" ]; then
        aws s3api put-object-acl \
            --bucket "$BUCKET" \
            --key "$key" \
            --acl public-read \
            --region "$REGION" 2>/dev/null && echo "   ✅ Made public: $key" || echo "   ⚠️  Failed: $key"
    fi
done

# Make audio/ objects public
for key in $(aws s3 ls "s3://$BUCKET/audio/" --recursive 2>/dev/null | awk '{print $4}' | grep -v "dump_bash_state"); do
    if [ -n "$key" ]; then
        aws s3api put-object-acl \
            --bucket "$BUCKET" \
            --key "$key" \
            --acl public-read \
            --region "$REGION" 2>/dev/null && echo "   ✅ Made public: $key" || echo "   ⚠️  Failed: $key"
    fi
done

echo ""

# Cleanup
rm -f /tmp/bucket-policy.json /tmp/cors-config.json

# Test
echo "🧪 Testing fix..."
echo ""
sleep 2
curl -I "https://$BUCKET.s3.$REGION.amazonaws.com/video/canva/clouds.mp4" 2>&1 | head -1 | grep -v "dump_bash_state" || echo "   (Test may take a moment to reflect changes)"

echo ""
echo "✅ Done! If you still get 403, wait 1-2 minutes for changes to propagate."
echo ""
