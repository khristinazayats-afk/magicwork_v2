# Fix S3 Permissions in AWS Console - Step by Step

Since your AWS credentials don't have permission to update bucket policies, you need to do this manually in AWS Console.

## Step 1: Update Bucket Policy

1. **Go to AWS Console:**
   - Open: https://console.aws.amazon.com/s3/
   - Click on bucket: `magicwork-canva-assets`

2. **Open Permissions Tab:**
   - Click **Permissions** tab (at the top)

3. **Edit Bucket Policy:**
   - Scroll down to **Bucket policy** section
   - Click **Edit** button

4. **Paste This Policy (Replace Everything):**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObjectCanva",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::magicwork-canva-assets/canva/*"
    },
    {
      "Sid": "PublicReadGetObjectVideo",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::magicwork-canva-assets/video/*"
    },
    {
      "Sid": "PublicReadGetObjectAudio",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::magicwork-canva-assets/audio/*"
    }
  ]
}
```

5. **Click Save changes**

## Step 2: Disable Block Public Access

1. **Still in Permissions Tab:**
   - Scroll to **Block public access (bucket settings)** section
   - Click **Edit** button

2. **Uncheck ALL 4 boxes:**
   - ☐ Block all public access
   - ☐ Block public access to buckets and objects granted through new access control lists (ACLs)
   - ☐ Block public access to buckets and objects granted through any access control lists (ACLs)
   - ☐ Block public access to buckets and objects granted through new public bucket or access point policies
   - ☐ Block public and cross-account access to buckets and objects through any public bucket or access point policies

3. **Click Save changes**
4. **Type `confirm` in the confirmation box**
5. **Click Confirm**

## Step 3: Update CORS Configuration

1. **Still in Permissions Tab:**
   - Scroll to **Cross-origin resource sharing (CORS)** section
   - Click **Edit** button

2. **Paste This CORS Configuration (Replace Everything):**

```json
[
  {
    "AllowedHeaders": [
      "*"
    ],
    "AllowedMethods": [
      "GET",
      "HEAD"
    ],
    "AllowedOrigins": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag",
      "Content-Length",
      "Content-Type",
      "Content-Range",
      "Accept-Ranges"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

3. **Click Save changes**

## Step 4: Verify It Works

After saving, test the video URL:

```bash
curl -I https://magicwork-canva-assets.s3.eu-north-1.amazonaws.com/video/canva/clouds.mp4
```

**Expected Result:**
```
HTTP/1.1 200 OK
```

**If you still get 403:**
- Wait 1-2 minutes (S3 changes can take a moment to propagate)
- Check that you unchecked ALL 4 boxes in Block public access
- Verify the bucket policy JSON is correct (no syntax errors)

## Quick Copy-Paste Checklist

✅ Bucket Policy updated with 3 statements (canva/*, video/*, audio/*)
✅ Block public access - ALL 4 boxes unchecked
✅ CORS configuration updated
✅ Tested video URL returns 200 OK

## Troubleshooting

### Still Getting 403 After Changes?

1. **Check Bucket Policy Syntax:**
   - Make sure JSON is valid (no trailing commas, proper quotes)
   - Use a JSON validator if unsure

2. **Verify Block Public Access:**
   - All 4 boxes MUST be unchecked
   - Changes take effect immediately but may take 1-2 minutes to propagate

3. **Check Object-Level Permissions:**
   - Go to the actual file: `video/canva/clouds.mp4`
   - Click **Permissions** tab
   - Make sure it's not set to "Private" at object level

4. **Try CloudFront URL Instead:**
   - If S3 direct access still fails, use CloudFront CDN URL:
   - `https://d3hajr7xji31qq.cloudfront.net/video/canva/clouds.mp4`

## Alternative: Use CloudFront CDN

If S3 direct access continues to have issues, you can use CloudFront CDN URLs instead. Update the database to use CloudFront URLs:

- CloudFront URL: `https://d3hajr7xji31qq.cloudfront.net/video/canva/clouds.mp4`
- Instead of: `https://magicwork-canva-assets.s3.eu-north-1.amazonaws.com/video/canva/clouds.mp4`

CloudFront URLs don't require bucket public access and are faster.
