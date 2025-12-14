# Generate Vibe Badge Images

This guide will help you generate AI-powered animal badge images using DALL-E 3.

## Prerequisites

1. **OpenAI API Key**
   - Get your API key from: https://platform.openai.com/api-keys
   - You'll need credits in your OpenAI account (DALL-E 3 costs ~$0.04 per image)

## Setup

1. **Add your OpenAI API key to `.env` file:**

```bash
# Create or edit .env file in the project root
echo "OPENAI_API_KEY=sk-your-key-here" >> .env
```

Or manually add this line to your `.env` file:
```
OPENAI_API_KEY=sk-your-actual-key-here
```

## Generate Images

Run the generation script:

```bash
npm run generate-badges
```

Or directly:
```bash
node scripts/generate-badge-images.js
```

## What It Does

The script will:
1. Generate 10 unique animal illustrations using DALL-E 3
2. Each image is designed with:
   - Minimal, soft aesthetic
   - Magicwork brand colors (Mint #94D1C4, Orange #FFAF42, Purple #BDB2CD)
   - Playful, rounded shapes
   - White background, centered composition
3. Save images to `/public/assets/badges/` directory
4. Images will be automatically used in the test component

## Cost Estimate

- DALL-E 3: ~$0.04 per image
- 10 badges: ~$0.40 total
- Images are 1024x1024px, high quality

## View Results

After generation, refresh your test page:
```
http://localhost:4000/?test=vibe-badges
```

The component will automatically load the generated images from `/public/assets/badges/`.

## Troubleshooting

**"Missing credentials" error:**
- Make sure `.env` file exists in project root
- Verify `OPENAI_API_KEY` is set correctly
- Restart terminal/IDE after adding env variable

**Rate limiting:**
- DALL-E 3 has rate limits
- Script waits 2 seconds between requests
- If you hit limits, wait a few minutes and retry

**Image quality:**
- If images don't match the aesthetic, you can regenerate individual badges
- Edit prompts in `scripts/generate-badge-images.js` to adjust style










