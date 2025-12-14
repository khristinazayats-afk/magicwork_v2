import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addListeningSeconds, getLightPointsStats } from '../../utils/lightPoints';
import { loadFavorites, toggleFavorite } from '../../utils/practiceFavorites';
import { availablePractices } from '../../constants/availablePractices';
import { useContentSet } from '../../hooks/useContentSet';

// Mock practice descriptions for each space
const PRACTICE_OF_DAY_DESCRIPTIONS = {
  'Slow Morning': 'Find a comfortable position and soften your gaze. Take three deep breaths, inviting curiosity with each inhale and releasing perfection with each exhale. Name one playful intention for today and breathe with it for three cycles. Allow yourself to begin slowly and with presence.',
  'Gentle De-Stress': 'Inhale through your nose, then hum the exhale gently to feel the vibration in your chest. Repeat this five times, allowing your shoulders to soften with each breath. Pause and notice the quiet that follows. Let tension dissolve with each exhale.',
  'Take a Walk': 'Begin by standing still and noticing your feet on the ground. Take ten mindful steps, paying attention to each movement. Let your pace be natural and unhurried. Notice how your body wants to move.',
  'Draw Your Feels': 'Pick up a pen or pencil and draw one continuous line for one minute. Add curves where your breath softens. Pause and notice the mood the shapes carry. Let your hand express what words cannot.',
  'Move and Cool': 'Stand comfortably and sway side to side with your breath. Let your movements be gentle and natural. Notice how your body wants to move. Release tension through gentle motion.',
  'Tap to Ground': 'Press both feet firmly into the floor. Take three deep breaths, feeling the connection between your body and the ground beneath you. Notice the support you receive from the earth.',
  'Breathe to Relax': 'Inhale for a count of four, feeling your belly rise. Exhale for a count of six, softening your jaw. Repeat this cycle ten times, staying gentle with yourself.',
  'Get in the Flow State': 'Take ten brisk breaths, then rest. Notice how your body responds to this energizing pattern. Let focus emerge naturally.',
  'Drift into Sleep': 'Count slowly from thirty down to zero, allowing each number to carry you deeper into relaxation. Let your thoughts drift like clouds. Welcome rest and peace.'
};

// Practice tags mapping - what each practice is useful for
const PRACTICE_TAGS = {
  'practice-of-day': ['Presence', 'Mindfulness', 'Daily Practice'],
  'physiological-sigh': ['Anxiety Relief', 'Calm', 'Stress Reduction'],
  'box-breathing': ['Focus', 'Anxiety Relief', 'Structured Practice'],
  'morning-presence': ['Presence', 'Gratitude', 'Morning Routine'],
  'mindful-steps': ['Grounding', 'Movement', 'Presence'],
  'creative-flow': ['Creativity', 'Expression', 'Emotional Release'],
  'body-release': ['Tension Release', 'Movement', 'Energy'],
  'grounding-practice': ['Grounding', 'Body Awareness', 'Stability'],
  'circle-breathing': ['Meditation', 'Relaxation', 'Flow State'],
  'wave-flow': ['Energy', 'Movement', 'Creative Flow'],
  'sleep-preparation': ['Sleep', 'Relaxation', 'Rest']
};

// Mock sounds for each space
const MOCK_SOUNDS = [
  { id: 'sound-1', type: 'sound', title: 'Forest Rain', description: 'Listen to the gentle sound of rain in a forest.', audioUrl: '/Feed_mp3/spring-forest.mp3', durationSec: 180 },
  { id: 'sound-2', type: 'sound', title: 'Ocean Waves', description: 'The calming rhythm of ocean waves.', audioUrl: '/Feed_mp3/spring-forest.mp3', durationSec: 240 },
  { id: 'sound-3', type: 'sound', title: 'Morning Birds', description: 'Gentle birdsong to welcome the day.', audioUrl: '/Feed_mp3/spring-forest.mp3', durationSec: 200 },
  { id: 'sound-4', type: 'sound', title: 'Mountain Stream', description: 'Flowing water over smooth stones.', audioUrl: '/Feed_mp3/spring-forest.mp3', durationSec: 220 },
  { id: 'sound-5', type: 'sound', title: 'Desert Wind', description: 'Soft wind through desert sands.', audioUrl: '/Feed_mp3/spring-forest.mp3', durationSec: 190 }
];

