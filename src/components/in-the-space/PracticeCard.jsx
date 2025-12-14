import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

export function PracticeCard({ 
  item, 
  index, 
  isSelected, 
  isPlaying, 
  isInPracticeMode,
  assetsLoading,
  contentSet,
  favorites,
  onToggleFavorite,
  onCardClick,
  onPlayPause,
  audioProgress,
  audioCurrentTime,
  audioDuration,
  formatTime,
  getLiveCount,
  previewVideoRefs
}) {
  return (
    <div
      key={item.id}
      className="relative rounded-2xl overflow-hidden mx-auto"
      style={{ 
        width: '100%',
        maxWidth: '335px',
        aspectRatio: '335/595',
        boxShadow: '0 4px 16px rgba(30, 45, 46, 0.1)',
        minHeight: '595px',
        contain: 'layout style paint',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
        backgroundColor: item.isEmpty ? '#fcf8f2' : 'transparent'
      }}
    >
      {/* Preview Video Background */}
      {item.hasVideo && item.videoUrl && !assetsLoading && !isInPracticeMode && (
        <video
          ref={(el) => {
            if (el) previewVideoRefs.current[index] = el;
          }}
          key={`preview-video-${item.id}-${index}-${item.videoUrl}`}
          autoPlay
          loop
          muted
          playsInline
          preload={index === 0 ? "metadata" : "none"}
          src={item.videoUrl}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ 
            opacity: 0.8,
            willChange: 'opacity',
            transition: 'opacity 0.2s ease-in-out',
            pointerEvents: 'none'
          }}
          onTimeUpdate={(e) => {
            if (e.target.currentTime >= 15) {
              e.target.currentTime = 0;
            }
          }}
          onError={(e) => {
            e.target.style.opacity = '0.3';
          }}
        />
      )}

      {/* Loading state */}
      {item.hasVideo && assetsLoading && (
        <div className="absolute inset-0 bg-black opacity-20 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-white opacity-30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Empty card video */}
      {item.isEmpty && (
        <video
          key={`empty-card-video-${item.id}`}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ pointerEvents: 'none', zIndex: 0 }}
          src="https://magicwork-canva-assets.s3.eu-north-1.amazonaws.com/videos/canva/clouds.mp4"
          onError={(e) => {
            console.error('[PracticeCard] Empty card video failed to load:', e.target.src);
          }}
        />
      )}

      {/* Gradient Overlay */}
      {(item.hasVideo || item.isEmpty) && (
        <>
          <div
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, transparent 40%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.6) 100%)',
              zIndex: 0
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black to-opacity-60 pointer-events-none" />
        </>
      )}

      {/* UI Elements */}
      <div className="relative z-10 h-full flex flex-col p-4 md:p-5 pointer-events-auto">
        {/* Favorite Button */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(item.id);
            }}
            className={`p-2 transition-colors duration-150 ${favorites.has(item.id) ? 'text-[#E52431]' : 'text-white opacity-80 hover:text-white'}`}
            style={{ 
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              pointerEvents: 'auto'
            }}
            aria-label={favorites.has(item.id) ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={favorites.has(item.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {/* Card Title */}
        {item.hasVideo && (
          <div className="absolute top-4 left-4 z-20 max-w-[60%]">
            <span className="font-hanken text-white text-base md:text-lg font-bold" style={{ 
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 1px 3px rgba(0, 0, 0, 0.7)',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))'
            }}>
              {item.title || `Video ${item.videoNumber || index + 1}`}
            </span>
          </div>
        )}

        {/* Live User Count */}
        {!isInPracticeMode && (
          <div className="flex items-center gap-2 mb-auto pt-2">
            <div className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-opacity-40" style={{ animationDuration: '2.5s' }}></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-opacity-80"></span>
            </div>
            <span className="font-hanken text-white text-xs font-semibold" style={{ 
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 1px 2px rgba(0, 0, 0, 0.5)'
            }}>
              {getLiveCount(index) || 0} {getLiveCount(index) === 1 ? 'person is' : 'people are'} practicing now
            </span>
          </div>
        )}

        {/* Play/Pause Button */}
        {item.hasVideo && (
          <div className="flex-1 flex items-center justify-center relative z-20">
            {!isPlaying ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCardClick(index);
                }}
                className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                aria-label="Play"
                type="button"
                style={{ 
                  filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.6))',
                  pointerEvents: 'auto',
                  zIndex: 30,
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  minWidth: '44px',
                  minHeight: '44px'
                }}
              >
                <svg width="64" height="64" viewBox="0 0 24 24" fill="white" style={{ 
                  filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.8))',
                  pointerEvents: 'none'
                }}>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPlayPause(index);
                }}
                className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                aria-label="Pause"
                type="button"
                style={{ 
                  filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.6))',
                  pointerEvents: 'auto',
                  zIndex: 30,
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  minWidth: '44px',
                  minHeight: '44px'
                }}
              >
                <svg width="64" height="64" viewBox="0 0 24 24" fill="white" style={{ 
                  filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.8))',
                  pointerEvents: 'none'
                }}>
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Track Name */}
        {item.hasVideo && item.trackName && (
          <div className="mb-auto text-left">
            <div className="font-hanken text-white text-sm font-bold mb-1" style={{ 
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 1px 2px rgba(0, 0, 0, 0.5)'
            }}>
              {item.trackName} · {item.trackArtist || 'Ambient Sounds'} · {item.trackSource || 'Pixabay'}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {isSelected && (
          <div className="mt-auto">
            <div className="w-full h-2 bg-black bg-opacity-50 backdrop-blur-sm rounded-full overflow-hidden border border-white border-opacity-10">
              <div
                className="h-full bg-white bg-opacity-95 transition-all duration-100 rounded-full"
                style={{ width: `${audioProgress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="font-hanken text-xs text-white font-semibold" style={{ 
                textShadow: '0 2px 6px rgba(0, 0, 0, 0.8), 0 1px 2px rgba(0, 0, 0, 0.5)'
              }}>
                {formatTime(audioCurrentTime)}
              </span>
              <span className="font-hanken text-xs text-white font-semibold" style={{ 
                textShadow: '0 2px 6px rgba(0, 0, 0, 0.8), 0 1px 2px rgba(0, 0, 0, 0.5)'
              }}>
                {formatTime(audioDuration)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

