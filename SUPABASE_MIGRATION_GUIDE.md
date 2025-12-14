# Supabase Migration Guide

## Overview
This project uses **Supabase** (PostgreSQL) as the database. Here's how to run the migrations.

## Option 1: Supabase SQL Editor (Recommended)

### Step 1: Open Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Run Practice Cards Migration
1. Open `database/migrations/create_practice_cards_table.sql`
2. Copy the entire SQL content
3. Paste into Supabase SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)

### Step 3: Run Usage Tracking Migration
1. Open `database/migrations/create_usage_tracking_table.sql`
2. Copy the entire SQL content
3. Paste into Supabase SQL Editor
4. Click **Run**

### Verify Migrations
Run these queries in SQL Editor to verify:

```sql
-- Check practice_cards table
SELECT COUNT(*) FROM practice_cards;

-- Check practice_sessions table
SELECT COUNT(*) FROM practice_sessions;

-- Check active_sessions table
SELECT COUNT(*) FROM active_sessions;

-- Test live count function
SELECT get_live_user_count('Slow Morning', 0);
```

## Option 2: Node.js Script (Alternative)

### Important: Use NON-POOLING Connection

For migrations, you **must** use the non-pooling connection (port 5432), not the pooled connection (port 6543).

**Why?**
- Pooled connections are for application queries
- Non-pooled connections are for migrations and schema changes
- Migrations need direct database access

### Run Migrations
```bash
# Use NON-POOLING connection string (port 5432, not 6543)
export POSTGRES_URL="postgres://postgres.pujvtikwdmxlfrqfsjpu:<SUPABASE_DB_PASSWORD>@aws-1-eu-central-2.pooler.supabase.com:5432/postgres?sslmode=require"

# Run practice cards migration
node scripts/run-practice-cards-migration.js

# Run usage tracking migration
node scripts/run-usage-tracking-migration.js
```

**Note**: Your Vercel environment already has `POSTGRES_URL_NON_POOLING` set correctly.

## Option 3: Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

## Environment Variables for Vercel

For Vercel deployment, add to your environment variables:

1. Go to Vercel Dashboard > Your Project > **Settings** > **Environment Variables**
2. Add:
   - `POSTGRES_URL` = Your Supabase connection string

### Get Supabase Connection String for Vercel
1. Supabase Dashboard > **Settings** > **Database**
2. Under **Connection string**, select **URI**
3. Copy the connection string
4. Replace `[YOUR-PASSWORD]` with your actual database password

## Troubleshooting

### "relation already exists" errors
- This means tables already exist - that's okay!
- The migrations use `CREATE TABLE IF NOT EXISTS` so they're safe to run multiple times

### Connection issues
- Verify your connection string includes the password
- Check that your Supabase project is active
- Ensure your IP is allowed (if using connection pooling)

### Permission errors
- Make sure you're using the `postgres` role or a role with CREATE privileges
- Check Supabase project settings

## Tables Created

### practice_cards
- Stores individual card metadata (4 cards per space)
- Columns: `space_name`, `card_index`, `title`, `description`, `video_asset_id`, `audio_asset_id`

### practice_sessions
- Tracks completed practice sessions
- Columns: `space_name`, `card_index`, `video_asset_id`, `audio_asset_id`, `duration_seconds`, `voice_audio_selected`

### active_sessions
- Tracks currently active sessions (for live user counts)
- Auto-expires after 5 minutes of no heartbeat
- Columns: `space_name`, `card_index`, `session_id`, `expires_at`

## Functions Created

- `get_live_user_count(space_name, card_index)` - Get live count for a card
- `get_live_user_counts_by_space(space_name)` - Get counts for all cards in a space
- `cleanup_expired_sessions()` - Clean up expired active sessions

## Next Steps

After migrations:
1. ✅ Tables are created
2. ✅ Default practice cards are inserted (36 cards: 4 per space × 9 spaces)
3. ✅ Functions are available for live user counts
4. 🚀 Ready to deploy to Vercel!

