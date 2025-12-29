import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const moods = [
  { id: 'calm', label: 'Calm', emoji: '😌' },
  { id: 'stressed', label: 'Stressed', emoji: '😰' },
  { id: 'energized', label: 'Energized', emoji: '⚡' },
  { id: 'tired', label: 'Tired', emoji: '😴' },
  { id: 'focused', label: 'Focused', emoji: '🎯' },
  { id: 'anxious', label: 'Anxious', emoji: '😟' },
];

const intentions = [
  { id: 'reduce-stress', label: 'Reduce Stress', icon: '🌬️' },
  { id: 'improve-focus', label: 'Improve Focus', icon: '🧠' },
  { id: 'better-sleep', label: 'Better Sleep', icon: '😴' },
  { id: 'self-love', label: 'Self Love', icon: '💖' },
  { id: 'grounding', label: 'Grounding', icon: '🌍' },
  { id: 'gratitude', label: 'Gratitude', icon: '🙏' },
];

export default function OnboardingModal({ onComplete, isOpen }) {
  const [step, setStep] = useState(1);
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedIntentions, setSelectedIntentions] = useState([]);

  const handleMoodSelect = (moodId) => {
    setSelectedMood(moodId);
    setTimeout(() => setStep(2), 400);
  };

  const handleIntentionToggle = (intentionId) => {
    setSelectedIntentions(prev =>
      prev.includes(intentionId)
        ? prev.filter(id => id !== intentionId)
        : [...prev, intentionId]
    );
  };

  const handleComplete = () => {
    if (selectedMood && selectedIntentions.length > 0) {
      onComplete({
        mood: selectedMood,
        intentions: selectedIntentions,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md mx-4 bg-white rounded-[32px] p-8 shadow-2xl"
          >
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="mood-step"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h2 className="text-3xl font-hanken font-bold text-[#1e2d2e] mb-2">
                    How are you feeling today?
                  </h2>
                  <p className="text-[#1e2d2e]/60 font-hanken mb-8">
                    This helps us personalize your meditation experience
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    {moods.map(mood => (
                      <motion.button
                        key={mood.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleMoodSelect(mood.id)}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          selectedMood === mood.id
                            ? 'border-[#1e2d2e] bg-[#1e2d2e]/5'
                            : 'border-[#1e2d2e]/10 hover:border-[#1e2d2e]/30'
                        }`}
                      >
                        <div className="text-3xl mb-2">{mood.emoji}</div>
                        <div className="font-hanken font-bold text-sm text-[#1e2d2e]">
                          {mood.label}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="intention-step"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h2 className="text-3xl font-hanken font-bold text-[#1e2d2e] mb-2">
                    What's your intention?
                  </h2>
                  <p className="text-[#1e2d2e]/60 font-hanken mb-8">
                    Select one or more intentions for today
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {intentions.map(intention => (
                      <motion.button
                        key={intention.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleIntentionToggle(intention.id)}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          selectedIntentions.includes(intention.id)
                            ? 'border-[#1e2d2e] bg-[#1e2d2e]/5'
                            : 'border-[#1e2d2e]/10 hover:border-[#1e2d2e]/30'
                        }`}
                      >
                        <div className="text-3xl mb-2">{intention.icon}</div>
                        <div className="font-hanken font-bold text-sm text-[#1e2d2e]">
                          {intention.label}
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 px-4 py-3 rounded-full border-2 border-[#1e2d2e]/20 text-[#1e2d2e] font-hanken font-bold hover:border-[#1e2d2e]/40 transition-all"
                    >
                      Back
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleComplete}
                      disabled={selectedIntentions.length === 0}
                      className={`flex-1 px-4 py-3 rounded-full font-hanken font-bold transition-all ${
                        selectedIntentions.length > 0
                          ? 'bg-[#1e2d2e] text-white hover:bg-[#2a3f40]'
                          : 'bg-[#1e2d2e]/20 text-[#1e2d2e]/40 cursor-not-allowed'
                      }`}
                    >
                      Continue
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
