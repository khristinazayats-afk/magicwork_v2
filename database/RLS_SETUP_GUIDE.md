# Supabase RLS Setup Guide

## Overview

This guide ensures Row Level Security (RLS) is properly enabled on all tables in your Supabase database.

## Quick Setup

### Step 1: Run the Complete Schema

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/pujvtikwdmxlfrqfsjpu
2. Navigate to **SQL Editor**
3. Open the file: `database/setup_complete_schema.sql`
4. Copy and paste the entire SQL script
5. Click **Run** to execute

### Step 2: Verify RLS is Enabled

After running the script, verify RLS is enabled by running this query in the SQL Editor:

```sql
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public'
  AND tablename IN (
    'events',
    'daily_counters',
    'milestones_granted',
    'user_progress',
    'practice_sessions',
    'content_sets',
    'content_assets'
  )
ORDER BY tablename;
```

All tables should show `rls_enabled = true`.

### Step 3: Verify Policies

Check that policies are created:

```sql
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## Tables Created

### 1. **events**
- Tracks user actions and gamification events
- RLS: Users can only see/insert their own events

### 2. **daily_counters**
- Tracks daily progress, LP, and presence
- RLS: Users can only see/update their own counters

### 3. **milestones_granted**
- Prevents duplicate milestone grants
- RLS: Users can only see/insert their own milestones

### 4. **user_progress**
- Flutter app user progress tracking
- RLS: Users can only see/update their own progress

### 5. **practice_sessions**
- Flutter app practice history
- RLS: Users can only see/insert their own sessions

### 6. **content_sets**
- Public content spaces (Slow Morning, etc.)
- RLS: Public read access (anyone can view)

### 7. **content_assets**
- Videos, audio, images for content sets
- RLS: Public read access (anyone can view)

## RLS Policies Summary

### User Data Tables (Private)
- **events**: Users can SELECT and INSERT their own rows
- **daily_counters**: Users can SELECT, INSERT, and UPDATE their own rows
- **milestones_granted**: Users can SELECT and INSERT their own rows
- **user_progress**: Users can SELECT, INSERT, and UPDATE their own rows
- **practice_sessions**: Users can SELECT, INSERT, and UPDATE their own rows

### Content Tables (Public Read)
- **content_sets**: Anyone can SELECT (read)
- **content_assets**: Anyone can SELECT (read)

## Security Notes

1. **All user data is protected**: Users can only access their own records
2. **Content is public**: Content sets and assets are readable by anyone (needed for app functionality)
3. **No admin policies**: Admin write access would need to be added separately if needed
4. **Cascade deletes**: User data is automatically deleted when a user is deleted

## Troubleshooting

### RLS Not Enabled
If RLS shows as `false` for any table:
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### Missing Policies
If policies are missing, check the `setup_complete_schema.sql` file and re-run the policy creation sections.

### Users Can't Access Their Data
1. Verify user is authenticated: `SELECT auth.uid();`
2. Check policy conditions match user_id column type (should be UUID)
3. Verify user_id in tables matches `auth.uid()`

## Next Steps

After running the schema:
1. ✅ All tables created
2. ✅ RLS enabled on all tables
3. ✅ Policies created for user data access
4. ✅ Indexes created for performance
5. ✅ Triggers set up for updated_at timestamps

Your database is now secure and ready to use!








