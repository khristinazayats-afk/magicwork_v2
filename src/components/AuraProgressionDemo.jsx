import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MonthlyAuraCard from './MonthlyAuraCard';
import AuraBadge from './AuraBadge';
import MonthlyMoonRing from './MonthlyMoonRing';

// Aura configuration (same as AuraDemoPage)
const AURA_CONFIG = [
  {
    phaseName: 'New Moon',
    label: 'Dimmed Light, Spirits High',
    copy: 'You pressed pause — your body noticed.',
    minDays: 1,
    minStreak: 1
  },
  {
    phaseName: 'Waxing Crescent',
    label: 'Tiny Cloud of Calm',
    copy: 'Drifting between thoughts gets easier.',
    minDays: 3,
    minStreak: 2
  },
  {
    phaseName: 'First Quarter',
    label: 'Cosmic Heartbeat',
    copy: 'Your calm rhythm is syncing with the world.',
    minDays: 5,
    minStreak: 3
  },
  {
    phaseName: 'Waxing Gibbous',
    label: 'Parasympathetic Party',
    copy: 'Fewer alerts, more inner playlists.',
    minDays: 7,
    minStreak: 5
  },
  {
    phaseName: 'Full Moon',
    label: 'The Universe Holds Your Hand',
    copy: 'Life hums in time with your nervous system.',
    minDays: 10,
    minStreak: 5
  },
  {
    phaseName: 'Waning Gibbous',
    label: 'Mind Like Water',
    copy: 'You ripple, not react.',
    minDays: 12,
    minStreak: 7
  },
  {
    phaseName: 'Last Quarter',
    label: 'The Bloom Response',
    copy: "You're photosynthesizing peace.",
    minDays: 15,
    minStreak: 10
  },
  {
    phaseName: 'Waning Crescent',
    label: 'Full System Sync',
    copy: 'Even Mondays feel more manageable now.',
    minDays: 20,
    minStreak: 14
  },
  {
    phaseName: 'Supermoon',
    label: 'Featherweight Mind',
    copy: "Gravity's got nothing on your grace.",
    minDays: 25,
    minStreak: 21
  },
  {
    phaseName: 'Zen Eclipse',
    label: 'Zen Central',
    copy: 'You live from center. Nothing to chase.',
    minDays: 30,
    minStreak: 30
  }
];

function getCurrentAura(daysPracticed, consecutiveDays) {
  let currentAura = AURA_CONFIG[0];
  for (const aura of AURA_CONFIG) {
    if (daysPracticed >= aura.minDays && consecutiveDays >= aura.minStreak) {
      currentAura = aura;
    } else {
      break;
    }
  }
  return currentAura;
}

// Progression timeline showing key milestones
const PROGRESSION_MILESTONES = [
  { days: 0, streak: 0, label: 'Starting your journey' },
  { days: 1, streak: 1, label: 'First practice complete!' },
  { days: 3, streak: 2, label: 'Building momentum' },
  { days: 7, streak: 5, label: 'A week of presence' },
  { days: 15, streak: 10, label: 'Halfway through the month' },
  { days: 30, streak: 30, label: 'Full month of practice' }
];

