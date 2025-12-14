import { useState, useEffect } from 'react';

/**
 * CanvaBackground - Display Canva designs as backgrounds
 * 
 * Usage examples:
 * 
 * Static image background:
 * <CanvaBackground 
 *   type="image" 
 *   src="/assets/canva/images/meditation-bg.png"
 * />
 * 
 * Video background:
 * <CanvaBackground 
 *   type="video" 
 *   src="/assets/canva/videos/meditative-loop.mp4"
 *   overlay="dark"
 * />
 */
function CanvaBackground({ 
  type = 'image', 
  src, 
  overlay = 'none', // 'none', 'light', 'dark'
  children,
  className = ''
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  const overlayClasses = {
    none: '',
    light: 'bg-white/40',
    dark: 'bg-black/40'
  };

  if (type === 'video') {
    return (
      <div className={`relative w-full h-full overflow-hidden ${className}`}>
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onLoadedData={() => setIsLoaded(true)}
        >
          <source src={src} type="video/mp4" />
        </video>

        {/* Overlay */}
        {overlay !== 'none' && (
          <div className={`absolute inset-0 ${overlayClasses[overlay]}`} />
        )}

        {/* Content */}
        <div className="relative z-10 w-full h-full">
          {children}
        </div>

        {/* Loading state */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
        )}
      </div>
    );
  }

  // Image background
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${src})` }}
      />

      {/* Overlay */}
      {overlay !== 'none' && (
        <div className={`absolute inset-0 ${overlayClasses[overlay]}`} />
      )}

      {/* Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}

export default CanvaBackground;










