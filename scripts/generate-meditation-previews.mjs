#!/usr/bin/env node

/**
 * Generate meditation preview images with unique gradients
 * Creates one image per meditation (27 total - 3 per space)
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const meditations = {
  // Slow Morning
  'sunrise-breath': ['#FFF9E6', '#FFE4B5', '#FFD700', '#FF8C00'],
  'gratitude-setting': ['#FFE4D0', '#FFCCA0', '#FFB366', '#FF9933'],
  'morning-expansion': ['#E6F7E6', '#B3D9B3', '#80CC80', '#66B366'],
  // Gentle De-Stress
  '3-minute-rescue': ['#E6F3FF', '#B3D9FF', '#80B3FF', '#6699FF'],
  'tension-release': ['#F0E6F7', '#D9B3E6', '#C280D9', '#A84DB3'],
  'nervous-system-reset': ['#E6F0FF', '#B3D9FF', '#80BFFF', '#4DA6FF'],
  // Take a Walk
  'aware-steps': ['#E6F7E6', '#B3E6B3', '#80D980', '#5CB85C'],
  'sensory-immersion': ['#F0E6FF', '#D9B3FF', '#C280FF', '#A84DD9'],
  'slow-pilgrimage': ['#FFE6D0', '#FFB399', '#FF8C4D', '#FF6B1A'],
  // Draw Your Feels
  'emotion-to-color': ['#FFE6F0', '#FFB3D9', '#FF80CC', '#FF4DB3'],
  'intuitive-sketch': ['#F7E6FF', '#E6B3FF', '#D966FF', '#C933FF'],
  'heart-on-paper': ['#FFE6F0', '#FFCCDF', '#FFB3CF', '#FF99BE'],
  // Move and Cool
  'energy-release': ['#FFEBE6', '#FFD9B3', '#FFC299', '#FFAA66'],
  'dynamic-flow': ['#F0E6FF', '#D9B3FF', '#C280FF', '#A84DD9'],
  'cool-down-journey': ['#E6F3FF', '#B3D9FF', '#80BFFF', '#4DA6FF'],
  // Tap to Ground
  'quick-root': ['#F0E6D9', '#D9CCB3', '#C2B388', '#AB995D'],
  'body-awakening': ['#E6D9F0', '#CCCCFF', '#B3B3FF', '#9999FF'],
  'deep-earth-bond': ['#D9E6D0', '#B3D9B3', '#8CC28C', '#66B366'],
  // Breathe to Relax
  'balanced-breathing': ['#E6F0FF', '#B3D9FF', '#80BFFF', '#4DA6FF'],
  'extended-exhale': ['#F0E6FF', '#D9B3FF', '#C280FF', '#A84DD9'],
  'breath-meditation': ['#E6F3FF', '#B3D9FF', '#80B3FF', '#6699FF'],
  // Get in the Flow State
  'mind-sharpening': ['#FFF0E6', '#FFCCB3', '#FFA366', '#FF8C42'],
  'flow-gateway': ['#E6F0FF', '#B3D9FF', '#80BFFF', '#4DA6FF'],
  'peak-focus': ['#FFE6F0', '#FFB3D9', '#FF80CC', '#FF4DB3'],
  // Drift into Sleep
  'sleep-transition': ['#2a1a3e', '#1a1a2e', '#16213e', '#0f3460'],
  'body-softening': ['#1a1a2e', '#16213e', '#0f3460', '#533483'],
  'dream-passage': ['#16213e', '#0f3460', '#533483', '#6d5b8d']
};

async function createGradientImage(filename, colors) {
  const width = 800;
  const height = 320;

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
        <stop offset="33%" style="stop-color:${colors[1]};stop-opacity:1" />
        <stop offset="66%" style="stop-color:${colors[2]};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${colors[3]};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#grad)"/>
    <circle cx="${width * 0.2}" cy="${height * 0.2}" r="80" fill="${colors[0]}" opacity="0.2"/>
    <circle cx="${width * 0.8}" cy="${height * 0.8}" r="100" fill="${colors[3]}" opacity="0.2"/>
  </svg>`;

  const outputPath = path.join(path.dirname(__dirname), 'public', 'assets', 'meditation-previews', `${filename}.jpg`);

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    await sharp(Buffer.from(svg))
      .resize(width, height, { fit: 'fill' })
      .jpeg({ quality: 90, progressive: true })
      .toFile(outputPath);

    console.log(`✅ Generated: ${filename}.jpg`);
    return true;
  } catch (error) {
    console.error(`❌ Error generating ${filename}.jpg:`, error.message);
    return false;
  }
}

async function generateAllMeditations() {
  console.log('🎨 Generating meditation preview images...\n');

  let successful = 0;
  let failed = 0;

  for (const [filename, colors] of Object.entries(meditations)) {
    const success = await createGradientImage(filename, colors);
    if (success) {
      successful++;
    } else {
      failed++;
    }
  }

  console.log(`\n📊 Summary: ${successful} successful, ${failed} failed`);
  if (failed === 0) {
    console.log('✨ All meditation preview images generated successfully!');
  }
}

generateAllMeditations().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
