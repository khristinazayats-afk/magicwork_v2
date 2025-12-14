import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SettingsBottomSheet from './SettingsBottomSheet';
import HomeScreenSummary from './HomeScreenSummary';
import ProfileScreen from './ProfileScreen';
import PracticeCard from './PracticeCard';
import FirstTimeGuide from './FirstTimeGuide';
import stationsData from '../data/stations.json';

// Development-only logging helper
const isDev = import.meta.env.DEV;
const devLog = isDev ? console.log.bind(console) : () => {};

export default function Feed({ onBack }) {
  devLog('Feed: Component rendering');
  
  // Only show the 3 main spaces: Slow Morning, Gentle De-Stress, Drift into Sleep
  const [spaces] = useState(() => {
    const allowedSpaces = ['Slow Morning', 'Gentle De-Stress', 'Drift into Sleep'];
    return (stationsData.stations || []).filter(station => 
      allowedSpaces.includes(station.name)
    );
  });
  
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
      devLog('[Feed] FirstTimeGuide dismissed, setting swipeHintReady to true');
    } else {
      setSwipeHintReady(false);
      devLog('[Feed] FirstTimeGuide showing, resetting swipeHintReady to false');
    }
  }, [showHint]);
  
  // Also set SwipeHint ready when feed loads if FirstTimeGuide won't show
  useEffect(() => {
    if (!showHint && spaces.length > 0) {
      // Small delay to ensure card is rendered
      setTimeout(() => {
        setSwipeHintReady(true);
        devLog('[Feed] Feed loaded, FirstTimeGuide not showing, setting swipeHintReady to true');
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
      devLog('[Feed] Dismissing hint screen - button clicked');
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
          devLog('[Feed] Reset interaction for Get in the Flow State, index:', getInFlowStateIndex, 'remaining:', Array.from(newSet), 'showHint:', showHintRef.current);
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
          devLog('[Feed] Setting scroll protection flags before scrolling to SwipeHint');
          
          requestAnimationFrame(() => {
            if (!scrollContainerRef.current) return;
            hasScrolledToGetInFlowStateRef.current = true;
            
            // Find "Get in the Flow State" card and scroll to it
            const getInFlowStateIndex = spaces.findIndex(space => space.name === 'Get in the Flow State');
            devLog('[Feed] Found Get in the Flow State at index:', getInFlowStateIndex);
            if (getInFlowStateIndex !== -1) {
              const middleSetStart = spaces.length;
              const getInFlowStateCardIndex = middleSetStart + getInFlowStateIndex;
              const card = scrollContainerRef.current.children[getInFlowStateCardIndex + 1];
              devLog('[Feed] Scrolling to card index:', getInFlowStateCardIndex + 1, 'card exists:', !!card);
              if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'start' });
                devLog('[Feed] Scroll initiated to Get in the Flow State card');
              }
            }
            
            // Release scroll lock after scroll completes
            setTimeout(() => {
              isScrollingRef.current = false;
              devLog('[Feed] Scroll completed, SwipeHint should be visible');
            }, 800);
            
            setTimeout(() => {
              isScrollingToSwipeHintRef.current = false;
              devLog('[Feed] Releasing SwipeHint protection, interaction tracking can resume');
            }, 3000); // Keep protection for 3 seconds total
          });
        }
      }, 500); // Wait for FirstTimeGuide exit animation
    } else {
      devLog('[Feed] dismissHint called but showHintRef.current is false');
    }
  }, [spaces]);

  // Handle infinite scroll - seamlessly loop when reaching edges
  // Also dismiss hint when user scrolls
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || spaces.length === 0) {
      devLog('[Feed] Scroll handler setup skipped:', { container: !!container, spacesLength: spaces.length });
      return;
    }
    
    devLog('[Feed] Setting up scroll handlers, showHint:', showHint, 'hintReady:', hintReadyRef.current);

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
          devLog('[Feed] Marking Get in the Flow State as interacted, index:', normalizedIndex, 'timeSinceDismissed:', timeSinceHintDismissed);
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
        devLog('[Feed] Scroll detected, dismissing hint. Scroll delta:', scrollDelta);
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
        devLog('[Feed] Wheel event detected, dismissing hint. deltaY:', e.deltaY);
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
        devLog('[Feed] Touch move detected, dismissing hint. deltaY:', deltaY);
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
        devLog('[Feed] Window wheel event detected, dismissing hint. deltaY:', e.deltaY);
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
          devLog('[Feed] Window touch move detected, dismissing hint');
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
  
  devLog('[Feed] Render check:', { showHint, activeSpaceIndex, shouldShowHint, dismissHintExists: !!dismissHint });
  
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
        className={`full-viewport w-full ${activeSpaceIndex === null ? 'overflow-y-scroll snap-y snap-mandatory' : 'overflow-hidden'}`}
        style={{ 
          margin: 0, 
          padding: 0,
          backgroundColor: '#fcf8f2'
        }}
      >
        {/* Hamburger Menu - Top Left */}
        {activeSpaceIndex === null && (
          <motion.button
            onClick={() => setShowSettings(true)}
            whileTap={{ scale: 0.9 }}
            className="fixed top-4 left-4 z-40 p-3 rounded-full pointer-events-auto bg-white/80 backdrop-blur-sm shadow-sm"
            aria-label="Menu"
            style={{ marginTop: 'env(safe-area-inset-top, 0)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12h18M3 6h18M3 18h18" stroke="#1e2d2e" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </motion.button>
        )}

        {/* HomeScreen Summary - Brief excerpt at top (sticky) */}
        {activeSpaceIndex === null && (
          <div 
            className="w-full flex-shrink-0 sticky top-0 z-30 snap-start snap-always bg-[#fcf8f2]"
            style={{ margin: 0, padding: 0 }}
          >
            <HomeScreenSummary onVibeClick={() => setShowProfile(true)} />
          </div>
        )}

        {/* Feed cards - Space cards with gradient backgrounds */}
        {infiniteSpaces.map((space, index) => {
          const normalizedIndex = index % spaces.length;
          // Track if user has interacted with this specific card instance
          // For "Get in the Flow State", check if any instance of this card has been interacted with
          const hasInteracted = space.name === 'Get in the Flow State' 
            ? interactedCards.has(normalizedIndex)
            : false;
          
          if (space.name === 'Get in the Flow State') {
            devLog('[Feed] Rendering Get in the Flow State card, index:', normalizedIndex, 'hasInteracted:', hasInteracted, 'swipeHintReady:', swipeHintReady, 'showHint:', showHint);
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
      
      {/* Settings Bottom Sheet */}
      <SettingsBottomSheet isOpen={showSettings} onClose={() => setShowSettings(false)} />
      
      {/* Profile Screen */}
      {showProfile && (
        <ProfileScreen onBack={() => setShowProfile(false)} />
      )}
    </>
  );
}
