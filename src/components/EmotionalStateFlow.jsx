import { useState } from 'react';
import { motion } from 'framer-motion';

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

export default function EmotionalStateFlow({ station, onComplete, onBack }) {
  const [step, setStep] = useState('current'); // 'current', 'desired', 'duration'
  const [currentState, setCurrentState] = useState(null);
  const [selectedIntent, setSelectedIntent] = useState(null);
  const [practiceDuration, setPracticeDuration] = useState(null);

  const handleGenerate = () => {
    if (currentState && selectedIntent && practiceDuration) {
      onComplete({
        type: 'custom',
        currentState,
        intent: selectedIntent,
        duration: practiceDuration,
        station: station?.name
      });
    }
  };

  // Current State Selection
  if (step === 'current') {
    return (
      <div className="fixed inset-0 z-50 bg-[#fcf8f2] flex flex-col overflow-y-auto">
        <div className="p-6" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.5rem)' }}>
          <button
            onClick={onBack}
            className="mb-8 p-2 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="#1e2d2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h2 className="font-hanken text-2xl font-semibold text-[#1e2d2e] mb-2 text-center">
            How are you feeling right now?
          </h2>
          <p className="text-[#1e2d2e]/60 text-sm mb-12 text-center">
            Select your current emotional state
          </p>
          
          <div className="grid grid-cols-1 gap-4 w-full max-w-md mx-auto">
            {emotionalStates.map((state) => (
              <motion.button
                key={state.value}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setCurrentState(state.value);
                  setStep('desired');
                }}
                className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-[#1e2d2e]/5 shadow-sm text-left"
              >
                <span className="text-3xl">{state.icon}</span>
                <span className="font-hanken font-medium text-[#1e2d2e]">{state.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Desired State / Intent Selection
  if (step === 'desired') {
    return (
      <div className="fixed inset-0 z-50 bg-[#fcf8f2] flex flex-col overflow-y-auto">
        <div className="p-6" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.5rem)' }}>
          <button
            onClick={() => setStep('current')}
            className="mb-8 text-[#1e2d2e]/60"
          >
            ← Back
          </button>
          <h2 className="font-hanken text-2xl font-semibold text-[#1e2d2e] mb-2 text-center">
            What would you like to focus on?
          </h2>
          <p className="text-[#1e2d2e]/60 text-sm mb-8 text-center">
            Choose your intention
          </p>

          <div className="grid grid-cols-2 gap-3 w-full max-w-md mx-auto mb-12">
            {intents.map((intent) => (
              <motion.button
                key={intent.value}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedIntent(intent.value);
                  setStep('duration');
                }}
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
        </div>
      </div>
    );
  }

  // Duration Selection
  if (step === 'duration') {
    return (
      <div className="fixed inset-0 z-50 bg-[#fcf8f2] flex flex-col overflow-y-auto">
        <div className="p-6" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.5rem)' }}>
          <button
            onClick={() => setStep('desired')}
            className="mb-8 text-[#1e2d2e]/60"
          >
            ← Back
          </button>
          <h2 className="font-hanken text-2xl font-semibold text-[#1e2d2e] mb-2 text-center">
            How long?
          </h2>
          <p className="text-[#1e2d2e]/60 text-sm mb-12 text-center">
            Choose your practice duration
          </p>

          <div className="flex gap-3 justify-center mb-12">
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

          <button
            disabled={!practiceDuration}
            onClick={handleGenerate}
            className={`w-full max-w-md mx-auto py-4 rounded-full font-hanken font-bold transition-all ${
              practiceDuration
                ? 'bg-[#1e2d2e] text-white shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Generate Practice
          </button>
        </div>
      </div>
    );
  }

  return null;
}

