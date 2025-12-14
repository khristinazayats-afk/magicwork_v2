# Running the Practice Cards Migration (Supabase)

The migration script needs your Supabase database connection string. Here are your options:

## Option 1: Set Environment Variable (Recommended)

### For Supabase (This Project):
```bash
# Get your connection string from Supabase Dashboard:
# Project Settings → Database → Connection String → URI

export POSTGRES_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Then run the migration:
node scripts/run-practice-cards-migration.js
```

## Option 2: Create .env File

Create a `.env` file in the project root:

```bash
# .env
POSTGRES_URL="your-connection-string-here"
```

Then run:
```bash
node scripts/run-practice-cards-migration.js
```

## Option 3: Run SQL Manually in Supabase (Easiest - Recommended)

This is the simplest way to run migrations:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy the contents of `database/migrations/create_practice_cards_table.sql`
3. Paste into the SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)

Repeat for `database/migrations/create_usage_tracking_table.sql` to set up usage tracking.

See `SUPABASE_MIGRATION_GUIDE.md` for detailed instructions.

## What the Migration Does

1. ✅ Creates `practice_cards` table
2. ✅ Creates indexes for faster queries
3. ✅ Creates trigger for auto-updating timestamps
4. ✅ Inserts 36 default cards (9 spaces × 4 cards each)

## Verify Migration

After running, you should see:
- ✅ 36 cards total
- ✅ 9 spaces
- ✅ 4 cards per space (index 0-3)

You can verify by running:
```bash
node scripts/view-database.js
```

Or check in your database dashboard:
```sql
SELECT 
  COUNT(*) as total_cards,
  COUNT(DISTINCT space_name) as total_spaces
FROM practice_cards;
```

## Next Steps

Once the migration is complete:
1. ✅ Cards are now independent - edit one without affecting others
2. ✅ Each card has its own title, description, guidance
3. ✅ You can customize cards via API or database

See `CARD_INDEPENDENCE_SETUP.md` for more details on editing cards.


