# Connecting AWS S3 to Vercel

This guide will help you configure AWS S3 access for your Vercel deployment so that your application can access video and audio assets stored in S3.

## Prerequisites

- AWS Account with S3 bucket created (`magiwork-canva-assets`)
- AWS Access Key ID and Secret Access Key with S3 permissions
- Vercel project deployed

## Step 1: Get Your AWS Credentials

If you don't have AWS credentials yet:

1. **Go to AWS Console** → **IAM** → **Users**
2. **Create a new user** (or use existing) for Vercel
3. **Attach policies**:
   - `AmazonS3ReadOnlyAccess` (for reading files)
   - Or create a custom policy with these permissions:
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Effect": "Allow",
           "Action": [
             "s3:GetObject",
             "s3:ListBucket"
           ],
           "Resource": [
             "arn:aws:s3:::magiwork-canva-assets",
             "arn:aws:s3:::magiwork-canva-assets/*"
           ]
         }
       ]
     }
     ```
4. **Create Access Key**:
   - Go to **Security credentials** tab
   - Click **Create access key**
   - Choose **Application running outside AWS**
   - **Save both Access Key ID and Secret Access Key** (you won't see the secret again!)

## Step 2: Set Environment Variables in Vercel

1. **Go to your Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your project: `magiwork` (or your project name)

2. **Open Project Settings**
   - Click on your project
   - Go to **Settings** tab
   - Click **Environment Variables** in the left sidebar

3. **Add the following environment variables:**

   | Variable Name | Value | Environment |
   |--------------|-------|-------------|
   | `AWS_ACCESS_KEY_ID` | Your AWS Access Key ID | Production, Preview, Development |
   | `AWS_SECRET_ACCESS_KEY` | Your AWS Secret Access Key | Production, Preview, Development |
   | `AWS_REGION` | `eu-north-1` | Production, Preview, Development |
   | `S3_BUCKET` | `magiwork-canva-assets` | Production, Preview, Development |

   **Important:**
   - ✅ Check all three environments (Production, Preview, Development)
   - ✅ Keep `AWS_SECRET_ACCESS_KEY` secret - never commit it to git
   - ✅ Click **Save** after adding each variable

4. **Verify Variables Are Set**
   - You should see all 4 variables listed
   - Make sure they're enabled for the environments you need

## Step 3: Redeploy Your Application

After setting environment variables, you need to redeploy:

1. **Option A: Automatic Redeploy**
   - Push a new commit to trigger automatic deployment
   ```bash
   git commit --allow-empty -m "Trigger redeploy for S3 env vars"
   git push origin main
   ```

2. **Option B: Manual Redeploy**
   - Go to Vercel Dashboard → Your Project → **Deployments**
   - Click the **⋯** menu on the latest deployment
   - Click **Redeploy**

## Step 4: Verify S3 Access

After redeployment, test that your app can access S3:

1. **Check your application logs** in Vercel:
   - Go to **Deployments** → Click on latest deployment → **Functions** tab
   - Look for any S3-related errors

2. **Test S3 file access** (if you have access to run scripts):
   ```bash
   npm run test-s3-access
   ```

3. **Check browser console** when loading your app:
   - Open browser DevTools → Console
   - Look for any CORS or 403 errors when loading videos/audio

## Step 5: Configure S3 Bucket Permissions

Your S3 bucket needs to be publicly accessible for browser requests. If you haven't done this yet:

### Option A: Using Scripts (Recommended)

Run these scripts locally (they need AWS credentials):

```bash
# Make bucket public
npm run make-s3-public

# Set up CORS
npm run setup-s3-cors
```

### Option B: Manual AWS Console Setup

1. **Make Bucket Public:**
   - Go to AWS S3 Console → `magiwork-canva-assets` bucket
   - **Permissions** tab → **Block public access**
   - Click **Edit** → Uncheck all boxes → **Save**
   - **Bucket Policy** → Add this policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::magiwork-canva-assets/canva/*"
       }
     ]
   }
   ```

2. **Set Up CORS:**
   - **Permissions** tab → **Cross-origin resource sharing (CORS)**
   - Add this configuration:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "HEAD"],
       "AllowedOrigins": ["*"],
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

## Troubleshooting

### Issue: Videos/Audio not loading in production

**Check:**
1. ✅ Environment variables are set in Vercel
2. ✅ Variables are enabled for Production environment
3. ✅ Application has been redeployed after setting variables
4. ✅ S3 bucket is public and CORS is configured
5. ✅ Check Vercel function logs for errors

**Debug:**
- Check Vercel deployment logs: **Deployments** → Latest → **Functions** → Click on function → **Logs**
- Check browser console for CORS errors
- Verify S3 URLs are accessible: Try opening a video URL directly in browser

### Issue: "Access Denied" errors

**Possible causes:**
- AWS credentials don't have S3 read permissions
- Bucket policy doesn't allow public access
- CORS not configured correctly

**Fix:**
- Verify IAM user has `s3:GetObject` and `s3:ListBucket` permissions
- Check bucket policy allows public read access
- Ensure CORS is configured for your domain

### Issue: Environment variables not working

**Check:**
- Variables are set for the correct environment (Production/Preview/Development)
- Application was redeployed after adding variables
- Variable names are exactly: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET`

**Fix:**
- Delete and re-add variables
- Redeploy application
- Check Vercel logs for environment variable errors

## Security Best Practices

1. **Never commit AWS credentials to git**
   - ✅ Use Vercel environment variables
   - ✅ Add `.env` to `.gitignore`
   - ✅ Use IAM user with minimal required permissions

2. **Use separate credentials for different environments**
   - Production: Full access credentials
   - Development: Read-only credentials

3. **Rotate credentials regularly**
   - Change AWS access keys every 90 days
   - Update Vercel environment variables when rotating

4. **Monitor access**
   - Enable AWS CloudTrail to monitor S3 access
   - Check Vercel logs for unauthorized access attempts

## Next Steps

After S3 is connected:

1. ✅ Test video/audio playback in your app
2. ✅ Verify CDN URLs are working (if using CloudFront)
3. ✅ Monitor Vercel function logs for any S3 errors
4. ✅ Set up CloudFront CDN for better performance (optional)

## Additional Resources

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [AWS S3 Public Access Guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html)
- [AWS S3 CORS Configuration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html)
