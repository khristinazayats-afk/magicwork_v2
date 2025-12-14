import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VOICE_AUDIO_OPTIONS, getDefaultVoiceAudio } from '../constants/voiceAudioOptions';

/**
 * Timer and Voice Selection Modal
 * Shows when user clicks on a card to start practice
 */
export default function TimerVoiceSelectionModal({ 
  isOpen, 
  onClose, 
  onStart, 
  cardTitle 
}) {
  // `undefined` = not chosen yet, `null` = no time limit, number = minutes
  const [selectedDuration, setSelectedDuration] = useState(undefined);
  const [selectedVoice, setSelectedVoice] = useState(getDefaultVoiceAudio().id);
  const [showVoiceSelection, setShowVoiceSelection] = useState(false);

  const durationOptions = [5, 10, 15, 20, 30];

  useEffect(() => {
    if (!isOpen) return;
    // Reset per-open so the modal always starts clean for the next card
    setSelectedDuration(undefined);
    setSelectedVoice(getDefaultVoiceAudio().id);
    setShowVoiceSelection(false);
  }, [isOpen]);

  const handleStart = () => {
    if (selectedDuration === undefined) {
      // If no duration selected yet, move to voice selection
      setShowVoiceSelection(true);
      return;
    }

    onStart({
      durationMinutes: selectedDuration, // number | null
      voiceAudioId: selectedVoice
    });
  };

  const handleDurationSelect = (minutes) => {
    setSelectedDuration(minutes);
    setShowVoiceSelection(true);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="text-center mb-6">
            <h2 className="font-hanken text-2xl md:text-3xl font-semibold text-[#1e2d2e] mb-2">
              {cardTitle || 'Start Practice'}
            </h2>
            <p className="font-hanken text-[#1e2d2e]/70 text-sm md:text-base">
              Choose your practice duration
            </p>
          </div>

          {!showVoiceSelection ? (
            <>
              {/* Duration Selection */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {durationOptions.map((minutes) => (
                  <motion.button
                    key={minutes}
                    onClick={() => handleDurationSelect(minutes)}
                    whileTap={{ scale: 0.95 }}
                    className={`px-6 py-4 rounded-full font-hanken font-semibold text-base md:text-lg transition-all ${
                      selectedDuration === minutes
                        ? 'bg-[#1e2d2e] text-white'
                        : 'bg-[#1e2d2e]/10 text-[#1e2d2e] hover:bg-[#1e2d2e]/20'
                    }`}
                  >
                    {minutes} min
                  </motion.button>
                ))}
              </div>

              <motion.button
                onClick={() => {
                  setSelectedDuration(null); // no time limit
                  setShowVoiceSelection(true);
                }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-6 py-4 rounded-full bg-white border-2 border-[#1e2d2e] text-[#1e2d2e] font-hanken font-semibold text-base md:text-lg hover:bg-[#1e2d2e]/5 transition-all mb-4"
              >
                No Time Limit
              </motion.button>
            </>
          ) : (
            <>
              {/* Voice Selection */}
              <div className="mb-6">
                <h3 className="font-hanken text-lg font-semibold text-[#1e2d2e] mb-4 text-center">
                  Choose Your Audio
                </h3>
                <div className="space-y-2">
                  {VOICE_AUDIO_OPTIONS.map((option) => (
                    <motion.button
                      key={option.id}
                      onClick={() => setSelectedVoice(option.id)}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full px-4 py-3 rounded-xl text-left transition-all ${
                        selectedVoice === option.id
                          ? 'bg-[#1e2d2e] text-white'
                          : 'bg-[#1e2d2e]/5 text-[#1e2d2e] hover:bg-[#1e2d2e]/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{option.icon}</span>
                        <div className="flex-1">
                          <div className="font-hanken font-semibold">{option.name}</div>
                          <div className="font-hanken text-xs opacity-80">{option.description}</div>
                        </div>
                        {selectedVoice === option.id && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowVoiceSelection(false)}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-6 py-3 rounded-full bg-white border-2 border-[#1e2d2e]/20 text-[#1e2d2e] font-hanken font-semibold text-sm md:text-base hover:bg-[#1e2d2e]/5 transition-all"
                >
                  Back
                </motion.button>
                <motion.button
                  onClick={handleStart}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-6 py-3 rounded-full bg-[#1e2d2e] text-white font-hanken font-semibold text-sm md:text-base hover:bg-[#1e2d2e]/90 transition-all"
                >
                  Start Practice
                </motion.button>
              </div>
            </>
          )}

          <motion.button
            onClick={onClose}
            className="w-full mt-4 px-4 py-2 rounded-full text-[#1e2d2e]/50 font-hanken text-sm hover:text-[#1e2d2e] transition-colors"
          >
            Cancel
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