export default function SoundsFeed(props) {
  // Safely destructure props with defaults
  const safeProps = props || {};
  const {
    station, 
    isPlaying, 
    currentTrackInfo, 
    onPlayPause, 
    audioRef, 
    participantCount, 
    onToggleFavorite,
    onComplete,
    onStartPractice,
    showFilterSheet: propShowFilterSheet,
    setShowFilterSheet: propSetShowFilterSheet,
    activeFilter: propFilter,
    setActiveFilter: propSetFilter
  } = safeProps;
  
  // Filter state - use props if provided, otherwise use local state
  const [localFilter, setLocalFilter] = useState('All');
  const [localShowFilterSheet, setLocalShowFilterSheet] = useState(false);
  
  // Safely get filter value - handle both undefined and null
  // Use local state as fallback if props are not provided
  const currentFilter = (typeof propFilter !== 'undefined' && propFilter !== null) ? String(propFilter) : localFilter;
  const currentShowFilterSheet = (typeof propShowFilterSheet !== 'undefined' && propShowFilterSheet !== null) ? Boolean(propShowFilterSheet) : localShowFilterSheet;
  const setCurrentFilter = (typeof propSetFilter === 'function') ? propSetFilter : setLocalFilter;
  const setCurrentShowFilterSheet = (typeof propSetShowFilterSheet === 'function') ? propSetShowFilterSheet : setLocalShowFilterSheet;
  const [favorites, setFavorites] = useState(new Set());
  const [listeningSeconds, setListeningSeconds] = useState(0);
  const [playingSoundId, setPlayingSoundId] = useState(null);
  const [soundAudioRefs, setSoundAudioRefs] = useState({});
  const [practiceCounters, setPracticeCounters] = useState({}); // { practiceId: seconds }
  const [activePracticeId, setActivePracticeId] = useState(null);
  const [soundTimers, setSoundTimers] = useState({}); // { soundId: { duration: seconds, remaining: seconds, startTime: timestamp } }
  const [activeSoundTimer, setActiveSoundTimer] = useState(null); // soundId with active timer
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerSoundId, setTimePickerSoundId] = useState(null);
  const intervalRef = useRef(null);
  const practiceIntervalRef = useRef(null);
  const soundTimerIntervalRef = useRef(null);
  const videoRef = useRef(null); // Video background ref
  
  // Fetch video content for this space
  const { contentSet, loading: assetsLoading } = useContentSet(station?.name);
  const videoUrl = contentSet?.visual?.cdn_url || null;

  // Load favorites on mount
  useEffect(() => {
    setFavorites(loadFavorites());
    const stats = getLightPointsStats();
    setListeningSeconds(stats.listeningSeconds);
  }, []);

  // Auto-play main audio when component mounts (if not already playing)
  useEffect(() => {
    if (onPlayPause && audioRef?.current) {
      // Use requestAnimationFrame for immediate check without delay
      requestAnimationFrame(() => {
        // Check if audio is actually playing
        if (audioRef?.current && audioRef.current.paused && !isPlaying) {
          console.log('Auto-playing main audio on mount');
          if (onPlayPause) {
            onPlayPause();
          }
        }
      });
    }
  }, []); // Only on mount

  // Get practice of the day description
  const getPracticeDescription = () => {
    return PRACTICE_OF_DAY_DESCRIPTIONS[station.name] || 'Take a moment to reconnect with yourself. Find a comfortable position, close your eyes if it feels right, and breathe naturally. Notice what you feel in this moment without judgment.';
  };

  // Get all items (Practice of Day + Sound of Day + other practices + sounds)
  const getAllItems = () => {
    const practiceOfDay = {
      id: 'practice-of-day',
      type: 'practice',
      title: 'Practice of the Day',
      description: getPracticeDescription(),
      isDailyPractice: true,
      isTuneOfDay: false,
      isGuided: true // Practice of the Day is always guided
    };

    const soundOfDay = {
      id: 'sound-of-day',
      type: 'sound',
      title: 'Sound of the Day',
      description: 'Press play and listen mindfully.',
      isDailyPractice: false,
      isTuneOfDay: true,
      audioUrl: currentTrackInfo?.file || station.localMusic?.file,
      durationSec: null
    };

    // Get practices for this space
    const spacePractices = availablePractices[station.name] || [];
    const practices = spacePractices.map(p => ({ 
      ...p, 
      type: 'practice', 
      isDailyPractice: false, 
      isTuneOfDay: false,
      title: p.name,
      isGuided: !!p.animation || p.mode === 'guided' // Practices with animations are guided
    }));

    return [practiceOfDay, soundOfDay, ...practices, ...MOCK_SOUNDS];
  };

  // Filter items - memoized to prevent closure issues
  const { pinned, other } = useMemo(() => {
    // Ensure we have valid station
    if (!station || !station.name) {
      return { pinned: [], other: [] };
    }
    
    // Get practice description inline
    const practiceDescription = PRACTICE_OF_DAY_DESCRIPTIONS[station.name] || 'Take a moment to reconnect with yourself. Find a comfortable position, close your eyes if it feels right, and breathe naturally. Notice what you feel in this moment without judgment.';
    
    // Get all items inline to avoid closure issues
    const practiceOfDay = {
      id: 'practice-of-day',
      type: 'practice',
      title: 'Practice of the Day',
      description: practiceDescription,
      isDailyPractice: true,
      isTuneOfDay: false,
      isGuided: true
    };

    const soundOfDay = {
      id: 'sound-of-day',
      type: 'sound',
      title: 'Sound of the Day',
      description: 'Press play and listen mindfully.',
      isDailyPractice: false,
      isTuneOfDay: true,
      audioUrl: currentTrackInfo?.file || station.localMusic?.file,
      durationSec: null
    };

    const spacePractices = availablePractices[station.name] || [];
    const practices = spacePractices.map(p => ({ 
      ...p, 
      type: 'practice', 
      isDailyPractice: false, 
      isTuneOfDay: false,
      title: p.name,
      isGuided: !!p.animation || p.mode === 'guided'
    }));

    const allItems = [practiceOfDay, soundOfDay, ...practices, ...MOCK_SOUNDS];
    const pinnedItems = allItems.filter(item => item.isDailyPractice || item.isTuneOfDay);
    const otherItems = allItems.filter(item => !item.isDailyPractice && !item.isTuneOfDay);

    let filteredOtherItems = otherItems;
    if (currentFilter === 'Practices') {
      filteredOtherItems = otherItems.filter(item => item.type === 'practice');
    } else if (currentFilter === 'Sounds') {
      filteredOtherItems = otherItems.filter(item => item.type === 'sound');
    } else if (currentFilter === 'Guided') {
      filteredOtherItems = otherItems.filter(item => item.isGuided === true);
    } else if (currentFilter === 'Favorited') {
      filteredOtherItems = otherItems.filter(item => favorites.has(item.id));
    }

    return {
      pinned: pinnedItems,
      other: filteredOtherItems
    };
  }, [currentFilter, favorites, station?.name, station?.localMusic, currentTrackInfo]);

  // Track listening time for sounds
  useEffect(() => {
    if (playingSoundId && soundAudioRefs[playingSoundId]) {
      intervalRef.current = setInterval(() => {
        if (soundAudioRefs[playingSoundId] && !soundAudioRefs[playingSoundId].paused) {
          const result = addListeningSeconds(1);
          setListeningSeconds(result.listeningSeconds);
        }
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [playingSoundId, soundAudioRefs]);

  // Track practice counter
  useEffect(() => {
    console.log('Practice counter useEffect triggered, activePracticeId:', activePracticeId);
    if (activePracticeId !== null) {
      console.log('Starting practice counter for:', activePracticeId);
      practiceIntervalRef.current = setInterval(() => {
        setPracticeCounters(prev => {
          const newValue = (prev[activePracticeId] || 0) + 1;
          console.log('Counter tick:', activePracticeId, '=', newValue);
          return {
            ...prev,
            [activePracticeId]: newValue
          };
        });
      }, 1000);

      return () => {
        console.log('Cleaning up practice counter interval');
        if (practiceIntervalRef.current) {
          clearInterval(practiceIntervalRef.current);
        }
      };
    } else {
      if (practiceIntervalRef.current) {
        console.log('Stopping practice counter interval');
        clearInterval(practiceIntervalRef.current);
      }
    }
  }, [activePracticeId]);

  // Cleanup audio refs on unmount
  useEffect(() => {
    return () => {
      Object.values(soundAudioRefs).forEach(ref => {
        if (ref) {
          ref.pause();
          ref.src = '';
        }
      });
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (practiceIntervalRef.current) {
        clearInterval(practiceIntervalRef.current);
      }
    };
  }, []);

  // Handle favorite toggle
  const handleToggleFavorite = (itemId) => {
    const newFavorited = toggleFavorite(itemId);
    setFavorites(loadFavorites());
    
    if (onToggleFavorite) {
      onToggleFavorite(newFavorited);
    }
  };

  // Handle sound play/pause
  const handleSoundPlayPause = (soundId, audioUrl) => {
    // Stop all other sounds
    Object.values(soundAudioRefs).forEach(ref => {
      if (ref && !ref.paused) {
        ref.pause();
      }
    });

    // Stop main audio if playing
    if (audioRef?.current && !audioRef.current.paused) {
      audioRef.current.pause();
      if (onPlayPause) {
        onPlayPause();
      }
    }

    if (playingSoundId === soundId) {
      // Pause current sound
      if (soundAudioRefs[soundId]) {
        soundAudioRefs[soundId].pause();
      }
      setPlayingSoundId(null);
      // Pause timer if active
      if (activeSoundTimer === soundId && soundTimers[soundId]) {
        const timer = soundTimers[soundId];
        const elapsed = Math.floor((Date.now() - timer.startTime) / 1000);
        setSoundTimers(prev => ({
          ...prev,
          [soundId]: {
            ...timer,
            remaining: Math.max(0, timer.duration - elapsed),
            startTime: Date.now() - (timer.duration - (timer.remaining || timer.duration)) * 1000
          }
        }));
      }
    } else {
      // Play new sound
      let audioRef = soundAudioRefs[soundId];
      if (!audioRef) {
        audioRef = new Audio(audioUrl);
        audioRef.loop = true;
        setSoundAudioRefs(prev => ({ ...prev, [soundId]: audioRef }));
      }
      audioRef.play();
      setPlayingSoundId(soundId);
      // Resume timer if exists
      if (soundTimers[soundId]) {
        setActiveSoundTimer(soundId);
        setSoundTimers(prev => ({
          ...prev,
          [soundId]: {
            ...prev[soundId],
            startTime: Date.now() - (prev[soundId].duration - prev[soundId].remaining) * 1000
          }
        }));
      }
    }
  };

  // Handle practice start/stop
  const handlePracticeStart = (practiceId) => {
    console.log('handlePracticeStart called with:', practiceId, 'current activePracticeId:', activePracticeId);
    if (activePracticeId === practiceId) {
      // Stop current practice
      setActivePracticeId(null);
    } else {
      // Start new practice (stop any other active practice)
      setActivePracticeId(practiceId);
      setPracticeCounters(prev => {
        const newCounters = {
          ...prev,
          [practiceId]: prev[practiceId] || 0
        };
        console.log('Setting practice counters:', newCounters);
        return newCounters;
      });
      
      // Ensure main audio is playing when practice starts
      if (onPlayPause) {
        // Always try to start audio when practice begins
        console.log('Starting main audio for practice, isPlaying:', isPlaying, 'audioRef exists:', !!audioRef?.current);
        if (audioRef?.current) {
          console.log('Audio paused:', audioRef.current.paused);
        }
        // Call onPlayPause which will handle starting the audio
        onPlayPause();
      }
    }
  };

  // Handle practice complete
  const handlePracticeComplete = (practiceId) => {
    const duration = practiceCounters[practiceId] || 0;
    setActivePracticeId(null);
    
    if (onComplete) {
      onComplete({
        duration: duration,
        spaceName: station.name
      });
    }
  };

  // Handle complete from Sound of the Day
  const handleComplete = () => {
    // Stop all sounds
    Object.values(soundAudioRefs).forEach(ref => {
      if (ref && !ref.paused) {
        ref.pause();
      }
    });
    setPlayingSoundId(null);

    if (onComplete) {
      onComplete({
        duration: listeningSeconds,
        spaceName: station.name
      });
    }
  };

  // Format time helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle timer for sounds
  const handleSetSoundTimer = (soundId, minutes) => {
    const duration = minutes * 60;
    setSoundTimers(prev => ({
      ...prev,
      [soundId]: {
        duration,
        remaining: duration,
        startTime: Date.now()
      }
    }));
    setActiveSoundTimer(soundId);
    setShowTimePicker(false);
    setTimePickerSoundId(null);
  };
  
  // Handle timer countdown for sounds
  useEffect(() => {
    if (activeSoundTimer && soundTimers[activeSoundTimer]) {
      soundTimerIntervalRef.current = setInterval(() => {
        setSoundTimers(prev => {
          const timer = prev[activeSoundTimer];
          if (!timer) return prev;
          
          const elapsed = Math.floor((Date.now() - timer.startTime) / 1000);
          const remaining = Math.max(0, timer.duration - elapsed);
          
          if (remaining === 0) {
            // Timer finished - pause sound
            if (soundAudioRefs[activeSoundTimer]) {
              soundAudioRefs[activeSoundTimer].pause();
            }
            setPlayingSoundId(null);
            setActiveSoundTimer(null);
            // Call onComplete if it's provided
            if (typeof onComplete === 'function') {
              try {
                onComplete({
                  duration: timer.duration,
                  spaceName: station?.name || 'Unknown'
                });
              } catch (err) {
                console.error('[SoundsFeed] Error calling onComplete:', err);
              }
            }
            return { ...prev, [activeSoundTimer]: null };
          }
          
          return {
            ...prev,
            [activeSoundTimer]: {
              ...timer,
              remaining
            }
          };
        });
      }, 1000);
      
      return () => {
        if (soundTimerIntervalRef.current) {
          clearInterval(soundTimerIntervalRef.current);
        }
      };
    }
  }, [activeSoundTimer, soundTimers, soundAudioRefs, station?.name]);

  // Get tags for a practice
  const getPracticeTags = (practiceId, practiceTitle) => {
    // Try to get tags by ID first
    if (PRACTICE_TAGS[practiceId]) {
      return PRACTICE_TAGS[practiceId];
    }
    // Fallback: try to match by title keywords
    const titleLower = practiceTitle.toLowerCase();
    if (titleLower.includes('breathing') || titleLower.includes('sigh')) {
      return ['Anxiety Relief', 'Calm', 'Breathing'];
    }
    if (titleLower.includes('morning') || titleLower.includes('presence')) {
      return ['Presence', 'Mindfulness', 'Daily Practice'];
    }
    if (titleLower.includes('walk') || titleLower.includes('steps')) {
      return ['Grounding', 'Movement', 'Presence'];
    }
    if (titleLower.includes('draw') || titleLower.includes('creative')) {
      return ['Creativity', 'Expression', 'Emotional Release'];
    }
    if (titleLower.includes('move') || titleLower.includes('body')) {
      return ['Tension Release', 'Movement', 'Energy'];
    }
    if (titleLower.includes('sleep')) {
      return ['Sleep', 'Relaxation', 'Rest'];
    }
    if (titleLower.includes('flow')) {
      return ['Energy', 'Focus', 'Flow State'];
    }
    return ['Mindfulness', 'Presence', 'Practice'];
  };


  return (
    <div className="w-full px-4 md:px-5 relative" style={{ paddingTop: '0', paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))', margin: 0 }}>
        {/* Video Background - if available */}
        {videoUrl && !assetsLoading && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="fixed inset-0 w-full h-full object-cover -z-10"
            style={{ 
              opacity: 0.3,
              pointerEvents: 'none',
              touchAction: 'none'
            }}
            src={videoUrl}
            onError={(e) => {
              console.error('[SoundsFeed] Video failed to load:', e.target.src);
              e.target.style.display = 'none';
            }}
          />
        )}
        
        <div className="max-w-2xl mx-auto space-y-4 relative z-10" style={{ margin: 0 }}>
          {/* Pinned Items: Practice of the Day and Sound of the Day */}
          <AnimatePresence>
            {pinned.map((item, index) => {
              const stableParticipantCount = item.id 
                ? ((item.id.charCodeAt(0) || 0) + (item.id.length || 0)) % 50 + 10
                : participantCount || 24;
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 md:p-8 min-h-[320px] flex flex-col"
                  style={{ boxShadow: '0 4px 16px rgba(30, 45, 46, 0.1)' }}
                >
                  {/* Label and Favorite */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-hanken text-xs uppercase tracking-wider text-[#1e2d2e]/50">
                      {item.isDailyPractice ? 'Practice of the Day' : item.isTuneOfDay ? 'Sound of the Day' : ''}
                    </span>
                    <button
                      onClick={() => handleToggleFavorite(item.id)}
                      className={`p-1.5 rounded-full transition-all touch-target ${
                        favorites.has(item.id) ? 'text-[#E52431]' : 'text-[#1e2d2e]/40 hover:text-[#1e2d2e]/60'
                      }`}
                      aria-label={favorites.has(item.id) ? 'Remove from favorites' : 'Add to favorites'}
                      style={{ 
                        touchAction: 'manipulation',
                        WebkitTapHighlightColor: 'transparent'
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={favorites.has(item.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="font-hanken text-lg md:text-xl font-semibold text-[#1e2d2e] mb-2">
                    {item.isDailyPractice ? 'Practice of the Day' : item.isTuneOfDay ? 'Sound of the Day' : item.title}
                  </h3>

                  {/* Track Info - Show when track info exists */}
                  {(currentTrackInfo || station.localMusic) && (
                    <div className="flex items-center gap-2 mb-4">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#1e2d2e]/70 flex-shrink-0">
                        <rect x="3" y="14" width="2.5" height="4" rx="1.25" fill="currentColor">
                          {isPlaying && !playingSoundId && (
                            <>
                              <animate attributeName="height" values="4;8;10;8;4;4" dur="0.8s" repeatCount="indefinite"/>
                              <animate attributeName="y" values="14;12;11;12;14;14" dur="0.8s" repeatCount="indefinite"/>
                            </>
                          )}
                        </rect>
                        <rect x="7.5" y="12" width="2.5" height="6" rx="1.25" fill="currentColor">
                          {isPlaying && !playingSoundId && (
                            <>
                              <animate attributeName="height" values="6;10;12;10;6;6" dur="0.8s" repeatCount="indefinite" begin="0.15s"/>
                              <animate attributeName="y" values="12;10;9;10;12;12" dur="0.8s" repeatCount="indefinite" begin="0.15s"/>
                            </>
                          )}
                        </rect>
                        <rect x="12" y="10" width="2.5" height="8" rx="1.25" fill="currentColor">
                          {isPlaying && !playingSoundId && (
                            <>
                              <animate attributeName="height" values="8;12;14;12;8;8" dur="0.8s" repeatCount="indefinite" begin="0.3s"/>
                              <animate attributeName="y" values="10;8;7;8;10;10" dur="0.8s" repeatCount="indefinite" begin="0.3s"/>
                            </>
                          )}
                        </rect>
                        <rect x="16.5" y="12" width="2.5" height="6" rx="1.25" fill="currentColor">
                          {isPlaying && !playingSoundId && (
                            <>
                              <animate attributeName="height" values="6;10;12;10;6;6" dur="0.8s" repeatCount="indefinite" begin="0.45s"/>
                              <animate attributeName="y" values="12;10;9;10;12;12" dur="0.8s" repeatCount="indefinite" begin="0.45s"/>
                            </>
                          )}
                        </rect>
                        <rect x="21" y="14" width="2.5" height="4" rx="1.25" fill="currentColor">
                          {isPlaying && !playingSoundId && (
                            <>
                              <animate attributeName="height" values="4;8;10;8;4;4" dur="0.8s" repeatCount="indefinite" begin="0.6s"/>
                              <animate attributeName="y" values="14;12;11;12;14;14" dur="0.8s" repeatCount="indefinite" begin="0.6s"/>
                            </>
                          )}
                        </rect>
                      </svg>
                      <div className="text-[#1e2d2e]/70 font-hanken text-xs font-medium">
                        {currentTrackInfo?.title || station.localMusic?.title || station.name}
                        {(currentTrackInfo?.artist || station.localMusic?.artist) && (
                          <span> · {currentTrackInfo?.artist || station.localMusic?.artist}</span>
                        )}
                        {(currentTrackInfo?.source || station.localMusic?.source) && (
                          <span className="opacity-60"> · {currentTrackInfo?.source || station.localMusic?.source}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Participant count */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E52431]/40" style={{ animationDuration: '2.5s' }}></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-[#E52431]/80"></span>
                    </div>
                    <span className="font-hanken text-[#1e2d2e]/60 text-xs md:text-sm">
                      {stableParticipantCount} are practicing now
                    </span>
                  </div>

                  {/* Description */}
                  <p className="font-hanken text-[#1e2d2e]/70 text-sm leading-relaxed mb-4 flex-1">
                    {item.description}
                  </p>

                  {/* Practice of the Day content */}
                  {item.isDailyPractice && (
                    <>
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {getPracticeTags(item.id, item.title).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full bg-[#1e2d2e]/10 text-[#1e2d2e]/70 font-hanken text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Counter or Start Button */}
                      {activePracticeId === item.id ? (
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="font-hanken font-mono text-4xl md:text-5xl text-[#1e2d2e] tabular-nums mb-2">
                              {formatTime(practiceCounters[item.id] || 0)}
                            </div>
                            <p className="font-hanken text-xs text-[#1e2d2e]/50">Practice in progress</p>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                                console.log('Pause button clicked');
                                handlePracticeStart(item.id);
                              }}
                              className="flex-1 px-6 py-3 rounded-full bg-white/70 backdrop-blur-sm text-[#1e2d2e] font-hanken font-semibold text-sm border border-[#1e2d2e]/20"
                            >
                              Pause
                            </button>
                            <button
                              onClick={() => {
                                console.log('Complete button clicked');
                                handlePracticeComplete(item.id);
                              }}
                              className="flex-1 px-6 py-3 rounded-full bg-[#1e2d2e] text-white font-hanken font-semibold text-sm"
                            >
                              Complete
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            console.log('Begin Practice button clicked for:', item.id);
                            handlePracticeStart(item.id);
                          }}
                          className="w-full px-6 py-3 rounded-full bg-[#1e2d2e] text-white font-hanken font-semibold text-sm"
                        >
                          Begin Practice
                        </button>
                      )}
                    </>
                  )}

                  {/* Sound of the Day content */}
                  {item.isTuneOfDay && (
                    <>
                      {/* Play/Pause Button for Main Audio */}
                      <div className="flex items-center justify-center mb-4">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (onPlayPause) {
                              onPlayPause();
                            }
                          }}
                          className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center bg-[#1e2d2e] text-white hover:bg-[#1e2d2e]/90 active:scale-95 transition-all touch-target"
                          style={{ 
                            boxShadow: '0 4px 16px rgba(30, 45, 46, 0.3)',
                            touchAction: 'manipulation',
                            WebkitTapHighlightColor: 'transparent'
                          }}
                          aria-label={isPlaying && !playingSoundId ? 'Pause' : 'Play'}
                        >
                          {isPlaying && !playingSoundId ? (
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                              <rect x="6" y="4" width="4" height="16" rx="1" />
                              <rect x="14" y="4" width="4" height="16" rx="1" />
                            </svg>
                          ) : (
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '3px' }}>
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          )}
                        </button>
                      </div>

                      {/* Track Info */}
                      <div className="text-center mb-3">
                        <div className="font-hanken text-[#1e2d2e] text-base font-semibold mb-1">
                          {currentTrackInfo?.title || station.localMusic?.title || station.name}
                        </div>
                        {(currentTrackInfo?.artist || station.localMusic?.artist) && (
                          <div className="font-hanken text-[#1e2d2e]/70 text-sm">
                            {currentTrackInfo?.artist || station.localMusic?.artist}
                            {(currentTrackInfo?.source || station.localMusic?.source) && ` · ${currentTrackInfo?.source || station.localMusic?.source}`}
                          </div>
                        )}
                      </div>
                      
                      {/* Timer Display for Sound of the Day */}
                      {activeSoundTimer === item.id && soundTimers[item.id] && (
                        <div className="text-center mb-4">
                          <div className="font-hanken font-mono text-3xl md:text-4xl text-[#1e2d2e] tabular-nums mb-1">
                            {formatTime(Math.max(0, Math.floor(soundTimers[item.id].remaining)))}
                          </div>
                          <p className="font-hanken text-xs text-[#1e2d2e]/50">
                            {soundTimers[item.id].remaining > 0 ? 'Time remaining' : 'Timer finished'}
                          </p>
                        </div>
                      )}

                      {/* Timer Picker Button */}
                      {activeSoundTimer !== item.id && (
                        <motion.button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setTimePickerSoundId(item.id);
                            setShowTimePicker(true);
                          }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full h-12 rounded-full bg-white/70 backdrop-blur-sm text-[#1e2d2e] font-hanken font-semibold text-base border border-[#1e2d2e]/20 mb-3 touch-target"
                          style={{ 
                            boxShadow: '0 2px 12px rgba(30, 45, 46, 0.08)',
                            touchAction: 'manipulation',
                            WebkitTapHighlightColor: 'transparent'
                          }}
                        >
                          Set Timer
                        </motion.button>
                      )}

                      {/* Complete Button */}
                      <motion.button
                        onClick={handleComplete}
                        whileTap={{ scale: 0.95 }}
                        className="w-full h-12 rounded-full bg-[#1e2d2e] text-white font-hanken font-semibold text-base touch-target"
                        style={{ 
                          boxShadow: '0 4px 16px rgba(30, 45, 46, 0.3)',
                          touchAction: 'manipulation',
                          WebkitTapHighlightColor: 'transparent'
                        }}
                      >
                        Complete
                      </motion.button>
                    </>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Other Items */}
          <AnimatePresence>
            {other.map((item, index) => {
              const stableParticipantCount = item.id 
                ? ((item.id.charCodeAt(0) || 0) + (item.id.length || 0)) % 50 + 10
                : participantCount || 24;
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: (pinned.length + index) * 0.05 }}
                  className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 md:p-8 min-h-[320px] flex flex-col"
                  style={{ boxShadow: '0 4px 16px rgba(30, 45, 46, 0.1)' }}
                >
                  {/* Label and Favorite */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-hanken text-xs uppercase tracking-wider text-[#1e2d2e]/50">
                      {item.type === 'practice' ? 'Practice' : 'Sound'}
                    </span>
                    <button
                      onClick={() => handleToggleFavorite(item.id)}
                      className={`p-1.5 rounded-full transition-all touch-target ${
                        favorites.has(item.id) ? 'text-[#E52431]' : 'text-[#1e2d2e]/40 hover:text-[#1e2d2e]/60'
                      }`}
                      aria-label={favorites.has(item.id) ? 'Remove from favorites' : 'Add to favorites'}
                      style={{ 
                        touchAction: 'manipulation',
                        WebkitTapHighlightColor: 'transparent'
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={favorites.has(item.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="font-hanken text-lg md:text-xl font-semibold text-[#1e2d2e] mb-2">
                    {item.title}
                  </h3>

                  {/* Track Info - Show when track info exists */}
                  {(currentTrackInfo || station.localMusic) && (
                    <div className="flex items-center gap-2 mb-4">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#1e2d2e]/70 flex-shrink-0">
                        <rect x="3" y="14" width="2.5" height="4" rx="1.25" fill="currentColor">
                          {isPlaying && !playingSoundId && (
                            <>
                              <animate attributeName="height" values="4;8;10;8;4;4" dur="0.8s" repeatCount="indefinite"/>
                              <animate attributeName="y" values="14;12;11;12;14;14" dur="0.8s" repeatCount="indefinite"/>
                            </>
                          )}
                        </rect>
                        <rect x="7.5" y="12" width="2.5" height="6" rx="1.25" fill="currentColor">
                          {isPlaying && !playingSoundId && (
                            <>
                              <animate attributeName="height" values="6;10;12;10;6;6" dur="0.8s" repeatCount="indefinite" begin="0.15s"/>
                              <animate attributeName="y" values="12;10;9;10;12;12" dur="0.8s" repeatCount="indefinite" begin="0.15s"/>
                            </>
                          )}
                        </rect>
                        <rect x="12" y="10" width="2.5" height="8" rx="1.25" fill="currentColor">
                          {isPlaying && !playingSoundId && (
                            <>
                              <animate attributeName="height" values="8;12;14;12;8;8" dur="0.8s" repeatCount="indefinite" begin="0.3s"/>
                              <animate attributeName="y" values="10;8;7;8;10;10" dur="0.8s" repeatCount="indefinite" begin="0.3s"/>
                            </>
                          )}
                        </rect>
                        <rect x="16.5" y="12" width="2.5" height="6" rx="1.25" fill="currentColor">
                          {isPlaying && !playingSoundId && (
                            <>
                              <animate attributeName="height" values="6;10;12;10;6;6" dur="0.8s" repeatCount="indefinite" begin="0.45s"/>
                              <animate attributeName="y" values="12;10;9;10;12;12" dur="0.8s" repeatCount="indefinite" begin="0.45s"/>
                            </>
                          )}
                        </rect>
                        <rect x="21" y="14" width="2.5" height="4" rx="1.25" fill="currentColor">
                          {isPlaying && !playingSoundId && (
                            <>
                              <animate attributeName="height" values="4;8;10;8;4;4" dur="0.8s" repeatCount="indefinite" begin="0.6s"/>
                              <animate attributeName="y" values="14;12;11;12;14;14" dur="0.8s" repeatCount="indefinite" begin="0.6s"/>
                            </>
                          )}
                        </rect>
                      </svg>
                      <div className="text-[#1e2d2e]/70 font-hanken text-xs font-medium">
                        {currentTrackInfo?.title || station.localMusic?.title || station.name}
                        {(currentTrackInfo?.artist || station.localMusic?.artist) && (
                          <span> · {currentTrackInfo?.artist || station.localMusic?.artist}</span>
                        )}
                        {(currentTrackInfo?.source || station.localMusic?.source) && (
                          <span className="opacity-60"> · {currentTrackInfo?.source || station.localMusic?.source}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Participant count */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E52431]/40" style={{ animationDuration: '2.5s' }}></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-[#E52431]/80"></span>
                    </div>
                    <span className="font-hanken text-[#1e2d2e]/60 text-xs md:text-sm">
                      {stableParticipantCount} are practicing now
                    </span>
                  </div>

                  {/* Description */}
                  <p className="font-hanken text-[#1e2d2e]/70 text-sm leading-relaxed mb-4 flex-1">
                    {item.description}
                  </p>

                  {/* Tags for practices */}
                  {item.type === 'practice' && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {getPracticeTags(item.id, item.title).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full bg-[#1e2d2e]/10 text-[#1e2d2e]/70 font-hanken text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action button */}
                  {item.type === 'practice' ? (
                    activePracticeId === item.id ? (
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="font-hanken font-mono text-4xl md:text-5xl text-[#1e2d2e] tabular-nums mb-2">
                            {formatTime(practiceCounters[item.id] || 0)}
                          </div>
                          <p className="font-hanken text-xs text-[#1e2d2e]/50">Practice in progress</p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handlePracticeStart(item.id)}
                            className="flex-1 px-6 py-3 rounded-full bg-white/70 backdrop-blur-sm text-[#1e2d2e] font-hanken font-semibold text-sm border border-[#1e2d2e]/20 touch-target"
                            style={{ 
                              touchAction: 'manipulation',
                              WebkitTapHighlightColor: 'transparent'
                            }}
                          >
                            Pause
                          </button>
                          <button
                            onClick={() => handlePracticeComplete(item.id)}
                            className="flex-1 px-6 py-3 rounded-full bg-[#1e2d2e] text-white font-hanken font-semibold text-sm touch-target"
                            style={{ 
                              touchAction: 'manipulation',
                              WebkitTapHighlightColor: 'transparent'
                            }}
                          >
                            Complete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          console.log('Begin Practice button clicked for:', item.id);
                          handlePracticeStart(item.id);
                        }}
                        className="w-full px-6 py-3 rounded-full bg-[#1e2d2e] text-white font-hanken font-semibold text-sm touch-target"
                        style={{ 
                          touchAction: 'manipulation',
                          WebkitTapHighlightColor: 'transparent'
                        }}
                      >
                        Begin Practice
                      </button>
                    )
                  ) : (
                    item.audioUrl && (
                      <div className="space-y-3">
                        {/* Timer Display for active sound */}
                        {activeSoundTimer === item.id && soundTimers[item.id] && (
                          <div className="text-center">
                            <div className="font-hanken font-mono text-2xl md:text-3xl text-[#1e2d2e] tabular-nums mb-1">
                              {formatTime(Math.max(0, Math.floor(soundTimers[item.id].remaining)))}
                            </div>
                            <p className="font-hanken text-xs text-[#1e2d2e]/50">
                              {soundTimers[item.id].remaining > 0 ? 'Time remaining' : 'Timer finished'}
                            </p>
                          </div>
                        )}
                        
                        {/* Timer Picker Button */}
                        {activeSoundTimer !== item.id && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setTimePickerSoundId(item.id);
                              setShowTimePicker(true);
                            }}
                            className="w-full px-6 py-2.5 rounded-full bg-white/70 backdrop-blur-sm text-[#1e2d2e] font-hanken font-semibold text-sm border border-[#1e2d2e]/20 touch-target"
                            style={{ 
                              touchAction: 'manipulation',
                              WebkitTapHighlightColor: 'transparent'
                            }}
                          >
                            Set Timer
                          </button>
                        )}
                        
                        {/* Play/Pause Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSoundPlayPause(item.id, item.audioUrl);
                          }}
                          className="w-full px-6 py-3 rounded-full bg-[#1e2d2e] text-white font-hanken font-semibold text-sm flex items-center justify-center gap-2 touch-target"
                          style={{ 
                            touchAction: 'manipulation',
                            WebkitTapHighlightColor: 'transparent'
                          }}
                        >
                          {playingSoundId === item.id ? (
                            <>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="6" y="4" width="4" height="16" rx="1" />
                                <rect x="14" y="4" width="4" height="16" rx="1" />
                              </svg>
                              Pause
                            </>
                          ) : (
                            <>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '3px' }}>
                                <path d="M8 5v14l11-7z" />
                              </svg>
                              Play
                            </>
                          )}
                        </button>
                      </div>
                    )
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        
        {/* Time Picker Modal */}
        <AnimatePresence>
          {showTimePicker && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={() => {
                  setShowTimePicker(false);
                  setTimePickerSoundId(null);
                }}
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
                    Set Timer
                  </h3>
                  <p className="font-hanken text-sm text-[#1e2d2e]/70 mb-6 text-center">
                    How long would you like to listen?
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[5, 10, 15, 20, 30].map((minutes) => (
                      <button
                        key={minutes}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (timePickerSoundId) {
                            handleSetSoundTimer(timePickerSoundId, minutes);
                          }
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
                      setShowTimePicker(false);
                      setTimePickerSoundId(null);
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

    </div>
  );
}
