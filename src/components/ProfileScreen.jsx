import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadSessions } from '../utils/sessionTracking';
import { getWeeklyStats, getCurrentWeekKey } from '../utils/weeklyTracking';
import { calculateCurrentVibe, getVibeById, getAllVibes, getWeeklyMinutes } from '../utils/vibeSystem';
import { getCurrentStreak } from '../utils/sessionTracking';
import { gradientStyle } from '../styles/gradients';

// Helper to get week start date from week key
function getWeekStartFromKey(weekKey) {
  const [year, month, day] = weekKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Helper to format month name
function formatMonth(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Get all weeks with practice data
function getAllWeeksWithData() {
  const sessions = loadSessions();
  const weeksMap = new Map();
  
  sessions.forEach(session => {
    const sessionDate = new Date(session.timestamp);
    const weekStart = getWeekStart(sessionDate);
    const weekKey = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
    
    if (!weeksMap.has(weekKey)) {
      weeksMap.set(weekKey, {
        weekKey,
        sessions: [],
        startDate: weekStart
      });
    }
    
    weeksMap.get(weekKey).sessions.push(session);
  });
  
  return Array.from(weeksMap.values()).sort((a, b) => b.startDate - a.startDate);
}

// Get week start (Monday) for a given date
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Group weeks by month
function groupWeeksByMonth(weeks) {
  const monthsMap = new Map();
  
  weeks.forEach(week => {
    const monthKey = `${week.startDate.getFullYear()}-${week.startDate.getMonth()}`;
    
    if (!monthsMap.has(monthKey)) {
      monthsMap.set(monthKey, {
        month: week.startDate,
        weeks: []
      });
    }
    
    monthsMap.get(monthKey).weeks.push(week);
  });
  
  return Array.from(monthsMap.values()).sort((a, b) => b.month - a.month);
}

// Calculate vibe for a week
function calculateWeekVibe(weekSessions, weekStart) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  // Get unique practice days
  const practiceDays = new Set();
  weekSessions.forEach(session => {
    const sessionDate = new Date(session.timestamp);
    if (sessionDate >= weekStart && sessionDate <= weekEnd) {
      practiceDays.add(sessionDate.toDateString());
    }
  });
  
  // Calculate total minutes
  const totalSeconds = weekSessions.reduce((sum, session) => {
    const sessionDate = new Date(session.timestamp);
    if (sessionDate >= weekStart && sessionDate <= weekEnd) {
      return sum + (session.duration || 0);
    }
    return sum;
  }, 0);
  const totalMinutes = Math.floor(totalSeconds / 60);
  
  // Calculate streak (simplified - would need more complex logic for historical weeks)
  const daysPracticed = practiceDays.size;
  
  // Use a simple streak estimate based on consecutive days in the week
  let streak = 0;
  const sortedDays = Array.from(practiceDays).sort();
  for (let i = 0; i < sortedDays.length; i++) {
    if (i === 0) {
      streak = 1;
    } else {
      const prevDate = new Date(sortedDays[i - 1]);
      const currDate = new Date(sortedDays[i]);
      const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak++;
      } else {
        streak = 1;
      }
    }
  }
  
  return calculateCurrentVibe(totalMinutes, daysPracticed, streak);
}