export default function AuraProgressionDemo() {
  const [currentState, setCurrentState] = useState({ days: 0, streak: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFirstPractice, setShowFirstPractice] = useState(false);
  const [showProgression, setShowProgression] = useState(false);
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const currentAura = getCurrentAura(currentState.days, currentState.streak);

  // Auto-progression demo
  useEffect(() => {
    if (showProgression) {
      let step = 0;
      const interval = setInterval(() => {
        if (step < PROGRESSION_MILESTONES.length - 1) {
          step++;
          setIsAnimating(true);
          setCurrentState({
            days: PROGRESSION_MILESTONES[step].days,
            streak: PROGRESSION_MILESTONES[step].streak
          });
          setTimeout(() => setIsAnimating(false), 800);
        } else {
          clearInterval(interval);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [showProgression]);

  const handleFirstPractice = () => {
    setShowFirstPractice(true);
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentState({ days: 1, streak: 1 });
      setTimeout(() => setIsAnimating(false), 800);
    }, 500);
  };

  const handleStartProgression = () => {
    setShowProgression(true);
    setCurrentState({ days: 1, streak: 1 });
  };

  return (
    <div className="min-h-screen bg-[#fcf8f2] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-[rgba(252,248,242,0.98)] to-transparent backdrop-blur-md pb-4 pt-4" style={{ paddingTop: 'calc(env(safe-area-inset-top,24px) + 1rem)' }}>
        <div className="max-w-2xl mx-auto px-4 md:px-5">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-hanken text-2xl md:text-3xl font-semibold text-[#1e2d2e]">
              Your Aura Journey
            </h1>
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-full hover:bg-white/50 transition-colors"
              aria-label="Back"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e2d2e" strokeWidth="1.5">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-5 pb-20 pt-6 space-y-8">
        {/* First Practice Demo */}
        {!showFirstPractice && !showProgression && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="font-hanken text-xl font-semibold text-[#1e2d2e] mb-2">
                Before Your First Practice
              </h2>
              <p className="font-hanken text-sm text-[#1e2d2e]/60 mb-6">
                Your aura is resting. Any tiny pause you take here will be felt.
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 md:p-8 text-center" style={{ boxShadow: '0 4px 16px rgba(30, 45, 46, 0.1)' }}>
              <div className="mb-6">
                <AuraBadge 
                  aura={getCurrentAura(0, 0)} 
                  size="lg" 
                />
              </div>
              
              <div className="mb-6">
                <MonthlyMoonRing daysPracticed={0} totalDays={30} size={140} />
              </div>

              <p className="font-hanken text-base text-[#1e2d2e]/70 mb-6">
                You've practiced 0 days this month.
              </p>

              <button
                onClick={handleFirstPractice}
                className="px-8 py-3 rounded-full bg-[#1e2d2e] text-white font-hanken font-semibold text-base hover:bg-[#1e2d2e]/90 transition-all"
                style={{ boxShadow: '0 4px 16px rgba(30, 45, 46, 0.2)' }}
              >
                Complete Your First Practice
              </button>
            </div>
          </motion.div>
        )}

        {/* After First Practice */}
        {showFirstPractice && !showProgression && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="inline-block mb-4"
              >
                <div className="text-6xl">✨</div>
              </motion.div>
              <h2 className="font-hanken text-2xl font-semibold text-[#1e2d2e] mb-2">
                Your First Practice Complete!
              </h2>
              <p className="font-hanken text-base text-[#1e2d2e]/70 mb-6">
                Your body noticed. Your aura is beginning to shift.
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentState.days}-${currentState.streak}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <MonthlyAuraCard
                  monthName={currentMonth}
                  daysPracticedThisMonth={currentState.days}
                  consecutiveDaysThisMonth={currentState.streak}
                  aura={currentAura}
                />
              </motion.div>
            </AnimatePresence>

            <div className="text-center">
              <button
                onClick={handleStartProgression}
                className="px-8 py-3 rounded-full bg-white/70 text-[#1e2d2e] font-hanken font-semibold text-base border border-[#1e2d2e]/20 hover:bg-white/90 transition-all"
              >
                See How Your Aura Grows →
              </button>
            </div>
          </motion.div>
        )}

        {/* Progression Timeline */}
        {showProgression && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="font-hanken text-2xl font-semibold text-[#1e2d2e] mb-2">
                Watch Your Aura Evolve
              </h2>
              <p className="font-hanken text-sm text-[#1e2d2e]/60">
                As you practice consistently, your moon phase aura grows brighter
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentState.days}-${currentState.streak}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.6 }}
              >
                <MonthlyAuraCard
                  monthName={currentMonth}
                  daysPracticedThisMonth={currentState.days}
                  consecutiveDaysThisMonth={currentState.streak}
                  aura={currentAura}
                />
              </motion.div>
            </AnimatePresence>

            {/* Progress Timeline */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6" style={{ boxShadow: '0 4px 16px rgba(30, 45, 46, 0.1)' }}>
              <h3 className="font-hanken text-lg font-semibold text-[#1e2d2e] mb-4 text-center">
                Your Journey
              </h3>
              <div className="space-y-3">
                {PROGRESSION_MILESTONES.map((milestone, index) => {
                  const isReached = currentState.days >= milestone.days;
                  const milestoneAura = getCurrentAura(milestone.days, milestone.streak);
                  
                  return (
                    <motion.div
                      key={milestone.days}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                        isReached ? 'bg-[#94D1C4]/10' : 'bg-white/50'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                        isReached ? 'bg-[#94D1C4]/20' : 'bg-[#1e2d2e]/5'
                      }`}>
                        {isReached ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94D1C4" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        ) : (
                          <div className="w-3 h-3 rounded-full bg-[#1e2d2e]/20" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`font-hanken font-medium ${
                          isReached ? 'text-[#1e2d2e]' : 'text-[#1e2d2e]/50'
                        }`}>
                          {milestone.label}
                        </div>
                        <div className="font-hanken text-sm text-[#1e2d2e]/60">
                          {milestone.days} days • {milestone.streak} day streak → {milestoneAura.label}
                        </div>
                      </div>
                      {isReached && (
                        <AuraBadge aura={milestoneAura} size="sm" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}


