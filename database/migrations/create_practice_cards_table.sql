-- Practice Cards Table
-- Stores individual card metadata for each space
-- Each space has 4 cards (index 0-3), each with its own title, description, etc.

CREATE TABLE IF NOT EXISTS practice_cards (
  id SERIAL PRIMARY KEY,
  
  -- Card identification
  space_name VARCHAR(255) NOT NULL,
  card_index INTEGER NOT NULL CHECK (card_index >= 0 AND card_index <= 3),
  
  -- Card content
  title VARCHAR(500),
  description TEXT,
  guidance TEXT,
  
  -- Card metadata
  is_practice_of_day BOOLEAN DEFAULT FALSE,
  practice_type VARCHAR(50) DEFAULT 'ambient', -- 'ambient', 'guided', 'sound'
  duration_minutes INTEGER, -- Optional duration hint
  
  -- Content references (optional - can link to specific content_assets)
  video_asset_id VARCHAR(255), -- References content_assets.id
  audio_asset_id VARCHAR(255), -- References content_assets.id
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique card per space/index combination
  UNIQUE(space_name, card_index)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_practice_cards_space ON practice_cards(space_name);
CREATE INDEX IF NOT EXISTS idx_practice_cards_space_index ON practice_cards(space_name, card_index);
CREATE INDEX IF NOT EXISTS idx_practice_cards_status ON practice_cards(status);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_practice_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_practice_cards_updated_at
  BEFORE UPDATE ON practice_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_practice_cards_updated_at();

-- Insert default cards for all spaces (will be editable later)
-- This ensures each space has 4 cards that can be individually edited
INSERT INTO practice_cards (space_name, card_index, title, description, status)
SELECT 
  stations.name as space_name,
  card_idx as card_index,
  stations.name || ' - Card ' || (card_idx + 1) as title,
  'A space for mindful presence. Card ' || (card_idx + 1) || '.' as description,
  'active' as status
FROM (
  VALUES 
    ('Slow Morning'),
    ('Gentle De-Stress'),
    ('Take a Walk'),
    ('Draw Your Feels'),
    ('Move and Cool'),
    ('Tap to Ground'),
    ('Breathe to Relax'),
    ('Get in the Flow State'),
    ('Drift into Sleep')
) AS stations(name)
CROSS JOIN generate_series(0, 3) AS card_idx
ON CONFLICT (space_name, card_index) DO NOTHING;


