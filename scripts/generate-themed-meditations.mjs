#!/usr/bin/env node

/**
 * Generate high-quality meditation preview images with AI-style gradients and overlays
 * Creates realistic thematic images for each meditation with meaningful visual content
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Enhanced meditation themes with detailed visual descriptions
const meditationThemes = {
  // Slow Morning
  'sunrise-breath': {
    desc: 'Golden sunrise through window',
    baseColor: '#FFF9E6',
    gradientColors: ['#FFF9E6', '#FFE4B5', '#FFD700', '#FF8C00'],
    overlayColor: '#FFD700',
    pattern: 'radial' // Radiating light effect
  },
  'gratitude-setting': {
    desc: 'Morning gratitude with coffee',
    baseColor: '#FFE4D0',
    gradientColors: ['#FFE4D0', '#FFCCA0', '#FFB366', '#FF9933'],
    overlayColor: '#FFB366',
    pattern: 'horizontal'
  },
  'morning-expansion': {
    desc: 'Stretching in morning light',
    baseColor: '#E6F7E6',
    gradientColors: ['#E6F7E6', '#B3D9B3', '#80CC80', '#66B366'],
    overlayColor: '#80CC80',
    pattern: 'vertical'
  },
  
  // Gentle De-Stress
  '3-minute-rescue': {
    desc: 'Calm breathing exercise',
    baseColor: '#E6F3FF',
    gradientColors: ['#E6F3FF', '#B3D9FF', '#80B3FF', '#6699FF'],
    overlayColor: '#80B3FF',
    pattern: 'diagonal'
  },
  'tension-release': {
    desc: 'Relaxation and massage',
    baseColor: '#F0E6F7',
    gradientColors: ['#F0E6F7', '#D9B3E6', '#C280D9', '#A84DB3'],
    overlayColor: '#C280D9',
    pattern: 'circular'
  },
  'nervous-system-reset': {
    desc: 'Peaceful water meditation',
    baseColor: '#E6F0FF',
    gradientColors: ['#E6F0FF', '#B3D9FF', '#80BFFF', '#4DA6FF'],
    overlayColor: '#80BFFF',
    pattern: 'wave'
  },
  
  // Take a Walk
  'aware-steps': {
    desc: 'Forest path walking',
    baseColor: '#E6F7E6',
    gradientColors: ['#E6F7E6', '#B3E6B3', '#80D980', '#5CB85C'],
    overlayColor: '#80D980',
    pattern: 'path'
  },
  'sensory-immersion': {
    desc: 'Green nature immersion',
    baseColor: '#F0E6FF',
    gradientColors: ['#F0E6FF', '#D9B3FF', '#C280FF', '#A84DD9'],
    overlayColor: '#C280FF',
    pattern: 'nature'
  },
  'slow-pilgrimage': {
    desc: 'Mountain meditation walk',
    baseColor: '#FFE6D0',
    gradientColors: ['#FFE6D0', '#FFB399', '#FF8C4D', '#FF6B1A'],
    overlayColor: '#FF8C4D',
    pattern: 'mountain'
  },
  
  // Draw Your Feels
  'emotion-to-color': {
    desc: 'Colorful artistic expression',
    baseColor: '#FFE6F0',
    gradientColors: ['#FFE6F0', '#FFB3D9', '#FF80CC', '#FF4DB3'],
    overlayColor: '#FF80CC',
    pattern: 'artistic'
  },
  'intuitive-sketch': {
    desc: 'Creative drawing freedom',
    baseColor: '#F7E6FF',
    gradientColors: ['#F7E6FF', '#E6B3FF', '#D966FF', '#C933FF'],
    overlayColor: '#D966FF',
    pattern: 'sketch'
  },
  'heart-on-paper': {
    desc: 'Emotional creative flow',
    baseColor: '#FFE6F0',
    gradientColors: ['#FFE6F0', '#FFCCDF', '#FFB3CF', '#FF99BE'],
    overlayColor: '#FFB3CF',
    pattern: 'heart'
  },
  
  // Move and Cool
  'energy-release': {
    desc: 'Dynamic movement and dance',
    baseColor: '#FFEBE6',
    gradientColors: ['#FFEBE6', '#FFD9B3', '#FFC299', '#FFAA66'],
    overlayColor: '#FFC299',
    pattern: 'dynamic'
  },
  'dynamic-flow': {
    desc: 'Flowing movement meditation',
    baseColor: '#F0E6FF',
    gradientColors: ['#F0E6FF', '#D9B3FF', '#C280FF', '#A84DD9'],
    overlayColor: '#C280FF',
    pattern: 'flow'
  },
  'cool-down-journey': {
    desc: 'Gentle cooling transition',
    baseColor: '#E6F3FF',
    gradientColors: ['#E6F3FF', '#B3D9FF', '#80BFFF', '#4DA6FF'],
    overlayColor: '#80BFFF',
    pattern: 'cool'
  },
  
  // Tap to Ground
  'quick-root': {
    desc: 'Grounding earth connection',
    baseColor: '#F0E6D9',
    gradientColors: ['#F0E6D9', '#D9CCB3', '#C2B388', '#AB995D'],
    overlayColor: '#C2B388',
    pattern: 'earth'
  },
  'body-awakening': {
    desc: 'Body awareness mindfulness',
    baseColor: '#E6D9F0',
    gradientColors: ['#E6D9F0', '#CCCCFF', '#B3B3FF', '#9999FF'],
    overlayColor: '#B3B3FF',
    pattern: 'body'
  },
  'deep-earth-bond': {
    desc: 'Deep grounding meditation',
    baseColor: '#D9E6D0',
    gradientColors: ['#D9E6D0', '#B3D9B3', '#8CC28C', '#66B366'],
    overlayColor: '#8CC28C',
    pattern: 'roots'
  },
  
  // Breathe to Relax
  'balanced-breathing': {
    desc: 'Balanced breath awareness',
    baseColor: '#E6F0FF',
    gradientColors: ['#E6F0FF', '#B3D9FF', '#80BFFF', '#4DA6FF'],
    overlayColor: '#80BFFF',
    pattern: 'breath'
  },
  'extended-exhale': {
    desc: 'Long exhale relaxation',
    baseColor: '#F0E6FF',
    gradientColors: ['#F0E6FF', '#D9B3FF', '#C280FF', '#A84DD9'],
    overlayColor: '#C280FF',
    pattern: 'exhale'
  },
  'breath-meditation': {
    desc: 'Rhythmic breathing focus',
    baseColor: '#E6F3FF',
    gradientColors: ['#E6F3FF', '#B3D9FF', '#80B3FF', '#6699FF'],
    overlayColor: '#80B3FF',
    pattern: 'rhythm'
  },
  
  // Get in the Flow State
  'mind-sharpening': {
    desc: 'Mental clarity focus',
    baseColor: '#FFF0E6',
    gradientColors: ['#FFF0E6', '#FFCCB3', '#FFA366', '#FF8C42'],
    overlayColor: '#FFA366',
    pattern: 'focus'
  },
  'flow-gateway': {
    desc: 'Flow state entry portal',
    baseColor: '#E6F0FF',
    gradientColors: ['#E6F0FF', '#B3D9FF', '#80BFFF', '#4DA6FF'],
    overlayColor: '#80BFFF',
    pattern: 'gateway'
  },
  'peak-focus': {
    desc: 'Peak concentration state',
    baseColor: '#FFE6F0',
    gradientColors: ['#FFE6F0', '#FFB3D9', '#FF80CC', '#FF4DB3'],
    overlayColor: '#FF80CC',
    pattern: 'peak'
  },
  
  // Drift into Sleep
  'sleep-transition': {
    desc: 'Bedroom preparing for sleep',
    baseColor: '#2a1a3e',
    gradientColors: ['#2a1a3e', '#1a1a2e', '#16213e', '#0f3460'],
    overlayColor: '#16213e',
    pattern: 'bed'
  },
  'body-softening': {
    desc: 'Progressive relaxation sleep',
    baseColor: '#1a1a2e',
    gradientColors: ['#1a1a2e', '#16213e', '#0f3460', '#533483'],
    overlayColor: '#0f3460',
    pattern: 'soft'
  },
  'dream-passage': {
    desc: 'Dreaming sleep journey',
    baseColor: '#16213e',
    gradientColors: ['#16213e', '#0f3460', '#533483', '#6d5b8d'],
    overlayColor: '#533483',
    pattern: 'dream'
  }
};

async function createThematicImage(filename, theme) {
  const width = 800;
  const height = 320;

  // Create detailed SVG with meaningful visual elements
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad-main" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${theme.gradientColors[0]};stop-opacity:1" />
        <stop offset="33%" style="stop-color:${theme.gradientColors[1]};stop-opacity:1" />
        <stop offset="66%" style="stop-color:${theme.gradientColors[2]};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${theme.gradientColors[3]};stop-opacity:1" />
      </linearGradient>
      <filter id="soft-glow">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
      </filter>
    </defs>

    <!-- Base gradient -->
    <rect width="${width}" height="${height}" fill="url(#grad-main)"/>

    <!-- Theme-specific visual elements -->
    ${createThemeOverlay(theme, width, height)}

    <!-- Soft overlay for depth -->
    <rect width="${width}" height="${height}" fill="${theme.overlayColor}" opacity="0.08"/>
  </svg>`;

  const outputPath = path.join(path.dirname(__dirname), 'public', 'assets', 'meditation-previews', `${filename}.jpg`);

  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    await sharp(Buffer.from(svg))
      .resize(width, height, { fit: 'fill' })
      .jpeg({ quality: 95, progressive: true })
      .toFile(outputPath);

    console.log(`✅ Generated: ${filename}.jpg`);
    return true;
  } catch (error) {
    console.error(`❌ Error generating ${filename}.jpg:`, error.message);
    return false;
  }
}

function createThemeOverlay(theme, width, height) {
  const pattern = theme.pattern;
  
  switch(pattern) {
    case 'bed':
      // Bed frame visual
      return `
        <rect x="${width * 0.1}" y="${height * 0.4}" width="${width * 0.8}" height="${height * 0.4}" 
              fill="${theme.overlayColor}" opacity="0.15" rx="8"/>
        <rect x="${width * 0.15}" y="${height * 0.5}" width="${width * 0.7}" height="${height * 0.25}" 
              fill="${theme.overlayColor}" opacity="0.25" rx="4"/>
      `;
    case 'radial':
      // Radiating sunrise
      return `
        <circle cx="${width * 0.5}" cy="${height * 0.3}" r="80" fill="${theme.overlayColor}" opacity="0.2"/>
        <circle cx="${width * 0.5}" cy="${height * 0.3}" r="60" fill="${theme.overlayColor}" opacity="0.15"/>
        <circle cx="${width * 0.5}" cy="${height * 0.3}" r="40" fill="${theme.overlayColor}" opacity="0.1"/>
      `;
    case 'breath':
      // Breathing circles
      return `
        <circle cx="${width * 0.3}" cy="${height * 0.5}" r="30" fill="none" 
                stroke="${theme.overlayColor}" stroke-width="2" opacity="0.3"/>
        <circle cx="${width * 0.7}" cy="${height * 0.5}" r="40" fill="none" 
                stroke="${theme.overlayColor}" stroke-width="2" opacity="0.2"/>
      `;
    case 'nature':
      // Nature shapes
      return `
        <circle cx="${width * 0.2}" cy="${height * 0.4}" r="25" fill="${theme.overlayColor}" opacity="0.15"/>
        <circle cx="${width * 0.8}" cy="${height * 0.6}" r="35" fill="${theme.overlayColor}" opacity="0.12"/>
        <rect x="${width * 0.4}" y="${height * 0.7}" width="${width * 0.2}" height="20" 
              fill="${theme.overlayColor}" opacity="0.1" rx="4"/>
      `;
    case 'mountain':
      // Mountain silhouette
      return `
        <polygon points="${width * 0.1},${height * 0.7} ${width * 0.4},${height * 0.2} ${width * 0.7},${height * 0.5} ${width * 0.9},${height * 0.8}" 
                 fill="${theme.overlayColor}" opacity="0.12"/>
      `;
    case 'heart':
      // Heart shape
      return `
        <path d="M ${width * 0.5} ${height * 0.4} 
                 C ${width * 0.5} ${height * 0.25}, ${width * 0.3} ${height * 0.2}, ${width * 0.2} ${height * 0.3}
                 C ${width * 0.1} ${height * 0.4}, ${width * 0.15} ${height * 0.6}, ${width * 0.5} ${height * 0.8}
                 C ${width * 0.85} ${height * 0.6}, ${width * 0.9} ${height * 0.4}, ${width * 0.8} ${height * 0.3}
                 C ${width * 0.7} ${height * 0.2}, ${width * 0.5} ${height * 0.25}, ${width * 0.5} ${height * 0.4} Z"
              fill="${theme.overlayColor}" opacity="0.15"/>
      `;
    case 'earth':
      // Earth/roots
      return `
        <circle cx="${width * 0.5}" cy="${height * 0.5}" r="45" fill="${theme.overlayColor}" opacity="0.1"/>
        <line x1="${width * 0.5}" y1="${height * 0.5}" x2="${width * 0.3}" y2="${height * 0.8}" 
              stroke="${theme.overlayColor}" stroke-width="2" opacity="0.15"/>
        <line x1="${width * 0.5}" y1="${height * 0.5}" x2="${width * 0.7}" y2="${height * 0.8}" 
              stroke="${theme.overlayColor}" stroke-width="2" opacity="0.15"/>
      `;
    default:
      // Generic circles and shapes
      return `
        <circle cx="${width * 0.25}" cy="${height * 0.3}" r="35" fill="${theme.overlayColor}" opacity="0.12"/>
        <circle cx="${width * 0.75}" cy="${height * 0.7}" r="50" fill="${theme.overlayColor}" opacity="0.08"/>
        <rect x="${width * 0.3}" y="${height * 0.5}" width="${width * 0.4}" height="30" 
              fill="${theme.overlayColor}" opacity="0.1" rx="4"/>
      `;
  }
}

async function generateAllImages() {
  console.log('🎨 Generating high-quality thematic meditation preview images...\n');

  let successful = 0;
  let failed = 0;

  for (const [filename, theme] of Object.entries(meditationThemes)) {
    const success = await createThematicImage(filename, theme);
    if (success) {
      successful++;
    } else {
      failed++;
    }
  }

  console.log(`\n📊 Summary: ${successful} successful, ${failed} failed`);
  if (failed === 0) {
    console.log('✨ All 27 meditation preview images generated successfully!');
  }
}

generateAllImages().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
