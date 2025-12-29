#!/usr/bin/env node

/**
 * Generate placeholder preview images for practices
 * Creates simple gradient-based SVG images for each practice space
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const practices = {
  'slow-morning': {
    title: 'Slow Morning',
    gradient: ['#FFF9E6', '#FFE4B5', '#FFD700', '#FF8C00'],
    emoji: '🌅'
  },
  'gentle-de-stress': {
    title: 'Gentle De-Stress',
    gradient: ['#E6F3FF', '#B3D9FF', '#80B3FF', '#6699FF'],
    emoji: '🌊'
  },
  'take-a-walk': {
    title: 'Take a Walk',
    gradient: ['#E6F7E6', '#B3D9B3', '#80CC80', '#66B366'],
    emoji: '🌲'
  },
  'draw-your-feels': {
    title: 'Draw Your Feels',
    gradient: ['#F7E6F7', '#E6B3E6', '#D966D9', '#C933C9'],
    emoji: '🎨'
  },
  'move-and-cool': {
    title: 'Move and Cool',
    gradient: ['#FFE6F0', '#FFB3D9', '#FF80CC', '#FF4DB3'],
    emoji: '💫'
  },
  'tap-to-ground': {
    title: 'Tap to Ground',
    gradient: ['#F0E6D9', '#D9CCB3', '#C2B388', '#AB995D'],
    emoji: '🌍'
  },
  'breathe-to-relax': {
    title: 'Breathe to Relax',
    gradient: ['#E6F0FF', '#B3D9FF', '#80BFFF', '#4DA6FF'],
    emoji: '💨'
  },
  'get-in-the-flow-state': {
    title: 'Get in the Flow State',
    gradient: ['#FFF0E6', '#FFCCB3', '#FFA366', '#FF8C42'],
    emoji: '🔥'
  },
  'drift-into-sleep': {
    title: 'Drift into Sleep',
    gradient: ['#1a1a2e', '#16213e', '#0f3460', '#533483'],
    emoji: '🌙'
  }
};

async function createGradientImage(filename, colors) {
  const width = 800;
  const height = 1000;

  // Create SVG with gradient and subtle decorative shapes (no fonts)
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
    <circle cx="${width * 0.2}" cy="${height * 0.25}" r="120" fill="${colors[0]}" opacity="0.12"/>
    <circle cx="${width * 0.8}" cy="${height * 0.75}" r="180" fill="${colors[3]}" opacity="0.10"/>
    <rect x="${width * 0.1}" y="${height * 0.7}" width="${width * 0.3}" height="40" fill="${colors[1]}" opacity="0.08"/>
  </svg>`;

  const outputPath = path.join(path.dirname(__dirname), 'public', 'assets', 'practice-previews', `${filename}.jpg`);

  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    await sharp(Buffer.from(svg))
      .resize(width, height, { fit: 'fill' })
      .jpeg({ quality: 85, progressive: true })
      .toFile(outputPath);

    console.log(`✅ Generated: ${filename}.jpg`);
    return true;
  } catch (error) {
    console.error(`❌ Error generating ${filename}.jpg:`, error.message);
    return false;
  }
}

async function generateAllImages() {
  console.log('🎨 Generating practice preview images...\n');

  let successful = 0;
  let failed = 0;

  for (const [filename, config] of Object.entries(practices)) {
    const success = await createGradientImage(filename, config.gradient);
    if (success) {
      successful++;
    } else {
      failed++;
    }
  }

  console.log(`\n📊 Summary: ${successful} successful, ${failed} failed`);
  if (failed === 0) {
    console.log('✨ All practice preview images generated successfully!');
  }
}

generateAllImages().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
