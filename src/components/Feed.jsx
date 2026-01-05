import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import SettingsBottomSheet from './SettingsBottomSheet';
import HomeScreenSummary from './HomeScreenSummary';
import ProfileScreen from './ProfileScreen';
import PracticeCard from './PracticeCard';
import MinimalPracticeScreen from './MinimalPracticeScreen';
import PracticeOptions from './PracticeOptions';
import EmotionalStateFlow from './EmotionalStateFlow';
import ProgressStats from './ProgressStats';
import QuickPracticeSuggestions from './QuickPracticeSuggestions';
import stationsData from '../data/stations.json';
import { supabase } from '../lib/supabase';

// Extract stations data at module level to avoid Safari initialization issues
const INITIAL_STATIONS = stationsData?.stations || [];

export default function Feed({ onBack }) {
  const [spaces] = useState(INITIAL_STATIONS);
  const [greeting, setGreeting] = useState('Good afternoon');
  const [recommendedSpace, setRecommendedSpace] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeSpaceIndex, setActiveSpaceIndex] = useState(null);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [showPracticeSelection, setShowPracticeSelection] = useState(false);
  const [swipeHintReady] = useState(true);
  const [isAdminDesktop, setIsAdminDesktop] = useState(false);
  
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
    
    // Throttle scroll work to animation frames to reduce main-thread contention
    const scheduledRef = { current: false };
    const handleScroll = () => {
      if (scheduledRef.current) return;
      scheduledRef.current = true;
      requestAnimationFrame(() => {
        scheduledRef.current = false;
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
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [spaces.length]);

  const handleJoin = (normalizedIndex) => {
    setActiveSpaceIndex(normalizedIndex);
    setShowPracticeSelection(true);
    setSelectedPractice(null);
  };

  const handleLeave = () => {
    setActiveSpaceIndex(null);
    setShowPracticeSelection(false);
    setSelectedPractice(null);
  };

  const handlePracticeSelect = (practice) => {
    setSelectedPractice(practice);
    setShowPracticeSelection(false);
  };

  // Create infinite scroll by tripling the spaces array
  const infiniteSpaces = [...spaces, ...spaces, ...spaces];

  return (
    <>
      <div 
        ref={scrollContainerRef}
        className={`w-full ${activeSpaceIndex === null ? 'overflow-y-auto' : 'overflow-hidden'}`}
        style={{ 
          margin: 0, 
          padding: 0,
          minHeight: '100vh',
          height: activeSpaceIndex === null ? 'auto' : '100vh',
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
              <div className="flex items-center justify-between mb-2">
                <h1 className="font-hanken font-bold text-[32px] md:text-[48px] text-[#1e2d2e]">
                  {greeting}
                </h1>
                {isAdminDesktop && (
                  <a
                    href="/admin/analytics"
                    className="hidden md:inline-flex px-3 py-2 rounded-xl bg-[#1e2d2e]/10 hover:bg-[#1e2d2e]/20 text-[#1e2d2e] text-sm font-medium"
                    title="Admin Analytics"
                  >
                    Admin
                  </a>
                )}
              </div>
              <div className="mb-4" />
              
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
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleJoin(spaces.indexOf(recommendedSpace))}
                    className="bg-[#94d1c4]/20 rounded-[32px] p-8 border-2 border-[#94d1c4]/30 cursor-pointer flex items-center justify-between group overflow-hidden relative hover:scale-[1.01] transition-transform duration-150 will-change-transform"
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

            {/* Quick Practice Suggestions */}
            <QuickPracticeSuggestions 
              onSelectPractice={(suggestion) => {
                // Find the matching space by exact name match first, then fallback to intent matching
                let spaceIndex = 0;
                
                // Try exact name match with spaceName field
                if (suggestion.spaceName) {
                  spaceIndex = spaces.findIndex(s => s.name === suggestion.spaceName);
                }
                
                // If not found, try matching by intent
                if (spaceIndex === -1) {
                  spaceIndex = spaces.findIndex(s => 
                    s.name.toLowerCase().includes(suggestion.intent?.toLowerCase().replace(/_/g, ' ')) ||
                    suggestion.intent?.toLowerCase().includes(s.name.toLowerCase().replace(/ /g, '_'))
                  );
                }
                
                // Fallback to index 0 if still not found
                if (spaceIndex === -1) {
                  spaceIndex = 0;
                }
                
                handleJoin(spaceIndex);
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 content-auto">
              {spaces.map((space, index) => (
                <motion.button
                  key={`grid-${space.name}-${index}`}
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleJoin(index);
                  }}
                  className="bg-white rounded-[32px] p-8 shadow-sm border border-[#1e2d2e]/5 cursor-pointer relative overflow-hidden group h-64 flex flex-col justify-end hover:scale-[1.02] transition-transform duration-150 will-change-transform content-auto text-left"
                  style={{ touchAction: 'manipulation' }}
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
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Mobile-only infinite scroll - Hidden on desktop */}
        {activeSpaceIndex === null && (
          <div className="md:hidden">
            {infiniteSpaces.map((space, index) => {
              const normalizedIndex = index % spaces.length;
              return (
                <div 
                  key={`${space.name}-${index}`} 
                  className="snap-start snap-always w-full flex-shrink-0 min-h-screen" 
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
                    isCurrentlyActive={false}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Practice Selection Screen - 3 predefined + 1 custom */}
      {activeSpaceIndex !== null && showPracticeSelection && (
        <div className="fixed inset-0 z-50 bg-[#fcf8f2] flex flex-col overflow-y-auto">
          <div className="p-6" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.5rem)' }}>
            <button
              onClick={handleLeave}
              className="mb-6 p-2 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Back"
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M15 18l-6-6 6-6" 
                  stroke="#1e2d2e" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <h1 className="font-hanken font-bold text-3xl text-[#1e2d2e] mb-2">
              {spaces[activeSpaceIndex]?.name}
            </h1>
            <p className="text-[#1e2d2e]/60 font-hanken mb-8">
              Choose a practice or create your own
            </p>
            <PracticeOptions
              spaceName={spaces[activeSpaceIndex]?.name}
              onSelectPractice={handlePracticeSelect}
            />
          </div>
        </div>
      )}

      {/* Emotional State Flow - for custom practices */}
      {activeSpaceIndex !== null && selectedPractice?.type === 'custom' && !showPracticeSelection && !selectedPractice?.generated && (
        <EmotionalStateFlow
          station={spaces[activeSpaceIndex]}
          onComplete={async (flowData) => {
            // Generate custom practice
            try {
              const response = await fetch('/api/generate-practice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  emotionalState: flowData.currentState,
                  durationMinutes: flowData.duration / 60,
                  intent: flowData.intent,
                  spaceName: flowData.station
                }),
              });

              if (response.ok) {
                const data = await response.json();
                setSelectedPractice({
                  ...flowData,
                  generated: true,
                  guidance: data.content,
                  type: 'custom'
                });
              } else {
                console.error('Failed to generate practice');
                handleLeave();
              }
            } catch (err) {
              console.error('Error generating practice:', err);
              handleLeave();
            }
          }}
          onBack={() => {
            setSelectedPractice(null);
            setShowPracticeSelection(true);
          }}
        />
      )}

      {/* Minimal Practice Screen - shown when practice is selected */}
      {activeSpaceIndex !== null && selectedPractice && !showPracticeSelection && (selectedPractice?.type === 'preconfigured' || selectedPractice?.generated) && (
        <MinimalPracticeScreen
          station={spaces[activeSpaceIndex]}
          practice={selectedPractice}
          onBack={() => {
            setSelectedPractice(null);
            setShowPracticeSelection(true);
          }}
        />
      )}
      
      <SettingsBottomSheet isOpen={showSettings} onClose={() => setShowSettings(false)} />
      
      {showProfile && (
        <ProfileScreen onBack={() => setShowProfile(false)} />
      )}
    </>
  );
}
