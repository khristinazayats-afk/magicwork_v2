import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import PracticeHistory from './PracticeHistory';
import { getCurrentStreak, getFavoriteSpace, getSpacesTriedCount, getTotalPracticeCount, getTotalPracticeTime } from '../utils/sessionTracking';
import { checkAndUnlockAchievements } from '../utils/achievements';
import { getCurrentTierInfo, recordPracticeSession } from '../utils/monthlyTiers';
import { recordWeeklyPractice, getWeeklyStats } from '../utils/weeklyTracking';
import { getCurrentVibe, calculateCurrentVibe, getWeeklyMinutes, getAllVibes } from '../utils/vibeSystem';

// Evidence-based feedback messages
const EVIDENCE_FEEDBACK = [
  "Your nervous system noticed this pause.",
  "Your cortisol softened a little.",
  "You practiced self-kindness, even if life is busy.",
  "Small pauses like this add up to a steadier you.",
  "You slowed down — this is how long-term change begins.",
  "Just by being here, you're helping others feel less alone."
];

// Get a random evidence-based feedback message
function getRandomFeedback() {
  return EVIDENCE_FEEDBACK[Math.floor(Math.random() * EVIDENCE_FEEDBACK.length)];
}

export default function ResultsScreen({ 
  spaceName, 
  duration, 
  heartsSent, 
  mode,
  gradientStyle,
  onDone,
  onPracticeAgain 
}) {
  const [showHistory, setShowHistory] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [showAchievements, setShowAchievements] = useState(false);
  const [tierInfo, setTierInfo] = useState(null);
  const [currentVibe, setCurrentVibe] = useState(null);
  const [showBenefitDetails, setShowBenefitDetails] = useState(false);
  const [showAllBadges, setShowAllBadges] = useState(false);
  
  // Stats
  const totalTime = getTotalPracticeTime();
  const totalPractices = getTotalPracticeCount();
  const streak = getCurrentStreak();
  const favoriteSpace = getFavoriteSpace();
  const spacesTried = getSpacesTriedCount();
  
  // Record practice session and get vibe info
  useEffect(() => {
    const minutesPracticed = Math.max(1, Math.floor(duration / 60));
    const result = recordPracticeSession(minutesPracticed);
    recordWeeklyPractice(); // Also record for weekly tracking
    const updatedTierInfo = getCurrentTierInfo();
    setTierInfo(updatedTierInfo);
    
    // Calculate current vibe
    const weeklyStats = getWeeklyStats();
    const weeklyMinutes = getWeeklyMinutes();
    const vibe = calculateCurrentVibe(weeklyMinutes, weeklyStats.daysThisWeek, streak);
    const vibeData = getCurrentVibe();
    
    setCurrentVibe({
      ...vibeData,
      vibe
    });
  }, [duration, streak]);
  
  // Format duration
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const durationDisplay = minutes > 0 
    ? `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
    : `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
  
  // Check for newly unlocked achievements
  useEffect(() => {
    const newlyUnlocked = checkAndUnlockAchievements();
    if (newlyUnlocked.length > 0) {
      setUnlockedAchievements(newlyUnlocked);
      setShowAchievements(true);
    }
  }, []);
  
  // Calculate streak display
  const streakDisplay = streak > 0 ? `${streak} day${streak === 1 ? '' : 's'}` : 'Start a streak!';
  
  if (showHistory) {
    return <PracticeHistory onBack={() => setShowHistory(false)} />;
  }
  
  return (
    <div 
      className="fixed inset-0 w-full h-full overflow-y-auto flex flex-col items-center px-8 py-12 z-50"
      style={gradientStyle}
    >
      {/* Achievements Popup */}
      <AnimatePresence>
        {showAchievements && unlockedAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
            onClick={() => setShowAchievements(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#fcf8f2] rounded-2xl p-8 max-w-sm mx-4 shadow-2xl"
            >
              <h3 className="font-actay font-bold text-[#1e2d2e] text-xl mb-4 text-center">
                Achievement Unlocked!
              </h3>
              <div className="space-y-3">
                {unlockedAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 p-3 bg-[#1e2d2e]/5 rounded-lg"
                  >
                    <span className="text-3xl">{achievement.icon}</span>
                    <div>
                      <div className="font-hanken font-bold text-[#1e2d2e]">
                        {achievement.name}
                      </div>
                      <div className="font-hanken text-sm text-[#1e2d2e]/70">
                        {achievement.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <motion.button
                onClick={() => setShowAchievements(false)}
                whileTap={{ scale: 0.96 }}
                className="w-full mt-6 h-12 rounded-full bg-[#1e2d2e]/90 text-white font-hanken font-semibold"
              >
                Continue
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <div className="w-full max-w-md text-center flex-1 flex flex-col justify-center">
        {/* Practice Details */}
        <motion.div
          className="space-y-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {/* Large block with vibe recognition */}
          <div className="bg-[#1e2d2e]/10 backdrop-blur-sm rounded-xl p-6 md:p-8 flex flex-col items-center w-full">
            {/* Beautiful! - Title inside the box */}
            <motion.h2 
              className="font-actay font-bold text-[#1e2d2e] text-[28px] md:text-[32px] mb-6 flex-shrink-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Beautiful!
            </motion.h2>
            
            {/* Vibe Recognition Section */}
            {currentVibe && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col items-center mb-6 w-full"
              >
                {/* Line 1: "You are vibing today as" */}
                <p className="font-hanken text-[#1e2d2e] text-sm md:text-base mb-3 text-center">
                  You are vibing today as
                </p>
                
                {/* Line 2: Badge (emoji) + vibe name */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl md:text-5xl">{currentVibe.vibe.emoji}</span>
                  <p className="font-hanken font-bold text-[#1e2d2e] text-xl md:text-2xl">
                    {currentVibe.vibe.name}
                  </p>
                </div>
                
                {/* Community Line */}
                <p className="font-hanken text-[#1e2d2e]/70 text-xs md:text-sm mb-4 text-center flex items-center justify-center gap-2">
                  <span className="relative flex h-1.5 w-1.5">
                    {/* Multiple pulsing rings for microparticle effect */}
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E52431]/40" style={{ animationDuration: '2.5s' }}></span>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E52431]/25" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}></span>
                    {/* Solid pulsing center */}
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#E52431]/80" style={{ animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></span>
                  </span>
                  {currentVibe.communityCount} humans are vibing this energy today.
                </p>
                
                {/* Nervous-System Benefit */}
                <p className="font-hanken text-[#1e2d2e] text-sm md:text-base mb-4 text-center leading-relaxed">
                  {currentVibe.vibe.benefit}
                </p>
                
                {/* Expandable Benefit Details - wrapped in same background */}
                <div className="w-full">
                  <AnimatePresence initial={false}>
                    {showBenefitDetails && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                        className="w-full"
                      >
                        <div className="mt-4 space-y-3 text-left pt-2">
                          <p className="font-hanken text-[#1e2d2e]/80 text-sm leading-relaxed">
                            Your {Math.floor(duration / 60)} minutes of practice today helped reduce cortisol levels and activated your parasympathetic nervous system—the part responsible for rest, digestion, and recovery. This gentle pause signals to your body that you're safe, allowing your stress response to soften.
                          </p>
                          <p className="font-hanken text-[#1e2d2e]/80 text-sm leading-relaxed">
                            Research shows that even brief moments of mindfulness can shift your nervous system from fight-or-flight mode toward a more regulated state. Each session builds your capacity to return to calm more easily, creating lasting changes in how your body responds to stress.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Toggle button for benefit details */}
                <button
                  onClick={() => setShowBenefitDetails(!showBenefitDetails)}
                  className="mt-4 font-hanken text-[#1e2d2e]/60 text-xs underline flex-shrink-0"
                >
                  {showBenefitDetails ? 'Show less' : 'Learn more about this benefit'}
                </button>
              </motion.div>
            )}
            
            {/* Practice Stats */}
            <div className="font-hanken text-[#1e2d2e]/70 text-xs md:text-sm mb-3 text-center flex-shrink-0 space-y-1 mt-auto">
              <div>{Math.floor(duration / 60)} mindful minutes</div>
              {streak > 0 && (
                <div>{streak} day{streak === 1 ? '' : 's'} streak</div>
              )}
            </div>
          </div>
          
          {/* Your Journey */}
          <div className="bg-[#1e2d2e]/10 backdrop-blur-sm rounded-xl p-4">
            <div className="font-hanken font-semibold text-[#1e2d2e] text-sm uppercase mb-2">
              Your Journey
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="font-hanken text-[#1e2d2e]/70">Total Practices</div>
                <div className="font-hanken font-bold text-[#1e2d2e] text-lg">{totalPractices}</div>
              </div>
              <div>
                <div className="font-hanken text-[#1e2d2e]/70">Total Time</div>
                <div className="font-hanken font-bold text-[#1e2d2e] text-lg">
                  {Math.floor(totalTime / 60)}m
                </div>
              </div>
              <div>
                <div className="font-hanken text-[#1e2d2e]/70">Day Streak</div>
                <div className="font-hanken font-bold text-[#1e2d2e] text-lg">
                  {streak > 0 ? `🔥 ${streak}` : '—'}
                </div>
              </div>
              <div>
                <div className="font-hanken text-[#1e2d2e]/70">Spaces Tried</div>
                <div className="font-hanken font-bold text-[#1e2d2e] text-lg">
                  {spacesTried}/9
                </div>
              </div>
            </div>
            {favoriteSpace && (
              <div className="mt-3 pt-3 border-t border-[#1e2d2e]/10">
                <div className="font-hanken text-[#1e2d2e]/70 text-xs">Favorite Space</div>
                <div className="font-hanken font-semibold text-[#1e2d2e]">{favoriteSpace}</div>
              </div>
            )}
          </div>

          {/* All Animal Badges */}
          <div className="bg-[#1e2d2e]/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-hanken font-semibold text-[#1e2d2e] text-sm uppercase">
                All Vibe Badges
              </div>
              <button
                onClick={() => setShowAllBadges(!showAllBadges)}
                className="font-hanken text-[#1e2d2e]/70 text-xs underline"
              >
                {showAllBadges ? 'Hide' : 'Show all'}
              </button>
            </div>
            
            <AnimatePresence>
              {showAllBadges && (
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
                    const isCurrentVibe = currentVibe && currentVibe.vibe.id === vibe.id;
                    
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
          </div>
        </motion.div>
        
        {/* Buttons */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            onClick={() => {
              const text = `I'm vibing as ${currentVibe.vibe.name} today on Magiwork ✨ Join me in stillness!`;
              if (navigator.share) {
                navigator.share({ title: 'Magiwork Vibe', text, url: window.location.origin });
              } else {
                navigator.clipboard.writeText(text);
                alert('Vibe copied to clipboard! 📋');
              }
            }}
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            className="w-full h-14 rounded-full bg-[#E52431] text-white font-hanken font-bold text-base shadow-lg shadow-[#E52431]/20"
          >
            Share Your Vibe ✨
          </motion.button>

          <motion.button
            onClick={() => setShowHistory(true)}
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            className="w-full h-12 rounded-full bg-[#1e2d2e]/10 backdrop-blur-sm text-[#1e2d2e] font-hanken font-medium text-sm border border-[#1e2d2e]/15"
          >
            View History →
          </motion.button>
          {onPracticeAgain && (
            <motion.button
              onClick={onPracticeAgain}
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              className="w-full h-14 rounded-full bg-[#1e2d2e]/15 backdrop-blur-sm text-[#1e2d2e] font-hanken font-semibold text-base border border-[#1e2d2e]/20"
            >
              Practice Again
            </motion.button>
          )}
          <motion.button
            onClick={onDone}
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            className="w-full h-14 rounded-full bg-[#1e2d2e]/90 backdrop-blur-sm text-white font-hanken font-semibold text-base"
            style={{ boxShadow: '0 4px 16px rgba(30, 45, 46, 0.25)' }}
          >
            Done
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
