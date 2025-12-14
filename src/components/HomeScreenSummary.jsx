import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getWeeklyStats, practicedToday } from '../utils/weeklyTracking';
import { getCurrentVibe, calculateCurrentVibe, getWeeklyMinutes } from '../utils/vibeSystem';
import { getCurrentStreak } from '../utils/sessionTracking';

export default function HomeScreenSummary({ variant = 'default', onVibeClick }) {
  const handleVibeClick = () => {
    if (onVibeClick) {
      onVibeClick();
    }
  };
  // Initialize with default values to prevent null return
  const [weeklyStats, setWeeklyStats] = useState(() => getWeeklyStats());
  const [currentVibe, setCurrentVibe] = useState(null);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);

  useEffect(() => {
    const stats = getWeeklyStats();
    const minutes = getWeeklyMinutes();
    const streak = getCurrentStreak();
    
    // Calculate vibe based on weekly stats
    const vibeData = getCurrentVibe();
    // Override with actual minutes
    const vibe = calculateCurrentVibe(minutes, stats.daysThisWeek, streak);
    
    setWeeklyStats(stats);
    setWeeklyMinutes(minutes);
    setCurrentVibe({
      ...vibeData,
      vibe,
      totalMinutes: minutes
    });
  }, []);

  if (!currentVibe) {
    // Loading state - show placeholder instead of null
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full bg-[#fcf8f2]/80 backdrop-blur-sm border-b border-[#1e2d2e]/10 py-3 md:py-4"
      >
        <div className="w-full flex items-center pl-20 md:pl-24 pr-12 md:pr-6 relative gap-2 md:gap-6">
          <div className="flex-shrink-0 flex items-center">
            <p className="font-hanken text-[#1e2d2e]/60 text-[9px] md:text-xs uppercase tracking-wider leading-tight text-center whitespace-nowrap">
              YOUR VIBE
              <br />
              THIS WEEK
            </p>
          </div>
          <div className="flex-1 min-w-0 flex flex-col items-start pr-1">
            <p className="font-hanken text-[#1e2d2e]/40 text-sm md:text-lg font-bold mb-0.5 md:mb-1">
              Loading...
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  const daysText = weeklyStats.daysThisWeek === 0 
    ? "0/7 days of shared presence" 
    : `${weeklyStats.daysThisWeek}/7 days of shared presence`;
  
  const minutesText = weeklyMinutes > 0 
    ? `${weeklyMinutes} mindful minutes`
    : '';

  // Check URL parameter for variant override (for testing)
  const urlVariant = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('headerVariant')
    : null;
  const activeVariant = urlVariant || variant;

  // Variation 1: Default (current design with backdrop blur)
  if (activeVariant === 'default' || activeVariant === '1') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full bg-[#fcf8f2]/80 backdrop-blur-sm border-b border-[#1e2d2e]/10 py-3 md:py-4"
      >
        <div className="w-full flex items-center pl-20 md:pl-24 pr-12 md:pr-6 relative gap-2 md:gap-6">
          {/* Section 1: YOUR VIBE THIS WEEK - takes only needed space */}
          <div className="flex-shrink-0 flex items-center">
            <p className="font-hanken text-[#1e2d2e]/60 text-[9px] md:text-xs uppercase tracking-wider leading-tight text-center whitespace-nowrap">
              YOUR VIBE
              <br />
              THIS WEEK
            </p>
          </div>

          {/* Section 2: Emoji - takes only needed space */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <div className="w-12 h-12 md:w-16 md:h-16 relative overflow-hidden flex items-center justify-center text-2xl md:text-4xl">
              {currentVibe.vibe.emoji}
            </div>
          </div>

          {/* Section 3: Stats and vibe info - grows to fill remaining space */}
          <div className="flex-1 min-w-0 flex flex-col items-start pr-1">
            <p className="font-hanken text-[#1e2d2e] text-sm md:text-lg font-bold mb-0.5 md:mb-1 truncate w-full">
              {currentVibe.vibe.name}
            </p>
            <p className="font-hanken text-[#1e2d2e]/60 text-[10px] md:text-sm mb-0.5 md:mb-1 truncate w-full">
              {daysText}
              {minutesText && ` • ${minutesText}`}
            </p>
            <p className="font-hanken text-[#1e2d2e]/70 text-[10px] md:text-sm leading-tight md:leading-relaxed overflow-hidden max-h-[2.4em] md:max-h-none">
              {currentVibe.vibe.microcopy}
            </p>
          </div>

          {/* Section 4: Read more button - bottom right corner, left-aligned text (keep as is) */}
          <div className="absolute bottom-1 md:bottom-3 right-2 md:right-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleVibeClick();
              }}
              className="font-hanken text-[#1e2d2e]/70 text-xs underline hover:text-[#1e2d2e] transition-colors text-left"
            >
              Read<br />more →
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Variation 2: No header, white background
  if (activeVariant === 'white' || activeVariant === '2') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full bg-[#fcf8f2] py-3 md:py-4"
      >
        <div className="w-full flex items-center pl-20 md:pl-24 pr-12 md:pr-6 relative gap-2 md:gap-6">
          {/* Section 1: YOUR VIBE THIS WEEK - takes only needed space */}
          <div className="flex-shrink-0 flex items-center">
            <p className="font-hanken text-[#1e2d2e]/60 text-[9px] md:text-xs uppercase tracking-wider leading-tight text-center whitespace-nowrap">
              YOUR VIBE
              <br />
              THIS WEEK
            </p>
          </div>

          {/* Section 2: Emoji - takes only needed space */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <div className="w-12 h-12 md:w-16 md:h-16 relative overflow-hidden flex items-center justify-center text-2xl md:text-4xl">
              {currentVibe.vibe.emoji}
            </div>
          </div>

          {/* Section 3: Stats and vibe info - grows to fill remaining space */}
          <div className="flex-1 min-w-0 flex flex-col items-start pr-1">
            <p className="font-hanken text-[#1e2d2e] text-sm md:text-lg font-bold mb-0.5 md:mb-1 truncate w-full">
              {currentVibe.vibe.name}
            </p>
            <p className="font-hanken text-[#1e2d2e]/60 text-[10px] md:text-sm mb-0.5 md:mb-1 truncate w-full">
              {daysText}
              {minutesText && ` • ${minutesText}`}
            </p>
            <p className="font-hanken text-[#1e2d2e]/70 text-[10px] md:text-sm leading-tight md:leading-relaxed overflow-hidden max-h-[2.4em] md:max-h-none">
              {currentVibe.vibe.microcopy}
            </p>
          </div>

          {/* Section 4: Read more button - bottom right corner, left-aligned text (keep as is) */}
          <div className="absolute bottom-1 md:bottom-3 right-2 md:right-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleVibeClick();
              }}
              className="font-hanken text-[#1e2d2e]/70 text-xs underline hover:text-[#1e2d2e] transition-colors text-left"
            >
              Read<br />more →
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Variation 3: Legacy aura variant (kept for backwards compatibility)
  if (activeVariant === 'aura' || activeVariant === '3') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full bg-[#fcf8f2]/80 backdrop-blur-sm border-b border-[#1e2d2e]/10 py-3 md:py-4"
      >
        <div className="w-full flex items-center pl-20 md:pl-24 pr-12 md:pr-6 relative gap-2 md:gap-6">
          {/* Section 1: YOUR VIBE THIS WEEK - takes only needed space */}
          <div className="flex-shrink-0 flex items-center">
            <p className="font-hanken text-[#1e2d2e]/60 text-[9px] md:text-xs uppercase tracking-wider leading-tight text-center whitespace-nowrap">
              YOUR VIBE
              <br />
              THIS WEEK
            </p>
          </div>

          {/* Section 2: Emoji - takes only needed space */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <div className="w-12 h-12 md:w-16 md:h-16 relative overflow-hidden flex items-center justify-center text-2xl md:text-4xl">
              {currentVibe.vibe.emoji}
            </div>
          </div>

          {/* Section 3: Stats and vibe info - grows to fill remaining space */}
          <div className="flex-1 min-w-0 flex flex-col items-start pr-1">
            <p className="font-hanken text-[#1e2d2e] text-sm md:text-lg font-bold mb-0.5 md:mb-1 truncate w-full">
              {currentVibe.vibe.name}
            </p>
            <p className="font-hanken text-[#1e2d2e]/60 text-[10px] md:text-sm mb-0.5 md:mb-1 truncate w-full">
              {daysText}
              {minutesText && ` • ${minutesText}`}
            </p>
            <p className="font-hanken text-[#1e2d2e]/70 text-[10px] md:text-sm leading-tight md:leading-relaxed overflow-hidden max-h-[2.4em] md:max-h-none">
              {currentVibe.vibe.microcopy}
            </p>
          </div>

          {/* Section 4: Read more button - bottom right corner, left-aligned text (keep as is) */}
          <div className="absolute bottom-1 md:bottom-3 right-2 md:right-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleVibeClick();
              }}
              className="font-hanken text-[#1e2d2e]/70 text-xs underline hover:text-[#1e2d2e] transition-colors text-left"
            >
              Read<br />more →
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Fallback to default
  return null;
}

