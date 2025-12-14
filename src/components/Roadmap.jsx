import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Roadmap milestones based on the gamification prompt
const MILESTONES = [
  {
    id: 1,
    daysTotal: 1,
    daysConsecutive: 1,
    emoji: '🌱',
    title: 'Dimmed Light, Spirits High',
    reward: 'You pressed pause — your body noticed.',
    science: 'Single mindful pause lowers cortisol & HR.',
    unlocked: true,
    completed: false
  },
  {
    id: 2,
    daysTotal: 3,
    daysConsecutive: 2,
    emoji: '☁️',
    title: 'Tiny Cloud of Calm',
    reward: 'Drifting between thoughts gets easier.',
    science: 'Brief mindfulness enhances meta-awareness.',
    unlocked: true,
    completed: false
  },
  {
    id: 3,
    daysTotal: 5,
    daysConsecutive: 3,
    emoji: '💓',
    title: 'Cosmic Heartbeat',
    reward: 'Your calm rhythm is syncing with the world.',
    science: 'Regular breathwork steadies HRV.',
    unlocked: true,
    completed: false
  },
  {
    id: 4,
    daysTotal: 7,
    daysConsecutive: 5,
    emoji: '🌊',
    title: 'Parasympathetic Party',
    reward: 'Fewer alerts, more inner playlists.',
    science: '7 days of mindfulness reduces amygdala response.',
    unlocked: false,
    completed: false
  },
  {
    id: 5,
    daysTotal: 10,
    daysConsecutive: 5,
    emoji: '🌸',
    title: 'The Universe Holds Your Hand',
    reward: 'Life hums in time with your nervous system.',
    science: 'Sustained practice enhances safety perception.',
    unlocked: false,
    completed: false
  },
  {
    id: 6,
    daysTotal: 12,
    daysConsecutive: 7,
    emoji: '🔮',
    title: 'Mind Like Water',
    reward: 'You ripple, not react.',
    science: 'Vagal tone improves through daily stillness.',
    unlocked: false,
    completed: false
  },
  {
    id: 7,
    daysTotal: 15,
    daysConsecutive: 10,
    emoji: '🌻',
    title: 'The Bloom Response',
    reward: "You're photosynthesizing peace.",
    science: 'Regular reflection increases serotonin & self-regulation.',
    unlocked: false,
    completed: false
  },
  {
    id: 8,
    daysTotal: 20,
    daysConsecutive: 14,
    emoji: '🌕',
    title: 'Full System Sync',
    reward: 'Even Mondays feel manageable now.',
    science: '14+ days stabilizes mood & attention circuits.',
    unlocked: false,
    completed: false
  },
  {
    id: 9,
    daysTotal: 25,
    daysConsecutive: 21,
    emoji: '🪶',
    title: 'Featherweight Mind',
    reward: "Gravity's got nothing on your grace.",
    science: 'Long-term practice lightens cognitive load.',
    unlocked: false,
    completed: false
  },
  {
    id: 10,
    daysTotal: 30,
    daysConsecutive: 30,
    emoji: '🧘‍♀️',
    title: 'Zen Central',
    reward: 'You live from center. Nothing to chase.',
    science: '30 days = habit loop solidified; stress reactivity down.',
    unlocked: false,
    completed: false
  }
];

// Mock user progress (in real app, this would come from localStorage/API)
const getMockProgress = () => {
  // Simulate: user has completed 2 days total, 2 days consecutive
  return {
    daysTotal: 2,
    daysConsecutive: 2,
    currentStreak: 2
  };
};

