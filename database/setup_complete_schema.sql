-- Complete Supabase Database Setup with RLS
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/pujvtikwdmxlfrqfsjpu/sql

-- ============================================================================
-- 1. GAMIFICATION TABLES (from api/db/schema.sql)
-- ============================================================================

-- Events table for tracking user actions
-- Note: user_id can be UUID (from auth.users) or TEXT (for backward compatibility)
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL, -- Can be UUID or text identifier
  event_type VARCHAR(50) NOT NULL,
  metadata JSONB,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  lp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_occurred_at ON events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_events_user_type ON events(user_id, event_type);

-- Daily counters for tracking daily progress
CREATE TABLE IF NOT EXISTS daily_counters (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL, -- Can be UUID or text identifier
  date DATE NOT NULL,
  present BOOLEAN DEFAULT FALSE,
  lp_earned INTEGER DEFAULT 0,
  practice_spaces TEXT[],
  share_post_count INTEGER DEFAULT 0,
  light_send_count INTEGER DEFAULT 0,
  tune_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_counters_user_id ON daily_counters(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_counters_date ON daily_counters(date);
CREATE INDEX IF NOT EXISTS idx_daily_counters_user_date ON daily_counters(user_id, date);

-- Milestones granted to prevent duplicates
CREATE TABLE IF NOT EXISTS milestones_granted (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL, -- Can be UUID or text identifier
  milestone_id INTEGER NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, milestone_id)
);

CREATE INDEX IF NOT EXISTS idx_milestones_user_id ON milestones_granted(user_id);

-- ============================================================================
-- 2. USER PROFILES TABLE (Complete user information)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Basic Information
  username VARCHAR(100) UNIQUE,
  display_name VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  bio TEXT,
  avatar_url TEXT,
  
  -- Preferences
  preferred_language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50),
  notification_preferences JSONB DEFAULT '{}'::JSONB,
  privacy_settings JSONB DEFAULT '{"profile_visibility": "public", "activity_visibility": "friends"}'::JSONB,
  
  -- Onboarding & Setup
  onboarding_completed BOOLEAN DEFAULT FALSE,
  profile_setup_completed BOOLEAN DEFAULT FALSE,
  onboarding_data JSONB,
  
  -- Account Status
  account_status VARCHAR(50) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deleted', 'inactive')),
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_active ON user_profiles(last_active_at);

-- ============================================================================
-- 3. USER PROGRESS TABLE (for Flutter app)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  total_practice_minutes INTEGER DEFAULT 0,
  total_practices INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  vibe_level INTEGER DEFAULT 1,
  light_points INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- ============================================================================
-- 4. ANALYTICS & TRACKING TABLES
-- ============================================================================

-- User Sessions (track app usage)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  device_type VARCHAR(50), -- 'ios', 'android', 'web'
  device_id VARCHAR(255),
  app_version VARCHAR(50),
  platform_version VARCHAR(50),
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  screen_views JSONB DEFAULT '[]'::JSONB, -- Array of screens visited
  events_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_start_time ON user_sessions(start_time);

-- Analytics Events (comprehensive event tracking)
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  session_id VARCHAR(255),
  event_name VARCHAR(100) NOT NULL,
  event_category VARCHAR(50), -- 'user_action', 'system', 'error', 'performance'
  event_type VARCHAR(50), -- 'click', 'view', 'complete', 'error', etc.
  screen_name VARCHAR(100),
  properties JSONB DEFAULT '{}'::JSONB, -- Event-specific properties
  user_properties JSONB DEFAULT '{}'::JSONB, -- User context at time of event
  device_info JSONB DEFAULT '{}'::JSONB,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_category ON analytics_events(event_category);
CREATE INDEX IF NOT EXISTS idx_analytics_events_occurred_at ON analytics_events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_date ON analytics_events(user_id, occurred_at);

