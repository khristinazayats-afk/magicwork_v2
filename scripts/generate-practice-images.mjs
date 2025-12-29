import sharp from 'sharp';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const practices = {
  'slow-morning': 'serene morning meditation sunrise peaceful woman meditating lotus position soft light golden hour',
  'gentle-de-stress': 'calm meditation peaceful woman relaxing breathing mindfulness stress relief tranquility',
  'take-a-walk': 'mindful walking meditation nature trail forest peaceful person walking outdoor',
  'draw-your-feels': 'artistic meditation creative expression watercolor painting emotions colors abstract art',
  'move-and-cool': 'gentle yoga flowing movement meditation woman stretching peaceful motion',
  'tap-to-ground': 'grounding meditation person barefoot earth nature connection roots',
  'breathe-to-relax': 'breathing meditation woman calm peaceful breathing exercise wellness',
  'get-in-the-flow-state': 'focused meditation concentration person mindful working flow state peak performance',
  'drift-into-sleep': 'sleep meditation peaceful bedtime woman resting night stars moonlight dreamy'
};

const UNSPLASH_API_KEY = process.env.UNSPLASH_API_KEY;

async function downloadAndProcessImage(query, filename) {
  try {
    // Fetch from Unsplash
    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_API_KEY}&w=800&h=1000`
    );
    
    if (!response.ok) {
      console.error(`Failed to fetch image for ${filename}: ${response.status}`);
      return false;
    }

    const data = await response.json();
    const imageUrl = data.urls.full;

    // Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error(`Failed to download image for ${filename}`);
      return false;
    }

    const imageBuffer = await imageResponse.buffer();

    // Process with sharp: resize, optimize, add overlay
    const outputPath = path.join(process.cwd(), 'public', 'assets', 'practice-previews', `${filename}.jpg`);
    
    await sharp(imageBuffer)
      .resize(800, 1000, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85, progressive: true })
      .toFile(outputPath);

    console.log(`✅ Generated: ${filename}.jpg`);
    return true;
  } catch (error) {
    console.error(`Error processing ${filename}:`, error.message);
    return false;
  }
}

async function generateAllImages() {
  console.log('🎨 Generating practice preview images...\n');

  // Ensure directory exists
  const dir = path.join(process.cwd(), 'public', 'assets', 'practice-previews');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let successful = 0;
  let failed = 0;

  for (const [filename, query] of Object.entries(practices)) {
    const success = await downloadAndProcessImage(query, filename);
    if (success) {
      successful++;
    } else {
      failed++;
    }
    // Delay between requests to respect API rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n📊 Summary: ${successful} successful, ${failed} failed`);
  if (failed === 0) {
    console.log('✨ All practice preview images generated successfully!');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  if (!UNSPLASH_API_KEY) {
    console.error('❌ UNSPLASH_API_KEY environment variable not set');
    process.exit(1);
  }
  generateAllImages().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { generateAllImages };
