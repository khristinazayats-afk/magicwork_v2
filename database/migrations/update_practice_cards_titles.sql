-- Update Practice Cards with Correct Titles and Descriptions
-- This updates all 3 spaces (Slow Morning, Gentle De-Stress, Drift into Sleep)
-- Each space gets 4 cards with titles matching their videos

-- Card themes (same for all spaces):
-- Card 0: Gentle Clouds
-- Card 1: Soothing Rain  
-- Card 2: Calm Waves
-- Card 3: Peaceful Forest

-- Update Slow Morning cards
UPDATE practice_cards
SET 
  title = 'Gentle Clouds',
  description = 'Drift away with gentle clouds moving across the sky.',
  updated_at = NOW()
WHERE space_name = 'Slow Morning' AND card_index = 0;

UPDATE practice_cards
SET 
  title = 'Soothing Rain',
  description = 'Find calm in the gentle rhythm of falling rain.',
  updated_at = NOW()
WHERE space_name = 'Slow Morning' AND card_index = 1;

UPDATE practice_cards
SET 
  title = 'Calm Waves',
  description = 'Let ocean waves wash away tension and stress.',
  updated_at = NOW()
WHERE space_name = 'Slow Morning' AND card_index = 2;

UPDATE practice_cards
SET 
  title = 'Peaceful Forest',
  description = 'Immerse yourself in the tranquility of nature.',
  updated_at = NOW()
WHERE space_name = 'Slow Morning' AND card_index = 3;

-- Update Gentle De-Stress cards
UPDATE practice_cards
SET 
  title = 'Gentle Clouds',
  description = 'Drift away with gentle clouds moving across the sky.',
  updated_at = NOW()
WHERE space_name = 'Gentle De-Stress' AND card_index = 0;

UPDATE practice_cards
SET 
  title = 'Soothing Rain',
  description = 'Find calm in the gentle rhythm of falling rain.',
  updated_at = NOW()
WHERE space_name = 'Gentle De-Stress' AND card_index = 1;

UPDATE practice_cards
SET 
  title = 'Calm Waves',
  description = 'Let ocean waves wash away tension and stress.',
  updated_at = NOW()
WHERE space_name = 'Gentle De-Stress' AND card_index = 2;

UPDATE practice_cards
SET 
  title = 'Peaceful Forest',
  description = 'Immerse yourself in the tranquility of nature.',
  updated_at = NOW()
WHERE space_name = 'Gentle De-Stress' AND card_index = 3;

-- Update Drift into Sleep cards (note: space name is "Drift into Sleep" not "Drift into Sleep")
UPDATE practice_cards
SET 
  title = 'Gentle Clouds',
  description = 'Drift away with gentle clouds moving across the sky.',
  updated_at = NOW()
WHERE space_name = 'Drift into Sleep' AND card_index = 0;

UPDATE practice_cards
SET 
  title = 'Soothing Rain',
  description = 'Find calm in the gentle rhythm of falling rain.',
  updated_at = NOW()
WHERE space_name = 'Drift into Sleep' AND card_index = 1;

UPDATE practice_cards
SET 
  title = 'Calm Waves',
  description = 'Let ocean waves wash away tension and stress.',
  updated_at = NOW()
WHERE space_name = 'Drift into Sleep' AND card_index = 2;

UPDATE practice_cards
SET 
  title = 'Peaceful Forest',
  description = 'Immerse yourself in the tranquility of nature.',
  updated_at = NOW()
WHERE space_name = 'Drift into Sleep' AND card_index = 3;

-- If cards don't exist, create them
INSERT INTO practice_cards (space_name, card_index, title, description, status)
VALUES
  ('Slow Morning', 0, 'Gentle Clouds', 'Drift away with gentle clouds moving across the sky.', 'active'),
  ('Slow Morning', 1, 'Soothing Rain', 'Find calm in the gentle rhythm of falling rain.', 'active'),
  ('Slow Morning', 2, 'Calm Waves', 'Let ocean waves wash away tension and stress.', 'active'),
  ('Slow Morning', 3, 'Peaceful Forest', 'Immerse yourself in the tranquility of nature.', 'active'),
  ('Gentle De-Stress', 0, 'Gentle Clouds', 'Drift away with gentle clouds moving across the sky.', 'active'),
  ('Gentle De-Stress', 1, 'Soothing Rain', 'Find calm in the gentle rhythm of falling rain.', 'active'),
  ('Gentle De-Stress', 2, 'Calm Waves', 'Let ocean waves wash away tension and stress.', 'active'),
  ('Gentle De-Stress', 3, 'Peaceful Forest', 'Immerse yourself in the tranquility of nature.', 'active'),
  ('Drift into Sleep', 0, 'Gentle Clouds', 'Drift away with gentle clouds moving across the sky.', 'active'),
  ('Drift into Sleep', 1, 'Soothing Rain', 'Find calm in the gentle rhythm of falling rain.', 'active'),
  ('Drift into Sleep', 2, 'Calm Waves', 'Let ocean waves wash away tension and stress.', 'active'),
  ('Drift into Sleep', 3, 'Peaceful Forest', 'Immerse yourself in the tranquility of nature.', 'active')
ON CONFLICT (space_name, card_index) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  updated_at = NOW();

