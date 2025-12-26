import { useState, useEffect } from 'react';
import { useContentSet } from '../hooks/useContentSet';

// Use deployed API URL for local development since serverless functions don't run locally
const API_BASE = import.meta.env.DEV 
  ? 'https://magicwork.vercel.app'
  : '';

export default function ContentAssetsTest() {
  console.log('ContentAssetsTest component rendering');
  const { contentSet, loading, error } = useContentSet('Drift into Sleep');
  const [allAssets, setAllAssets] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  
  console.log('ContentAssetsTest state:', { loading, error, contentSet, allAssets });

  useEffect(() => {
    // Fetch all assets for the space
    async function fetchAllAssets() {
      setLoadingAll(true);
      try {
        const response = await fetch(`${API_BASE}/api/content-assets?space=Drift into Sleep`);
        if (response.ok) {
          const data = await response.json();
          console.log('All assets response:', data);
          setAllAssets(data);
        } else {
          console.error('API error:', response.status, response.statusText);
          const text = await response.text();
          console.error('Response body:', text);
          
          // For local dev, use mock data if API fails
          if (import.meta.env.DEV && response.status === 500) {
            console.warn('API returned 500, using mock data for local testing');
            setAllAssets([
              {
                id: 'drift-into-sleep-video-1',
                name: 'Drift into Sleep - Background Video 1',
                cdn_url: 'https://d3hajr7xji31qq.cloudfront.net/canva/videos/breathe-to-relax-video.mp4',
                type: 'video',
                format: 'mp4'
              },
              {
                id: 'drift-clouds-video',
                name: 'Clouds Video',
                cdn_url: 'https://d3hajr7xji31qq.cloudfront.net/canva/videos/clouds.mp4',
                type: 'video',
                format: 'mp4'
              },
              {
                id: 'drift-rain-video',
                name: 'Rain Video',
                cdn_url: 'https://d3hajr7xji31qq.cloudfront.net/canva/videos/rain.mp4',
                type: 'video',
                format: 'mp4'
              },
              {
                id: 'drift-waves-video',
                name: 'Waves Video',
                cdn_url: 'https://d3hajr7xji31qq.cloudfront.net/canva/videos/waves.mp4',
                type: 'video',
                format: 'mp4'
              },
              {
                id: 'drift-into-sleep-audio',
                name: 'Drift into Sleep - Audio Track',
                cdn_url: 'https://d3hajr7xji31qq.cloudfront.net/canva/audio/download.wav',
                type: 'audio',
                format: 'wav'
              }
            ]);
          }
        }
      } catch (err) {
        console.error('Error fetching all assets:', err);
        // For local dev, use mock data
        if (import.meta.env.DEV) {
          console.warn('Using mock data due to fetch error');
          setAllAssets([
            {
              id: 'drift-into-sleep-video-1',
              name: 'Drift into Sleep - Background Video 1',
              cdn_url: 'https://d3hajr7xji31qq.cloudfront.net/canva/videos/breathe-to-relax-video.mp4',
              type: 'video',
              format: 'mp4'
            },
            {
              id: 'drift-clouds-video',
              name: 'Clouds Video',
              cdn_url: 'https://d3hajr7xji31qq.cloudfront.net/canva/videos/clouds.mp4',
              type: 'video',
              format: 'mp4'
            },
            {
              id: 'drift-rain-video',
              name: 'Rain Video',
              cdn_url: 'https://d3hajr7xji31qq.cloudfront.net/canva/videos/rain.mp4',
              type: 'video',
              format: 'mp4'
            },
            {
              id: 'drift-waves-video',
              name: 'Waves Video',
              cdn_url: 'https://d3hajr7xji31qq.cloudfront.net/canva/videos/waves.mp4',
              type: 'video',
              format: 'mp4'
            },
            {
              id: 'drift-into-sleep-audio',
              name: 'Drift into Sleep - Audio Track',
              cdn_url: 'https://d3hajr7xji31qq.cloudfront.net/canva/audio/download.wav',
              type: 'audio',
              format: 'wav'
            }
          ]);
        }
      } finally {
        setLoadingAll(false);
      }
    }
    fetchAllAssets();
  }, []);

  if (loading) {
    return (
      <div className="full-viewport flex items-center justify-center bg-[#fcf8f2]">
        <p className="font-hanken text-[#172223]/60">Loading assets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="full-viewport flex items-center justify-center bg-[#fcf8f2]">
        <div className="text-center">
          <p className="font-hanken text-red-600 mb-2">Error loading assets</p>
          <p className="font-hanken text-[#172223]/60 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="full-viewport bg-[#fcf8f2] overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-hanken font-bold text-[#1e2d2e] text-3xl mb-6">
          Content Assets Test
        </h1>

        {/* Content Set (Visual + Audio Pair) */}
        <section className="mb-8">
          <h2 className="font-hanken font-bold text-[#1e2d2e] text-xl mb-4">
            Content Set (Visual + Audio Pair)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visual */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-hanken font-semibold text-[#1e2d2e] mb-2">Visual</h3>
              {contentSet.visual ? (
                <div>
                  <p className="text-sm text-[#172223]/60 mb-2">
                    <strong>ID:</strong> {contentSet.visual.id}
                  </p>
                  <p className="text-sm text-[#172223]/60 mb-2">
                    <strong>Name:</strong> {contentSet.visual.name}
                  </p>
                  <video
                    src={contentSet.visual.cdn_url}
                    controls
                    autoPlay
                    loop
                    muted
                    className="w-full rounded-lg mb-2"
                    style={{ maxHeight: '300px' }}
                  />
                  <p className="text-xs text-[#172223]/40 break-all">
                    {contentSet.visual.cdn_url}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-[#172223]/60">No visual asset found</p>
              )}
            </div>

            {/* Audio */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-hanken font-semibold text-[#1e2d2e] mb-2">Audio</h3>
              {contentSet.audio ? (
                <div>
                  <p className="text-sm text-[#172223]/60 mb-2">
                    <strong>ID:</strong> {contentSet.audio.id}
                  </p>
                  <p className="text-sm text-[#172223]/60 mb-2">
                    <strong>Name:</strong> {contentSet.audio.name}
                  </p>
                  <audio src={contentSet.audio.cdn_url} controls className="w-full mb-2" />
                  <p className="text-xs text-[#172223]/40 break-all">
                    {contentSet.audio.cdn_url}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-[#172223]/60">No audio asset found</p>
              )}
            </div>
          </div>
        </section>

        {/* All Assets */}
        <section>
          <h2 className="font-hanken font-bold text-[#1e2d2e] text-xl mb-4">
            All Assets for "Drift into Sleep" ({allAssets.length})
          </h2>

          {loadingAll ? (
            <p className="text-sm text-[#172223]/60">Loading all assets...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allAssets.map((asset) => (
                <div key={asset.id} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="mb-2">
                    <p className="font-hanken font-semibold text-[#1e2d2e] text-sm">
                      {asset.name}
                    </p>
                    <p className="text-xs text-[#172223]/60">
                      {asset.type} / {asset.format}
                    </p>
                  </div>

                  {asset.type === 'video' && (
                    <video
                      src={asset.cdn_url}
                      controls
                      muted
                      className="w-full rounded-lg mb-2"
                      style={{ maxHeight: '200px' }}
                    />
                  )}

                  {asset.type === 'audio' && (
                    <audio src={asset.cdn_url} controls className="w-full mb-2" />
                  )}

                  <p className="text-xs text-[#172223]/40 break-all mt-2">
                    {asset.cdn_url}
                  </p>
                </div>
              ))}
            </div>
          )}

          {allAssets.length === 0 && !loadingAll && (
            <p className="text-sm text-[#172223]/60">No assets found</p>
          )}
        </section>
      </div>
    </div>
  );
}

