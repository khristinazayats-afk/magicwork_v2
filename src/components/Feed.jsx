import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SettingsBottomSheet from './SettingsBottomSheet';
import HomeScreenSummary from './HomeScreenSummary';
import ProfileScreen from './ProfileScreen';
import PracticeCard from './PracticeCard';
import FirstTimeGuide from './FirstTimeGuide';
import ProgressStats from './ProgressStats';
import stationsData from '../data/stations.json';

export default function Feed({ onBack }) {
  console.log('Feed: Component rendering');
  
  const [spaces] = useState(stationsData.stations || []);
  const [greeting, setGreeting] = useState('Good afternoon');
  const [recommendedSpace, setRecommendedSpace] = useState(null);

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
  
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeSpaceIndex, setActiveSpaceIndex] = useState(null);
  // Check sessionStorage to see if user has seen the hint before
  const [showHint, setShowHint] = useState(() => {
    return !sessionStorage.getItem('hasSeenFeedGuide');
  });
  const [interactedCards, setInteractedCards] = useState(new Set()); // Track which cards have been interacted with
  // SwipeHint should appear immediately if FirstTimeGuide is not showing and we're on "Get in the Flow State"
  const [swipeHintReady, setSwipeHintReady] = useState(() => {
    // Show SwipeHint immediately if FirstTimeGuide won't show (user has seen it before)
    return !!sessionStorage.getItem('hasSeenFeedGuide');
  });
  const scrollContainerRef = useRef(null);
  const isScrollingRef = useRef(false);
  const hasInitializedScrollRef = useRef(false);
  const hintReadyRef = useRef(false);
  const lastScrollTopRef = useRef(0);
  const showHintRef = useRef(showHint); // Keep ref in sync with state
  const hasScrolledToGetInFlowStateRef = useRef(false); // Track if we've scrolled to Get in the Flow State
  const hintDismissedTimeRef = useRef(null); // Track when hint was dismissed to prevent immediate interaction tracking
  const isScrollingToSwipeHintRef = useRef(false); // Prevent interaction tracking during programmatic scroll to SwipeHint

  // Keep ref in sync with state
  useEffect(() => {
    showHintRef.current = showHint;
    // When FirstTimeGuide is dismissed, SwipeHint should appear
    if (!showHint) {
      setSwipeHintReady(true);
      console.log('[Feed] FirstTimeGuide dismissed, setting swipeHintReady to true');
    } else {
      setSwipeHintReady(false);
      console.log('[Feed] FirstTimeGuide showing, resetting swipeHintReady to false');
    }
  }, [showHint]);
  
  // Also set SwipeHint ready when feed loads if FirstTimeGuide won't show
  useEffect(() => {
    if (!showHint && spaces.length > 0) {
      // Small delay to ensure card is rendered
      setTimeout(() => {
        setSwipeHintReady(true);
        console.log('[Feed] Feed loaded, FirstTimeGuide not showing, setting swipeHintReady to true');
      }, 100);
    }
  }, [spaces.length, showHint]);

  // Scroll to "Get in the Flow State" card when feed loads and hint should be shown
  useEffect(() => {
    if (!showHint || hasScrolledToGetInFlowStateRef.current || !scrollContainerRef.current || spaces.length === 0) return;
    
    // Find index of "Get in the Flow State" in the stations array
    const getInFlowStateIndex = spaces.findIndex(space => space.name === 'Get in the Flow State');
    if (getInFlowStateIndex === -1) return;
    
    // Wait for DOM to be ready, then scroll to "Get in the Flow State" in the middle set
    const scrollToGetInFlowState = () => {
      if (!scrollContainerRef.current || hasScrolledToGetInFlowStateRef.current) return;
      
      hasScrolledToGetInFlowStateRef.current = true;
      hintReadyRef.current = true; // Mark hint as ready to be dismissed
      
      const middleSetStart = spaces.length;
      const getInFlowStateCardIndex = middleSetStart + getInFlowStateIndex;
      
      // Scroll to the "Get in the Flow State" card
      // children[0] is HomeScreenSummary, so card index is getInFlowStateCardIndex + 1
      const card = scrollContainerRef.current.children[getInFlowStateCardIndex + 1];
      if (card) {
        isScrollingRef.current = true;
        card.scrollIntoView({ behavior: 'instant', block: 'start' });
        requestAnimationFrame(() => {
          isScrollingRef.current = false;
        });
      }
    };
    
    // Try immediately, then fallback with timeout to ensure DOM is ready
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToGetInFlowState();
        // Fallback in case requestAnimationFrame doesn't work
        setTimeout(scrollToGetInFlowState, 50);
      });
    });
  }, [showHint, spaces]);

  // Initialize scroll position for infinite scroll - but only after hint is dismissed
  useEffect(() => {
    // Don't initialize scroll if hint is showing - wait for user to dismiss it first
    if (showHint || hasInitializedScrollRef.current) return;
    
    if (spaces.length > 0 && scrollContainerRef.current && !isScrollingRef.current) {
      requestAnimationFrame(() => {
        if (!scrollContainerRef.current || showHint) return;
        
        hasInitializedScrollRef.current = true;
        isScrollingRef.current = true;
        const middleSetStart = spaces.length;
        const lastCardIndex = middleSetStart + spaces.length - 1;
        
        const card = scrollContainerRef.current.children[lastCardIndex + 1];
        if (card) {
          card.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
        
        requestAnimationFrame(() => {
          isScrollingRef.current = false;
        });
      });
    }
  }, [spaces.length, showHint]);

  // Dismiss hint function - accessible from both scroll handlers and button click
  const dismissHint = useCallback(() => {
    // Use ref to check current state (avoids closure issues)
    if (showHintRef.current) {
      console.log('[Feed] Dismissing hint screen - button clicked');
      showHintRef.current = false;
      setShowHint(false);
      hintDismissedTimeRef.current = Date.now(); // Record dismissal time
      sessionStorage.setItem('hasSeenFeedGuide', 'true');
      
      // Reset scroll tracking ref so we can scroll again
      hasScrolledToGetInFlowStateRef.current = false;
      // swipeHintReady will be set to true by the useEffect that watches showHint
      
      // Reset interaction state for "Get in the Flow State" card so SwipeHint can appear
      const getInFlowStateIndex = spaces.findIndex(space => space.name === 'Get in the Flow State');
      if (getInFlowStateIndex !== -1) {
        setInteractedCards(prev => {
          const newSet = new Set(prev);
          newSet.delete(getInFlowStateIndex); // Remove from interacted set
          console.log('[Feed] Reset interaction for Get in the Flow State, index:', getInFlowStateIndex, 'remaining:', Array.from(newSet), 'showHint:', showHintRef.current);
          return newSet;
        });
      }
      
      // SwipeHint readiness is already handled by the useEffect that watches showHint
      // Wait for exit animation to complete (400ms) before scrolling to "Get in the Flow State"
      setTimeout(() => {
        if (scrollContainerRef.current) {
          // Set protection flags BEFORE scrolling to prevent interaction tracking
          isScrollingRef.current = true;
          isScrollingToSwipeHintRef.current = true;
          console.log('[Feed] Setting scroll protection flags before scrolling to SwipeHint');
          
          requestAnimationFrame(() => {
            if (!scrollContainerRef.current) return;
            hasScrolledToGetInFlowStateRef.current = true;
            
            // Find "Get in the Flow State" card and scroll to it
            const getInFlowStateIndex = spaces.findIndex(space => space.name === 'Get in the Flow State');
            console.log('[Feed] Found Get in the Flow State at index:', getInFlowStateIndex);
            if (getInFlowStateIndex !== -1) {
              const middleSetStart = spaces.length;
              const getInFlowStateCardIndex = middleSetStart + getInFlowStateIndex;
              const card = scrollContainerRef.current.children[getInFlowStateCardIndex + 1];
              console.log('[Feed] Scrolling to card index:', getInFlowStateCardIndex + 1, 'card exists:', !!card);
              if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'start' });
                console.log('[Feed] Scroll initiated to Get in the Flow State card');
              }
            }
            
            // Release scroll lock after scroll completes
            setTimeout(() => {
              isScrollingRef.current = false;
              console.log('[Feed] Scroll completed, SwipeHint should be visible');
            }, 800);
            
            setTimeout(() => {
              isScrollingToSwipeHintRef.current = false;
              console.log('[Feed] Releasing SwipeHint protection, interaction tracking can resume');
            }, 3000); // Keep protection for 3 seconds total
          });
        }
      }, 500); // Wait for FirstTimeGuide exit animation
    } else {
      console.log('[Feed] dismissHint called but showHintRef.current is false');
    }
  }, [spaces]);

  // Handle infinite scroll - seamlessly loop when reaching edges
  // Also dismiss hint when user scrolls
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || spaces.length === 0) {
      console.log('[Feed] Scroll handler setup skipped:', { container: !!container, spacesLength: spaces.length });
      return;
    }
    
    console.log('[Feed] Setting up scroll handlers, showHint:', showHint, 'hintReady:', hintReadyRef.current);

    // Initialize scroll position tracking
    lastScrollTopRef.current = container.scrollTop;
    
    const handleScroll = () => {
      const currentScrollTop = container.scrollTop;
      const scrollDelta = currentScrollTop - lastScrollTopRef.current;
      
      // Track interaction for cards currently in view when user scrolls
      // This must happen before infinite scroll logic to catch the interaction
      // Don't track interaction if FirstTimeGuide is still showing (we want SwipeHint to appear after it's dismissed)
      // Don't track during programmatic scroll to SwipeHint
      // Also wait 1 second after hint dismissal to allow SwipeHint to appear
      const timeSinceHintDismissed = hintDismissedTimeRef.current ? Date.now() - hintDismissedTimeRef.current : Infinity;
      if (Math.abs(scrollDelta) > 0 && !isScrollingRef.current && !isScrollingToSwipeHintRef.current && !showHint && timeSinceHintDismissed > 1000) {
        const scrollHeight = container.scrollHeight;
        const cardHeight = scrollHeight / (spaces.length * 3);
        const visibleCardIndex = Math.floor(currentScrollTop / cardHeight);
        const normalizedIndex = visibleCardIndex % spaces.length;
        
        // If user scrolled and we're on "Get in the Flow State" card, mark it as interacted
        // Only track if FirstTimeGuide has been dismissed (showHint is false)
        if (spaces[normalizedIndex]?.name === 'Get in the Flow State') {
          console.log('[Feed] Marking Get in the Flow State as interacted, index:', normalizedIndex, 'timeSinceDismissed:', timeSinceHintDismissed);
          setInteractedCards(prev => {
            const newSet = new Set(prev);
            newSet.add(normalizedIndex);
            return newSet;
          });
        }
      }
      
      // Dismiss hint on any scroll movement (up or down) - check if scroll position actually changed
      if (hintReadyRef.current && showHint && scrollDelta !== 0) {
        // This is a real user scroll, dismiss the hint
        console.log('[Feed] Scroll detected, dismissing hint. Scroll delta:', scrollDelta);
        dismissHint();
      }
      
      // Update last scroll position
      lastScrollTopRef.current = currentScrollTop;

      // Handle infinite scroll loop (only if hint is dismissed)
      // Don't block scrolling - allow seamless scroll even while hint is dismissing
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

    // Handle wheel events to dismiss hint (works even when hint overlay is visible)
    const handleWheel = (e) => {
      // Dismiss hint on any wheel movement
      if (showHint && Math.abs(e.deltaY) > 0) {
        console.log('[Feed] Wheel event detected, dismissing hint. deltaY:', e.deltaY);
        dismissHint();
      }
      
      // Track interaction for "Get in the Flow State" card when scrolling
      // Only track if FirstTimeGuide has been dismissed (showHint is false)
      // Don't track during programmatic scroll to SwipeHint
      // Also wait 2 seconds after hint dismissal to allow SwipeHint to appear
      const timeSinceHintDismissed = hintDismissedTimeRef.current ? Date.now() - hintDismissedTimeRef.current : Infinity;
      if (Math.abs(e.deltaY) > 0 && scrollContainerRef.current && !showHint && !isScrollingToSwipeHintRef.current && timeSinceHintDismissed > 2000) {
        const container = scrollContainerRef.current;
        const cardHeight = container.scrollHeight / (spaces.length * 3);
        const visibleCardIndex = Math.floor(container.scrollTop / cardHeight);
        const normalizedIndex = visibleCardIndex % spaces.length;
        
        if (spaces[normalizedIndex]?.name === 'Get in the Flow State') {
          setInteractedCards(prev => {
            const newSet = new Set(prev);
            newSet.add(normalizedIndex);
            return newSet;
          });
        }
      }
    };
    
    // Handle touch events for mobile scrolling
    let touchStartY = 0;
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e) => {
      // Use ref to check current state
      if (!showHintRef.current) return;
      const touchEndY = e.touches[0].clientY;
      const deltaY = Math.abs(touchEndY - touchStartY);
      // Dismiss hint if user has moved their finger (scrolling)
      if (deltaY > 5) {
        console.log('[Feed] Touch move detected, dismissing hint. deltaY:', deltaY);
        dismissHint();
        
        // Track interaction for "Get in the Flow State" card
        // Only track if FirstTimeGuide has been dismissed (showHint is false)
        // Don't track during programmatic scroll to SwipeHint
        // Also wait 2 seconds after hint dismissal to allow SwipeHint to appear
        const timeSinceHintDismissed = hintDismissedTimeRef.current ? Date.now() - hintDismissedTimeRef.current : Infinity;
        if (scrollContainerRef.current && !showHintRef.current && !isScrollingToSwipeHintRef.current && timeSinceHintDismissed > 2000) {
          const container = scrollContainerRef.current;
          const cardHeight = container.scrollHeight / (spaces.length * 3);
          const visibleCardIndex = Math.floor(container.scrollTop / cardHeight);
          const normalizedIndex = visibleCardIndex % spaces.length;
          
          if (spaces[normalizedIndex]?.name === 'Get in the Flow State') {
            setInteractedCards(prev => {
              const newSet = new Set(prev);
              newSet.add(normalizedIndex);
              return newSet;
            });
          }
        }
      }
    };

    // Add scroll listener to container
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // Also listen on window for wheel events (works even when hint overlay is visible)
    // The hint has pointer-events-none so wheel events pass through
    const wheelHandler = (e) => {
      // Use ref to check current state
      if (showHintRef.current && Math.abs(e.deltaY) > 0) {
        console.log('[Feed] Window wheel event detected, dismissing hint. deltaY:', e.deltaY);
        dismissHint();
      }
    };
    window.addEventListener('wheel', wheelHandler, { passive: true });
    
    // Handle touch events for mobile - listen on container
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    // Also listen for touch on window as fallback
    const windowTouchMove = (e) => {
      // Use ref to check current state
      if (!showHintRef.current) return;
      if (e.touches.length > 0) {
        const touchEndY = e.touches[0].clientY;
        const deltaY = Math.abs(touchEndY - touchStartY);
        if (deltaY > 5) {
          console.log('[Feed] Window touch move detected, dismissing hint');
          dismissHint();
        }
      }
    };
    window.addEventListener('touchmove', windowTouchMove, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', wheelHandler);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchmove', windowTouchMove);
    };
  }, [spaces.length, showHint]);

  const handleJoin = (normalizedIndex) => {
    setActiveSpaceIndex(normalizedIndex);
  };

  const handleLeave = () => {
    setActiveSpaceIndex(null);
  };

  // Create infinite scroll by tripling the spaces array
  const infiniteSpaces = [...spaces, ...spaces, ...spaces];

  // Determine if hint should be shown
  const shouldShowHint = showHint && activeSpaceIndex === null;
  
  console.log('[Feed] Render check:', { showHint, activeSpaceIndex, shouldShowHint, dismissHintExists: !!dismissHint });
  
  return (
    <>
      {/* First Time Hint Screen - shows on Get in the Flow State card */}
      <AnimatePresence>
        {shouldShowHint && (
          <FirstTimeGuide key="first-time-guide" onDismiss={dismissHint} />
        )}
      </AnimatePresence>

      <div 
        ref={scrollContainerRef}
        className={`full-viewport w-full ${activeSpaceIndex === null ? 'overflow-y-scroll md:overflow-y-auto' : 'overflow-hidden'}`}
        style={{ 
          margin: 0, 
          padding: 0,
          backgroundColor: '#fcf8f2'
        }}
      >
        {/* Mobile-only Hamburger Menu - Top Left (Hidden on Desktop because of AppLayout Sidebar) */}
        {activeSpaceIndex === null && (
          <motion.button
            onClick={() => setShowSettings(true)}
            whileTap={{ scale: 0.9 }}
            className="md:hidden fixed top-4 left-4 z-40 p-3 rounded-full pointer-events-auto bg-white/80 backdrop-blur-sm shadow-sm"
            aria-label="Menu"
            style={{ marginTop: 'env(safe-area-inset-top, 0)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12h18M3 6h18M3 18h18" stroke="#1e2d2e" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </motion.button>
        )}

        {/* Dashboard Header - Shows on Desktop, replaced HomeScreenSummary */}
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
          // Track if user has interacted with this specific card instance
          // For "Get in the Flow State", check if any instance of this card has been interacted with
          const hasInteracted = space.name === 'Get in the Flow State' 
            ? interactedCards.has(normalizedIndex)
            : false;
          
          if (space.name === 'Get in the Flow State') {
            console.log('[Feed] Rendering Get in the Flow State card, index:', normalizedIndex, 'hasInteracted:', hasInteracted, 'swipeHintReady:', swipeHintReady, 'showHint:', showHint);
          }
          
          return (
            <div 
              key={`${space.name}-${index}`} 
              className="snap-start snap-always w-full flex-shrink-0 full-viewport" 
              style={{ margin: 0, padding: 0 }}
            >
              <PracticeCard
                station={space}
                isActive={index === spaces.length}
                hasInteracted={hasInteracted}
                showFirstTimeHint={showHint}
                swipeHintReady={swipeHintReady && !showHint}
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
      
      {/* Settings Bottom Sheet */}
      <SettingsBottomSheet isOpen={showSettings} onClose={() => setShowSettings(false)} />
      
      {/* Profile Screen */}
      {showProfile && (
        <ProfileScreen onBack={() => setShowProfile(false)} />
      )}
    </>
  );
}
