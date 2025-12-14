# Migration Instructions for Your Supabase Database

## 🎯 Your Setup

- **Supabase Project**: `pujvtikwdmxlfrqfsjpu`
- **Vercel Project**: `prj_dndWKafuHj6qtj6VAFQveIuDaTNq`
- **Connection Strings**: Already configured in Vercel ✅

## ⚡ Recommended: Supabase SQL Editor

**This is the easiest and most reliable method:**

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard/project/pujvtikwdmxlfrqfsjpu
   - Click **SQL Editor** in the left sidebar

2. **Run Migration 1: Practice Cards**
   - Open file: `database/migrations/create_practice_cards_table.sql`
   - Copy ALL the SQL content
   - Paste into Supabase SQL Editor
   - Click **Run** button (or press Cmd/Ctrl + Enter)
   - ✅ Should see "Success. No rows returned"

3. **Run Migration 2: Usage Tracking**
   - Open file: `database/migrations/create_usage_tracking_table.sql`
   - Copy ALL the SQL content
   - Paste into Supabase SQL Editor
   - Click **Run** button
   - ✅ Should see "Success. No rows returned"

4. **Verify**
   ```sql
   SELECT COUNT(*) FROM practice_cards;
   -- Should return: 36
   
   SELECT COUNT(*) FROM practice_sessions;
   -- Should return: 0 (table exists, no data yet)
   ```

**Done!** ✅ Your database is ready.

## 🔧 Alternative: Node.js Script

If you want to run migrations via script locally:

```bash
# Use NON-POOLING connection (port 5432)
# This is important - migrations need direct database access
export POSTGRES_URL="postgres://postgres.pujvtikwdmxlfrqfsjpu:<SUPABASE_DB_PASSWORD>@aws-1-eu-central-2.pooler.supabase.com:5432/postgres?sslmode=require"

# Run migrations
node scripts/run-practice-cards-migration.js
node scripts/run-usage-tracking-migration.js
```

**Note**: 
- Use `POSTGRES_URL_NON_POOLING` (port 5432) for migrations
- Your Vercel environment already has this set
- The API will automatically use `POSTGRES_URL` (pooled, port 6543) which is correct for queries

## 📊 What Gets Created

### Tables
1. **practice_cards** - 36 cards (4 per space × 9 spaces)
2. **practice_sessions** - Tracks completed sessions
3. **active_sessions** - Tracks live sessions (for user counts)

### Functions
- `get_live_user_count(space_name, card_index)` - Get count for a card
- `get_live_user_counts_by_space(space_name)` - Get counts for all cards
- `cleanup_expired_sessions()` - Clean up expired sessions

## ✅ After Migrations

Your app will now:
- ✅ Show preview cards with 15-second video clips
- ✅ Display live user counts per card
- ✅ Track all practice sessions
- ✅ Show custom completion messages
- ✅ Support timer and voice selection

## 🚀 Deploy to Vercel

After migrations are complete, your Vercel deployment will automatically:
- Use the existing `POSTGRES_URL` environment variable
- Connect to Supabase via the pooled connection (correct for API queries)
- Start tracking usage immediately

No additional configuration needed! 🎉

