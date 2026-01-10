#!/usr/bin/env node

/**
 * Set environment variables in Vercel using the REST API
 * 
 * Usage: node scripts/set-vercel-env.js [VERCEL_TOKEN]
 * 
 * If VERCEL_TOKEN is not provided, it will try to use:
 * 1. VERCEL_TOKEN environment variable
 * 2. ~/.vercel/auth.json (if vercel CLI is linked)
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { homedir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ID = 'prj_Jzeqro18ZIkV8tJPcTkHaHoacjtU'; // magicwork project
const VERCEL_API_URL = 'https://api.vercel.com';

// Environment variables to set
const ENV_VARS = {
  ELEVENLABS_API_KEY: 'sk_654d070bd8fe7043b341bbc4d0b1b35cbe75eb2e8930bdf8',
  HIGGSFIELD_API_KEY_ID: 'a04c96c9-c475-4c8e-870f-750389b1180f',
  HIGGSFIELD_API_KEY_SECRET: '48f7adf01dc11f69df3cf21d3e2f8b3c53b760ccd732b0e24bb5ddc5fc563580',
};

// Get Vercel token from various sources
function getVercelToken() {
  // 1. Check command line argument
  if (process.argv[2]) {
    return process.argv[2];
  }

  // 2. Check environment variable
  if (process.env.VERCEL_TOKEN) {
    return process.env.VERCEL_TOKEN;
  }

  // 3. Try to read from ~/.vercel/auth.json (if vercel CLI is linked)
  const authPath = join(homedir(), '.vercel', 'auth.json');
  if (existsSync(authPath)) {
    try {
      const auth = JSON.parse(readFileSync(authPath, 'utf-8'));
      if (auth.token) {
        return auth.token;
      }
    } catch (e) {
      console.error('Error reading auth.json:', e.message);
    }
  }

  return null;
}

// Set environment variable in Vercel
async function setEnvVar(token, projectId, key, value, environments = ['production', 'preview', 'development']) {
  const url = `${VERCEL_API_URL}/v9/projects/${projectId}/env`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      key,
      value,
      type: 'encrypted',
      target: environments,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to set ${key}: ${response.status} ${response.statusText} - ${error}`);
  }

  return await response.json();
}

// Main function
async function main() {
  const token = getVercelToken();

  if (!token) {
    console.error('❌ Vercel token not found!');
    console.error('\nPlease provide a Vercel token in one of these ways:');
    console.error('1. Pass as argument: node scripts/set-vercel-env.js YOUR_TOKEN');
    console.error('2. Set environment variable: VERCEL_TOKEN=YOUR_TOKEN node scripts/set-vercel-env.js');
    console.error('3. Link Vercel CLI first: vercel link (then this script will auto-detect the token)');
    console.error('\nGet your token from: https://vercel.com/account/tokens');
    process.exit(1);
  }

  console.log(`🔧 Setting environment variables for project: ${PROJECT_ID}`);
  console.log(`📝 Variables to set: ${Object.keys(ENV_VARS).join(', ')}\n`);

  const results = [];
  
  for (const [key, value] of Object.entries(ENV_VARS)) {
    try {
      console.log(`Setting ${key}...`);
      const result = await setEnvVar(token, PROJECT_ID, key, value);
      results.push({ key, success: true, result });
      console.log(`✅ ${key} set successfully\n`);
    } catch (error) {
      console.error(`❌ Failed to set ${key}: ${error.message}\n`);
      results.push({ key, success: false, error: error.message });
    }
  }

  console.log('\n📊 Summary:');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successfully set: ${successful}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n⚠️  Some variables failed to set. Please check the errors above.');
    process.exit(1);
  }

  console.log('\n🎉 All environment variables set successfully!');
  console.log('\n⚠️  Important: You may need to redeploy your project for changes to take effect.');
  console.log('   Go to: https://vercel.com/dashboard -> Your Project -> Deployments -> Redeploy');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
