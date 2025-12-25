import { useState, useEffect } from 'react';

// Use deployed API URL for local development since serverless functions don't run locally
// Try to use proxy first, fallback to deployed API
const API_BASE = import.meta.env.DEV 
  ? (import.meta.env.VITE_API_BASE_URL || 'https://magiwork.vercel.app')
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
        
        // Fetch content set (visual + audio)
        const setResponse = await fetch(
          `${API_BASE}/api/content-assets?set=true&space=${encodeURIComponent(spaceName)}`
        );
        
        // Also fetch all videos for the space
        const videosResponse = await fetch(
          `${API_BASE}/api/content-assets?space=${encodeURIComponent(spaceName)}`
        );
        
        if (!setResponse.ok) {
          // If API fails (500 or any error), use fallback mock data for supported spaces
          if (spaceName === 'Drift into Sleep' || spaceName === 'Slow Morning') {
            console.warn(`API returned ${setResponse.status}, using fallback data for ${spaceName}`);
            const s3BaseUrl = 'https://magiwork-canva-assets.s3.eu-north-1.amazonaws.com';
            
            if (spaceName === 'Slow Morning') {
              // Fallback for Slow Morning - use clouds video
              const mockData = {
                visual: {
                  id: 'slow-morning-clouds-video',
                  name: 'Slow Morning - Clouds Video',
                  cdn_url: `${s3BaseUrl}/videos/canva/clouds.mp4`,
                  type: 'video',
                  format: 'mp4',
                  s3_key: 'videos/canva/clouds.mp4',
                  allocated_space: 'Slow Morning'
                },
                visuals: [
                  {
                    id: 'slow-morning-clouds-video',
                    name: 'Slow Morning - Clouds Video',
                    cdn_url: `${s3BaseUrl}/videos/canva/clouds.mp4`,
                    type: 'video',
                    format: 'mp4',
                    s3_key: 'videos/canva/clouds.mp4'
                  }
                ],
                audio: null
              };
              setContentSet(mockData);
              setLoading(false);
              return;
            } else if (spaceName === 'Drift into Sleep') {
              // Mock data with all 4 videos for Drift into Sleep
              const mockData = {
                visual: {
                  id: 'drift-clouds-video',
                  name: 'Clouds Video',
                  cdn_url: `${s3BaseUrl}/video/canva/clouds.mp4`,
                  type: 'video',
                  format: 'mp4',
                  s3_key: 'video/canva/clouds.mp4',
                  allocated_space: 'Drift into Sleep'
                },
                visuals: [
                  {
                    id: 'drift-clouds-video',
                    name: 'Clouds Video',
                    cdn_url: `${s3BaseUrl}/video/canva/clouds.mp4`,
                    type: 'video',
                    format: 'mp4',
                    s3_key: 'video/canva/clouds.mp4'
                  },
                  {
                    id: 'drift-rain-video',
                    name: 'Rain Video',
                    cdn_url: `${s3BaseUrl}/video/canva/rain.mp4`,
                    type: 'video',
                    format: 'mp4',
                    s3_key: 'video/canva/rain.mp4'
                  },
                  {
                    id: 'drift-waves-video',
                    name: 'Waves Video',
                    cdn_url: `${s3BaseUrl}/video/canva/waves.mp4`,
                    type: 'video',
                    format: 'mp4',
                    s3_key: 'video/canva/waves.mp4'
                  },
                  {
                    id: 'drift-into-sleep-video-1',
                    name: 'Drift into Sleep - Background Video 1',
                    cdn_url: `${s3BaseUrl}/video/canva/breathe-to-relax-video.mp4`,
                    type: 'video',
                    format: 'mp4',
                    s3_key: 'video/canva/breathe-to-relax-video.mp4'
                  }
                ],
                audio: {
                  id: 'drift-into-sleep-audio',
                  name: 'Drift into Sleep - Audio Track',
                  cdn_url: `${s3BaseUrl}/audio/download.wav`,
                  type: 'audio',
                  format: 'wav',
                  s3_key: 'audio/download.wav',
                  allocated_space: 'Drift into Sleep'
                }
              };
              setContentSet(mockData);
              setLoading(false);
              return;
            }
          }
          throw new Error(`Failed to fetch content set: ${setResponse.statusText}`);
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
        
        // For "Drift into Sleep", ensure we have multiple videos
        // If API only returns 1 video or less, use mock data with 4 videos
        let finalVisuals = allVideos.length > 0 ? allVideos : (setData.visual ? [setData.visual] : []);
        
        // For "Drift into Sleep", always ensure we have 4 videos
        if (spaceName === 'Drift into Sleep') {
          if (finalVisuals.length < 4) {
            console.warn(`Only ${finalVisuals.length} video(s) found for Drift into Sleep, using mock data with 4 videos`);
            const s3BaseUrl = 'https://magiwork-canva-assets.s3.eu-north-1.amazonaws.com';
            finalVisuals = [
              {
                id: 'drift-clouds-video',
                name: 'Clouds Video',
                cdn_url: `${s3BaseUrl}/video/canva/clouds.mp4`,
                type: 'video',
                format: 'mp4',
                s3_key: 'video/canva/clouds.mp4'
              },
              {
                id: 'drift-rain-video',
                name: 'Rain Video',
                cdn_url: `${s3BaseUrl}/video/canva/rain.mp4`,
                type: 'video',
                format: 'mp4',
                s3_key: 'video/canva/rain.mp4'
              },
              {
                id: 'drift-waves-video',
                name: 'Waves Video',
                cdn_url: `${s3BaseUrl}/video/canva/waves.mp4`,
                type: 'video',
                format: 'mp4',
                s3_key: 'video/canva/waves.mp4'
              },
              {
                id: 'drift-into-sleep-video-1',
                name: 'Drift into Sleep - Background Video 1',
                cdn_url: `${s3BaseUrl}/video/canva/breathe-to-relax-video.mp4`,
                type: 'video',
                format: 'mp4',
                s3_key: 'video/canva/breathe-to-relax-video.mp4'
              }
            ];
          } else {
            console.log(`Found ${finalVisuals.length} videos for Drift into Sleep, using API data`);
          }
        }
        
        setContentSet({
          ...setData,
          visuals: finalVisuals
        });
      } catch (err) {
        console.error('Error fetching content set:', err);
        // Use mock data as fallback for supported spaces when API fails
        if (spaceName === 'Drift into Sleep' || spaceName === 'Slow Morning') {
          console.warn(`Using fallback data due to API error for ${spaceName}`);
          const s3BaseUrl = 'https://magiwork-canva-assets.s3.eu-north-1.amazonaws.com';
          
          if (spaceName === 'Slow Morning') {
            // Fallback for Slow Morning - use clouds video
            setContentSet({
              visual: {
                id: 'slow-morning-clouds-video',
                name: 'Slow Morning - Clouds Video',
                cdn_url: `${s3BaseUrl}/videos/canva/clouds.mp4`,
                type: 'video',
                format: 'mp4',
                s3_key: 'videos/canva/clouds.mp4',
                allocated_space: 'Slow Morning'
              },
              visuals: [
                {
                  id: 'slow-morning-clouds-video',
                  name: 'Slow Morning - Clouds Video',
                  cdn_url: `${s3BaseUrl}/videos/canva/clouds.mp4`,
                  type: 'video',
                  format: 'mp4',
                  s3_key: 'videos/canva/clouds.mp4'
                }
              ],
              audio: null
            });
            setError(null); // Clear error so component renders
          } else if (spaceName === 'Drift into Sleep') {
            setContentSet({
              visual: {
                id: 'drift-clouds-video',
                name: 'Clouds Video',
                cdn_url: `${s3BaseUrl}/video/canva/clouds.mp4`,
                type: 'video',
                format: 'mp4',
                s3_key: 'video/canva/clouds.mp4',
                allocated_space: 'Drift into Sleep'
              },
              visuals: [
                {
                  id: 'drift-clouds-video',
                  name: 'Clouds Video',
                  cdn_url: `${s3BaseUrl}/video/canva/clouds.mp4`,
                  type: 'video',
                  format: 'mp4',
                  s3_key: 'video/canva/clouds.mp4'
                },
                {
                  id: 'drift-rain-video',
                  name: 'Rain Video',
                  cdn_url: `${s3BaseUrl}/video/canva/rain.mp4`,
                  type: 'video',
                  format: 'mp4',
                  s3_key: 'video/canva/rain.mp4'
                },
                {
                  id: 'drift-waves-video',
                  name: 'Waves Video',
                  cdn_url: `${s3BaseUrl}/video/canva/waves.mp4`,
                  type: 'video',
                  format: 'mp4',
                  s3_key: 'video/canva/waves.mp4'
                },
                {
                  id: 'drift-into-sleep-video-1',
                  name: 'Drift into Sleep - Background Video 1',
                  cdn_url: `${s3BaseUrl}/video/canva/breathe-to-relax-video.mp4`,
                  type: 'video',
                  format: 'mp4',
                  s3_key: 'video/canva/breathe-to-relax-video.mp4'
                }
              ],
              audio: {
                id: 'drift-into-sleep-audio',
                name: 'Drift into Sleep - Audio Track',
                cdn_url: `${s3BaseUrl}/audio/download.wav`,
                type: 'audio',
                format: 'wav',
                s3_key: 'audio/download.wav',
                allocated_space: 'Drift into Sleep'
              }
            });
            setError(null); // Clear error so component renders
          }
        } else {
          setError(err.message);
          setContentSet({ visual: null, audio: null, visuals: [] });
        }
      } finally {
        setLoading(false);
      }
    }

    fetchContentSet();
  }, [spaceName]);

  return { contentSet, loading, error };
}






