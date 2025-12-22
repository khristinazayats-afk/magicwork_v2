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
  
  // New AI flow state
  const [flowStep, setFlowFlowStep] = useState('list'); // 'list', 'emotional_checkin', 'intent', 'generating', 'practice'
  const [emotionalState, setEmotionalState] = useState(null);
  const [selectedIntent, setSelectedIntent] = useState(null);
  const [generatedScript, setGeneratedScript] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const countdownIntervalRef = useRef(null);
  const videoRef = useRef(null);

  // Fetch video content for this space
  const { contentSet, loading: assetsLoading } = useContentSet(station?.name);
  const videoUrl = contentSet?.visual?.cdn_url || null;

  // Get practices for this station
  const stationPractices = availablePractices.filter(p => 
    p.spaces && p.spaces.includes(station?.name)
  ) || [];

  const emotionalStates = [
    { value: 'calm', label: 'Calm', icon: '😌', color: '#4CAF50' },
    { value: 'neutral', label: 'Neutral', icon: '😐', color: '#9E9E9E' },
    { value: 'slightly_anxious', label: 'Slightly Anxious', icon: '😰', color: '#FF9800' },
    { value: 'anxious', label: 'Anxious', icon: '😟', color: '#FF5722' },
    { value: 'very_anxious', label: 'Very Anxious', icon: '😫', color: '#F44336' },
  ];

  const intents = [
    { value: 'reduce_stress', label: 'Reduce Stress', icon: '☀️' },
    { value: 'improve_focus', label: 'Improve Focus', icon: '🎯' },
    { value: 'better_sleep', label: 'Better Sleep', icon: '🌙' },
    { value: 'boost_energy', label: 'Boost Energy', icon: '⚡' },
    { value: 'emotional_balance', label: 'Find Balance', icon: '⚖️' },
    { value: 'self_compassion', label: 'Self-Compassion', icon: '💖' },
  ];

  // Handle practice start
  const handleStartPractice = async () => {
    setIsGenerating(true);
    setError(null);
    setFlowFlowStep('generating');

    try {
      const response = await fetch('/api/generate-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emotionalState,
          durationMinutes: practiceDuration / 60,
          intent: selectedIntent,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate practice');

      const data = await response.json();
      setGeneratedScript(data.content);
      setFlowFlowStep('practice');
      
      // Notify parent
      if (onStartPractice) {
        onStartPractice(activePracticeId, practiceDuration);
      }

      // Start countdown
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      setTimeRemaining(practiceDuration);
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

    } catch (err) {
      console.error('Generation error:', err);
      setError('Something went wrong. Please try again.');
      setFlowFlowStep('intent');
    } finally {
      setIsGenerating(false);
    }
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
        duration: practiceDuration,
        intent: selectedIntent,
        emotionalState
      });
    }
    setActivePracticeId(null);
    setPracticeDuration(null);
    setTimeRemaining(null);
    setFlowFlowStep('list');
    setEmotionalState(null);
    setSelectedIntent(null);
    setGeneratedScript(null);
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

  // 1. Practice Selection (List)
  if (flowStep === 'list') {
    return (
      <div className="w-full h-full overflow-y-auto pb-32">
        <div className="px-6 py-4">
          <h2 className="font-hanken text-xl font-semibold text-[#1e2d2e] mb-4">
            Practices
          </h2>

          <div className="space-y-4">
            {/* AI Custom Practice Card */}
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActivePracticeId('ai_custom');
                setFlowFlowStep('emotional_checkin');
              }}
              className="bg-[#1e2d2e] text-white rounded-2xl p-6 shadow-lg cursor-pointer border border-white/10"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">✨</span>
                <h3 className="font-hanken text-lg font-semibold">
                  Personalized AI Practice
                </h3>
              </div>
              <p className="text-white/70 font-hanken text-sm mb-4">
                Let our AI create a guided meditation tailored to your current mood and goals.
              </p>
              <div className="text-xs font-hanken bg-white/20 px-3 py-1 rounded-full inline-block">
                Custom Duration
              </div>
            </motion.div>

            {stationPractices.map((practice) => (
              <motion.div
                key={practice.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActivePracticeId(practice.id);
                  setFlowFlowStep('emotional_checkin');
                }}
                className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 border border-[#1e2d2e]/10 cursor-pointer"
              >
                <h3 className="font-hanken text-lg font-semibold text-[#1e2d2e] mb-2">
                  {practice.title}
                </h3>
                <p className="text-[#1e2d2e]/70 font-hanken text-sm">
                  {practice.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. Emotional Check-in
  if (flowStep === 'emotional_checkin') {
    return (
      <div className="w-full h-full p-6 flex flex-col items-center">
        <button 
          onClick={() => setFlowFlowStep('list')}
          className="self-start text-[#1e2d2e]/60 mb-8"
        >
          ← Back
        </button>
        <h2 className="font-hanken text-2xl font-semibold text-[#1e2d2e] mb-2 text-center">
          How are you feeling?
        </h2>
        <p className="text-[#1e2d2e]/60 text-sm mb-12 text-center">
          Select your current emotional state
        </p>
        
        <div className="grid grid-cols-1 gap-4 w-full max-w-md">
          {emotionalStates.map((state) => (
            <motion.button
              key={state.value}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setEmotionalState(state.value);
                setFlowFlowStep('intent');
              }}
              className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-[#1e2d2e]/5 shadow-sm text-left"
            >
              <span className="text-3xl">{state.icon}</span>
              <span className="font-hanken font-medium text-[#1e2d2e]">{state.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // 3. Intent Selection & Duration
  if (flowStep === 'intent') {
    return (
      <div className="w-full h-full p-6 flex flex-col items-center overflow-y-auto pb-32">
        <button 
          onClick={() => setFlowFlowStep('emotional_checkin')}
          className="self-start text-[#1e2d2e]/60 mb-8"
        >
          ← Back
        </button>
        <h2 className="font-hanken text-2xl font-semibold text-[#1e2d2e] mb-2 text-center">
          What is your intent?
        </h2>
        <p className="text-[#1e2d2e]/60 text-sm mb-8 text-center">
          What would you like to focus on?
        </p>

        <div className="grid grid-cols-2 gap-3 w-full max-w-md mb-12">
          {intents.map((intent) => (
            <motion.button
              key={intent.value}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedIntent(intent.value)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                selectedIntent === intent.value 
                  ? 'bg-[#1e2d2e] text-white border-[#1e2d2e]' 
                  : 'bg-white text-[#1e2d2e] border-[#1e2d2e]/10 shadow-sm'
              }`}
            >
              <span className="text-2xl mb-2">{intent.icon}</span>
              <span className="font-hanken text-xs font-semibold">{intent.label}</span>
            </motion.button>
          ))}
        </div>

        <h3 className="font-hanken text-lg font-semibold text-[#1e2d2e] mb-4">
          Duration
        </h3>
        <div className="flex gap-3 mb-12">
          {[5, 10, 15, 20].map((duration) => (
            <button
              key={duration}
              onClick={() => setPracticeDuration(duration * 60)}
              className={`px-6 py-3 rounded-full font-hanken font-medium transition-all ${
                practiceDuration === duration * 60
                  ? 'bg-[#1e2d2e] text-white'
                  : 'bg-white text-[#1e2d2e] border border-[#1e2d2e]/10 shadow-sm'
              }`}
            >
              {duration}m
            </button>
          ))}
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          disabled={!selectedIntent || !practiceDuration}
          onClick={handleStartPractice}
          className={`w-full max-w-md py-4 rounded-full font-hanken font-bold transition-all ${
            selectedIntent && practiceDuration
              ? 'bg-[#1e2d2e] text-white shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Generate Practice
        </button>
      </div>
    );
  }

  // 4. Generating State
  if (flowStep === 'generating') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-5xl mb-8"
        >
          ✨
        </motion.div>
        <h2 className="font-hanken text-2xl font-semibold text-[#1e2d2e] mb-4">
          Personalizing Your Practice
        </h2>
        <p className="text-[#1e2d2e]/60 font-hanken max-w-xs mx-auto">
          Our AI is crafting a guided meditation script based on your mood and intention...
        </p>
      </div>
    );
  }

  // 5. Active Practice View
  if (flowStep === 'practice') {
    const practice = stationPractices.find(p => p.id === activePracticeId) || {
      title: 'Personalized AI Practice',
      description: generatedScript
    };

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
            style={{ opacity: 0.3, pointerEvents: 'none' }}
            src={videoUrl}
          />
        )}

        {/* Practice Content */}
        <div className="w-full h-full flex flex-col p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-hanken text-xl font-bold text-[#1e2d2e]">
              {practice.title}
            </h2>
            <div className="text-2xl font-hanken font-bold text-[#1e2d2e]">
              {formatTime(timeRemaining)}
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20 shadow-xl">
            <p className="text-[#1e2d2e] font-hanken text-lg leading-relaxed whitespace-pre-wrap">
              {generatedScript || practice.description}
            </p>
          </div>

          <button
            onClick={handleCompletePractice}
            className="w-full py-4 rounded-full bg-[#1e2d2e] text-white font-hanken font-bold shadow-lg mt-auto mb-24"
          >
            Complete Practice
          </button>
        </div>
      </div>
    );
  }

  return null;
}


