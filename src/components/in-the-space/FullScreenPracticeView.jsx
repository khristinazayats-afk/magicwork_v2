import { motion, AnimatePresence } from 'framer-motion';

export function FullScreenPracticeView({ 
  isOpen, 
  selectedCardIndex, 
  isPlaying,
  videoSrc,
  timeRemaining,
  audioProgress,
  onClose,
  onPlayPause,
  onComplete,
  expandedVideoRef,
  formatTime
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div
            key="expanded-bg"
            className="fixed z-40"
            style={{ 
              top: 0,
              left: 0,
              width: '100vw',
              height: '100dvh',
              maxWidth: '100vw',
              maxHeight: '100dvh',
              margin: 0,
              padding: 0,
              backgroundColor: '#000',
              zIndex: 40
            }}
          >
            <video
              ref={expandedVideoRef}
              key={`expanded-video-${selectedCardIndex}-${isPlaying ? 'playing' : 'paused'}`}
              src={videoSrc || ''}
              autoPlay={isPlaying}
              loop
              muted
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPlayPause(selectedCardIndex);
              }}
            />

            {/* Controls Overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 md:p-6" style={{ zIndex: 50 }}>
              {/* Top: Exit Button */}
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="w-12 h-12 rounded-full bg-black bg-opacity-60 backdrop-blur-md flex items-center justify-center active:bg-black active:opacity-80 active:scale-95"
                  style={{ 
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                  aria-label="Exit full screen"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Center: Play/Pause Button */}
              <div className="flex-1 flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onPlayPause(selectedCardIndex);
                  }}
                  className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center transition-transform active:scale-95"
                  style={{ 
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="white">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Bottom: Timer and Complete Button */}
              <div className="space-y-4">
                {timeRemaining !== null && (
                  <div className="text-center">
                    <div className="font-hanken text-white text-2xl md:text-3xl font-bold mb-2">
                      {Math.max(0, Math.floor(timeRemaining))} seconds remaining
                    </div>
                  </div>
                )}

                <div className="w-full h-1 bg-white opacity-20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-100 rounded-full"
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>

                <button
                  onClick={onComplete}
                  className="w-full rounded-full bg-white opacity-30 backdrop-blur-md text-white font-hanken font-semibold border-2 border-white opacity-50 active:scale-95"
                  style={{ 
                    padding: '16px',
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  Complete
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

