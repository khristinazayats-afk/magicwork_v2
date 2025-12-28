import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import SettingsBottomSheet from './SettingsBottomSheet';
import HomeScreenSummary from './HomeScreenSummary';
const ProfileScreen = lazy(() => import('./ProfileScreen'));
import PracticeCard from './PracticeCard';
import ProgressStats from './ProgressStats';
import stationsData from '../data/stations.json';

export default function Feed({ onBack }) {
  const [spaces] = useState(stationsData.stations || []);
  const [greeting, setGreeting] = useState('Good afternoon');
  const [recommendedSpace, setRecommendedSpace] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeSpaceIndex, setActiveSpaceIndex] = useState(null);
  const [swipeHintReady] = useState(true);
  
  const scrollContainerRef = useRef(null);
  const isScrollingRef = useRef(false);
  const hasInitializedScrollRef = useRef(false);
  const lastScrollTopRef = useRef(0);

  // Update greeting and recommendation based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Good morning');
      setRecommendedSpace(spaces.find(s => s.name === 'Slow Morning'));
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good afternoon');
      setRecommendedSpace(spaces.find(s => s.name === 'Get in the Flow State'));
    } else if (hour >= 17 && hour < 21) {
      setGreeting('Good evening');
      setRecommendedSpace(spaces.find(s => s.name === 'Gentle De-Stress'));
    } else {
      setGreeting('Good night');
      setRecommendedSpace(spaces.find(s => s.name === 'Drift into Sleep'));
    }
  }, [spaces]);

  // Initialize scroll position for infinite scroll
  useEffect(() => {
    if (spaces.length > 0 && scrollContainerRef.current && !hasInitializedScrollRef.current) {
      requestAnimationFrame(() => {
        if (!scrollContainerRef.current) return;
        
        hasInitializedScrollRef.current = true;
        isScrollingRef.current = true;
        const middleSetStart = spaces.length;
        
        // Scroll to the beginning of the middle set
        const card = scrollContainerRef.current.children[middleSetStart + 1]; // +1 for the header
        if (card) {
          card.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
        
        requestAnimationFrame(() => {
          isScrollingRef.current = false;
        });
      });
    }
  }, [spaces.length]);

  // Handle infinite scroll - seamlessly loop when reaching edges
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || spaces.length === 0) return;
    
    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const cardHeight = scrollHeight / (spaces.length * 3);

      // Near top edge - loop to bottom set
      if (scrollTop < cardHeight * 2) {
        isScrollingRef.current = true;
        const offset = scrollTop + (cardHeight * spaces.length);
        container.scrollTo({ top: offset, behavior: 'instant' });
        requestAnimationFrame(() => { isScrollingRef.current = false; });
      }
      // Near bottom edge - loop to top set
      else if (scrollTop > scrollHeight - clientHeight - cardHeight * 2) {
        isScrollingRef.current = true;
        const offset = scrollTop - (cardHeight * spaces.length);
        container.scrollTo({ top: offset, behavior: 'instant' });
        requestAnimationFrame(() => { isScrollingRef.current = false; });
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [spaces.length]);

  const handleJoin = (normalizedIndex) => {
    setActiveSpaceIndex(normalizedIndex);
  };

  const handleLeave = () => {
    setActiveSpaceIndex(null);
  };

  // Create infinite scroll by tripling the spaces array
  const infiniteSpaces = [...spaces, ...spaces, ...spaces];

  return (
    <>
      <div 
        ref={scrollContainerRef}
        className={`full-viewport w-full ${activeSpaceIndex === null ? 'overflow-y-scroll md:overflow-y-auto' : 'overflow-hidden'}`}
        style={{ 
          margin: 0, 
          padding: 0,
          backgroundColor: '#fcf8f2'
        }}
      >
        {/* Mobile Hamburger Menu */}
        {activeSpaceIndex === null && (
          <motion.button
            onClick={() => setShowSettings(true)}
            whileTap={{ scale: 0.9 }}
            className="md:hidden fixed top-4 left-4 z-40 p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-sm"
            aria-label="Menu"
            style={{ marginTop: 'env(safe-area-inset-top, 0)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12h18M3 6h18M3 18h18" stroke="#1e2d2e" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </motion.button>
        )}

        {/* Dashboard Header */}
        {activeSpaceIndex === null && (
          <div className="w-full px-6 py-8 md:px-12 md:py-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <h1 className="font-hanken font-bold text-[32px] md:text-[48px] text-[#1e2d2e] mb-4">
                {greeting}
              </h1>
              
              <div className="flex flex-col md:flex-row gap-6 mb-12">
                <ProgressStats />
                <HomeScreenSummary variant="white" onVibeClick={() => setShowProfile(true)} />
              </div>

              {recommendedSpace && (
                <div className="mb-12">
                  <h2 className="text-sm font-hanken font-bold text-[#1e2d2e]/40 uppercase tracking-widest mb-4">
                    Recommended for you
                  </h2>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleJoin(spaces.indexOf(recommendedSpace))}
                    className="bg-[#94d1c4]/20 rounded-[32px] p-8 border-2 border-[#94d1c4]/30 cursor-pointer flex items-center justify-between group overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full bg-[#94d1c4] text-white text-[10px] font-bold uppercase tracking-wider">
                          Quick Start
                        </span>
                        <h3 className="font-hanken font-bold text-2xl text-[#1e2d2e]">{recommendedSpace.name}</h3>
                      </div>
                      <p className="font-hanken text-[#1e2d2e]/60">
                        {recommendedSpace.description || "The perfect way to spend a few moments right now."}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#1e2d2e] flex items-center justify-center text-white relative z-10 shadow-lg group-hover:bg-[#1e2d2e]/90 transition-colors">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 5l8 7-8 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spaces.map((space, index) => (
                <motion.div
                  key={`grid-${space.name}-${index}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleJoin(index)}
                  className="bg-white rounded-[32px] p-8 shadow-sm border border-[#1e2d2e]/5 cursor-pointer relative overflow-hidden group h-64 flex flex-col justify-end"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-[#1e2d2e]/5 group-hover:from-white/20 transition-all" />
                  <div className="relative z-10">
                    <h3 className="font-hanken font-bold text-2xl text-[#1e2d2e] mb-2">{space.name}</h3>
                    <p className="font-hanken text-[#1e2d2e]/60 text-sm mb-4 line-clamp-2">
                      {space.description || "A quiet space for presence."}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#E52431] animate-pulse" />
                      <span className="text-[10px] font-hanken font-semibold text-[#1e2d2e]/40 uppercase tracking-widest">
                        Live Now
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Mobile-only infinite scroll - Hidden on desktop */}
        <div className="md:hidden">
          {infiniteSpaces.map((space, index) => {
            const normalizedIndex = index % spaces.length;
            return (
              <div 
                key={`${space.name}-${index}`} 
                className="snap-start snap-always w-full flex-shrink-0 full-viewport" 
                style={{ margin: 0, padding: 0 }}
              >
                <PracticeCard
                  station={space}
                  isActive={index === spaces.length}
                  hasInteracted={true}
                  showFirstTimeHint={false}
                  swipeHintReady={swipeHintReady}
                  key={`card-${index}`}
                  onBack={handleLeave}
                  currentIndex={(normalizedIndex) + 1}
                  totalPractices={spaces.length}
                  onJoin={() => handleJoin(normalizedIndex)}
                  onLeave={handleLeave}
                  isCurrentlyActive={activeSpaceIndex === normalizedIndex}
                />
              </div>
            );
          })}
        </div>
      </div>
      
      <SettingsBottomSheet isOpen={showSettings} onClose={() => setShowSettings(false)} />
      
      {showProfile && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-[#fcf8f2] flex items-center justify-center z-50">
            <div className="w-12 h-12 border-4 border-[#1e2d2e]/10 border-t-[#1e2d2e] rounded-full animate-spin" />
          </div>
        }>
          <ProfileScreen onBack={() => setShowProfile(false)} />
        </Suspense>
      )}
    </>
  );
}
