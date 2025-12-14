import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getWeeklyStats } from '../utils/weeklyTracking';
import { getCurrentVibe, getVibeById, getAllVibes, calculateCurrentVibe, getWeeklyMinutes } from '../utils/vibeSystem';
import { getCurrentStreak } from '../utils/sessionTracking';
import { loadSessions } from '../utils/sessionTracking';
import { gradientStyle } from '../styles/gradients';

// Get week start (Monday) for a given date
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Get day vibe for a specific day
function getDayVibe(dayDate, sessions) {
  const dayStart = new Date(dayDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayDate);
  dayEnd.setHours(23, 59, 59, 999);
  
  // Filter sessions for this day
  const daySessions = sessions.filter(session => {
    const sessionDate = new Date(session.timestamp);
    return sessionDate >= dayStart && sessionDate <= dayEnd;
  });
  
  if (daySessions.length === 0) {
    return null; // No practice this day
  }
  
  // Calculate minutes for this day
  const totalSeconds = daySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const totalMinutes = Math.floor(totalSeconds / 60);
  
  // For daily vibe, we use a simplified calculation
  // A single day of practice typically maps to lower vibes
  return calculateCurrentVibe(totalMinutes, 1, 1); // 1 day, 1 day streak
}

export default function WeeklySummaryScreen({ onBack, onClose }) {
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [currentVibe, setCurrentVibe] = useState(null);
  const [dayVibes, setDayVibes] = useState([]);
  
  useEffect(() => {
    const stats = getWeeklyStats();
    const streak = getCurrentStreak();
    const minutes = getWeeklyMinutes();
    const sessions = loadSessions();
    
    // Calculate current vibe
    const vibe = calculateCurrentVibe(minutes, stats.daysThisWeek, streak);
    
    setWeeklyStats(stats);
    setCurrentVibe({
      vibe,
      totalMinutes: minutes,
      daysPracticed: stats.daysThisWeek,
      streak
    });
    
    // Calculate day vibes for the week
    const weekStart = getWeekStart(new Date());
    const dayVibesArray = [];
    
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + i);
      const dayVibe = getDayVibe(dayDate, sessions);
      dayVibesArray.push({
        date: dayDate,
        vibe: dayVibe,
        dayName: dayDate.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    
    setDayVibes(dayVibesArray);
  }, []);
  
  if (!currentVibe || !weeklyStats) {
    return null; // Loading
  }
  
  const weeklyTotals = `${currentVibe.totalMinutes} mindful minutes • ${currentVibe.daysPracticed} days • ${currentVibe.streak}-day streak`;
  
  return (
    <div 
      className="fixed inset-0 w-full h-full overflow-y-auto flex flex-col items-center px-8 py-12 z-50"
      style={gradientStyle('slowMorning')}
    >
      <div className="w-full max-w-md text-center flex-1 flex flex-col justify-center">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="font-actay font-bold text-[#1e2d2e] text-2xl md:text-3xl mb-2">
            Your vibe this week:
          </h1>
          <div className="flex items-center justify-center gap-3">
            <span className="text-5xl md:text-6xl">{currentVibe.vibe.emoji}</span>
            <h2 className="font-actay font-bold text-[#1e2d2e] text-2xl md:text-3xl">
              {currentVibe.vibe.name}
            </h2>
          </div>
        </motion.div>
        
        {/* Weekly Totals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-hanken text-[#1e2d2e]/70 text-base md:text-lg mb-6"
        >
          {weeklyTotals}
        </motion.div>
        
        {/* Benefit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/60 backdrop-blur-sm rounded-xl p-6 mb-6"
        >
          <p className="font-hanken text-[#1e2d2e] text-lg md:text-xl font-semibold mb-2">
            {currentVibe.vibe.benefit}
          </p>
          <p className="font-hanken text-[#1e2d2e]/80 text-sm md:text-base leading-relaxed">
            {currentVibe.vibe.microcopy}
          </p>
        </motion.div>
        
        {/* Mini Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/60 backdrop-blur-sm rounded-xl p-6 mb-6"
        >
          <h3 className="font-hanken font-semibold text-[#1e2d2e] text-sm uppercase mb-4">
            This Week
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {dayVibes.map((day, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="font-hanken text-[#1e2d2e]/60 text-xs mb-1">
                  {day.dayName}
                </div>
                {day.vibe ? (
                  <div className="text-2xl">{day.vibe.emoji}</div>
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-[#1e2d2e]/20" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Encouragement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <p className="font-hanken text-[#1e2d2e] text-base md:text-lg leading-relaxed">
            You showed up for yourself with consistency and care.
          </p>
        </motion.div>
        
        {/* Close Button */}
        <motion.button
          onClick={onClose || onBack}
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          className="w-full h-14 rounded-full bg-[#1e2d2e]/90 backdrop-blur-sm text-white font-hanken font-semibold text-base"
          style={{ boxShadow: '0 4px 16px rgba(30, 45, 46, 0.25)' }}
        >
          Close
        </motion.button>
      </div>
    </div>
  );
}

