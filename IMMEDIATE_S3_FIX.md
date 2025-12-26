# IMMEDIATE FIX: S3 403 Forbidden Error

## The Problem
```
curl -I https://magicwork-canva-assets.s3.eu-north-1.amazonaws.com/video/canva/clouds.mp4
→ HTTP/1.1 403 Forbidden
```

## Most Likely Cause: Block Public Access is ON

**This is the #1 cause of 403 errors!** Even if you set a bucket policy, if "Block public access" is enabled, it will override everything.

## Quick Fix (5 minutes)

### 1. Go to AWS S3 Console
**Link:** https://console.aws.amazon.com/s3/buckets/magicwork-canva-assets?region=eu-north-1&tab=permissions

### 2. Disable Block Public Access (CRITICAL!)

1. Click **Permissions** tab
2. Scroll to **Block public access (bucket settings)**
3. Click **Edit**
4. **UNCHECK ALL 4 BOXES:**
   - ☐ Block all public access
   - ☐ Block public access to buckets and objects granted through new access control lists (ACLs)
   - ☐ Block public access to buckets and objects granted through any access control lists (ACLs)
   - ☐ Block public access to buckets and objects granted through new public bucket or access point policies
   - ☐ Block public and cross-account access to buckets and objects through any public bucket or access point policies
5. Click **Save changes**
6. Type `confirm` → Click **Confirm**

### 3. Add Bucket Policy

1. Still in **Permissions** tab
2. Scroll to **Bucket policy**
3. Click **Edit**
4. **Paste this (replace everything):**

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

5. Click **Save changes**

### 4. Make Objects Public (If Still 403)

1. In S3 Console, navigate to: `video/canva/clouds.mp4`
2. Click on the file
3. Click **Permissions** tab
4. Under **Access control list (ACL)**, click **Edit**
5. Check **Read** under **Everyone (public access)**
6. Click **Save changes**

**OR** make the entire folder public:
1. Select the `video/canva/` folder
2. Click **Actions** → **Make public using ACL**

### 5. Test Again

Wait 30-60 seconds, then test:

```bash
curl -I https://magicwork-canva-assets.s3.eu-north-1.amazonaws.com/video/canva/clouds.mp4
```

**Expected:** `HTTP/1.1 200 OK`

## If Still 403 After All Steps

### Option A: Verify File Exists
1. In S3 Console, check if file exists at: `video/canva/clouds.mp4`
2. If path is different (e.g., `videos/canva/` with 's'), update the URL

### Option B: Use CloudFront CDN
If S3 direct access won't work, use CloudFront URLs instead. Update your database:

```bash
cd /Users/ksvarychevska/git-practice
NODE_TLS_REJECT_UNAUTHORIZED=0 node -e "
import('pg').then(({Pool}) => {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
  });
  pool.query(\"UPDATE content_assets SET cdn_url = REPLACE(cdn_url, 'magicwork-canva-assets.s3.eu-north-1.amazonaws.com', 'd3hajr7xji31qq.cloudfront.net') WHERE cdn_url LIKE '%s3.eu-north-1.amazonaws.com%'\").then(() => {
    console.log('✅ Updated URLs to CloudFront');
    pool.end();
  });
});
"
```

## Quick Checklist

- [ ] Block public access - ALL 4 boxes unchecked ✅
- [ ] Bucket policy added with 3 statements ✅
- [ ] Object-level permissions set to public ✅
- [ ] Waited 1-2 minutes for changes to propagate ✅
- [ ] Tested with curl command ✅

## Direct AWS Console Links

- **Bucket Permissions:** https://console.aws.amazon.com/s3/buckets/magicwork-canva-assets?region=eu-north-1&tab=permissions
- **Block Public Access:** https://console.aws.amazon.com/s3/buckets/magicwork-canva-assets?region=eu-north-1&tab=permissions&bucketPolicy=true
