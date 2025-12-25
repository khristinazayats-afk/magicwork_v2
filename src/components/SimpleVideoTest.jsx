import { useState } from 'react';

export default function SimpleVideoTest() {
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const videoUrl = "https://magiwork-canva-assets.s3.eu-north-1.amazonaws.com/canva/videos/breathe-to-relax-video.mp4";

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Simple Video Test</h1>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">URL: {videoUrl}</p>
        {loaded && <p className="text-green-600">✅ Video loaded</p>}
        {error && <p className="text-red-600">❌ Error: {error}</p>}
      </div>

      <div className="relative rounded-xl overflow-hidden bg-gray-200" style={{ paddingBottom: '177.6%' }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          src={videoUrl}
          className="absolute top-0 left-0 w-full h-full object-cover"
          onLoadedData={() => {
            console.log('✅ Video loaded successfully!');
            setLoaded(true);
          }}
          onError={(e) => {
            const msg = `Failed to load: ${e.target.error?.message || 'Unknown error'}`;
            console.error('❌ Video error:', msg);
            setError(msg);
          }}
        />
      </div>

      <div className="mt-4">
        <a 
          href={videoUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Open video in new tab
        </a>
      </div>
    </div>
  );
}










