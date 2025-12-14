import { useState, useEffect, useRef } from 'react';
import { useContentSet } from '../hooks/useContentSet';

// Video Player Component with proper event handling
function VideoPlayer({ asset }) {
  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(null);
  const [videoReady, setVideoReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative w-full mb-2 rounded-lg overflow-hidden bg-black/5" style={{ maxHeight: '400px' }}>
      {videoError && (
        <div className="text-red-600 text-xs p-2 bg-red-50 rounded mb-2">
          ⚠️ Error: {videoError}
        </div>
      )}
      {!videoReady && !videoError && (
        <div className="text-[#172223]/60 text-xs p-2 bg-[#fcf8f2] rounded mb-2">
          ⏳ Loading video...
        </div>
      )}
      <video
        ref={videoRef}
        src={asset.cdn_url}
        controls
        muted
        playsInline
        preload="metadata"
        className="w-full rounded-lg"
        style={{ 
          maxHeight: '400px',
          objectFit: 'contain',
          width: '100%',
          pointerEvents: 'auto',
          zIndex: 1
        }}
        onClick={(e) => {
          e.stopPropagation();
          const video = e.target;
          console.log('[VideoPlayer] Video clicked, paused:', video.paused);
          if (video.paused) {
            video.play().then(() => {
              console.log('[VideoPlayer] Video play() succeeded');
              setIsPlaying(true);
            }).catch((err) => {
              console.error('[VideoPlayer] Video play() failed:', err);
              setVideoError(`Play failed: ${err.message}`);
            });
          } else {
            video.pause();
            setIsPlaying(false);
          }
        }}
        onLoadStart={() => {
          console.log('[VideoPlayer] Video loading:', asset.cdn_url);
          setVideoReady(false);
          setVideoError(null);
        }}
        onLoadedMetadata={() => {
          console.log('[VideoPlayer] Video metadata loaded:', asset.name);
          setVideoReady(true);
        }}
        onLoadedData={() => {
          console.log('[VideoPlayer] Video data loaded:', asset.name);
          setVideoReady(true);
        }}
        onCanPlay={() => {
          console.log('[VideoPlayer] Video can play:', asset.name);
          setVideoReady(true);
        }}
        onPlay={() => {
          console.log('[VideoPlayer] Video started playing:', asset.name);
          setIsPlaying(true);
        }}
        onPause={() => {
          console.log('[VideoPlayer] Video paused:', asset.name);
          setIsPlaying(false);
        }}
        onError={(e) => {
          const error = e.target.error;
          const errorDetails = {
            name: asset.name,
            url: asset.cdn_url,
            code: error?.code,
            message: error?.message,
            networkState: e.target.networkState,
            readyState: e.target.readyState
          };
          console.error('[VideoPlayer] Video error:', errorDetails);
          
          let errorMsg = 'Unknown error';
          if (error) {
            switch (error.code) {
              case error.MEDIA_ERR_ABORTED:
                errorMsg = 'Video loading aborted';
                break;
              case error.MEDIA_ERR_NETWORK:
                errorMsg = 'Network error loading video';
                break;
              case error.MEDIA_ERR_DECODE:
                errorMsg = 'Video decode error';
                break;
              case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                errorMsg = 'Video format not supported';
                break;
              default:
                errorMsg = error.message || 'Unknown error';
            }
          }
          setVideoError(errorMsg);
        }}
      >
        <source src={asset.cdn_url} type={`video/${asset.format || 'mp4'}`} />
        Your browser does not support the video tag.
      </video>
      <div className="text-xs text-[#172223]/40 mt-1">
        <a 
          href={asset.cdn_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="underline hover:text-[#1e2d2e]"
        >
          Open video URL
        </a>
        {isPlaying && <span className="ml-2 text-green-600">▶ Playing</span>}
      </div>
    </div>
  );
}

// All spaces from stations.json
const ALL_SPACES = [
  'Slow Morning',
  'Gentle De-Stress',
  'Take a Walk',
  'Draw Your Feels',
  'Move and Cool',
  'Tap to Ground',
  'Breathe to Relax',
  'Get in the Flow State',
  'Drift into Sleep'
];

// Use deployed API URL for local development
const API_BASE = import.meta.env.DEV 
  ? (import.meta.env.VITE_API_BASE_URL || 'https://magicwork.vercel.app')
  : '';

export default function AllContentAssetsTest() {
  const [allSpacesData, setAllSpacesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedSpace, setSelectedSpace] = useState(null);

  useEffect(() => {
    async function fetchAllSpaces() {
      setLoading(true);
      const data = {};
      
      for (const space of ALL_SPACES) {
        try {
          // Fetch all assets for this space
          const response = await fetch(
            `${API_BASE}/api/content-assets?space=${encodeURIComponent(space)}`
          );
          
          if (response.ok) {
            const assets = await response.json();
            data[space] = {
              assets: Array.isArray(assets) ? assets : [],
              error: null
            };
          } else {
            data[space] = {
              assets: [],
              error: `API returned ${response.status}: ${response.statusText}`
            };
          }
        } catch (err) {
          data[space] = {
            assets: [],
            error: err.message
          };
        }
      }
      
      setAllSpacesData(data);
      setLoading(false);
    }
    
    fetchAllSpaces();
  }, []);

  if (loading) {
    return (
      <div className="full-viewport flex items-center justify-center bg-[#fcf8f2]">
        <p className="font-hanken text-[#172223]/60">Loading all content assets...</p>
      </div>
    );
  }

  return (
    <div className="full-viewport bg-[#fcf8f2] overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-hanken font-bold text-[#1e2d2e] text-3xl mb-2">
          All Content Assets from Supabase
        </h1>
        <p className="font-hanken text-[#172223]/60 text-sm mb-6">
          This page shows all content assets loaded from your Supabase database for each space.
        </p>

        {/* Summary */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <h2 className="font-hanken font-semibold text-[#1e2d2e] mb-3">Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {ALL_SPACES.map(space => {
              const spaceData = allSpacesData[space] || { assets: [], error: null };
              const liveAssets = spaceData.assets.filter(a => a.status === 'live');
              const videos = liveAssets.filter(a => a.type === 'video');
              const audio = liveAssets.filter(a => a.type === 'audio');
              
              return (
                <div 
                  key={space}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedSpace === space 
                      ? 'border-[#1e2d2e] bg-[#1e2d2e]/5' 
                      : 'border-[#1e2d2e]/20 hover:border-[#1e2d2e]/40'
                  }`}
                  onClick={() => setSelectedSpace(selectedSpace === space ? null : space)}
                >
                  <div className="font-hanken font-semibold text-[#1e2d2e] text-sm mb-1">
                    {space}
                  </div>
                  <div className="text-xs text-[#172223]/60">
                    {liveAssets.length} asset{liveAssets.length !== 1 ? 's' : ''}
                    {videos.length > 0 && ` • ${videos.length} video${videos.length !== 1 ? 's' : ''}`}
                    {audio.length > 0 && ` • ${audio.length} audio`}
                  </div>
                  {spaceData.error && (
                    <div className="text-xs text-red-600 mt-1">⚠️ {spaceData.error}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed View for Selected Space */}
        {selectedSpace && (
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-hanken font-bold text-[#1e2d2e] text-xl">
                {selectedSpace}
              </h2>
              <button
                onClick={() => setSelectedSpace(null)}
                className="text-[#172223]/60 hover:text-[#1e2d2e]"
              >
                ✕ Close
              </button>
            </div>

            {(() => {
              const spaceData = allSpacesData[selectedSpace] || { assets: [], error: null };
              const liveAssets = spaceData.assets.filter(a => a.status === 'live');
              
              if (spaceData.error) {
                return (
                  <div className="text-red-600">
                    <p className="font-semibold mb-2">Error loading assets:</p>
                    <p className="text-sm">{spaceData.error}</p>
                  </div>
                );
              }

              if (liveAssets.length === 0) {
                return (
                  <div className="text-[#172223]/60">
                    <p className="mb-2">No live assets found for this space.</p>
                    <p className="text-sm">
                      Upload files to Supabase and set <code className="bg-[#fcf8f2] px-1 rounded">allocated_space</code> to "{selectedSpace}" 
                      and <code className="bg-[#fcf8f2] px-1 rounded">status</code> to "live".
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {liveAssets.map((asset) => (
                      <div key={asset.id} className="border border-[#1e2d2e]/20 rounded-lg p-4">
                        <div className="mb-2">
                          <div className="font-hanken font-semibold text-[#1e2d2e] text-sm mb-1">
                            {asset.name}
                          </div>
                          <div className="text-xs text-[#172223]/60 mb-2">
                            {asset.type} / {asset.format} • {asset.status}
                          </div>
                          {asset.allocated_space && (
                            <div className="text-xs text-[#172223]/60 mb-2">
                              Space: {asset.allocated_space}
                            </div>
                          )}
                        </div>

                        {asset.type === 'video' && asset.cdn_url && (
                          <>
                            <VideoPlayer asset={asset} />
                            <div className="text-xs text-[#172223]/40 mt-1">
                              <a 
                                href={asset.cdn_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="underline hover:text-[#1e2d2e]"
                              >
                                Open video URL
                              </a>
                            </div>
                          </>
                        )}

                      {asset.type === 'audio' && asset.cdn_url && (
                        <audio 
                          src={asset.cdn_url} 
                          controls 
                          preload="metadata"
                          className="w-full mb-2"
                          onError={(e) => {
                            const error = e.target.error;
                            console.error('[AllContentAssetsTest] Audio error:', {
                              name: asset.name,
                              url: asset.cdn_url,
                              code: error?.code,
                              message: error?.message
                            });
                          }}
                        >
                          <source src={asset.cdn_url} type={`audio/${asset.format || 'mp3'}`} />
                          Your browser does not support the audio tag.
                        </audio>
                      )}

                      {asset.cdn_url && (
                        <p className="text-xs text-[#172223]/40 break-all mt-2">
                          {asset.cdn_url}
                        </p>
                      )}

                      {!asset.cdn_url && (
                        <p className="text-xs text-red-600 mt-2">
                          ⚠️ Missing CDN URL
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-hanken font-semibold text-[#1e2d2e] mb-3">
            How to Use Content from Supabase
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-[#172223]/80">
            <li>Upload files to S3 and add them to the <code className="bg-white px-1 rounded">content_assets</code> table in Supabase</li>
            <li>Set <code className="bg-white px-1 rounded">allocated_space</code> to the space name (e.g., "Slow Morning")</li>
            <li>Set <code className="bg-white px-1 rounded">status</code> to "live"</li>
            <li>Ensure <code className="bg-white px-1 rounded">cdn_url</code> points to your S3/CDN URL</li>
            <li>The app will automatically fetch and display content for spaces that use the database</li>
            <li>Currently, "Drift into Sleep" and "Breathe to Relax" use database content automatically</li>
            <li>Other spaces can be enabled by updating <code className="bg-white px-1 rounded">PracticesTab.jsx</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
}
