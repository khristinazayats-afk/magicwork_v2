import { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import SwipeHint from './SwipeHint';
import FloatingHeart from './FloatingHeart';
import ArtistCredit from './ArtistCredit';
import Shareouts from './Shareouts';
import ResultsScreen from './ResultsScreen';
import PracticeJoinedTabs from './PracticeJoinedTabs';
import MilestoneModal from './MilestoneModal';
import { gradientStyle } from '../styles/gradients';
import { useLocalAudio } from '../hooks/useLocalAudio';
import { useTuneTracking } from '../hooks/useTuneTracking';
import { usePostEvent } from '../hooks/usePostEvent';
import { saveSession, getTotalPracticeTime } from '../utils/sessionTracking';
import { recordWeeklyPractice } from '../utils/weeklyTracking';
import { useContentSet } from '../hooks/useContentSet';

// Descriptions shown when browsing the feed (not joined) - Main Feed specific
const descriptions = {
  'Gentle De-Stress': 'A space to come back to center, together.',
  'Slow Morning': 'A space to begin the day slowly, side by side.',
  'Take a Walk': 'A quiet space for mindful steps.',
  'Draw Your Feels': 'A creative space where emotions flow by hand.',
  'Move and Cool': 'A space to release energy and find ease.',
  'Tap to Ground': 'A grounding space to reconnect with your body.',
  'Breathe to Relax': 'A space for slow breaths and unwinding.',
  'Get in the Flow State': 'A space to focus on what matters.',
  'Drift into Sleep': 'A space to slow down and drift off together.'
};

// Instructions shown when joined (active practice) - Main Feed specific
const cues = {
  'Gentle De-Stress': 'Drop your shoulders. Breathe out slowly.',
  'Slow Morning': 'Notice three things you are grateful for.',
  'Take a Walk': 'Count ten soft steps in silence.',
  'Draw Your Feels': 'Pick a color. One continuous line.',
  'Move and Cool': 'Sway side to side with your breath.',
  'Tap to Ground': 'Press both feet into the floor.',
  'Breathe to Relax': 'Inhale 4, exhale 6.',
  'Get in the Flow State': 'Ten brisk breaths, then rest.',
  'Drift into Sleep': 'Count from 30 down to 0.'
};

// Map station names to gradient keys (matches feed_gradient.txt order) - Main Feed specific
const gradientMap = {
  'Slow Morning': 'slowMorning',           // 1. Mint → Orange → Orange → Purple
  'Gentle De-Stress': 'gentleDeStress',    // 2. Purple → Orange → Orange → Mint
  'Take a Walk': 'takeAWalk',              // 3. Mint → Orange → Orange → Purple
  'Draw Your Feels': 'journalYourFeels',   // 4. Purple → Mint → Mint → Orange (Draw Your Feels)
  'Move and Cool': 'moveAndCool',          // 5. Orange → Mint → Mint → Purple
  'Tap to Ground': 'drawToGround',         // 6. Purple → Mint → Mint → Orange (Tap to Ground)
  'Breathe to Relax': 'breatheToRelax',    // 7. Orange → Purple → Purple → Mint
  'Get in the Flow State': 'breatheToGetActive', // 8. Mint → Purple → Purple → Orange
  'Drift into Sleep': 'driftIntoSleep'     // 9. Orange → Purple → Purple → Mint
};


export default function PracticeCard({ station, isActive, hasInteracted, showFirstTimeHint, swipeHintReady, onBack, currentIndex, totalPractices, onJoin, onLeave, isCurrentlyActive }) {
  const { audioRef, playStation, pause, resume, isPlaying, currentTrackInfo } = useLocalAudio();
  const { postEvent } = usePostEvent();
  useTuneTracking(isPlaying, audioRef);
  const [joined, setJoined] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [heartsSent, setHeartsSent] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [participantCount] = useState(Math.floor(Math.random() * 50) + 20); // Placeholder
  const [floatingHearts, setFloatingHearts] = useState([]);
  const [joinedAt, setJoinedAt] = useState(null);
  const [milestone, setMilestone] = useState(null);
  const [isTrialUser, setIsTrialUser] = useState(false);
  const [trialLimit, setTrialLimit] = useState(420);
  const [totalPreExistingTime, setTotalPreExistingTime] = useState(0);

  // Check trial status on mount
  useEffect(() => {
    async function checkTrial() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.is_trial) {
        setIsTrialUser(true);
        setTrialLimit(user.user_metadata?.trial_limit_seconds || 420);
        setTotalPreExistingTime(getTotalPracticeTime());
      }
    }
    checkTrial();
  }, []);
  
  // Practice flow states
  const [showTabs, setShowTabs] = useState(false); // New tabbed interface
  const [showShareouts, setShowShareouts] = useState(false); // P2 (legacy, may be removed)
  const [practiceMode, setPracticeMode] = useState('ambient'); // Always ambient mode now
  const [practiceDuration, setPracticeDuration] = useState(null); // Timer duration in seconds
  const [timeRemaining, setTimeRemaining] = useState(null); // Countdown timer
  const [showTimePicker, setShowTimePicker] = useState(false);
  const countdownIntervalRef = useRef(null);
  const videoRef = useRef(null); // Video background ref
  
  // Fetch video content for this space
  const { contentSet, loading: assetsLoading } = useContentSet(station?.name || null);
  const videoUrl = contentSet?.visual?.cdn_url || null;

  const mm = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
  const ss = String(secondsElapsed % 60).padStart(2, '0');

  const description = useMemo(() => descriptions[station.name] ?? 'A space for mindful presence.', [station.name]);
  const cue = useMemo(() => cues[station.name] ?? 'Be here, softly.', [station.name]);
  const gradientKey = useMemo(() => gradientMap[station.name] ?? 'slowMorning', [station.name]);
  
  // Check if this station will use local music (for preview display)
  const willUseLocalMusic = useMemo(() => {
    if (!station.localMusic) return null;
    // Import hasExceededPlayLimit for preview
    return {
      artist: station.localMusic.artist,
      title: station.localMusic.title,
      source: station.localMusic.source
    };
  }, [station.localMusic]);

  // Stop music when another station becomes active
  useEffect(() => {
    if (joined && !isCurrentlyActive) {
      pause();
      setJoined(false);
      setShowSummary(true);
      if (onLeave) onLeave();
    }
  }, [isCurrentlyActive, joined, pause, onLeave]);

  // Timer counts UP infinitely while playing (or countdown if timer is set)
  useEffect(() => {
    let t;
    if (joined && isPlaying) {
      // Check trial limit every second
      const checkTrialLimit = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.is_trial) {
          const totalSeconds = getTotalPracticeTime() + secondsElapsed;
          const limitSeconds = user.user_metadata?.trial_limit_seconds || 420;
          if (totalSeconds >= limitSeconds) {
            handleFinish();
            // AuthGuard will handle the redirection after handleFinish resets 'joined'
          }
        }
      };
      
      checkTrialLimit();

      if (practiceDuration !== null && timeRemaining !== null) {
        // Countdown timer
        t = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev <= 1) {
              // Timer finished - pause and show summary
              pause();
              setJoined(false);
              setShowSummary(true);
              if (typeof onLeave === 'function') {
                try {
                  onLeave();
                } catch (err) {
                  console.error('[PracticeCard] Error calling onLeave:', err);
                }
              }
              // Save session when timer completes
              try {
                saveSession({
                  spaceName: station?.name || 'Unknown',
                  duration: practiceDuration,
                  mode: practiceMode || 'ambient',
                  heartsSent: heartsSent
                });
                recordWeeklyPractice();
                postEvent({
                  event_type: 'practice_complete',
                  metadata: {
                    space: station?.name || 'Unknown',
                    duration: practiceDuration,
                    mode: practiceMode || 'ambient',
                  },
                }).catch(err => {
                  console.error('Error tracking practice completion:', err);
                });
              } catch (err) {
                console.error('[PracticeCard] Error saving session on timer completion:', err);
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        // Count up timer
        t = setInterval(() => setSecondsElapsed(s => s + 1), 1000);
      }
    }
    return () => clearInterval(t);
  }, [joined, isPlaying, practiceDuration, timeRemaining, pause, onLeave, station?.name, practiceMode, practiceDuration, heartsSent, postEvent]);
  
  // Handle setting timer duration
  const handleSetDuration = (minutes) => {
    const seconds = minutes * 60;
    setPracticeDuration(seconds);
    setTimeRemaining(seconds);
    setShowTimePicker(false);
  };

  const handleJoin = async () => {
    try {
      if (onJoin) onJoin(); // Notify Feed that this station is now active
      
      // Don't auto-play - user must press play button
      
      setSecondsElapsed(0);
      setJoinedAt(Date.now());
      setShowSummary(false);
      setJoined(true);
      setHeartsSent(0);
      
      // Show new tabbed interface
      setShowTabs(true);
    } catch (error) {
      console.error(`[PracticeCard] ✗ Could not join ${station.name}:`, error);
      
      const errorMsg = error.message || 'Unknown error';
      alert(`Could not join ${station.name}.\n\nError: ${errorMsg}\n\nPlease check the console for details or try another practice.`);
      
      if (onLeave) onLeave();
    }
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      pause();
      return;
    }

    const resumed = await resume();
    if (!resumed) {
      playStation(station);
    }
  };

  const handleNextTrack = () => {
    // For now, restart the station (could be enhanced to cycle through tracks)
    playStation(station);
  };

  const handleStartPracticeFromTabs = (practice) => {
    // Always use ambient mode
    setShowTabs(false);
    setPracticeMode('ambient');
  };

  const handleCloseTabs = () => {
    setShowTabs(false);
    setJoined(false);
    pause();
    if (onLeave) onLeave();
  };

  const handleCompleteFromSounds = (data) => {
    // Save session
    saveSession({
      spaceName: data.spaceName || station.name,
      duration: data.duration || secondsElapsed,
      mode: 'ambient',
      heartsSent: 0
    });
    
    // Record weekly practice
    recordWeeklyPractice();
    
    // Track practice completion
    postEvent({
      event_type: 'practice_complete',
      metadata: {
        space: data.spaceName || station.name,
        duration: data.duration || secondsElapsed,
        mode: 'ambient',
      },
    }).catch(err => {
      console.error('Error tracking practice completion:', err);
    });
    
    // Close tabs and show results
    setShowTabs(false);
    setJoined(false);
    setSecondsElapsed(data.duration || secondsElapsed);
    pause();
    setShowSummary(true);
    if (onLeave) onLeave();
  };
  
  const handleShareoutsContinue = () => {
    setShowShareouts(false);
    // Go straight to ambient mode
    setPracticeMode('ambient');
  };
  
  const handleShareoutsClose = () => {
    setShowShareouts(false);
    setJoined(false);
    pause();
    if (onLeave) onLeave();
  };
  

  const handleFinish = async () => {
    pause();
    
    // Save session to localStorage
    saveSession({
      spaceName: station.name,
      duration: secondsElapsed,
      mode: practiceMode || 'ambient',
      heartsSent: heartsSent
    });
    
    // Track practice completion
    try {
      const result = await postEvent({
        event_type: 'practice_complete',
        metadata: {
          space: station.name,
          duration: secondsElapsed,
          mode: practiceMode || 'ambient',
        },
      });
      
      if (result?.milestone_granted) {
        setMilestone(result.milestone_granted);
      }
    } catch (err) {
      console.error('Error tracking practice completion:', err);
    }
    
    setJoined(false);
    setShowSummary(true);
    if (onLeave) onLeave(); // Re-enable scrolling
  };
  
  const handleResultsDone = () => {
    setShowSummary(false);
    setJoined(false);
    setPracticeMode('ambient');
    setSecondsElapsed(0);
    setHeartsSent(0);
  };
  
  const handlePracticeAgain = () => {
    setShowSummary(false);
    handleJoin(); // Start practice again
  };

  const sendHeart = async (event) => {
    // Get button position
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const buttonCenterX = rect.left + rect.width / 2;
    const viewportWidth = window.innerWidth;
    const leftPercent = (buttonCenterX / viewportWidth) * 100;
    
    // Create a new floating heart with unique ID and position
    const heartId = Date.now() + Math.random();
    setFloatingHearts(prev => [...prev, { id: heartId, startX: `${leftPercent}%` }]);
    setHeartsSent(h => h + 1);
    
    // Track light send event
    try {
      const result = await postEvent({
        event_type: 'light_send',
        metadata: {},
      });
      
      if (result?.milestone_granted) {
        setMilestone(result.milestone_granted);
      }
      
      if (!result?.success && result?.message) {
        // Show friendly message if cap reached
        console.log(result.message);
      }
    } catch (err) {
      console.error('Error tracking light send:', err);
    }
    
    // Optional: add haptic feedback
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const removeHeart = (heartId) => {
    setFloatingHearts(prev => prev.filter(heart => heart.id !== heartId));
  };

  return (
    <div 
      className={`full-viewport w-full relative overflow-hidden noise-overlay`}
      style={{
        ...gradientStyle(gradientKey),
        ...(joined && { touchAction: 'none' }),
        ...(showTabs && joined && { overflow: 'hidden', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, isolation: 'isolate', zIndex: 50 })
      }}
      data-index={currentIndex - 1}
    >
      {/* Trial Progress Bar */}
      {isTrialUser && joined && !showTabs && (
        <div className="absolute top-0 left-0 w-full h-1 z-[70] bg-[#1e2d2e]/5">
          <motion.div 
            className="h-full bg-[#94d1c4]"
            initial={{ width: 0 }}
            animate={{ 
              width: `${Math.min(100, ((totalPreExistingTime + secondsElapsed) / trialLimit) * 100)}%` 
            }}
            transition={{ duration: 1, ease: "linear" }}
          />
          <div className="absolute top-2 right-4 text-[10px] font-hanken font-bold text-[#1e2d2e]/30 uppercase tracking-widest">
            Free Calm: {Math.max(0, Math.floor((trialLimit - (totalPreExistingTime + secondsElapsed)) / 60))}m left
          </div>
        </div>
      )}

      {/* Video Background - if available */}
      {videoUrl && !assetsLoading && !showTabs && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover -z-10"
          style={{ 
            opacity: 0.3,
            pointerEvents: 'none',
            touchAction: 'none'
          }}
          src={videoUrl}
          onError={(e) => {
            console.error('[PracticeCard] Video failed to load:', e.target.src);
            e.target.style.display = 'none';
          }}
        />
      )}

      {/* Breathing Pulse Overlay */}
      {joined && !showTabs && !showSummary && (
        <>
          <motion.div 
            className="absolute inset-0 z-0 pointer-events-none"
            animate={{ 
              backgroundColor: isPlaying ? ["rgba(255,255,255,0)", "rgba(255,255,255,0.08)", "rgba(255,255,255,0)"] : "rgba(255,255,255,0)" 
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
          <motion.div 
            className="absolute inset-0 z-0 pointer-events-none mix-blend-soft-light"
            animate={{ 
              scale: isPlaying ? [1, 1.05, 1] : 1,
              opacity: isPlaying ? [0.3, 0.6, 0.3] : 0
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            style={{
              background: 'radial-gradient(circle at center, rgba(148, 209, 196, 0.2) 0%, transparent 70%)'
            }}
          />
        </>
      )}

      {/* New Tabbed Interface - shown when user joins */}
      <AnimatePresence mode="wait">
        {showTabs && joined && (
          <PracticeJoinedTabs
            station={station}
            isPlaying={isPlaying}
            currentTrackInfo={currentTrackInfo}
            onPlayPause={handlePlayPause}
            onNextTrack={handleNextTrack}
            participantCount={participantCount}
            gradientStyle={gradientStyle(gradientKey)}
            onClose={handleCloseTabs}
            onStartPractice={handleStartPracticeFromTabs}
            audioRef={audioRef}
            presenceSeconds={secondsElapsed}
            onComplete={handleCompleteFromSounds}
          />
        )}
      </AnimatePresence>
      
      {/* P2: Shareouts - legacy (shown first after joining) */}
      <AnimatePresence>
        {showShareouts && !showTabs && (
          <Shareouts
            spaceName={station.name}
            gradientStyle={gradientStyle(gradientKey)}
            onContinue={handleShareoutsContinue}
            onClose={handleShareoutsClose}
          />
        )}
      </AnimatePresence>
      
      {/* P5: Results Screen - shown when practice finishes */}
      <AnimatePresence>
        {showSummary && (
          <ResultsScreen
            spaceName={station.name}
            duration={secondsElapsed}
            heartsSent={heartsSent}
            mode={practiceMode}
            gradientStyle={gradientStyle(gradientKey)}
            onDone={handleResultsDone}
            onPracticeAgain={handlePracticeAgain}
          />
        )}
      </AnimatePresence>
      
      

      {/* Center Content - hide when showing tabs, shareouts, or results */}
      {!showTabs && !showShareouts && !showSummary && (
        <div className={`sticky top-0 h-screen flex flex-col md:flex-row justify-center items-center z-10 ${joined ? 'pb-48 md:pb-0' : 'pb-32 md:pb-0'}`}>
          {/* Left Column: Visuals & Large Title (Desktop Only) */}
          <div className="hidden md:flex flex-1 flex-col justify-center items-center px-12 border-r border-[#1e2d2e]/5 h-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <h1 className="font-hanken font-bold text-[#1e2d2e] text-[64px] leading-tight mb-8">
                {station.name}
              </h1>
              <div className="flex items-center justify-center gap-4">
                <span className="w-12 h-0.5 bg-[#1e2d2e]/10" />
                <p className="font-hanken text-[#1e2d2e]/40 uppercase tracking-widest text-sm font-bold">
                  Collective Stillness
                </p>
                <span className="w-12 h-0.5 bg-[#1e2d2e]/10" />
              </div>
            </motion.div>
          </div>

          {/* Right Column: Practice Content & Controls */}
          <div className="flex-1 flex flex-col justify-center items-center px-8 md:px-16 text-center h-full overflow-y-auto pt-24 pb-48 md:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-lg mx-auto"
            >
              {/* Title - Mobile only */}
              {!showSummary && (
                <div className="md:hidden flex flex-col items-center gap-2 mb-6">
                <motion.h1 
                    className="font-hanken font-bold text-[#1e2d2e] text-[32px] md:text-[40px] leading-tight text-center"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {station.name}
                </motion.h1>
                </div>
              )}

              {/* Timer or Cue */}
              <AnimatePresence mode="wait">
                {joined && practiceMode === 'ambient' && (
                  <motion.div
                    key="timer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="mb-8"
                  >
                    {/* Timer - large in ambient mode - show countdown if timer is set, otherwise count up */}
                    <div className="font-hanken font-bold text-[#1e2d2e] text-[64px] md:text-[80px] leading-none mb-6">
                      {practiceDuration !== null && timeRemaining !== null 
                        ? `${String(Math.floor(timeRemaining / 60)).padStart(2, '0')}:${String(Math.floor(timeRemaining % 60)).padStart(2, '0')}`
                        : `${mm}:${ss}`}
                    </div>
                    {/* Timer remaining text */}
                    {practiceDuration !== null && timeRemaining !== null && (
                      <p className="font-hanken text-[#1e2d2e]/60 text-sm mb-4">
                        {timeRemaining > 0 ? `${Math.floor(timeRemaining)} seconds remaining` : 'Timer finished'}
                      </p>
                    )}
                    {/* Cue */}
                    <p className="font-hanken text-[#1e2d2e]/80 text-lg md:text-2xl font-medium leading-relaxed mb-8">
                      {cue}
                    </p>
                    {/* Artist Credit (local music) or Radio Label */}
                    {currentTrackInfo ? (
                      <ArtistCredit 
                        artist={currentTrackInfo.artist}
                        title={currentTrackInfo.title}
                        source={currentTrackInfo.source}
                      />
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mt-3"
                      >
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#1e2d2e]/10 backdrop-blur-sm px-4 py-2">
                          <svg 
                            width="14"
                            height="14"
                            viewBox="0 0 24 24" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                            className="flex-shrink-0"
                          >
                            <circle cx="12" cy="12" r="10" stroke="#1e2d2e" strokeWidth="2" opacity="0.6"/>
                            <circle cx="12" cy="12" r="3" fill="#1e2d2e" opacity="0.6"/>
                          </svg>
                          <div className="text-[#1e2d2e]/70 font-hanken leading-tight text-xs">
                            {station.label}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}


                {!joined && !showSummary && (
                  <motion.p 
                    key="description"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="font-hanken text-[#1e2d2e]/80 text-lg md:text-xl leading-relaxed text-center mb-12"
                  >
                    {description}
                  </motion.p>
                )}

              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      )}

      {/* SwipeHint - positioned exactly in middle between description and participant counter, only for Get in the Flow State */}
      {/* Show SwipeHint ONLY AFTER: FirstTimeGuide is dismissed, feed is loaded, and we've scrolled to the card */}
      {station.name === 'Get in the Flow State' && (
        <div style={{ display: 'none' }}>
          {console.log('[PracticeCard] Get in the Flow State card render check:', {
            joined,
            showSummary,
            showFirstTimeHint,
            hasInteracted,
            swipeHintReady,
            shouldShow: !joined && !showSummary && !showFirstTimeHint && !hasInteracted && swipeHintReady
          })}
        </div>
      )}
      {!joined && !showSummary && station.name === 'Get in the Flow State' && !showFirstTimeHint && !hasInteracted && swipeHintReady && (
        <div className="absolute left-0 right-0 flex justify-center items-center pointer-events-none z-[60] swipe-hint-middle" style={{ top: '50%', transform: 'translateY(-50%)' }}>
          <AnimatePresence>
            <motion.div
              key="swipe-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <SwipeHint />
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Bottom area with buttons - hide when showing tabs, shareouts, or results */}
      {/* Consistent positioning: 15% from bottom on mobile, 20% on desktop - matches all CTAs */}
      {!showTabs && !showShareouts && !showSummary && (
        <>
          {/* Button container - positioned at cta-bottom, adjusted for mobile when joined */}
          <div className={`absolute md:relative left-0 right-0 px-8 z-20 ${joined ? 'cta-bottom-joined' : 'cta-bottom'} md:bottom-0 md:mt-auto md:pb-16 w-full flex justify-center`}>
            <div className="w-full max-w-md mx-auto flex flex-col items-center gap-3">
              {/* Participant Counter - positioned above button, closer to Join CTA */}
              {!joined && !showSummary && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="font-hanken text-[#1e2d2e]/60 text-sm flex items-center justify-center gap-2 mb-2"
                >
                  <span className="relative flex h-1.5 w-1.5">
                    {/* Multiple pulsing rings for microparticle effect */}
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E52431]/40" style={{ animationDuration: '2.5s' }}></span>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E52431]/25" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}></span>
                    {/* Solid pulsing center */}
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#E52431]/80" style={{ animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></span>
                  </span>
                  {participantCount} humans here
                </motion.p>
              )}
              <AnimatePresence mode="wait">
                {!joined && (
                  <motion.button
                    key="join"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    whileTap={{ scale: 0.96, backgroundColor: 'rgba(30, 45, 46, 0.95)' }}
                    whileHover={{ scale: 1.01 }}
                    onClick={handleJoin}
                    className="w-full h-14 rounded-full bg-[#1e2d2e]/90 backdrop-blur-sm text-white font-hanken font-semibold text-base touch-target"
                    style={{ 
                      boxShadow: '0 4px 16px rgba(30, 45, 46, 0.25)',
                      touchAction: 'manipulation',
                      WebkitTapHighlightColor: 'transparent'
                    }}
                  >
                    Join
                  </motion.button>
                )}

                {joined && (
                  <motion.div
                    key="joined-buttons"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.4 }}
                    className="w-full flex flex-col gap-3"
                  >
                    {/* Ambient mode: Timer, Pause, Send Hearts, and Finish */}
                    <div className="w-full flex flex-col gap-3">
                      {/* Timer Picker Button - only show when no timer is set */}
                      {practiceDuration === null && (
                        <motion.button
                          onClick={() => setShowTimePicker(true)}
                          whileTap={{ scale: 0.96 }}
                          whileHover={{ scale: 1.01 }}
                          className="w-full h-12 rounded-full bg-white/70 backdrop-blur-sm text-[#1e2d2e] font-hanken font-semibold text-sm border border-[#1e2d2e]/20 touch-target"
                          style={{ 
                            boxShadow: '0 2px 12px rgba(30, 45, 46, 0.08)',
                            touchAction: 'manipulation',
                            WebkitTapHighlightColor: 'transparent'
                          }}
                        >
                          Set Timer
                        </motion.button>
                      )}
                      
                      <div className="w-full flex gap-3">
                        <motion.button
                          onClick={handlePlayPause}
                          whileTap={{ scale: 0.96, backgroundColor: 'rgba(30, 45, 46, 0.2)' }}
                          whileHover={{ scale: 1.01 }}
                          className="flex-1 h-14 rounded-full bg-[#1e2d2e]/15 backdrop-blur-sm text-[#1e2d2e] font-hanken font-semibold text-base border border-[#1e2d2e]/20 touch-target"
                          style={{ 
                            boxShadow: '0 2px 12px rgba(30, 45, 46, 0.08)',
                            touchAction: 'manipulation',
                            WebkitTapHighlightColor: 'transparent'
                          }}
                        >
                          {isPlaying ? 'Pause' : 'Play'}
                        </motion.button>
                        <motion.button
                          onClick={sendHeart}
                          whileTap={{ scale: 0.96, borderColor: 'rgba(30, 45, 46, 0.4)' }}
                          whileHover={{ scale: 1.01 }}
                          className="flex-1 h-14 rounded-full bg-transparent backdrop-blur-sm text-[#1e2d2e] font-hanken font-semibold text-base border-2 border-[#1e2d2e]/30 touch-target"
                          style={{ 
                            boxShadow: '0 2px 12px rgba(30, 45, 46, 0.08)',
                            touchAction: 'manipulation',
                            WebkitTapHighlightColor: 'transparent'
                          }}
                        >
                          💗 Send
                        </motion.button>
                      </div>
                      <motion.button
                        onClick={handleFinish}
                        whileTap={{ scale: 0.96, backgroundColor: 'rgba(30, 45, 46, 0.95)' }}
                        whileHover={{ scale: 1.01 }}
                        className="w-full h-14 rounded-full bg-[#1e2d2e]/90 backdrop-blur-sm text-white font-hanken font-semibold text-base touch-target"
                        style={{ 
                          boxShadow: '0 4px 16px rgba(30, 45, 46, 0.25)',
                          touchAction: 'manipulation',
                          WebkitTapHighlightColor: 'transparent'
                        }}
                      >
                        Finish
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}
      
      {/* Time Picker Modal */}
      <AnimatePresence>
        {showTimePicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowTimePicker(false)}
              style={{ touchAction: 'manipulation' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 flex items-center justify-center px-6 pointer-events-none z-50"
            >
              <div 
                className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
                style={{ touchAction: 'manipulation' }}
              >
                <h3 className="font-hanken text-xl md:text-2xl font-semibold text-[#1e2d2e] mb-2 text-center">
                  Set Practice Duration
                </h3>
                <p className="font-hanken text-sm text-[#1e2d2e]/70 mb-6 text-center">
                  How long would you like to practice?
                </p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[5, 10, 15, 20, 30].map((minutes) => (
                    <button
                      key={minutes}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSetDuration(minutes);
                      }}
                      className="px-4 py-3 rounded-full bg-[#1e2d2e] text-white font-hanken font-semibold text-sm md:text-base hover:bg-[#1e2d2e]/90 transition-all touch-target"
                      style={{ 
                        touchAction: 'manipulation',
                        WebkitTapHighlightColor: 'transparent'
                      }}
                    >
                      {minutes} min
                    </button>
                  ))}
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPracticeDuration(null);
                    setTimeRemaining(null);
                    setShowTimePicker(false);
                  }}
                  className="w-full px-6 py-3 rounded-full bg-white border-2 border-[#1e2d2e] text-[#1e2d2e] font-hanken font-semibold text-sm md:text-base hover:bg-[#1e2d2e]/5 transition-all touch-target"
                  style={{ 
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  No Limit
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hidden audio element for local audio playback */}
      <audio 
        ref={audioRef} 
        preload="auto"
        crossOrigin="anonymous"
      />
      
      {/* Floating hearts container */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {floatingHearts.map(heart => (
          <FloatingHeart 
            key={heart.id} 
            startX={heart.startX}
            onComplete={() => removeHeart(heart.id)} 
          />
        ))}
      </div>

      {/* Milestone Modal */}
      <MilestoneModal
        milestone={milestone}
        onClose={() => setMilestone(null)}
        onWriteNote={() => {
          setMilestone(null);
          // Could navigate to share prompt here
        }}
      />
    </div>
  );
}
