import { useState } from 'react';

/**
 * CanvaShareCard - Display Canva designs as shareable cards
 * Perfect for social media posts, practice completion screens, etc.
 * 
 * Usage:
 * <CanvaShareCard
 *   title="Practice Complete!"
 *   imageSrc="/assets/canva/images/embrace-journey.png"
 *   onShare={() => shareToSocial()}
 *   onDownload={() => downloadImage()}
 * />
 */
function CanvaShareCard({ 
  title,
  description,
  imageSrc,
  onShare,
  onDownload,
  className = ''
}) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <div className={`bg-white rounded-2xl shadow-xl overflow-hidden ${className}`}>
      {/* Header */}
      {title && (
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {description && (
            <p className="text-gray-600 mt-2">{description}</p>
          )}
        </div>
      )}

      {/* Canva Design Image */}
      <div className="relative bg-gray-100">
        {!isImageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gray-200" />
        )}
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-auto"
          onLoad={() => setIsImageLoaded(true)}
        />
      </div>

      {/* Actions */}
      <div className="p-6 flex gap-4">
        {onShare && (
          <button
            onClick={onShare}
            className="flex-1 bg-[#8fb569] text-white py-3 px-6 rounded-lg hover:bg-[#7a9e5a] transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <ShareIcon />
            Share
          </button>
        )}
        {onDownload && (
          <button
            onClick={onDownload}
            className="flex-1 border-2 border-[#8fb569] text-[#8fb569] py-3 px-6 rounded-lg hover:bg-[#8fb569] hover:text-white transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <DownloadIcon />
            Download
          </button>
        )}
      </div>
    </div>
  );
}

// Simple icons
function ShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 6.66667C16.3807 6.66667 17.5 5.54738 17.5 4.16667C17.5 2.78595 16.3807 1.66667 15 1.66667C13.6193 1.66667 12.5 2.78595 12.5 4.16667C12.5 5.54738 13.6193 6.66667 15 6.66667Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 12.5C6.38071 12.5 7.5 11.3807 7.5 10C7.5 8.61929 6.38071 7.5 5 7.5C3.61929 7.5 2.5 8.61929 2.5 10C2.5 11.3807 3.61929 12.5 5 12.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 18.3333C16.3807 18.3333 17.5 17.214 17.5 15.8333C17.5 14.4526 16.3807 13.3333 15 13.3333C13.6193 13.3333 12.5 14.4526 12.5 15.8333C12.5 17.214 13.6193 18.3333 15 18.3333Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.15833 11.175L12.85 14.6583" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.8417 5.34167L7.15833 8.825" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.5 12.5V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.83333 8.33333L10 12.5L14.1667 8.33333" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 12.5V2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default CanvaShareCard;