-- User Behavior Analytics (aggregated insights)
CREATE TABLE IF NOT EXISTS user_behavior_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  
  -- Engagement Metrics
  sessions_count INTEGER DEFAULT 0,
  total_session_duration_seconds INTEGER DEFAULT 0,
  screens_viewed INTEGER DEFAULT 0,
  unique_screens_viewed INTEGER DEFAULT 0,
  
  -- Practice Metrics
  practices_started INTEGER DEFAULT 0,
  practices_completed INTEGER DEFAULT 0,
  total_practice_minutes INTEGER DEFAULT 0,
  
  -- Content Engagement
  content_items_viewed INTEGER DEFAULT 0,
  content_items_interacted INTEGER DEFAULT 0,
  audio_listened_minutes INTEGER DEFAULT 0,
  video_watched_minutes INTEGER DEFAULT 0,
  
  -- Social Engagement
  shares_count INTEGER DEFAULT 0,
  likes_sent INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  
  -- Error Tracking
  errors_count INTEGER DEFAULT 0,
  error_types JSONB DEFAULT '[]'::JSONB,
  
  -- Performance Metrics
  avg_load_time_ms INTEGER,
  avg_response_time_ms INTEGER,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_user_behavior_user_id ON user_behavior_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_date ON user_behavior_analytics(date);
CREATE INDEX IF NOT EXISTS idx_user_behavior_user_date ON user_behavior_analytics(user_id, date);

-- ============================================================================
-- 5. PRACTICE SESSIONS TABLE (for Flutter app)
-- ============================================================================

CREATE TABLE IF NOT EXISTS practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  practice_type VARCHAR(100) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_start_time ON practice_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_start ON practice_sessions(user_id, start_time);

-- ============================================================================
-- 6. CONTENT TABLES (from database/schema/content_assets.sql)
-- ============================================================================

-- Content sets (spaces)
CREATE TABLE IF NOT EXISTS content_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_sets_name ON content_sets(name);

-- Content assets (videos, audio, etc.)
CREATE TABLE IF NOT EXISTS content_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_set_id UUID REFERENCES content_sets(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'video', 'audio', 'image'
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  metadata JSONB,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_assets_content_set_id ON content_assets(content_set_id);
CREATE INDEX IF NOT EXISTS idx_content_assets_type ON content_assets(type);
CREATE INDEX IF NOT EXISTS idx_content_assets_order ON content_assets(content_set_id, order_index);

-- ============================================================================
-- 7. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ============================================================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones_granted ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavior_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_assets ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8. RLS POLICIES - Users can only access their own data
-- ============================================================================

-- User Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid()::text = user_id::text OR user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text OR user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid()::text = user_id::text OR user_id::text = auth.uid()::text);

-- Public profile read (for username lookups, etc.)
DROP POLICY IF EXISTS "Public can view basic profile info" ON user_profiles;
CREATE POLICY "Public can view basic profile info" ON user_profiles
  FOR SELECT USING (
    -- Allow viewing username, display_name, avatar for public profiles
    (privacy_settings->>'profile_visibility' = 'public' OR privacy_settings->>'profile_visibility' IS NULL)
    AND auth.uid() IS NOT NULL
  );

-- Events policies
-- Note: Using TEXT comparison for user_id to support both UUID and text identifiers
DROP POLICY IF EXISTS "Users can view their own events" ON events;
CREATE POLICY "Users can view their own events" ON events
  FOR SELECT USING (auth.uid()::text = user_id OR user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can insert their own events" ON events;
CREATE POLICY "Users can insert their own events" ON events
  FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id = auth.uid()::text);

