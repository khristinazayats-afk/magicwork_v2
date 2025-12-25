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
  const [narrationUrl, setNarrationUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [error, setError] = useState(null);

  const narrationAudioRef = useRef(new Audio());

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
      
      // Generate voice narration
      setIsGeneratingVoice(true);
      try {
        const voiceResponse = await fetch('/api/generate-voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: data.content,
            voice: emotionalState === 'calm' ? 'shimmer' : 'nova'
          }),
        });

        if (voiceResponse.ok) {
          const blob = await voiceResponse.blob();
          const url = URL.createObjectURL(blob);
          setNarrationUrl(url);
          narrationAudioRef.current.src = url;
          narrationAudioRef.current.play().catch(e => console.log('Narration autoplay blocked:', e));
        }
      } catch (voiceErr) {
        console.error('Voice generation error:', voiceErr);
      } finally {
        setIsGeneratingVoice(false);
      }

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
    
    // Stop narration
    narrationAudioRef.current.pause();
    narrationAudioRef.current.src = '';
    if (narrationUrl) {
      URL.revokeObjectURL(narrationUrl);
      setNarrationUrl(null);
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
      <div className="w-full h-full relative flex flex-col">
        {/* Practice Content */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-8 bg-white/40 backdrop-blur-md p-4 rounded-2xl sticky top-0 z-10">
            <div>
              <h2 className="font-hanken text-xl font-bold text-[#1e2d2e]">
                {practice.title}
              </h2>
              <div className="flex items-center gap-2">
                <p className="text-[#1e2d2e]/60 text-xs uppercase tracking-widest font-bold">
                  {isGeneratingVoice ? 'Generating Voice...' : 'Session Active'}
                </p>
                {!isGeneratingVoice && narrationUrl && (
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-[#4CAF50] rounded-full animate-pulse" />
                    <span className="text-[10px] text-[#4CAF50] font-bold uppercase tracking-widest">Audio Live</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-3xl font-hanken font-bold text-[#1e2d2e]">
              {formatTime(timeRemaining)}
            </div>
          </div>
          
          <div className="flex-1 max-w-2xl mx-auto w-full">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-lg rounded-[40px] p-8 md:p-12 mb-8 border border-white/40 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 text-4xl opacity-10 select-none">✨</div>
              <p className="text-[#1e2d2e] font-hanken text-lg md:text-xl leading-relaxed whitespace-pre-wrap relative z-10">
                {generatedScript || practice.description}
              </p>
            </motion.div>
          </div>

          <div className="max-w-md mx-auto w-full pb-32">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleCompletePractice}
              className="w-full py-5 rounded-full bg-[#1e2d2e] text-white font-hanken font-bold text-lg shadow-xl shadow-[#1e2d2e]/20"
            >
              Complete Practice
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}


