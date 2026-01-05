import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContentSet } from '../hooks/useContentSet';
import { useLocalAudio } from '../hooks/useLocalAudio';

export default function MinimalPracticeScreen({ 
  station, 
  practice,
  onBack 
}) {
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes default
  const [isRunning, setIsRunning] = useState(true);
  const [showHeader, setShowHeader] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState(() => {
    // Initialize voice based on practice attributes
    const emotionalState = practice?.emotionalState || practice?.currentState || 'neutral';
    const intent = practice?.intent || practice?.selectedIntent || 'reduce_stress';
    // Default: female for calming, male for focus/energy
    if (intent === 'improve_focus' || intent === 'boost_energy') return 'male';
    return practice?.voicePreference || 'female';
  });
  const [narrationUrl, setNarrationUrl] = useState(null);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [isPlayingNarration, setIsPlayingNarration] = useState(false);
  const intervalRef = useRef(null);
  const videoRef = useRef(null);
  const narrationAudioRef = useRef(new Audio());

  // Audio hook
  const { audioRef, playStation, pause, isPlaying } = useLocalAudio();

  // Fetch video content for this space
  const { contentSet, loading: assetsLoading } = useContentSet(station?.name);
  
  // For predefined practices, randomly select from available videos for variety
  // For custom practices, use the primary video
  const getVideoUrl = () => {
    if (!contentSet) return null;
    
    // If custom practice, use primary video
    if (practice?.type === 'custom') {
      return contentSet.visual?.cdn_url || null;
    }
    
    // For predefined practices, randomly select from available videos
    const videos = contentSet.visuals || [];
    if (videos.length > 0) {
      // Use practice index to seed selection for consistency
      const practiceIndex = practice?.index || 0;
      const selectedVideo = videos[practiceIndex % videos.length];
      return selectedVideo?.cdn_url || contentSet.visual?.cdn_url || null;
    }
    
    return contentSet.visual?.cdn_url || null;
  };
  
  const videoUrl = getVideoUrl();

  // Timer countdown
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining]);

  // Auto-play audio when component mounts
  useEffect(() => {
    if (station && playStation) {
      playStation(station);
    }
  }, [station, playStation]);

  // Format time helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Guidance text based on practice type
  const getGuidance = () => {
    // For predefined practices, use the practice description
    if (practice?.type === 'preconfigured' && practice?.description) {
      return practice.description;
    }
    
    // For custom practices, use generated content or default
    if (practice?.type === 'custom' && practice?.guidance) {
      return practice.guidance;
    }
    
    // Fallback to space-based guidance
    const guidance = {
      'Slow Morning': 'Find a comfortable position. Close your eyes if it feels right. Breathe naturally and notice the gentle rhythm of your breath.',
      'Gentle De-Stress': 'Allow your body to soften. Release any tension you\'re holding. Let each breath carry away stress and tension.',
      'Breathe to Relax': 'Focus on your breath. Inhale slowly, exhale slowly. Let your breath be your anchor in this moment.',
      'Get in the Flow State': 'Clear your mind. Focus on the present moment. Let distractions fade away as you enter a state of flow.',
      'Drift into Sleep': 'Relax completely. Let go of the day. Allow your body and mind to drift into peaceful sleep.',
      'Take a Walk': 'Move mindfully. Notice each step. Feel your connection to the ground beneath you.',
      'Draw Your Feels': 'Express yourself freely. Let your emotions flow through your creative expression.',
      'Move and Cool': 'Move your body gently. Release energy and find stillness.'
    };
    return guidance[station?.name] || 'Take a moment to be present. Breathe naturally and allow yourself to settle into this practice.';
  };

  // Parse duration from practice
  useEffect(() => {
    if (practice?.duration) {
      const durationStr = practice.duration;
      const minutes = parseInt(durationStr) || 10; // Default to 10 minutes
      setTimeRemaining(minutes * 60);
    }
  }, [practice]);

  // Get voice attributes based on emotional state and intent
  const getVoiceAttributes = () => {
    const emotionalState = practice?.emotionalState || practice?.currentState || 'neutral';
    const intent = practice?.intent || practice?.selectedIntent || 'reduce_stress';
    
    // Voice selection based on journey: from current state to desired state
    const voiceMap = {
      // Calm/Neutral states → Any intent: Warm, soothing voices
      calm: {
        reduce_stress: { gender: 'female', tone: 'warm', pace: 'slow', stability: 0.8 },
        improve_focus: { gender: 'male', tone: 'clear', pace: 'moderate', stability: 0.75 },
        better_sleep: { gender: 'female', tone: 'calm', pace: 'slow', stability: 0.85 },
        boost_energy: { gender: 'male', tone: 'energetic', pace: 'moderate', stability: 0.7 },
        emotional_balance: { gender: 'female', tone: 'balanced', pace: 'slow', stability: 0.8 },
        self_compassion: { gender: 'female', tone: 'warm', pace: 'slow', stability: 0.85 }
      },
      neutral: {
        reduce_stress: { gender: 'female', tone: 'warm', pace: 'slow', stability: 0.8 },
        improve_focus: { gender: 'male', tone: 'clear', pace: 'moderate', stability: 0.75 },
        better_sleep: { gender: 'female', tone: 'calm', pace: 'slow', stability: 0.85 },
        boost_energy: { gender: 'male', tone: 'energetic', pace: 'moderate', stability: 0.7 },
        emotional_balance: { gender: 'female', tone: 'balanced', pace: 'slow', stability: 0.8 },
        self_compassion: { gender: 'female', tone: 'warm', pace: 'slow', stability: 0.85 }
      },
      // Anxious states → Calming intents: Very soothing, slower
      slightly_anxious: {
        reduce_stress: { gender: 'female', tone: 'calm', pace: 'slow', stability: 0.9 },
        improve_focus: { gender: 'male', tone: 'grounding', pace: 'slow', stability: 0.85 },
        better_sleep: { gender: 'female', tone: 'soothing', pace: 'very_slow', stability: 0.9 },
        boost_energy: { gender: 'male', tone: 'gentle', pace: 'slow', stability: 0.85 },
        emotional_balance: { gender: 'female', tone: 'calm', pace: 'slow', stability: 0.9 },
        self_compassion: { gender: 'female', tone: 'warm', pace: 'slow', stability: 0.9 }
      },
      anxious: {
        reduce_stress: { gender: 'female', tone: 'very_calm', pace: 'very_slow', stability: 0.95 },
        improve_focus: { gender: 'male', tone: 'grounding', pace: 'slow', stability: 0.9 },
        better_sleep: { gender: 'female', tone: 'soothing', pace: 'very_slow', stability: 0.95 },
        boost_energy: { gender: 'male', tone: 'gentle', pace: 'slow', stability: 0.9 },
        emotional_balance: { gender: 'female', tone: 'very_calm', pace: 'very_slow', stability: 0.95 },
        self_compassion: { gender: 'female', tone: 'warm', pace: 'very_slow', stability: 0.95 }
      },
      very_anxious: {
        reduce_stress: { gender: 'female', tone: 'extremely_calm', pace: 'very_slow', stability: 0.98 },
        improve_focus: { gender: 'male', tone: 'grounding', pace: 'very_slow', stability: 0.95 },
        better_sleep: { gender: 'female', tone: 'soothing', pace: 'very_slow', stability: 0.98 },
        boost_energy: { gender: 'male', tone: 'gentle', pace: 'very_slow', stability: 0.95 },
        emotional_balance: { gender: 'female', tone: 'extremely_calm', pace: 'very_slow', stability: 0.98 },
        self_compassion: { gender: 'female', tone: 'warm', pace: 'very_slow', stability: 0.98 }
      }
    };
    
    const stateMap = voiceMap[emotionalState] || voiceMap.neutral;
    const attributes = stateMap[intent] || stateMap.reduce_stress;
    
    // Override with user's selected voice preference if available
    if (practice?.voicePreference) {
      attributes.gender = practice.voicePreference;
    }
    
    return attributes;
  };

  // Generate voice narration
  useEffect(() => {
    const generateNarration = async () => {
      const guidanceText = getGuidance();
      if (!guidanceText || narrationUrl) return; // Don't regenerate if already exists
      
      setIsGeneratingVoice(true);
      try {
        const voiceAttrs = getVoiceAttributes();
        
        const response = await fetch('/api/generate-voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: guidanceText,
            voice: voiceAttrs.gender === 'male' ? 'clear' : 'warm',
            emotionalState: practice?.emotionalState || practice?.currentState,
            intent: practice?.intent || practice?.selectedIntent,
            tone: voiceAttrs.tone,
            pace: voiceAttrs.pace,
            stability: voiceAttrs.stability
          }),
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setNarrationUrl(url);
          narrationAudioRef.current.src = url;
          narrationAudioRef.current.volume = 0.7; // Slightly lower than ambient
          
          // Auto-play narration
          try {
            await narrationAudioRef.current.play();
            setIsPlayingNarration(true);
          } catch (e) {
            console.log('[Narration] Autoplay blocked, user interaction required');
          }
        } else {
          console.error('[Narration] Generation failed:', response.status);
        }
      } catch (error) {
        console.error('[Narration] Error generating voice:', error);
      } finally {
        setIsGeneratingVoice(false);
      }
    };

    // Generate narration when practice starts
    if (practice && !narrationUrl) {
      generateNarration();
    }

    // Cleanup on unmount
    return () => {
      if (narrationUrl) {
        URL.revokeObjectURL(narrationUrl);
      }
      if (narrationAudioRef.current) {
        narrationAudioRef.current.pause();
        narrationAudioRef.current.src = '';
      }
    };
  }, [practice, narrationUrl]); // Include narrationUrl to prevent regeneration

  // Handle voice selection change
  const handleVoiceChange = async (gender) => {
    setSelectedVoice(gender);
    // Regenerate narration with new voice
    if (narrationUrl) {
      URL.revokeObjectURL(narrationUrl);
      setNarrationUrl(null);
    }
    narrationAudioRef.current.pause();
    narrationAudioRef.current.src = '';
    setIsPlayingNarration(false);
    
    // Trigger regeneration
    const guidanceText = getGuidance();
    if (!guidanceText) return;
    
    setIsGeneratingVoice(true);
    try {
      const voiceAttrs = getVoiceAttributes();
      voiceAttrs.gender = gender; // Override with selection
      
      const response = await fetch('/api/generate-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: guidanceText,
          voice: gender === 'male' ? 'clear' : 'warm',
          emotionalState: practice?.emotionalState || practice?.currentState,
          intent: practice?.intent || practice?.selectedIntent,
          tone: voiceAttrs.tone,
          pace: voiceAttrs.pace,
          stability: voiceAttrs.stability
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setNarrationUrl(url);
        narrationAudioRef.current.src = url;
        narrationAudioRef.current.volume = 0.7;
        
        try {
          await narrationAudioRef.current.play();
          setIsPlayingNarration(true);
        } catch (e) {
          console.log('[Narration] Autoplay blocked');
        }
      }
    } catch (error) {
      console.error('[Narration] Error regenerating voice:', error);
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  // Toggle narration play/pause
  const toggleNarration = () => {
    if (!narrationAudioRef.current.src) return;
    
    if (isPlayingNarration) {
      narrationAudioRef.current.pause();
      setIsPlayingNarration(false);
    } else {
      narrationAudioRef.current.play();
      setIsPlayingNarration(true);
    }
  };

  const handleBack = () => {
    // Stop audio
    pause();
    // Stop narration
    if (narrationAudioRef.current) {
      narrationAudioRef.current.pause();
      narrationAudioRef.current.src = '';
    }
    if (narrationUrl) {
      URL.revokeObjectURL(narrationUrl);
    }
    // Stop timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    onBack();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#fcf8f2] flex flex-col">
      {/* Hidden audio elements */}
      <audio ref={audioRef} />
      <audio ref={narrationAudioRef} />
      
      {/* Video Background */}
      {videoUrl && !assetsLoading && (
        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* Content */}
      <div 
        className="relative z-10 flex-1 flex flex-col"
        onClick={(e) => {
          // Only toggle if clicking on the content area, not on buttons
          if (e.target === e.currentTarget || e.target.closest('.guidance-text')) {
            setShowHeader(prev => !prev);
          }
        }}
      >
        {/* Header with Back Button and Timer */}
        <motion.div 
          className="flex items-center justify-between p-6" 
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.5rem)' }}
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: showHeader ? 1 : 0, y: showHeader ? 0 : -20 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
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

          {/* Timer */}
          <div className="text-center">
            <div className="font-hanken font-bold text-[#1e2d2e] text-3xl tabular-nums">
              {formatTime(timeRemaining)}
            </div>
          </div>

          {/* Voice Controls */}
          <div className="flex items-center gap-2">
            {/* Voice Selection */}
            <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full p-1 border border-[#1e2d2e]/10">
              <button
                onClick={() => handleVoiceChange('female')}
                className={`px-3 py-1.5 rounded-full text-xs font-hanken font-semibold transition-all ${
                  selectedVoice === 'female'
                    ? 'bg-[#1e2d2e] text-white'
                    : 'text-[#1e2d2e]/60 hover:text-[#1e2d2e]'
                }`}
                disabled={isGeneratingVoice}
              >
                ♀
              </button>
              <button
                onClick={() => handleVoiceChange('male')}
                className={`px-3 py-1.5 rounded-full text-xs font-hanken font-semibold transition-all ${
                  selectedVoice === 'male'
                    ? 'bg-[#1e2d2e] text-white'
                    : 'text-[#1e2d2e]/60 hover:text-[#1e2d2e]'
                }`}
                disabled={isGeneratingVoice}
              >
                ♂
              </button>
            </div>
            
            {/* Narration Play/Pause */}
            {narrationUrl && (
              <button
                onClick={toggleNarration}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
                aria-label={isPlayingNarration ? 'Pause narration' : 'Play narration'}
              >
                {isGeneratingVoice ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-[#1e2d2e] border-t-transparent rounded-full"
                  />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    {isPlayingNarration ? (
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" fill="#1e2d2e" />
                    ) : (
                      <path d="M8 5v14l11-7z" fill="#1e2d2e" />
                    )}
                  </svg>
                )}
              </button>
            )}
          </div>
        </motion.div>

        {/* Guidance Text - Centered */}
        <div className="flex-1 flex items-center justify-center px-6 pb-32 guidance-text" style={{ cursor: 'pointer' }}>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-hanken text-[#1e2d2e] text-lg md:text-xl leading-relaxed text-center max-w-2xl"
          >
            {getGuidance()}
          </motion.p>
        </div>
      </div>
    </div>
  );
}

