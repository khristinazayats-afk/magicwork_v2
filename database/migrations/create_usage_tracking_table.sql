-- Usage Tracking Table
-- Tracks user sessions by space, card, video, and audio for analytics and AI suggestions

CREATE TABLE IF NOT EXISTS practice_sessions (
  id SERIAL PRIMARY KEY,
  
  -- Session identification
  user_id VARCHAR(255), -- Optional: can be null for anonymous tracking
  session_id VARCHAR(255) NOT NULL, -- Unique session identifier
  
  -- What was practiced
  space_name VARCHAR(255) NOT NULL,
  card_index INTEGER NOT NULL CHECK (card_index >= 0 AND card_index <= 3),
  card_id INTEGER, -- References practice_cards.id
  
  -- Content used
  video_asset_id VARCHAR(255), -- References content_assets.id
  audio_asset_id VARCHAR(255), -- References content_assets.id
  video_url TEXT, -- Store URL for reference
  audio_url TEXT, -- Store URL for reference
  
  -- Session details
  duration_seconds INTEGER NOT NULL, -- How long they practiced
  selected_duration_minutes INTEGER, -- What they selected (5, 10, 15, 20, 30, or null for unlimited)
  voice_audio_selected VARCHAR(255), -- Which voice audio they selected
  
  -- Completion
  completed BOOLEAN DEFAULT TRUE, -- Whether they completed the session
  completion_message_shown TEXT, -- Which completion message was shown
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_practice_sessions_space ON practice_sessions(space_name);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_card ON practice_sessions(space_name, card_index);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_session ON practice_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_started ON practice_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_completed ON practice_sessions(completed_at);

-- Active Sessions Table (for live user counts)
-- Tracks currently active sessions in real-time
CREATE TABLE IF NOT EXISTS active_sessions (
  id SERIAL PRIMARY KEY,
  
  -- Session identification
  session_id VARCHAR(255) NOT NULL UNIQUE,
  user_id VARCHAR(255), -- Optional
  
  -- What they're practicing
  space_name VARCHAR(255) NOT NULL,
  card_index INTEGER NOT NULL CHECK (card_index >= 0 AND card_index <= 3),
  card_id INTEGER, -- References practice_cards.id
  
  -- Content being used
  video_asset_id VARCHAR(255),
  audio_asset_id VARCHAR(255),
  
  -- Session state
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Updated every 30 seconds
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL -- Auto-cleanup after 5 minutes of no heartbeat
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_active_sessions_space_card ON active_sessions(space_name, card_index);
CREATE INDEX IF NOT EXISTS idx_active_sessions_expires ON active_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_active_sessions_heartbeat ON active_sessions(last_heartbeat);

-- Function to clean up expired active sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM active_sessions 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Auto-cleanup expired sessions (run this periodically or via cron)
-- You can call: SELECT cleanup_expired_sessions();

-- Function to get live user count for a specific space and card
CREATE OR REPLACE FUNCTION get_live_user_count(p_space_name VARCHAR, p_card_index INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Clean up expired sessions first
  DELETE FROM active_sessions WHERE expires_at < NOW();
  
  -- Return count of active sessions for this space/card
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM active_sessions
    WHERE space_name = p_space_name
      AND card_index = p_card_index
      AND expires_at > NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get live user count for all cards in a space
CREATE OR REPLACE FUNCTION get_live_user_counts_by_space(p_space_name VARCHAR)
RETURNS TABLE(card_index INTEGER, user_count INTEGER) AS $$
BEGIN
  -- Clean up expired sessions first
  DELETE FROM active_sessions WHERE expires_at < NOW();
  
  -- Return counts per card
  RETURN QUERY
  SELECT 
    a.card_index,
    COUNT(*)::INTEGER as user_count
  FROM active_sessions a
  WHERE a.space_name = p_space_name
    AND a.expires_at > NOW()
  GROUP BY a.card_index
  ORDER BY a.card_index;
END;
$$ LANGUAGE plpgsql;

