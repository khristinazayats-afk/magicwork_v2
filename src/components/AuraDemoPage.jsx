import { useState } from 'react';
import { motion } from 'framer-motion';
import MonthlyAuraCard from './MonthlyAuraCard';

// Aura configuration based on thresholds
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

// Helper function to determine current aura
function getCurrentAura(daysPracticed, consecutiveDays) {
  // Find the highest aura where both thresholds are met
  let currentAura = AURA_CONFIG[0]; // Default to New Moon
  
  for (const aura of AURA_CONFIG) {
    if (daysPracticed >= aura.minDays && consecutiveDays >= aura.minStreak) {
      currentAura = aura;
    } else {
      break; // Since they're ordered, we can break here
    }
  }
  
  return currentAura;
}

// Mock user scenarios
const MOCK_SCENARIOS = [
  {
    id: 'new-user',
    name: 'New User',
    daysPracticedThisMonth: 1,
    consecutiveDaysThisMonth: 1
  },
  {
    id: 'early-engagement',
    name: 'Early Engagement',
    daysPracticedThisMonth: 4,
    consecutiveDaysThisMonth: 2
  },
  {
    id: 'mid-month',
    name: 'Mid-Month Consistent',
    daysPracticedThisMonth: 8,
    consecutiveDaysThisMonth: 5
  },
  {
    id: 'deep-commitment',
    name: 'Deep Commitment',
    daysPracticedThisMonth: 15,
    consecutiveDaysThisMonth: 10
  },
  {
    id: 'near-zen',
    name: 'Near Zen',
    daysPracticedThisMonth: 28,
    consecutiveDaysThisMonth: 21
  }
];

export default function AuraDemoPage() {
  const [selectedScenario, setSelectedScenario] = useState(MOCK_SCENARIOS[0]);
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const currentAura = getCurrentAura(
    selectedScenario.daysPracticedThisMonth,
    selectedScenario.consecutiveDaysThisMonth
  );

  return (
    <div className="min-h-screen bg-[#fcf8f2] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-[rgba(252,248,242,0.98)] to-transparent backdrop-blur-md pb-4 pt-4" style={{ paddingTop: 'calc(env(safe-area-inset-top,24px) + 1rem)' }}>
        <div className="max-w-2xl mx-auto px-4 md:px-5">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-hanken text-2xl md:text-3xl font-semibold text-[#1e2d2e]">
              Moon Phase Aura
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

          {/* Scenario Selector */}
          <div className="flex flex-wrap gap-2">
            {MOCK_SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario)}
                className={`px-4 py-2 rounded-full font-hanken text-sm transition-all ${
                  selectedScenario.id === scenario.id
                    ? 'bg-[#1e2d2e] text-white'
                    : 'bg-white/70 text-[#1e2d2e] border border-[#1e2d2e]/20 hover:bg-white/90'
                }`}
              >
                {scenario.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 md:px-5 pb-20 pt-6">
        <MonthlyAuraCard
          monthName={currentMonth}
          daysPracticedThisMonth={selectedScenario.daysPracticedThisMonth}
          consecutiveDaysThisMonth={selectedScenario.consecutiveDaysThisMonth}
          aura={currentAura}
        />

        {/* All Auras Preview (Optional) */}
        <div className="mt-12">
          <h3 className="font-hanken text-lg font-semibold text-[#1e2d2e] mb-4 text-center">
            All Aura Phases
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {AURA_CONFIG.map((aura, index) => {
              const isUnlocked = 
                selectedScenario.daysPracticedThisMonth >= aura.minDays &&
                selectedScenario.consecutiveDaysThisMonth >= aura.minStreak;
              
              return (
                <motion.div
                  key={aura.phaseName}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white/50 backdrop-blur-sm rounded-xl p-4 text-center ${
                    isUnlocked ? 'ring-2 ring-[#94D1C4]' : 'opacity-60'
                  }`}
                >
                  <div className="font-hanken text-xs text-[#1e2d2e]/60 mb-2">
                    {aura.phaseName}
                  </div>
                  <div className="font-hanken text-sm font-medium text-[#1e2d2e]">
                    {aura.label}
                  </div>
                  {!isUnlocked && (
                    <div className="font-hanken text-xs text-[#1e2d2e]/40 mt-1">
                      {aura.minDays} days, {aura.minStreak} streak
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


