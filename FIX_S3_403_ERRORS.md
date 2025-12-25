# Fix S3 403 Forbidden Errors

## Problem
Videos are getting 403 Forbidden errors when trying to load from S3:
- `https://magiwork-canva-assets.s3.eu-north-1.amazonaws.com/video/canva/clouds.mp4` → 403

## Root Cause
The S3 bucket policy only allows access to `canva/*` but videos are stored at `video/canva/*` and `audio/*`.

## Solution

### Step 1: Update S3 Bucket Policy

Run the updated script to allow access to all necessary paths:

```bash
npm run make-s3-public
```

This will update the bucket policy to allow:
- `canva/*` (existing)
- `video/*` (NEW - for video/canva/* paths)
- `audio/*` (NEW - for audio files)

### Step 2: Verify S3 CORS Configuration

```bash
npm run setup-s3-cors
```

### Step 3: Check AWS Console (Manual Option)

If scripts don't work, manually update in AWS Console:

1. Go to **AWS S3 Console** → `magiwork-canva-assets` bucket
2. **Permissions** tab → **Bucket policy**
3. Replace with this policy:

```json
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
```

4. **Block public access** settings:
   - Go to **Permissions** → **Block public access**
   - Click **Edit**
   - **Uncheck all 4 boxes** (allow public access)
   - Click **Save**

### Step 4: Test Access

After updating, test the URLs:

```bash
curl -I https://magiwork-canva-assets.s3.eu-north-1.amazonaws.com/video/canva/clouds.mp4
```

Should return `200 OK` instead of `403 Forbidden`.

## Alternative: Use CloudFront CDN

If S3 direct access continues to have issues, ensure CloudFront is properly configured and use CDN URLs instead of direct S3 URLs.

The database should store CloudFront URLs like:
- `https://d3hajr7xji31qq.cloudfront.net/video/canva/clouds.mp4`

Instead of:
- `https://magiwork-canva-assets.s3.eu-north-1.amazonaws.com/video/canva/clouds.mp4`
