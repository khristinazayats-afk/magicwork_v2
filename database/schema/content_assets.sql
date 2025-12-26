-- Content Assets Table for Magicwork CMS
-- This table stores all Canva content metadata and CDN URLs

CREATE TABLE IF NOT EXISTS content_assets (
  -- Primary identification
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  
  -- Canva source
  canva_url TEXT,
  canva_design_id VARCHAR(255),
  
  -- File details
  type VARCHAR(50) NOT NULL CHECK (type IN ('video', 'image', 'gif', 'audio')),
  format VARCHAR(10) NOT NULL CHECK (format IN ('mp4', 'png', 'jpg', 'gif', 'webm', 'mp3', 'wav')),
  dimensions VARCHAR(50),
  file_size_mb DECIMAL(10, 2),
  
  -- App integration
  allocated_space VARCHAR(255), -- Where this content is used in the app
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'processing', 'live', 'archived', 'error')),
  
  -- Storage paths
  s3_key TEXT,
  cdn_url TEXT,
  
  -- Metadata
  notes TEXT,
  tags TEXT[], -- Array of tags for filtering
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Processing metadata
  last_export_at TIMESTAMP WITH TIME ZONE,
  export_error TEXT,
  
  -- Indexing for faster queries
  CONSTRAINT unique_canva_design UNIQUE (canva_design_id)
);

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_content_assets_status ON content_assets(status);

-- Index for filtering by allocated space
CREATE INDEX IF NOT EXISTS idx_content_assets_space ON content_assets(allocated_space);

-- Index for filtering by type
CREATE INDEX IF NOT EXISTS idx_content_assets_type ON content_assets(type);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_assets_updated_at
  BEFORE UPDATE ON content_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sample data insert
INSERT INTO content_assets (
  id,
  name,
  canva_url,
  canva_design_id,
  type,
  format,
  allocated_space,
  status,
  dimensions,
  notes
) VALUES (
  'breathe-to-relax-video',
  'Breathe To Relax - Meditation Video',
  'https://www.canva.com/design/DAG5m6PdwGw/view',
  'DAG5m6PdwGw',
  'video',
  'mp4',
  'Breathe To Relax',
  'ready',
  '1080x1920',
  'Soft meditation background for breathing practice'
) ON CONFLICT (id) DO NOTHING;

-- Useful queries

-- Get all live assets
-- SELECT * FROM content_assets WHERE status = 'live' ORDER BY published_at DESC;

-- Get assets for a specific space
-- SELECT * FROM content_assets WHERE allocated_space = 'Breathe To Relax' AND status = 'live';

-- Get assets that need processing
-- SELECT * FROM content_assets WHERE status = 'ready' ORDER BY created_at ASC;

-- Get recently updated assets
-- SELECT * FROM content_assets WHERE status = 'live' ORDER BY updated_at DESC LIMIT 10;






