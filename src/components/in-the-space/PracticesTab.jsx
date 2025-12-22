import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { availablePractices } from '../../constants/availablePractices';
import { useContentSet } from '../../hooks/useContentSet';

export default function PracticesTab({
  station,
  isPlaying,
  currentTrackInfo,
  onPlayPause,
  audioRef,
  participantCount,
  onToggleFavorite,
  onExpandedViewChange,
  onStartPractice,
  onComplete
}) {
  const [activePracticeId, setActivePracticeId] = useState(null);
  const [practiceDuration, setPracticeDuration] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const countdownIntervalRef = useRef(null);
  const videoRef = useRef(null);

  // Fetch video content for this space
  const { contentSet, loading: assetsLoading } = useContentSet(station?.name);
  const videoUrl = contentSet?.visual?.cdn_url || null;

  // Get practices for this station
  const stationPractices = availablePractices.filter(p => 
    p.spaces && p.spaces.includes(station?.name)
  ) || [];

  // Handle practice start
  const handleStartPractice = (practiceId, duration) => {
    setActivePracticeId(practiceId);
    setPracticeDuration(duration);
    setTimeRemaining(duration);
    setIsExpanded(true);
    if (onExpandedViewChange) {
      onExpandedViewChange(true);
    }
    if (onStartPractice) {
      onStartPractice(practiceId, duration);
    }

    // Start countdown
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    countdownIntervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          handleCompletePractice();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle practice completion
  const handleCompletePractice = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setIsExpanded(false);
    if (onExpandedViewChange) {
      onExpandedViewChange(false);
    }
    if (onComplete) {
      onComplete({
        practiceId: activePracticeId,
        duration: practiceDuration
      });
    }
    setActivePracticeId(null);
    setPracticeDuration(null);
    setTimeRemaining(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Expanded practice view
  if (isExpanded && activePracticeId) {
    const practice = stationPractices.find(p => p.id === activePracticeId);
    return (
      <div className="w-full h-full relative">
        {/* Video Background */}
        {videoUrl && !assetsLoading && (
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
              pointerEvents: 'none'
            }}
            src={videoUrl}
            onError={(e) => {
              console.error('[PracticesTab] Video failed to load:', e.target.src);
              e.target.style.display = 'none';
            }}
          />
        )}

        {/* Practice Content */}
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
          <h2 className="font-hanken text-2xl font-semibold text-[#1e2d2e] mb-4">
            {practice?.title || 'Practice'}
          </h2>
          
          {timeRemaining !== null && (
            <div className="text-6xl font-hanken font-bold text-[#1e2d2e] mb-8">
              {formatTime(timeRemaining)}
            </div>
          )}

          <p className="text-[#1e2d2e]/70 font-hanken text-base mb-8 max-w-md">
            {practice?.description || 'Take your time and be present.'}
          </p>

          <button
            onClick={handleCompletePractice}
            className="px-8 py-4 rounded-full bg-[#1e2d2e] text-white font-hanken font-medium"
          >
            Complete Practice
          </button>
        </div>
      </div>
    );
  }

  // Practice list view
  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="px-6 py-4">
        <h2 className="font-hanken text-xl font-semibold text-[#1e2d2e] mb-4">
          Practices
        </h2>

        {stationPractices.length === 0 ? (
          <p className="text-[#1e2d2e]/60 font-hanken">
            No practices available for this space.
          </p>
        ) : (
          <div className="space-y-4">
            {stationPractices.map((practice) => (
              <motion.div
                key={practice.id}
                whileTap={{ scale: 0.98 }}
                className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 border border-[#1e2d2e]/10"
              >
                <h3 className="font-hanken text-lg font-semibold text-[#1e2d2e] mb-2">
                  {practice.title}
                </h3>
                <p className="text-[#1e2d2e]/70 font-hanken text-sm mb-4">
                  {practice.description}
                </p>
                <div className="flex gap-2">
                  {[5, 10, 15].map((duration) => (
                    <button
                      key={duration}
                      onClick={() => {
                        setShowTimePicker(false);
                        handleStartPractice(practice.id, duration * 60);
                      }}
                      className="px-4 py-2 rounded-full bg-[#1e2d2e] text-white font-hanken text-sm font-medium"
                    >
                      {duration}m
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

