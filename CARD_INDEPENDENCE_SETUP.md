# Card Independence Setup Guide

## Overview
Each of the 4 cards in every space is now **completely independent**. You can edit one card without affecting the others.

## What Changed

### 1. Database Structure
- **New Table**: `practice_cards` stores individual card data
- Each space has 4 cards (index 0-3)
- Each card has its own:
  - `title` - Card title (e.g., "Slow Morning - Card 1")
  - `description` - Card description text
  - `guidance` - Optional guidance text
  - `is_practice_of_day` - Whether this is the practice of the day
  - `practice_type` - Type of practice (ambient, guided, sound)
  - `duration_minutes` - Optional duration hint
  - `video_asset_id` - Link to specific video asset
  - `audio_asset_id` - Link to specific audio asset

### 2. API Endpoints
- **GET** `/api/practice-cards?space=SpaceName` - Get all cards for a space
- **GET** `/api/practice-cards?space=SpaceName&index=0` - Get specific card
- **POST** `/api/practice-cards` - Create/update a card
- **PUT** `/api/practice-cards` - Update a card

### 3. Frontend Changes
- **New Hook**: `usePracticeCards()` fetches card data
- **Updated**: `PracticesTab.jsx` now uses individual card data
- Each card displays its own title and description

## Setup Instructions

### Step 1: Run Database Migration
```bash
# Connect to your database and run:
psql $POSTGRES_URL < database/migrations/create_practice_cards_table.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `database/migrations/create_practice_cards_table.sql`
3. Run the query

### Step 2: Verify Cards Were Created
The migration automatically creates 4 default cards for each space:
- Slow Morning (Cards 0-3)
- Gentle De-Stress (Cards 0-3)
- Take a Walk (Cards 0-3)
- Draw Your Feels (Cards 0-3)
- Move and Cool (Cards 0-3)
- Tap to Ground (Cards 0-3)
- Breathe to Relax (Cards 0-3)
- Get in the Flow State (Cards 0-3)
- Drift into Sleep (Cards 0-3)

**Total: 36 cards** (9 spaces × 4 cards)

### Step 3: Edit Individual Cards

#### Via API
```bash
# Update Card 0 for "Slow Morning"
curl -X PUT https://your-api.com/api/practice-cards \
  -H "Content-Type: application/json" \
  -d '{
    "space_name": "Slow Morning",
    "card_index": 0,
    "title": "Morning Meditation",
    "description": "Start your day with gentle awareness.",
    "guidance": "Find a comfortable position and breathe naturally."
  }'
```

#### Via Database (Supabase)
1. Go to Table Editor → `practice_cards`
2. Filter by `space_name = "Slow Morning"` and `card_index = 0`
3. Edit the `title`, `description`, etc.
4. Save

### Step 4: Test in App
1. Start the app: `npm run dev`
2. Navigate to any space (e.g., "Slow Morning")
3. Click "Join"
4. You should see 4 cards, each with its own title/description
5. Edit a card in the database and refresh - only that card should change

## Card Data Structure

```javascript
{
  id: 1,
  space_name: "Slow Morning",
  card_index: 0,  // 0, 1, 2, or 3
  title: "Morning Meditation",
  description: "Start your day with gentle awareness.",
  guidance: "Find a comfortable position and breathe naturally.",
  is_practice_of_day: false,
  practice_type: "ambient",
  duration_minutes: null,
  video_asset_id: "video-asset-id-123",
  audio_asset_id: "audio-asset-id-456",
  status: "active",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z"
}
```

## Editing Cards

### Example: Make Each Card Unique

**Card 0 (Morning Meditation)**
```sql
UPDATE practice_cards
SET 
  title = 'Morning Meditation',
  description = 'Start your day with gentle awareness and intention.',
  guidance = 'Find a comfortable position. Take three deep breaths.'
WHERE space_name = 'Slow Morning' AND card_index = 0;
```

**Card 1 (Breathwork Practice)**
```sql
UPDATE practice_cards
SET 
  title = 'Breathwork Practice',
  description = 'Connect with your breath to center yourself.',
  guidance = 'Inhale for 4 counts, exhale for 6 counts.'
WHERE space_name = 'Slow Morning' AND card_index = 1;
```

**Card 2 (Body Scan)**
```sql
UPDATE practice_cards
SET 
  title = 'Body Scan',
  description = 'Bring awareness to each part of your body.',
  guidance = 'Start at your toes and slowly move up to your head.'
WHERE space_name = 'Slow Morning' AND card_index = 2;
```

**Card 3 (Gratitude Practice)**
```sql
UPDATE practice_cards
SET 
  title = 'Gratitude Practice',
  description = 'Reflect on what you are grateful for today.',
  guidance = 'Name three things you are grateful for.'
WHERE space_name = 'Slow Morning' AND card_index = 3;
```

## Benefits

✅ **Independent Editing**: Edit one card without affecting others
✅ **Unique Content**: Each card can have its own title, description, guidance
✅ **Flexible**: Link specific videos/audio to specific cards
✅ **Scalable**: Easy to add more cards or modify existing ones
✅ **Database-Driven**: All card data stored in database, easy to manage

## Troubleshooting

### Cards Not Showing Individual Data
1. Check database: `SELECT * FROM practice_cards WHERE space_name = 'Slow Morning';`
2. Verify API: `curl https://your-api.com/api/practice-cards?space=Slow%20Morning`
3. Check browser console for errors
4. Ensure migration ran successfully

### Default Cards Still Showing
- Cards use defaults if database fetch fails
- Check network tab for API errors
- Verify `POSTGRES_URL` is set correctly

### Cards Sharing Data
- Ensure `getAllItems()` uses `practiceCards[index]` not `station.name`
- Check that `usePracticeCards` hook is being called
- Verify cards array has 4 items

## Next Steps

1. ✅ Run migration
2. ✅ Test with default cards
3. ✅ Edit individual cards
4. ✅ Verify changes appear in app
5. ✅ Customize all 36 cards as needed

---

*Each card is now its own entity - edit freely!*


