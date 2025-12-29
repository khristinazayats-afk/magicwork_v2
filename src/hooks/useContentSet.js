import { useState, useEffect } from 'react';
import { useTenant } from '../context/TenantContext';

// Use deployed API URL for local development since serverless functions don't run locally
// Try to use proxy first, fallback to deployed API
const API_BASE = import.meta.env.DEV 
  ? (import.meta.env.VITE_API_BASE_URL || 'https://magicwork-six.vercel.app')
  : '';

/**
 * Hook to fetch visual + audio content set for a space
 * 
 * @param {string} spaceName - The name of the space (e.g., "Breathe to Relax")
 * @returns {Object} { contentSet: { visual, audio, visuals }, loading, error }
 * 
 * @example
 * const { contentSet, loading } = useContentSet('Breathe to Relax');
 * const videoUrl = contentSet.visual?.cdn_url;
 * const audioUrl = contentSet.audio?.cdn_url;
 * const allVideos = contentSet.visuals; // Array of all videos for the space
 */
export function useContentSet(spaceName) {
  const { tenant } = useTenant();
  const [contentSet, setContentSet] = useState({ visual: null, audio: null, visuals: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!spaceName) {
      setLoading(false);
      return;
    }

    async function fetchContentSet() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch content set (visual + audio) scoped by tenant and live-only
        const setResponse = await fetch(
          `${API_BASE}/api/content-assets?set=true&status=live&tenant=${encodeURIComponent(tenant)}&space=${encodeURIComponent(spaceName)}`,
          { headers: { 'X-Tenant': tenant } }
        );

        // Also fetch all videos for the space (live-only)
        const videosResponse = await fetch(
          `${API_BASE}/api/content-assets?status=live&tenant=${encodeURIComponent(tenant)}&space=${encodeURIComponent(spaceName)}`,
          { headers: { 'X-Tenant': tenant } }
        );

        if (!setResponse.ok) {
          throw new Error(`Failed to fetch content set: ${setResponse.status} ${setResponse.statusText}`);
        }
        
        const setData = await setResponse.json();
        
        // Parse all videos if videos response is ok
        let allVideos = [];
        if (videosResponse.ok) {
          try {
            const videosData = await videosResponse.json();
            // Filter to only videos
            allVideos = Array.isArray(videosData) 
              ? videosData.filter(asset => asset.type === 'video' && asset.status === 'live')
              : [];
          } catch (e) {
            console.warn('Failed to parse videos response:', e);
            allVideos = [];
          }
        } else {
          console.warn(`Videos API returned ${videosResponse.status}, will use content set videos or fallback`);
        }
        
        console.log('Content set response:', setData);
        console.log('All videos for space:', allVideos);
        
        // Determine visuals from live API only
        const finalVisuals = allVideos.length > 0 ? allVideos : (setData.visual ? [setData.visual] : []);
        
        setContentSet({
          ...setData,
          visuals: finalVisuals
        });
      } catch (err) {
        console.error('Error fetching content set:', err);
        setError(err.message);
        setContentSet({ visual: null, audio: null, visuals: [] });
      } finally {
        setLoading(false);
      }
    }

    fetchContentSet();
  }, [spaceName, tenant]);

  return { contentSet, loading, error };
}






