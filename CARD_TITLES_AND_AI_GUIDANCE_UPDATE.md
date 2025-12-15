# Card Titles and AI Guidance Update

## Summary
Updated all practice cards with correct titles matching their videos, added AI-generated meditation guidance option, and created migration scripts for Supabase.

## Changes Made

### 1. Card Titles Updated
- All 3 spaces (Slow Morning, Gentle De-Stress, Drift into Sleep) now have 4 cards each with correct titles:
  - **Card 0**: "Gentle Clouds" - Drift away with gentle clouds moving across the sky.
  - **Card 1**: "Soothing Rain" - Find calm in the gentle rhythm of falling rain.
  - **Card 2**: "Calm Waves" - Let ocean waves wash away tension and stress.
  - **Card 3**: "Peaceful Forest" - Immerse yourself in the tranquility of nature.

### 2. Supabase Migration
- **SQL Migration**: `database/migrations/update_practice_cards_titles.sql`
  - Updates all 12 cards (3 spaces × 4 cards) with correct titles and descriptions
  - Uses `ON CONFLICT` to update existing cards or create new ones
  
- **Node.js Script**: `scripts/update-practice-cards-titles.js`
  - Can be run to update Supabase directly
  - Requires `POSTGRES_URL_NON_POOLING` or `POSTGRES_URL` environment variable

### 3. AI Meditation Guidance
- **New API Endpoint**: `api/ai-meditation-guidance.js`
  - Generates personalized meditation scripts based on:
    - Space name (Slow Morning, Gentle De-Stress, Drift into Sleep)
    - Card title (Gentle Clouds, Soothing Rain, etc.)
    - Duration (minutes)
    - Voice preference (soft-female, warm-male, neutral-calm)
  - Returns structured script with timed segments
  - **Note**: TTS (Text-to-Speech) integration is ready but needs OpenAI/ElevenLabs API key

- **Voice Options Updated**: `src/constants/voiceAudioOptions.js`
  - Added "AI Guided Meditation" option with 🧘 icon
  - Soft, gentle voice that guides users through meditation
  - Flagged with `isAI: true` for special handling

- **Practice Flow Integration**: `src/components/in-the-space/PracticesTab.jsx`
  - Updated `startVoiceGuidance` to handle AI-generated guidance
  - When user selects "AI Guided Meditation":
    1. Calls `/api/ai-meditation-guidance` with space, card, and duration
    2. Receives structured script with timed segments
    3. Uses Web Speech API to speak each segment at the right time
    4. Falls back to default guidance if API fails

## Next Steps

### 1. Run Supabase Migration
```bash
# Option 1: Run SQL directly in Supabase Dashboard
# Copy contents of database/migrations/update_practice_cards_titles.sql
# Paste into SQL Editor and run

# Option 2: Run Node.js script
node scripts/update-practice-cards-titles.js
```

### 2. Set Up AI TTS (Optional - for future enhancement)
The AI guidance API currently returns script text. To generate actual audio:
1. Add OpenAI API key or ElevenLabs API key to environment variables
2. Update `api/ai-meditation-guidance.js` to call TTS service
3. Return audio URL instead of just script text
4. Update frontend to play audio URL instead of using Web Speech API

### 3. Test AI Guidance
1. Select any practice card
2. Choose a duration (5, 10, 15, 20, or 30 minutes)
3. Select "AI Guided Meditation" as the audio option
4. Start practice - you should hear gentle, timed meditation guidance

## Files Changed
- ✅ `database/migrations/update_practice_cards_titles.sql` (new)
- ✅ `scripts/update-practice-cards-titles.js` (new)
- ✅ `api/ai-meditation-guidance.js` (new)
- ✅ `src/constants/voiceAudioOptions.js` (updated)
- ✅ `src/components/in-the-space/PracticesTab.jsx` (updated)

## Deployment Status
- ✅ Changes committed to git
- ✅ Changes pushed to GitHub
- ✅ Vercel will auto-deploy from GitHub push

