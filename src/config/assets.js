/**
 * Canva Assets Configuration
 * 
 * Centralized asset management using CDN URLs with local fallbacks
 * Assets are automatically synced from Canva → S3 → CDN
 */

import assetsManifest from '../../canva-assets.json';

// Get CDN base URL from environment or manifest
const CDN_BASE_URL = import.meta.env.VITE_CDN_BASE_URL || assetsManifest.cdnBaseUrl;
const USE_CDN = import.meta.env.VITE_USE_CDN !== 'false'; // Default true

/**
 * Get asset URL with CDN/local fallback
 */
export function getCanvaAsset(assetId, options = {}) {
  const asset = assetsManifest.assets.find(a => a.id === assetId);
  
  if (!asset) {
    console.warn(`[Assets] Asset not found: ${assetId}`);
    return null;
  }

  // Use CDN URL if enabled, otherwise use local fallback
  const url = USE_CDN ? asset.cdnUrl : asset.localFallback;

  if (options.debug) {
    console.log(`[Assets] ${assetId}:`, {
      title: asset.title,
      url,
      source: USE_CDN ? 'CDN' : 'Local',
      lastUpdated: asset.lastUpdated
    });
  }

  return url;
}

/**
 * Get asset metadata
 */
export function getCanvaAssetMeta(assetId) {
  return assetsManifest.assets.find(a => a.id === assetId);
}

/**
 * Get all assets for a specific usage
 */
export function getAssetsByUsage(usage) {
  return assetsManifest.assets
    .filter(a => a.usedIn.includes(usage))
    .map(a => ({
      id: a.id,
      title: a.title,
      url: getCanvaAsset(a.id)
    }));
}

/**
 * Preload critical assets
 */
export function preloadAssets(assetIds) {
  assetIds.forEach(id => {
    const asset = assetsManifest.assets.find(a => a.id === id);
    if (!asset) return;

    const url = getCanvaAsset(id);
    
    // Preload based on type
    if (asset.format === 'mp4') {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.src = url;
    } else {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    }
  });
}

/**
 * Export pre-configured asset URLs
 * Using fallback values to prevent build errors if assets are missing
 */
export const CANVA_ASSETS = {
  // Videos
  BREATHE_VIDEO: getCanvaAsset('breathe-to-relax-video') || "https://magiwork-canva-assets.s3.eu-north-1.amazonaws.com/canva/videos/breathe-to-relax-video.mp4",
  MOBILE_BG: getCanvaAsset('mobile-video-bg') || null,
  
  // Images
  EMBRACE_JOURNEY: getCanvaAsset('embrace-journey-card') || null,
  EMAIL_TEMPLATE: getCanvaAsset('email-template') || null,
};

/**
 * Asset validation helper
 */
export function validateAssets() {
  const issues = [];
  
  assetsManifest.assets.forEach(asset => {
    if (!asset.cdnUrl) {
      issues.push(`${asset.id}: Missing CDN URL`);
    }
    if (!asset.localFallback) {
      issues.push(`${asset.id}: Missing local fallback`);
    }
  });

  if (issues.length > 0) {
    console.warn('[Assets] Validation issues:', issues);
  }

  return issues.length === 0;
}

// Log asset configuration in development
if (import.meta.env.DEV) {
  console.log('[Assets] Configuration:', {
    cdnBaseUrl: CDN_BASE_URL,
    useCDN: USE_CDN,
    assetsCount: assetsManifest.assets.length,
    lastUpdated: assetsManifest.lastUpdated
  });
}

export default {
  get: getCanvaAsset,
  getMeta: getCanvaAssetMeta,
  getByUsage: getAssetsByUsage,
  preload: preloadAssets,
  validate: validateAssets,
  CANVA_ASSETS
};