-- Daily counters policies
DROP POLICY IF EXISTS "Users can view their own daily counters" ON daily_counters;
CREATE POLICY "Users can view their own daily counters" ON daily_counters
  FOR SELECT USING (auth.uid()::text = user_id OR user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can insert their own daily counters" ON daily_counters;
CREATE POLICY "Users can insert their own daily counters" ON daily_counters
  FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own daily counters" ON daily_counters;
CREATE POLICY "Users can update their own daily counters" ON daily_counters
  FOR UPDATE USING (auth.uid()::text = user_id OR user_id = auth.uid()::text);

-- Milestones granted policies
DROP POLICY IF EXISTS "Users can view their own milestones" ON milestones_granted;
CREATE POLICY "Users can view their own milestones" ON milestones_granted
  FOR SELECT USING (auth.uid()::text = user_id OR user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can insert their own milestones" ON milestones_granted;
CREATE POLICY "Users can insert their own milestones" ON milestones_granted
  FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id = auth.uid()::text);

-- User Sessions policies
DROP POLICY IF EXISTS "Users can view their own sessions" ON user_sessions;
CREATE POLICY "Users can view their own sessions" ON user_sessions
  FOR SELECT USING (auth.uid()::text = user_id OR user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can insert their own sessions" ON user_sessions;
CREATE POLICY "Users can insert their own sessions" ON user_sessions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own sessions" ON user_sessions;
CREATE POLICY "Users can update their own sessions" ON user_sessions
  FOR UPDATE USING (auth.uid()::text = user_id OR user_id = auth.uid()::text);

-- Analytics Events policies
DROP POLICY IF EXISTS "Users can view their own analytics events" ON analytics_events;
CREATE POLICY "Users can view their own analytics events" ON analytics_events
  FOR SELECT USING (auth.uid()::text = user_id OR user_id = auth.uid()::text OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert their own analytics events" ON analytics_events;
CREATE POLICY "Users can insert their own analytics events" ON analytics_events
  FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id = auth.uid()::text OR user_id IS NULL);

-- User Behavior Analytics policies
DROP POLICY IF EXISTS "Users can view their own behavior analytics" ON user_behavior_analytics;
CREATE POLICY "Users can view their own behavior analytics" ON user_behavior_analytics
  FOR SELECT USING (auth.uid()::text = user_id OR user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can insert their own behavior analytics" ON user_behavior_analytics;
CREATE POLICY "Users can insert their own behavior analytics" ON user_behavior_analytics
  FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own behavior analytics" ON user_behavior_analytics;
CREATE POLICY "Users can update their own behavior analytics" ON user_behavior_analytics
  FOR UPDATE USING (auth.uid()::text = user_id OR user_id = auth.uid()::text);

-- User progress policies
DROP POLICY IF EXISTS "Users can view their own progress" ON user_progress;
CREATE POLICY "Users can view their own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own progress" ON user_progress;
CREATE POLICY "Users can insert their own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own progress" ON user_progress;
CREATE POLICY "Users can update their own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Practice sessions policies
DROP POLICY IF EXISTS "Users can view their own practice sessions" ON practice_sessions;
CREATE POLICY "Users can view their own practice sessions" ON practice_sessions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own practice sessions" ON practice_sessions;
CREATE POLICY "Users can insert their own practice sessions" ON practice_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own practice sessions" ON practice_sessions;
CREATE POLICY "Users can update their own practice sessions" ON practice_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Content sets policies (public read, admin write)
DROP POLICY IF EXISTS "Anyone can view content sets" ON content_sets;
CREATE POLICY "Anyone can view content sets" ON content_sets
  FOR SELECT USING (true);

-- Content assets policies (public read, admin write)
DROP POLICY IF EXISTS "Anyone can view content assets" ON content_assets;
CREATE POLICY "Anyone can view content assets" ON content_assets
  FOR SELECT USING (true);

-- ============================================================================
-- 9. FUNCTIONS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_daily_counters_updated_at ON daily_counters;
CREATE TRIGGER update_daily_counters_updated_at
  BEFORE UPDATE ON daily_counters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_progress_updated_at ON user_progress;
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_sets_updated_at ON content_sets;
CREATE TRIGGER update_content_sets_updated_at
  BEFORE UPDATE ON content_sets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_assets_updated_at ON content_assets;
CREATE TRIGGER update_content_assets_updated_at
  BEFORE UPDATE ON content_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_behavior_analytics_updated_at ON user_behavior_analytics;
CREATE TRIGGER update_user_behavior_analytics_updated_at
  BEFORE UPDATE ON user_behavior_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. HELPER FUNCTIONS
-- ============================================================================

-- Function to update user last_active_at
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profiles
  SET last_active_at = NOW()
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_active_at on session start
DROP TRIGGER IF EXISTS update_last_active_on_session ON user_sessions;
CREATE TRIGGER update_last_active_on_session
  AFTER INSERT ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_last_active();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, email_verified, created_at)
  VALUES (NEW.id, NEW.email_confirmed_at IS NOT NULL, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- 11. VERIFICATION QUERIES
-- ============================================================================

-- Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public'
  AND tablename IN (
    'events',
    'daily_counters',
    'milestones_granted',
    'user_profiles',
    'user_progress',
    'practice_sessions',
    'user_sessions',
    'analytics_events',
    'user_behavior_analytics',
    'content_sets',
    'content_assets'
  )
ORDER BY tablename;

-- Check policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'events',
    'daily_counters',
    'milestones_granted',
    'user_profiles',
    'user_progress',
    'practice_sessions',
    'user_sessions',
    'analytics_events',
    'user_behavior_analytics',
    'content_sets',
    'content_assets'
  )
ORDER BY tablename, policyname;

