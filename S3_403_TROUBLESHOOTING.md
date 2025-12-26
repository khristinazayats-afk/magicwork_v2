# S3 403 Forbidden - Troubleshooting Guide

## Current Status
```
curl -I https://magicwork-canva-assets.s3.eu-north-1.amazonaws.com/video/canva/clouds.mp4
→ HTTP/1.1 403 Forbidden
```

## Step-by-Step Fix Checklist

### ✅ Step 1: Verify Bucket Policy

1. **Go to AWS S3 Console:**
   - https://console.aws.amazon.com/s3/
   - Click: `magicwork-canva-assets`

2. **Check Bucket Policy:**
   - **Permissions** tab → **Bucket policy**
   - Should have 3 statements for: `canva/*`, `video/*`, `audio/*`
   - If missing, add the policy from `AWS_CONSOLE_S3_FIX.md`

### ✅ Step 2: Verify Block Public Access is OFF

**CRITICAL:** This is the most common cause of 403 errors!

1. **Permissions** tab → **Block public access (bucket settings)**
2. Click **Edit**
3. **ALL 4 boxes MUST be UNCHECKED:**
   ```
   ☐ Block all public access
   ☐ Block public access to buckets and objects granted through new access control lists (ACLs)
   ☐ Block public access to buckets and objects granted through any access control lists (ACLs)
   ☐ Block public access to buckets and objects granted through new public bucket or access point policies
   ☐ Block public and cross-account access to buckets and objects through any public bucket or access point policies
   ```
4. Click **Save changes**
5. Type `confirm` → Click **Confirm**

### ✅ Step 3: Check Object-Level Permissions

The file itself might be set to private:

1. **Go to the file:**
   - In S3 bucket, navigate to: `video/canva/clouds.mp4`
   - Click on the file name

2. **Check Permissions:**
   - Click **Permissions** tab
   - Under **Access control list (ACL)**, check:
     - **Public access** should show "Public read" or similar
     - If it says "Private", click **Edit** and grant public read access

3. **Alternative: Make all objects in folder public:**
   - Select the `video/canva/` folder
   - Click **Actions** → **Make public using ACL**

### ✅ Step 4: Verify File Path

Make sure the file actually exists at that path:

1. In S3 Console, navigate to: `video/canva/`
2. Verify `clouds.mp4` exists
3. Check the exact path - might be:
   - `video/canva/clouds.mp4` ✅
   - `videos/canva/clouds.mp4` (with 's')
   - `canva/video/clouds.mp4` (different structure)

### ✅ Step 5: Test After Each Change

After making changes, wait 30-60 seconds, then test:

```bash
curl -I https://magicwork-canva-assets.s3.eu-north-1.amazonaws.com/video/canva/clouds.mp4
```

Expected: `HTTP/1.1 200 OK`

## Quick Fix Commands (If You Have AWS CLI)

If you have AWS CLI installed with proper permissions:

```bash
# Make bucket public
aws s3api put-bucket-policy --bucket magicwork-canva-assets --policy file://bucket-policy.json

# Make objects public
aws s3 cp s3://magicwork-canva-assets/video/canva/clouds.mp4 s3://magicwork-canva-assets/video/canva/clouds.mp4 --acl public-read
```

## Alternative Solution: Use CloudFront CDN

Instead of fixing S3 direct access, use CloudFront CDN URLs which are:
- ✅ Faster
- ✅ Don't require bucket public access
- ✅ Better for production

### Check if CloudFront is configured:

```bash
curl -I https://d3hajr7xji31qq.cloudfront.net/video/canva/clouds.mp4
```

If this works, update your database to use CloudFront URLs instead of S3 direct URLs.

### Update Database to Use CloudFront:

```bash
cd /Users/ksvarychevska/git-practice
NODE_TLS_REJECT_UNAUTHORIZED=0 node -e "
import('pg').then(({Pool}) => {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
  });
  pool.query(\"UPDATE content_assets SET cdn_url = REPLACE(cdn_url, 'magicwork-canva-assets.s3.eu-north-1.amazonaws.com', 'd3hajr7xji31qq.cloudfront.net') WHERE cdn_url LIKE '%s3.eu-north-1.amazonaws.com%'\").then(() => {
    console.log('✅ Updated all S3 URLs to CloudFront');
    pool.end();
  });
});
"
```

## Most Common Issue: Block Public Access

**90% of 403 errors are caused by "Block public access" being enabled.**

Even if you set a bucket policy, if Block Public Access is ON, it will override the policy and return 403.

**Fix:**
1. Permissions → Block public access → Edit
2. **Uncheck ALL 4 boxes**
3. Save → Confirm

## Verification Checklist

After making changes, verify:

- [ ] Bucket policy has 3 statements (canva/*, video/*, audio/*)
- [ ] Block public access - ALL 4 boxes unchecked
- [ ] CORS configuration is set
- [ ] Object-level permissions allow public read
- [ ] File exists at correct path: `video/canva/clouds.mp4`
- [ ] Waited 1-2 minutes for changes to propagate
- [ ] Tested with `curl -I` command

## Still Getting 403?

1. **Check AWS Account Permissions:**
   - Make sure you're logged into the correct AWS account
   - Verify you have permission to modify bucket settings

2. **Try CloudFront Instead:**
   - CloudFront URLs work even if S3 is private
   - Update database to use CloudFront URLs

3. **Check File Location:**
   - Verify the exact S3 path in AWS Console
   - The path might be different than expected

4. **Contact AWS Support:**
   - If you're the bucket owner but still can't make it public
   - There might be organization-level restrictions
