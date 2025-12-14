-- Migration: Add Content Sets Support to content_assets table
-- Run this to enable visual + audio pairing

-- Add new columns for content set pairing
ALTER TABLE content_assets 
  ADD COLUMN IF NOT EXISTS content_set_id TEXT,
  ADD COLUMN IF NOT EXISTS paired_asset_id TEXT,
  ADD COLUMN IF NOT EXISTS asset_role TEXT CHECK (asset_role IN ('visual', 'audio', 'standalone'));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_content_assets_content_set_id ON content_assets(content_set_id);
CREATE INDEX IF NOT EXISTS idx_content_assets_paired_asset_id ON content_assets(paired_asset_id);
CREATE INDEX IF NOT EXISTS idx_content_assets_asset_role ON content_assets(asset_role);

-- Add comment for documentation
COMMENT ON COLUMN content_assets.content_set_id IS 'Groups related visual and audio assets together';
COMMENT ON COLUMN content_assets.paired_asset_id IS 'Links visual asset to audio asset and vice versa';
COMMENT ON COLUMN content_assets.asset_role IS 'Role of this asset: visual, audio, or standalone';

-- Set default for existing rows
UPDATE content_assets 
SET asset_role = 'standalone' 
WHERE asset_role IS NULL;