export default function ProfileScreen({ onBack }) {
  const [monthlyData, setMonthlyData] = useState([]);
  const [showAllVibes, setShowAllVibes] = useState(false);
  
  useEffect(() => {
    const allWeeks = getAllWeeksWithData();
    const grouped = groupWeeksByMonth(allWeeks);
    
    const monthly = grouped.map(monthGroup => {
      const weeks = monthGroup.weeks.map(week => {
        const vibe = calculateWeekVibe(week.sessions, week.startDate);
        const totalMinutes = Math.floor(
          week.sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60
        );
        const daysPracticed = new Set(
          week.sessions.map(s => new Date(s.timestamp).toDateString())
        ).size;
        
        return {
          ...week,
          vibe,
          totalMinutes,
          daysPracticed
        };
      });
      
      // Calculate monthly totals
      const totalMinutes = weeks.reduce((sum, w) => sum + w.totalMinutes, 0);
      const totalDays = weeks.reduce((sum, w) => sum + w.daysPracticed, 0);
      const avgDaysPerWeek = weeks.length > 0 ? (totalDays / weeks.length).toFixed(1) : 0;
      
      return {
        month: monthGroup.month,
        totalMinutes,
        avgDaysPerWeek: parseFloat(avgDaysPerWeek),
        weeks
      };
    });
    
    setMonthlyData(monthly);
  }, []);
  
  // Get current week info
  const currentWeekStats = getWeeklyStats();
  const currentStreak = getCurrentStreak();
  const currentVibe = useMemo(() => {
    const minutes = getWeeklyMinutes();
    return calculateCurrentVibe(minutes, currentWeekStats.daysThisWeek, currentStreak);
  }, [currentWeekStats, currentStreak]);
  
  return (
    <div 
      className="fixed inset-0 h-screen w-full overflow-hidden bg-[#fcf8f2] z-[60]"
      style={gradientStyle('slowMorning')}
    >
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6 pt-[env(safe-area-inset-top,24px)]">
        <div className="flex items-center justify-between" style={{ marginTop: '8px' }}>
          <button
            type="button"
            onClick={onBack}
            className="p-2 -ml-2"
            aria-label="Back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18l-6-6 6-6" stroke="#1e2d2e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="font-actay font-bold text-[#1e2d2e] text-[20px]">Profile</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>
      
      {/* Content */}
      <div className="h-screen overflow-y-auto pt-24 pb-8 px-6">
        {/* Current Week Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/60 backdrop-blur-sm rounded-xl p-6 mb-6"
        >
          <h2 className="font-actay font-bold text-[#1e2d2e] text-lg mb-4">This Week</h2>
          <div className="flex items-center gap-4 mb-4 ml-8">
            <span className="text-4xl">{currentVibe.emoji}</span>
            <div>
              <p className="font-hanken font-bold text-[#1e2d2e] text-lg">{currentVibe.name}</p>
              <p className="font-hanken text-[#1e2d2e]/70 text-sm">{currentVibe.microcopy}</p>
            </div>
          </div>
          <div className="font-hanken text-[#1e2d2e]/60 text-sm ml-8">
            {currentWeekStats.daysThisWeek}/7 days of shared presence
          </div>
        </motion.div>
        
        {/* Vibes Overview Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/60 backdrop-blur-sm rounded-xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-actay font-bold text-[#1e2d2e] text-lg">Vibes System</h2>
            <button
              onClick={() => setShowAllVibes(!showAllVibes)}
              className="font-hanken text-[#1e2d2e]/70 text-xs underline"
            >
              {showAllVibes ? 'Hide' : 'Show all'}
            </button>
          </div>
          
          <p className="font-hanken text-[#1e2d2e]/70 text-sm mb-4">
            Weekly nervous system states based on your practice
          </p>
          
          <AnimatePresence>
            {showAllVibes && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}
                className="space-y-3 mt-3"
              >
                {getAllVibes().map((vibe, index) => {
                  // Mock weekly counts for each badge
                  const mockWeeklyCounts = {
                    1: 1247,
                    2: 892,
                    3: 456,
                    4: 203,
                    5: 189,
                    6: 156,
                    7: 98,
                    8: 67,
                    9: 45,
                    10: 23
                  };
                  
                  const weeklyCount = mockWeeklyCounts[vibe.id] || 0;
                  const isCurrentVibe = currentVibe && currentVibe.id === vibe.id;
                  
                  return (
                    <motion.div
                      key={vibe.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-3 rounded-lg border ${
                        isCurrentVibe 
                          ? 'bg-[#1e2d2e]/15 border-[#1e2d2e]/30' 
                          : 'bg-[#1e2d2e]/5 border-[#1e2d2e]/10'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Badge Emoji */}
                        <div className="text-3xl flex-shrink-0">
                          {vibe.emoji}
                        </div>
                        
                        {/* Badge Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-hanken font-semibold text-[#1e2d2e] text-sm">
                              {vibe.name}
                            </div>
                            {isCurrentVibe && (
                              <span className="text-xs font-hanken text-[#1e2d2e]/60 bg-[#1e2d2e]/10 px-2 py-0.5 rounded-full">
                                You are here
                              </span>
                            )}
                          </div>
                          
                          {/* Requirements */}
                          <div className="font-hanken text-[#1e2d2e]/70 text-xs mb-2">
                            {vibe.effort}
                          </div>
                          
                          {/* Benefit */}
                          <div className="font-hanken text-[#1e2d2e]/80 text-xs mb-2 italic">
                            {vibe.benefit}
                          </div>
                          
                          {/* Weekly Count */}
                          <div className="font-hanken text-[#1e2d2e]/60 text-xs">
                            {weeklyCount.toLocaleString()} {weeklyCount === 1 ? 'person' : 'people'} vibing this energy this week
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Monthly History */}
        {monthlyData.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="font-hanken text-[#1e2d2e]/60 text-base">
              No practice history yet. Start your first practice!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {monthlyData.map((month, monthIndex) => (
              <motion.div
                key={`${month.month.getFullYear()}-${month.month.getMonth()}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: monthIndex * 0.1 }}
                className="bg-white/60 backdrop-blur-sm rounded-xl p-6"
              >
                {/* Month Header */}
                <h3 className="font-actay font-bold text-[#1e2d2e] text-lg mb-3">
                  {formatMonth(month.month)}
                </h3>
                
                {/* Monthly Totals */}
                <div className="font-hanken text-[#1e2d2e]/70 text-sm mb-4">
                  {month.totalMinutes} minutes • avg {month.avgDaysPerWeek} days/week
                </div>
                
                {/* Weekly Vibes */}
                <div className="space-y-3">
                  {month.weeks.map((week, weekIndex) => {
                    const weekNumber = month.weeks.length - weekIndex;
                    return (
                      <div
                        key={week.weekKey}
                        className="flex items-center gap-3 py-2 border-b border-[#1e2d2e]/10 last:border-0"
                      >
                        <span className="text-2xl">{week.vibe.emoji}</span>
                        <div className="flex-1">
                          <p className="font-hanken font-semibold text-[#1e2d2e]">
                            Week {weekNumber} — {week.vibe.name}
                          </p>
                          <p className="font-hanken text-[#1e2d2e]/60 text-xs">
                            {week.totalMinutes} min • {week.daysPracticed} days
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