export default function Roadmap() {
  const [progress] = useState(getMockProgress());
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [currentMonth] = useState(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));

  // Calculate which milestones are unlocked/completed based on progress
  const milestonesWithStatus = MILESTONES.map(milestone => {
    const unlocked = progress.daysTotal >= milestone.daysTotal || milestone.unlocked;
    const completed = progress.daysTotal >= milestone.daysTotal && progress.daysConsecutive >= milestone.daysConsecutive;
    return { ...milestone, unlocked, completed };
  });

  // Get next milestone to unlock
  const nextMilestone = milestonesWithStatus.find(m => !m.completed && m.unlocked) || 
                        milestonesWithStatus.find(m => !m.unlocked);

  return (
    <div className="min-h-screen bg-[#fcf8f2] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-[rgba(252,248,242,0.98)] to-transparent backdrop-blur-md pb-4 pt-4" style={{ paddingTop: 'calc(env(safe-area-inset-top,24px) + 1rem)' }}>
        <div className="max-w-2xl mx-auto px-4 md:px-5">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-hanken text-2xl md:text-3xl font-semibold text-[#1e2d2e]">
              Your Journey
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
          <p className="font-hanken text-sm text-[#1e2d2e]/60">
            {currentMonth}
          </p>
        </div>
      </div>

      {/* Progress Summary Card */}
      <div className="max-w-2xl mx-auto px-4 md:px-5 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-lg rounded-2xl p-6"
          style={{ boxShadow: '0 4px 16px rgba(30, 45, 46, 0.1)' }}
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="font-hanken text-3xl font-bold text-[#1e2d2e] mb-1">
                {progress.daysTotal}
              </div>
              <div className="font-hanken text-xs text-[#1e2d2e]/60 uppercase tracking-wider">
                Days Total
              </div>
            </div>
            <div>
              <div className="font-hanken text-3xl font-bold text-[#1e2d2e] mb-1">
                {progress.daysConsecutive}
              </div>
              <div className="font-hanken text-xs text-[#1e2d2e]/60 uppercase tracking-wider">
                Day Streak
              </div>
            </div>
            <div>
              <div className="font-hanken text-3xl font-bold text-[#1e2d2e] mb-1">
                {milestonesWithStatus.filter(m => m.completed).length}
              </div>
              <div className="font-hanken text-xs text-[#1e2d2e]/60 uppercase tracking-wider">
                Wins Earned
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Roadmap Timeline */}
      <div className="max-w-2xl mx-auto px-4 md:px-5 pb-20">
        <div className="space-y-4">
          {milestonesWithStatus.map((milestone, index) => {
            const isLast = index === milestonesWithStatus.length - 1;
            const progressToNext = nextMilestone && !isLast
              ? Math.min(100, (progress.daysTotal / nextMilestone.daysTotal) * 100)
              : milestone.completed ? 100 : 0;

            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Connection Line */}
                {!isLast && (
                  <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-[#1e2d2e]/10" />
                )}

                {/* Milestone Card */}
                <motion.div
                  onClick={() => setSelectedMilestone(milestone)}
                  whileTap={{ scale: 0.98 }}
                  className={`relative bg-white/70 backdrop-blur-lg rounded-2xl p-5 cursor-pointer transition-all ${
                    milestone.completed
                      ? 'ring-2 ring-[#94D1C4] shadow-lg'
                      : milestone.unlocked
                      ? 'ring-1 ring-[#1e2d2e]/20 hover:ring-[#1e2d2e]/40'
                      : 'opacity-60'
                  }`}
                  style={{ boxShadow: milestone.completed ? '0 4px 16px rgba(148, 209, 196, 0.2)' : '0 2px 8px rgba(30, 45, 46, 0.08)' }}
                >
                  <div className="flex items-start gap-4">
                    {/* Emoji/Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      milestone.completed
                        ? 'bg-[#94D1C4]/20'
                        : milestone.unlocked
                        ? 'bg-[#1e2d2e]/10'
                        : 'bg-[#1e2d2e]/5'
                    }`}>
                      {milestone.emoji}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-hanken text-lg font-semibold ${
                              milestone.completed ? 'text-[#1e2d2e]' : milestone.unlocked ? 'text-[#1e2d2e]' : 'text-[#1e2d2e]/50'
                            }`}>
                              {milestone.title}
                            </h3>
                            {milestone.completed && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-5 h-5 rounded-full bg-[#94D1C4] flex items-center justify-center"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </motion.div>
                            )}
                          </div>
                          <p className={`font-hanken text-sm ${
                            milestone.completed ? 'text-[#1e2d2e]/80' : milestone.unlocked ? 'text-[#1e2d2e]/70' : 'text-[#1e2d2e]/40'
                          }`}>
                            {milestone.reward}
                          </p>
                        </div>
                      </div>

                      {/* Progress Requirements */}
                      <div className="mt-3 flex items-center gap-4 text-xs">
                        <div className={`font-hanken ${
                          milestone.completed ? 'text-[#94D1C4]' : milestone.unlocked ? 'text-[#1e2d2e]/60' : 'text-[#1e2d2e]/40'
                        }`}>
                          {milestone.daysTotal} days total
                        </div>
                        <div className="text-[#1e2d2e]/20">·</div>
                        <div className={`font-hanken ${
                          milestone.completed ? 'text-[#94D1C4]' : milestone.unlocked ? 'text-[#1e2d2e]/60' : 'text-[#1e2d2e]/40'
                        }`}>
                          {milestone.daysConsecutive} day streak
                        </div>
                      </div>

                      {/* Progress Bar (for next milestone) */}
                      {!milestone.completed && milestone.unlocked && nextMilestone?.id === milestone.id && (
                        <div className="mt-3 h-1.5 bg-[#1e2d2e]/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressToNext}%` }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="h-full bg-[#94D1C4] rounded-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Milestone Detail Modal */}
      <AnimatePresence>
        {selectedMilestone && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setSelectedMilestone(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto"
            >
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 max-h-[80vh] overflow-y-auto">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{selectedMilestone.emoji}</div>
                  <h2 className="font-hanken text-2xl font-semibold text-[#1e2d2e] mb-2">
                    {selectedMilestone.title}
                  </h2>
                  <p className="font-hanken text-base text-[#1e2d2e]/80 mb-4">
                    {selectedMilestone.reward}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#1e2d2e]/5 rounded-xl p-4">
                    <div className="font-hanken text-xs uppercase tracking-wider text-[#1e2d2e]/60 mb-2">
                      Requirements
                    </div>
                    <div className="font-hanken text-sm text-[#1e2d2e] space-y-1">
                      <div>• {selectedMilestone.daysTotal} days of practice total</div>
                      <div>• {selectedMilestone.daysConsecutive} days in a row</div>
                    </div>
                  </div>

                  <div className="bg-[#94D1C4]/10 rounded-xl p-4">
                    <div className="font-hanken text-xs uppercase tracking-wider text-[#1e2d2e]/60 mb-2">
                      The Science
                    </div>
                    <p className="font-hanken text-sm text-[#1e2d2e] leading-relaxed">
                      {selectedMilestone.science}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedMilestone(null)}
                  className="w-full mt-6 px-6 py-3 rounded-full bg-[#1e2d2e] text-white font-hanken font-semibold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

