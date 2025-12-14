import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PracticesTab from './in-the-space/PracticesTab';

export default function PracticeJoinedTabs({
  station,
  isPlaying,
  currentTrackInfo,
  onPlayPause,
  onNextTrack,
  participantCount,
  gradientStyle,
  onClose,
  onStartPractice,
  audioRef,
  onActiveTabChange,
  presenceSeconds = 0,
  onComplete
}) {
  const [showToast, setShowToast] = useState(null);
  const [isExpandedView, setIsExpandedView] = useState(false);
  const [showFullScreenCounter, setShowFullScreenCounter] = useState(false);
  
  // Filter state for SoundsFeed
  const [filter, setFilter] = useState('All');
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  // Handle favorite toggle
  const handleFavoriteToggle = (isFavorited) => {
    setShowToast(isFavorited ? 'favorited' : 'unfavorited');
    setTimeout(() => setShowToast(null), 2000);
  };

  // Handle complete
  const handleComplete = (data) => {
    if (onComplete) {
      onComplete(data);
    }
  };

  return (
    <div 
      className="w-full h-full relative full-viewport"
      style={{ ...gradientStyle, zIndex: 60, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', margin: 0, padding: 0 }}
    >
      {/* Header with Station Name - Fixed at top - Hidden in expanded view */}
      <AnimatePresence>
        {!showFullScreenCounter && (
          <motion.header 
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 right-0 z-30 bg-white/30 backdrop-blur-sm border-b border-[#1e2d2e]/5"
            style={{ 
              paddingTop: 'env(safe-area-inset-top, 0px)',
              height: 'calc(env(safe-area-inset-top, 0px) + 73px)',
              minHeight: 'calc(env(safe-area-inset-top, 0px) + 73px)'
            }}
          >
        <div className="px-6 py-4 flex items-center justify-center relative">
          <h1 className="font-hanken font-semibold text-[#1e2d2e] text-lg">
            {station.name}
          </h1>
          {/* Back button - In header */}
          <motion.button
            type="button"
            onClick={onClose}
            whileTap={{ scale: 0.9, opacity: 0.6 }}
            className="absolute left-4 p-2 rounded-full pointer-events-auto"
            aria-label="Back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18l-6-6 6-6" stroke="#1e2d2e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>
        </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Content Area - Scrollable, starts below header - Disable scroll in expanded view */}
      <main 
        className="w-full snap-container"
        style={{ 
          margin: 0,
          padding: 0,
          paddingTop: '16px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)',
          position: 'absolute',
          top: showFullScreenCounter ? 0 : 'calc(env(safe-area-inset-top, 0px) + 73px)',
          left: 0,
          right: 0,
          bottom: 0,
          // Use dynamic viewport height for mobile (accounts for browser UI)
          height: showFullScreenCounter ? '100vh' : 'calc(100dvh - env(safe-area-inset-top, 0px) - 73px)',
          maxHeight: showFullScreenCounter ? '100vh' : 'calc(100dvh - env(safe-area-inset-top, 0px) - 73px)',
          overflowY: showFullScreenCounter ? 'hidden' : 'auto',
          WebkitOverflowScrolling: showFullScreenCounter ? 'auto' : 'touch',
          overscrollBehavior: 'contain',
          touchAction: showFullScreenCounter ? 'none' : 'auto',
          // Improve scroll stability
          scrollBehavior: 'smooth',
          contain: 'layout style',
          willChange: 'scroll-position',
          // Prevent layout shifts
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)'
        }}
      >
        <PracticesTab
          station={station}
          isPlaying={isPlaying}
          currentTrackInfo={currentTrackInfo}
          onPlayPause={onPlayPause}
          audioRef={audioRef}
          participantCount={participantCount}
          filter={filter}
          onToggleFavorite={handleFavoriteToggle}
          onExpandedViewChange={(isExpanded) => {
            setShowFullScreenCounter(isExpanded);
            setIsExpandedView(isExpanded);
          }}
          onStartPractice={onStartPractice}
          onComplete={handleComplete}
        />
      </main>

      {/* Floating Filter Button - Hidden when in expanded view (practicing) */}
      {!isExpandedView && (
        <motion.button
          onClick={() => setShowFilterSheet(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#1e2d2e] text-white flex items-center justify-center shadow-lg"
          style={{ boxShadow: '0 4px 16px rgba(30, 45, 46, 0.3)' }}
          whileTap={{ scale: 0.9 }}
          aria-label="Filter"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
        </motion.button>
      )}

      {/* Filter Bottom Sheet - Hidden when in expanded view (practicing) */}
      <AnimatePresence>
        {showFilterSheet && !isExpandedView && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[70]"
              onClick={() => setShowFilterSheet(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl p-6 max-h-[60vh] overflow-y-auto"
              style={{ paddingBottom: 'env(safe-area-inset-bottom,24px)' }}
            >
              <div className="w-12 h-1 bg-[#1e2d2e]/20 rounded-full mx-auto mb-6" />
              <h3 className="font-hanken text-xl font-semibold text-[#1e2d2e] mb-6">Filter</h3>
              <div className="space-y-3">
                {['All', 'Sounds', 'Practices', 'Guided', 'Favorited'].map((filterName) => (
                  <button
                    key={filterName}
                    onClick={() => {
                      setFilter(filterName);
                      setShowFilterSheet(false);
                    }}
                    className={`w-full px-6 py-4 rounded-full font-hanken text-base transition-all text-left ${
                      filter === filterName
                        ? 'bg-[#1e2d2e] text-white'
                        : 'bg-white/70 text-[#1e2d2e] border border-[#1e2d2e]/20'
                    }`}
                  >
                    {filterName}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
                    
      {/* Toast - Liquid Glass, Centered Horizontally on Page */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: 20, scale: 0.9, x: '-50%' }}
            className="fixed left-1/2 bottom-[calc(env(safe-area-inset-bottom,24px)+16px)] z-50 px-8 py-4 rounded-2xl font-hanken text-sm md:text-base font-medium whitespace-nowrap text-[#1e2d2e]"
              style={{
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              boxShadow: '0 8px 32px rgba(30, 45, 46, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              {showToast === 'favorited' && '❤️ Added to favorites'}
              {showToast === 'unfavorited' && '💔 Removed from favorites'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
