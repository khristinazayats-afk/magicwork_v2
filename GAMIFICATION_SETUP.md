# Gamification System Setup

## Overview

A minimal, reliable rewards system that awards Light Points (LP) for mindful behaviors, tracks Presence Streaks, and triggers milestone achievements.

## Database Setup

### 1. Create Vercel Postgres Database

1. Go to your Vercel project dashboard
2. Navigate to Storage → Create Database → Postgres
3. Create a new Postgres database
4. Copy the connection string (POSTGRES_URL)

### 2. Run Database Schema

Run the SQL schema in `api/db/schema.sql` to create the required tables:

```sql
-- Run this in your Vercel Postgres SQL editor or via psql
```

The schema creates three tables:
- `events` - Records all user actions
- `daily_counters` - Tracks daily LP and presence per user
- `milestones_granted` - Prevents duplicate milestone grants

### 3. Set Environment Variables

In your Vercel project settings, add:

```
POSTGRES_URL=your_connection_string_here
```

## Features Implemented

### Event Types & LP Values

- **tune_play**: +1 LP per full minute of listening (tab visible + audio playing)
- **practice_complete**: +5 LP, max 1 per day per space
- **share_post**: +5 LP, max 1 per day (public/anonymous only)
- **light_send**: +1 LP, max 3 per day

### Milestones

10 milestones with thresholds based on lifetime active days and consecutive days. See `api/config/gamification.js` for full list.

### API Endpoints

- `POST /api/events` - Record a gamification event
- `GET /api/progress?user_id=xxx` - Get user progress data

### Frontend Components

- `ProgressOrb` - Circular progress visualization
- `LightBar` - Horizontal progress bar
- `MilestoneModal` - Shows when milestone is achieved
- `PresenceBadge` - "Present today" indicator

### Hooks

- `useProgress(userId)` - Fetches and manages progress data
- `usePostEvent()` - Posts events to API
- `useTuneTracking(isPlaying, audioRef)` - Tracks listening time

## Integration Points

### Tunes/Feed
- Automatically tracks listening time when audio is playing and tab is visible
- Posts `tune_play` events every 60 seconds

### Practices
- Tracks `practice_complete` when user finishes a practice
- Only counts once per space per day

### Shares
- Tracks `share_post` when user submits a reflection
- Only counts public/anonymous shares (not private)

### Send Light
- Tracks `light_send` when user sends a heart
- Enforces 3/day limit with friendly message

## Development Mode

If `POSTGRES_URL` is not set, the API returns mock responses so the UI can render without a database connection. This allows development and testing without database setup.

## Testing

1. Play a tune for ≥2 minutes with tab visible → LP should increase
2. Complete a practice → +5 LP (only once per space per day)
3. Post a share → +5 LP (only once per day)
4. Send light → +1 LP (up to 3/day)
5. Check streak increments on consecutive present days
6. Verify milestones trigger at correct thresholds

## Configuration

All thresholds, LP values, and caps are in `api/config/gamification.js`. Modify this file to adjust:
- LP values per action
- Daily caps
- Milestone thresholds
- Daily LP target

## Future Enhancements

- Unlockables (themes/ambient loops) tied to total LP
- Remote config for thresholds via DB table
- Switch to Supabase (same schema, swap client)

