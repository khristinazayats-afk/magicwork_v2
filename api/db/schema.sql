-- Gamification database schema for Vercel Postgres
-- Run this to create the tables

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  metadata JSONB,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  lp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_occurred_at ON events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_events_user_type ON events(user_id, event_type);

CREATE TABLE IF NOT EXISTS daily_counters (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  present BOOLEAN DEFAULT FALSE,
  lp_earned INTEGER DEFAULT 0,
  practice_spaces TEXT[], -- array of space names completed today
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

CREATE TABLE IF NOT EXISTS milestones_granted (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  milestone_id INTEGER NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, milestone_id)
);

CREATE INDEX IF NOT EXISTS idx_milestones_user_id ON milestones_granted(user_id);

