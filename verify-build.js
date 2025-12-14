#!/usr/bin/env node
/**
 * Build verification script
 * Checks for common build issues before deployment
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { readFileSync } from 'fs';

console.log('🔍 Verifying build configuration...\n');

let errors = [];
let warnings = [];

// Check if dist folder exists (from previous build)
if (existsSync('dist')) {
  console.log('✅ dist/ folder exists');
} else {
  warnings.push('dist/ folder not found (will be created on build)');
}

// Check package.json
try {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  console.log('✅ package.json is valid');
  
  if (!pkg.scripts?.build) {
    errors.push('Missing "build" script in package.json');
  } else {
    console.log('✅ Build script found:', pkg.scripts.build);
  }
} catch (e) {
  errors.push('Invalid package.json: ' + e.message);
}

// Check vite.config.js
if (existsSync('vite.config.js')) {
  console.log('✅ vite.config.js exists');
} else {
  errors.push('vite.config.js not found');
}

// Check vercel.json
if (existsSync('vercel.json')) {
  console.log('✅ vercel.json exists');
} else {
  warnings.push('vercel.json not found (optional)');
}

// Check for node_modules
if (existsSync('node_modules')) {
  console.log('✅ node_modules exists');
} else {
  errors.push('node_modules not found - run npm install');
}

// Check critical source files
const criticalFiles = [
  'src/main.jsx',
  'src/App.jsx',
  'index.html'
];

criticalFiles.forEach(file => {
  if (existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    errors.push(`Critical file missing: ${file}`);
  }
});

// Summary
console.log('\n📊 Verification Summary:');
if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All checks passed! Ready to build and deploy.\n');
  process.exit(0);
} else {
  if (errors.length > 0) {
    console.log('\n❌ Errors found:');
    errors.forEach(err => console.log('  -', err));
  }
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach(warn => console.log('  -', warn));
  }
  console.log('\n');
  process.exit(errors.length > 0 ? 1 : 0);
}

