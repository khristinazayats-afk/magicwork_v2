-- Run this in Supabase SQL Editor to verify tables were created

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('events', 'daily_counters', 'milestones_granted')
ORDER BY table_name;

-- If you see all 3 tables listed, you're good to go!

