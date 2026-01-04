import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useContentSet } from '../hooks/useContentSet';
import { useLocalAudio } from '../hooks/useLocalAudio';

export default function MinimalPracticeScreen({ 
  station, 
  onBack 
}) {
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes default
  const [isRunning, setIsRunning] = useState(true);
  const [showHeader, setShowHeader] = useState(true);
  const intervalRef = useRef(null);
  const videoRef = useRef(null);

  // Audio hook
  const { audioRef, playStation, pause, isPlaying } = useLocalAudio();

  // Fetch video content for this space
  const { contentSet, loading: assetsLoading } = useContentSet(station?.name);
  const videoUrl = contentSet?.visual?.cdn_url || null;

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

  // Guidance text based on space
  const getGuidance = () => {
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

  const handleBack = () => {
    // Stop audio
    pause();
    // Stop timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    onBack();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#fcf8f2] flex flex-col">
      {/* Hidden audio element */}
      <audio ref={audioRef} />
      
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

          {/* Spacer for symmetry */}
          <div className="w-10" />
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

