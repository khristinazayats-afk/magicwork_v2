# Supabase Migration Quick Start

## Your Supabase Connection Details

Based on your Vercel environment variables, here's how to run the migrations:

## ⚡ Quick Method: Supabase SQL Editor (Recommended)

This is the easiest and most reliable method:

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/pujvtikwdmxlfrqfsjpu
   - Navigate to **SQL Editor** in the left sidebar

2. **Run Practice Cards Migration**
   - Open `database/migrations/create_practice_cards_table.sql`
   - Copy the entire SQL content
   - Paste into Supabase SQL Editor
   - Click **Run** (or Cmd/Ctrl + Enter)

3. **Run Usage Tracking Migration**
   - Open `database/migrations/create_usage_tracking_table.sql`
   - Copy the entire SQL content
   - Paste into Supabase SQL Editor
   - Click **Run**

✅ **Done!** Your database is now set up.

## 🔧 Alternative: Node.js Script

If you prefer to run migrations via script:

### Use NON-POOLING Connection (Important!)

For migrations, use `POSTGRES_URL_NON_POOLING` (not the pooled connection):

```bash
# Set the non-pooling connection string
export POSTGRES_URL="postgres://postgres.pujvtikwdmxlfrqfsjpu:<SUPABASE_DB_PASSWORD>@aws-1-eu-central-2.pooler.supabase.com:5432/postgres?sslmode=require"

# Run practice cards migration
node scripts/run-practice-cards-migration.js

# Run usage tracking migration
node scripts/run-usage-tracking-migration.js
```

**Why NON-POOLING?**
- Pooled connections (port 6543) are for application queries
- Non-pooled connections (port 5432) are for migrations and schema changes
- Migrations need direct database access, not through the connection pooler

## ✅ Verify Migrations

After running migrations, verify in Supabase SQL Editor:

```sql
-- Check practice_cards table
SELECT COUNT(*) as total_cards, 
       COUNT(DISTINCT space_name) as total_spaces 
FROM practice_cards;
-- Should show: 36 cards, 9 spaces

-- Check practice_sessions table exists
SELECT COUNT(*) FROM practice_sessions;
-- Should show: 0 (no sessions yet)

-- Check active_sessions table exists
SELECT COUNT(*) FROM active_sessions;
-- Should show: 0 (no active sessions)

-- Test live count function
SELECT get_live_user_count('Slow Morning', 0);
-- Should return: 0
```

## 🚀 Next Steps

After migrations are complete:

1. ✅ Database tables are created
2. ✅ Default practice cards are inserted (36 cards: 4 per space × 9 spaces)
3. ✅ Usage tracking is set up
4. ✅ Live user count functions are available
5. 🚀 Ready to deploy to Vercel!

## 📝 Your Supabase Project

- **Project Reference**: `pujvtikwdmxlfrqfsjpu`
- **URL**: https://pujvtikwdmxlfrqfsjpu.supabase.co
- **Database Host**: `db.pujvtikwdmxlfrqfsjpu.supabase.co`

All connection strings are already configured in your Vercel environment variables.

