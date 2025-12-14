import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gradientStyle } from '../styles/gradients';

const PROMPTS = {
  'Gentle De-Stress': {
    0: "What feels lighter as the week ends?",
    1: "What part of you needs kindness right now?",
    2: "What helped you slow down today?"
  }
};

const MOCK_SHAREOUTS = [
  { name: 'Maya', time: '2 min ago', emoji: '🌿', text: 'Learning to breathe slower' },
  { name: 'Sol', time: '3 min ago', emoji: '🍃', text: 'Letting my body rest' },
  { name: 'River', time: '5 min ago', emoji: '🌸', text: 'Just grateful to be here' }
];

const AVATAR_COLORS = ['#FFE5B4', '#B4E5D4', '#D4B4E5', '#E5D4B4', '#B4D4E5', '#E5B4D4'];

function ShareoutsScreen({ spaceName, onContinue, onClose }) {
  const [shareouts, setShareouts] = useState(MOCK_SHAREOUTS);
  const [inputValue, setInputValue] = useState('');
  const [showToast, setShowToast] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const inputRef = useRef(null);
  const audioElementRef = useRef(null);

  const dayOfWeek = new Date().getDay();
  const todayPrompt = PROMPTS[spaceName]?.[dayOfWeek] || "What's on your heart today?";

  const getAvatarColor = (name) => {
    const index = name.length % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  };

  const handleSubmit = () => {
    if (!inputValue.trim()) return;
    const newShareout = {
      name: 'You',
      time: 'just now',
      emoji: '✨',
      text: inputValue.trim()
    };
    setShareouts(prev => [newShareout, ...prev]);
    setInputValue('');
    setShowToast('shared');
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
    
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Heart-to-space interaction removed

  const skipBackward = () => {
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = Math.max(0, audioElementRef.current.currentTime - 15);
    }
  };

  const skipForward = () => {
    if (audioElementRef.current) {
      audioElementRef.current.currentTime += 15;
    }
  };

  const gradientKey = 'gentleDeStress';

  return (
    <div className="h-screen w-full relative overflow-hidden" style={gradientStyle(gradientKey)}>
      {/* Close button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute top-6 right-6 z-50 w-8 h-8 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M6 18L18 6M6 6l12 12" stroke="#1e2d2e" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </motion.button>

      {/* Sticky question - tappable to collapse/expand */}
      <motion.div 
        className="absolute top-0 left-0 right-0 z-30 pt-20 pb-4 px-8 text-center cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="font-hanken text-[#1e2d2e] text-base mb-2">Before we begin:</p>
          <p className="font-hanken text-[#1e2d2e] text-lg font-medium italic">{todayPrompt}</p>
        </motion.div>
      </motion.div>

      {/* Music player */}
      <div className="absolute bottom-52 left-6 right-6 z-30">
        <div className="bg-white/40 backdrop-blur-lg rounded-2xl px-4 py-3 flex items-center gap-3">
          <motion.button
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-[#1e2d2e]"
            whileTap={{ scale: 0.9 }}
          >
            {!isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
              </svg>
            )}
          </motion.button>
          
          <div className="flex-1 min-w-0">
            <p className="font-hanken text-[#1e2d2e] text-xs font-semibold truncate">
              Ambient Soundscape
            </p>
            <p className="font-hanken text-[#1e2d2e]/60 text-xs truncate">
              Nature Sounds
            </p>
          </div>

          <motion.button
            onClick={skipBackward}
            className="text-[#1e2d2e]/70"
            whileTap={{ scale: 0.9 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M14 5l7 7-7 7M6 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </motion.button>
          <span className="text-[#1e2d2e]/50 text-xs">-15s</span>
          <motion.button
            onClick={skipForward}
            className="text-[#1e2d2e]/70"
            whileTap={{ scale: 0.9 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M10 19l7-7-7-7M3 12h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </motion.button>
          <span className="text-[#1e2d2e]/50 text-xs">+15s</span>
        </div>
      </div>

      {/* Bottom sheet - integrated comment area */}
      <div className="fixed bottom-0 left-0 right-0 z-20" style={{ height: '60%' }}>
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.1}
          onDragEnd={(e, info) => {
            if (info.offset.y > 100) {
              setIsCollapsed(true);
            } else if (info.offset.y < -100) {
              setIsCollapsed(false);
            }
          }}
          initial={{ y: '100%' }}
          animate={{ y: isCollapsed ? 'calc(100% - 120px)' : 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="h-full bg-white/75 backdrop-blur-lg rounded-t-3xl flex flex-col relative"
        >
          {/* Drag handle */}
          <div className="w-full flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-[#1e2d2e]/20 rounded-full" />
          </div>

          {/* Scrollable comments */}
          <div className="flex-1 overflow-y-auto px-6 pt-6 pb-32">
            <div className="space-y-4">
              <AnimatePresence>
                {shareouts.map((shareout, index) => (
                  <motion.div
                    key={`${shareout.name}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                      style={{ backgroundColor: getAvatarColor(shareout.name) }}
                    >
                      {shareout.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-hanken text-[#1e2d2e] text-sm font-semibold">{shareout.name}</span>
                        <span className="text-[#1e2d2e]/50 text-xs">•</span>
                        <span className="font-hanken text-[#1e2d2e]/50 text-xs">{shareout.time}</span>
                      </div>
                      <p className="font-hanken text-[#1e2d2e] text-base">
                        <span className="mr-1">{shareout.emoji}</span>{shareout.text}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Fixed bottom input area */}
          <div className="absolute bottom-0 left-0 right-0 px-6 py-4 z-10 space-y-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a comment..."
                className="flex-1 h-12 px-4 rounded-full bg-white/60 backdrop-blur-sm border border-white/30 text-[#1e2d2e] placeholder-[#1e2d2e]/50 font-hanken focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              
              {/* Heart send removed per latest design */}
              
              <motion.button
                onClick={onContinue}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 rounded-full bg-[#1e2d2e] text-white flex items-center justify-center flex-shrink-0"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.button>
            </div>
            
            {/* User circles row - left aligned */}
            <div className="flex -space-x-2">
              {shareouts.slice(0, 6).map((shareout, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-sm font-semibold text-white"
                  style={{ backgroundColor: getAvatarColor(shareout.name) }}
                >
                  {shareout.name[0]}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed left-1/2 z-50 -translate-x-1/2"
            style={{ bottom: '120px' }}
          >
            <div 
              className="px-6 py-3 rounded-full font-hanken text-sm font-medium whitespace-nowrap text-[#1e2d2e]"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 4px 16px rgba(30, 45, 46, 0.15)'
              }}
            >
              {showToast === 'shared' && '🌿 Shared with care'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TodaysPracticeScreen({ spaceName, onContinue }) {
  const gradientKey = 'gentleDeStress';
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={gradientStyle(gradientKey)}
    >
      <div className="px-8 text-center">
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="font-hanken text-[#1e2d2e] text-[28px] font-bold mb-4"
        >
          Today's Collective Practice
        </motion.h2>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="font-hanken text-[#1e2d2e] text-lg mb-8"
        >
          {spaceName}
        </motion.p>
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={onContinue}
          whileTap={{ scale: 0.96 }}
          className="px-8 py-4 bg-[#1e2d2e] text-white rounded-full font-hanken font-semibold"
        >
          Continue
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function ShareoutsTestSimple() {
  const [showShareouts, setShowShareouts] = useState(true);
  const [showTodaysPractice, setShowTodaysPractice] = useState(false);

  const spaceName = 'Gentle De-Stress';

  const handleShareoutsContinue = () => {
    setShowShareouts(false);
    setShowTodaysPractice(true);
  };

  const handleShareoutsClose = () => {
    setShowShareouts(false);
    alert('Shareouts closed - would return to feed');
  };

  const handleTodaysPracticeContinue = () => {
    setShowTodaysPractice(false);
    alert('Complete! Would go to practice mode');
  };

  const handleReset = () => {
    setShowShareouts(true);
    setShowTodaysPractice(false);
  };

  const gradientKey = 'gentleDeStress';

  return (
    <div className="h-screen w-full relative">
      {/* Reset button when both screens are closed */}
      {!showShareouts && !showTodaysPractice && (
        <div className="h-screen w-full flex items-center justify-center" style={gradientStyle(gradientKey)}>
          <button
            onClick={handleReset}
            className="px-8 py-4 bg-[#1e2d2e] text-white rounded-full font-hanken font-semibold"
          >
            Reset Test
          </button>
        </div>
      )}

      {/* Shareouts Screen */}
      {showShareouts && (
        <ShareoutsScreen
          spaceName={spaceName}
          onContinue={handleShareoutsContinue}
          onClose={handleShareoutsClose}
        />
      )}

      {/* Today's Practice Screen */}
      {showTodaysPractice && (
        <TodaysPracticeScreen
          spaceName={spaceName}
          onContinue={handleTodaysPracticeContinue}
        />
      )}
    </div>
  );
}




