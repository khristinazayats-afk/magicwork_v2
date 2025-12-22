# 🔧 Environment Variables Setup for Content Upload

## Required Environment Variables

Based on your S3 bucket structure, you need these environment variables:

### For Local Development (.env file)

Create a `.env` file in your project root with:

```bash
# AWS Credentials
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=eu-north-1

# S3 Bucket (single bucket for all content)
S3_BUCKET=magicwork-canva-assets

# CDN Configuration
CDN_BASE=https://cdn.magicwork.app
CDN_BASE_URL=https://cdn.magicwork.app
CDN_DOMAIN=https://cdn.magicwork.app

# Database (Supabase)
POSTGRES_URL_NON_POOLING=postgres://postgres.ejhafhggndirnxmwrtgm:MYXp6u8dlToRXXdV@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require
POSTGRES_URL=postgres://postgres.ejhafhggndirnxmwrtgm:MYXp6u8dlToRXXdV@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
```

### For Vercel Deployment

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these for **Production**, **Preview**, and **Development**:

```bash
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=eu-north-1
S3_BUCKET=magicwork-canva-assets
CDN_BASE=https://cdn.magicwork.app
CDN_BASE_URL=https://cdn.magicwork.app
POSTGRES_URL_NON_POOLING=postgres://...
POSTGRES_URL=postgres://...
```

## S3 Bucket Structure

### magicwork-canva-assets (eu-north-1) - Single Bucket for All Content

```
magicwork-canva-assets/
├── audio/
│   ├── Pixabay/        ← MP3 files from Pixabay (capitalized)
│   │   └── *.mp3
│   ├── Gemini/         ← WAV files from Google Gemini (capitalized)
│   │   └── *.wav
│   └── *.wav, *.mp3    ← Audio files from Canva (directly in audio/)
└── video/
    └── canva/          ← Video files from Canva
        └── *.mp4
```

## Important Notes

1. **S3_BUCKET** is used for all content (default: `magicwork-canva-assets`)
2. **CDN_BASE** should point to your CloudFront distribution
3. Bucket is in **eu-north-1** (Stockholm) region
4. All content types (Canva, Pixabay, Gemini) go into the same bucket

## Verification

Test your environment variables:

```bash
# Check AWS credentials and bucket structure
aws s3 ls s3://magicwork-canva-assets/ --recursive

# List audio files
aws s3 ls s3://magicwork-canva-assets/audio/

# List Pixabay audio
aws s3 ls s3://magicwork-canva-assets/audio/Pixabay/

# List Gemini audio
aws s3 ls s3://magicwork-canva-assets/audio/Gemini/

# List video files
aws s3 ls s3://magicwork-canva-assets/video/canva/

# Test database connection
psql $POSTGRES_URL_NON_POOLING -c "SELECT 1;"
```

