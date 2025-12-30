#!/usr/bin/env node

/**
 * Fetch real HD images from Unsplash for meditation previews
 * Each meditation gets a thematically appropriate image
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Unsplash API configuration (using public API - no key needed for basic use)
const UNSPLASH_BASE = 'https://source.unsplash.com/800x320/?';

const meditationThemes = {
  // Slow Morning
  'sunrise-breath': 'sunrise,golden-hour,morning-light',
  'gratitude-setting': 'gratitude,journal,morning-coffee',
  'morning-expansion': 'yoga,morning-stretch,sunrise',
  
  // Gentle De-Stress
  '3-minute-rescue': 'calm,breathing,peaceful',
  'tension-release': 'massage,relaxation,spa',
  'nervous-system-reset': 'nature,zen,peaceful-water',
  
  // Take a Walk
  'aware-steps': 'forest-path,walking,nature-trail',
  'sensory-immersion': 'nature,forest,green',
  'slow-pilgrimage': 'mountain-path,hiking,peaceful',
  
  // Draw Your Feels
  'emotion-to-color': 'watercolor,painting,art',
  'intuitive-sketch': 'sketching,drawing,creativity',
  'heart-on-paper': 'art,emotional,expressive',
  
  // Move and Cool
  'energy-release': 'dance,movement,energy',
  'dynamic-flow': 'flow,movement,yoga',
  'cool-down-journey': 'stretching,relaxation,calm',
  
  // Tap to Ground
  'quick-root': 'grounding,earth,roots',
  'body-awakening': 'morning-yoga,awareness,mindfulness',
  'deep-earth-bond': 'nature,grounding,meditation',
  
  // Breathe to Relax
  'balanced-breathing': 'breathing,meditation,zen',
  'extended-exhale': 'calm-breathing,relaxation,peace',
  'breath-meditation': 'meditation,breathing,mindfulness',
  
  // Get in the Flow State
  'mind-sharpening': 'focus,concentration,clarity',
  'flow-gateway': 'creative,focus,flow-state',
  'peak-focus': 'productivity,concentration,work',
  
  // Drift into Sleep
  'sleep-transition': 'bed,bedroom,sleep',
  'body-softening': 'relaxation,bed,peaceful-sleep',
  'dream-passage': 'dreams,night,bedroom'
};

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath + '.tmp');
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        file.close();
        fs.unlinkSync(filepath + '.tmp');
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      fs.unlinkSync(filepath + '.tmp');
      reject(err);
    });
  });
}

async function fetchAndProcessImage(filename, searchTerms) {
  const outputDir = path.join(path.dirname(__dirname), 'public', 'assets', 'meditation-previews');
  const outputPath = path.join(outputDir, `${filename}.jpg`);
  const tempPath = path.join(outputDir, `${filename}.jpg.tmp`);

  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const unsplashUrl = `${UNSPLASH_BASE}${searchTerms}`;

  try {
    // Download from Unsplash
    await downloadImage(unsplashUrl, outputPath);
    
    // Process with Sharp to ensure correct dimensions and optimization
    await sharp(tempPath)
      .resize(800, 320, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ 
        quality: 90, 
        progressive: true 
      })
      .toFile(outputPath);

    // Clean up temp file
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }

    console.log(`✅ Generated: ${filename}.jpg (${searchTerms})`);
    return true;
  } catch (error) {
    console.error(`❌ Error generating ${filename}.jpg:`, error.message);
    // Clean up any temp files
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    return false;
  }
}

async function generateAllImages() {
  console.log('🎨 Fetching themed images from Unsplash for meditation previews...\n');
  console.log('⏳ This may take a few minutes as we download 27 HD images...\n');

  let successful = 0;
  let failed = 0;

  for (const [filename, searchTerms] of Object.entries(meditationThemes)) {
    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const success = await fetchAndProcessImage(filename, searchTerms);
    if (success) {
      successful++;
    } else {
      failed++;
    }
  }

  console.log(`\n📊 Summary: ${successful} successful, ${failed} failed`);
  if (failed === 0) {
    console.log('✨ All meditation preview images generated successfully!');
    console.log('\n💡 Tip: Images are cached. To get fresh images, delete the files and run again.');
  }
}

generateAllImages().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
