import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  loadSessions, 
  getTotalPracticeTime, 
  getTotalPracticeCount, 
  getCurrentStreak, 
  getFavoriteSpace, 
  getSpacesTriedCount 
} from '../utils/sessionTracking';
import { gradientStyle } from '../styles/gradients';

// Space names in order
const ALL_SPACES = [
  'Slow Morning',
  'Gentle De-Stress',
  'Take a Walk',
  'Draw Your Feels',
  'Move and Cool',
  'Tap to Ground',
  'Breathe to Relax',
  'Get in the Flow State',
  'Drift into Sleep'
];

export default function PracticeHistory({ onBack }) {
  const [selectedSpace, setSelectedSpace] = useState('all');
  const sessions = loadSessions();
  
  // Calculate stats
  const totalTime = getTotalPracticeTime();
  const totalPractices = getTotalPracticeCount();
  const streak = getCurrentStreak();
  const favoriteSpace = getFavoriteSpace();
  const spacesTried = getSpacesTriedCount();
  
  // Filter sessions
  const filteredSessions = useMemo(() => {
    if (selectedSpace === 'all') return sessions;
    return sessions.filter(s => s.spaceName === selectedSpace);
  }, [sessions, selectedSpace]);
  
  // Sort by most recent first
  const sortedSessions = useMemo(() => {
    return [...filteredSessions].sort((a, b) => b.timestamp - a.timestamp);
  }, [filteredSessions]);
  
  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / 86400000);
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  };
  
  // Format duration
  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) return `${minutes}m`;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  return (
    <div 
      className="h-screen w-full relative overflow-hidden bg-[#fcf8f2]"
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
          <h1 className="font-actay font-bold text-[#1e2d2e] text-[20px]">Your Journey</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>
      
      {/* Content */}
      <div className="h-screen overflow-y-auto scroll-smooth pt-24 pb-8 px-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 backdrop-blur-sm rounded-xl p-4"
          >
            <div className="font-hanken text-[#1e2d2e]/70 text-xs mb-1">Total Practices</div>
            <div className="font-hanken font-bold text-[#1e2d2e] text-2xl">{totalPractices}</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/60 backdrop-blur-sm rounded-xl p-4"
          >
            <div className="font-hanken text-[#1e2d2e]/70 text-xs mb-1">Total Time</div>
            <div className="font-hanken font-bold text-[#1e2d2e] text-2xl">
              {Math.floor(totalTime / 60)}m
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/60 backdrop-blur-sm rounded-xl p-4"
          >
            <div className="font-hanken text-[#1e2d2e]/70 text-xs mb-1">Day Streak</div>
            <div className="font-hanken font-bold text-[#1e2d2e] text-2xl">
              {streak > 0 ? `🔥 ${streak}` : '—'}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/60 backdrop-blur-sm rounded-xl p-4"
          >
            <div className="font-hanken text-[#1e2d2e]/70 text-xs mb-1">Spaces Tried</div>
            <div className="font-hanken font-bold text-[#1e2d2e] text-2xl">{spacesTried}/9</div>
          </motion.div>
        </div>
        
        {favoriteSpace && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-6"
          >
            <div className="font-hanken text-[#1e2d2e]/70 text-xs mb-1">Favorite Space</div>
            <div className="font-hanken font-semibold text-[#1e2d2e]">{favoriteSpace}</div>
          </motion.div>
        )}
        
        {/* Filter */}
        <div className="mb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedSpace('all')}
              className={`px-4 py-2 rounded-full font-hanken text-sm whitespace-nowrap transition-colors ${
                selectedSpace === 'all'
                  ? 'bg-[#1e2d2e]/90 text-white'
                  : 'bg-white/60 text-[#1e2d2e]'
              }`}
            >
              All
            </button>
            {ALL_SPACES.map(space => (
              <button
                key={space}
                onClick={() => setSelectedSpace(space)}
                className={`px-4 py-2 rounded-full font-hanken text-sm whitespace-nowrap transition-colors ${
                  selectedSpace === space
                    ? 'bg-[#1e2d2e]/90 text-white'
                    : 'bg-white/60 text-[#1e2d2e]'
                }`}
              >
                {space}
              </button>
            ))}
          </div>
        </div>
        
        {/* Sessions List */}
        {sortedSessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="font-hanken text-[#1e2d2e]/60 text-base">
              {selectedSpace === 'all' 
                ? 'No practices yet. Start your first practice!'
                : `No practices in "${selectedSpace}" yet.`
              }
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {sortedSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/60 backdrop-blur-sm rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-hanken font-semibold text-[#1e2d2e] text-base mb-1">
                      {session.spaceName}
                    </div>
                    <div className="font-hanken text-[#1e2d2e]/60 text-xs">
                      {formatDate(session.timestamp)} • {session.mode === 'guided' ? 'Guided' : 'Ambient'}
                    </div>
                  </div>
                  <div className="font-hanken font-semibold text-[#1e2d2e]">
                    {formatDuration(session.duration)}
                  </div>
                </div>
                {session.mode === 'ambient' && session.heartsSent > 0 && (
                  <div className="font-hanken text-[#1e2d2e]/60 text-xs">
                    💗 {session.heartsSent} hearts sent
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

