import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getWeeklyStats, practicedToday } from '../utils/weeklyTracking';
import { getCurrentTierInfo } from '../utils/monthlyTiers';
import HypnoticAuraVisual from './HypnoticAuraVisual';

// Warm, validating reflections linked to nervous system regulation
const REFLECTIONS = [
  "Your nervous system is learning to return to calm more easily.",
  "Each pause you take builds your capacity for presence.",
  "Your body remembers these moments of stillness.",
  "Consistency is teaching your system that safety is possible.",
  "You're creating new pathways toward ease.",
  "Your practice is strengthening your resilience.",
  "These moments of pause are reshaping your stress response.",
  "Your nervous system is finding its rhythm again."
];

// Gentle, non-pressuring suggestions
const SUGGESTIONS = [
  { text: "Explore a new space", action: "explore" },
  { text: "Return to your favorite practice", action: "favorite" },
  { text: "Take a few quiet breaths", action: "breathe" },
  { text: "Find a space that matches your energy", action: "match" }
];

// Get a reflection based on weekly practice
function getReflection(daysThisWeek) {
  // Rotate through reflections based on days practiced
  const index = daysThisWeek % REFLECTIONS.length;
  return REFLECTIONS[index];
}

// Get a suggestion based on context
function getSuggestion(daysThisWeek, practicedToday) {
  if (!practicedToday && daysThisWeek === 0) {
    return SUGGESTIONS[0]; // Explore a new space
  } else if (!practicedToday) {
    return SUGGESTIONS[1]; // Return to favorite
  } else {
    return SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)];
  }
}

export default function HomeScreen({ onExplore }) {
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [tierInfo, setTierInfo] = useState(null);
  const [reflection, setReflection] = useState('');
  const [suggestion, setSuggestion] = useState(null);

  useEffect(() => {
    const stats = getWeeklyStats();
    const tier = getCurrentTierInfo();
    const hasPracticedToday = practicedToday();
    
    setWeeklyStats(stats);
    setTierInfo(tier);
    setReflection(getReflection(stats.daysThisWeek));
    setSuggestion(getSuggestion(stats.daysThisWeek, hasPracticedToday));
  }, []);

  // Show loading state instead of null
  if (!weeklyStats || !tierInfo) {
    return (
      <div className="w-full bg-[#fcf8f2] px-6 py-16 flex flex-col items-center justify-center" style={{ minHeight: '100vh' }}>
        <p className="font-hanken text-[#1e2d2e]/60">Loading...</p>
      </div>
    );
  }

  const daysText = weeklyStats.daysThisWeek === 0 
    ? "You haven't practiced this week yet" 
    : weeklyStats.daysThisWeek === 1 
    ? "1 day this week" 
    : `${weeklyStats.daysThisWeek} days this week`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full bg-[#fcf8f2] px-6 py-16 flex flex-col items-center justify-center"
      style={{ minHeight: '100vh' }}
    >
      <div className="w-full max-w-md flex flex-col items-center space-y-10">
        {/* Days practiced this week */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center"
        >
          <p className="font-hanken text-[#1e2d2e]/60 text-sm mb-2">Your weekly rhythm</p>
          <p className="font-hanken text-[#1e2d2e] text-3xl font-semibold">
            {daysText}
          </p>
        </motion.div>

        {/* Current aura state */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center space-y-4"
        >
          <HypnoticAuraVisual
            aura={tierInfo.tier}
            tier={tierInfo.tier}
            sessionsThisMonth={tierInfo.sessionsThisMonth}
            consecutiveDays={tierInfo.consecutiveDays}
            minutesPracticed={1}
          />
          <div className="text-center">
            <p className="font-hanken text-[#1e2d2e] text-lg font-semibold mb-1">
              {tierInfo.tierInfo.headline}
            </p>
            <p className="font-hanken text-[#1e2d2e]/60 text-sm">
              {tierInfo.tierInfo.name}
            </p>
          </div>
        </motion.div>

        {/* One-sentence reflection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-[#1e2d2e]/8"
        >
          <p className="font-hanken text-[#1e2d2e] text-base leading-relaxed text-center">
            {reflection}
          </p>
        </motion.div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full space-y-4"
        >
          <p className="font-hanken text-[#1e2d2e]/60 text-sm text-center">
            What feels right for you now?
          </p>
          {suggestion && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
              onClick={onExplore}
              className="w-full px-6 py-4 rounded-full bg-[#1e2d2e] text-white font-hanken font-semibold text-base shadow-sm"
            >
              {suggestion.text}
            </motion.button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

