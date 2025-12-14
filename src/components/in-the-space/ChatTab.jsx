import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROMPTS } from '../../constants/prompts';
import { saveShareout, getShareoutsForSpace, formatShareoutForDisplay } from '../../utils/shareoutsStorage';

// Mock display names
const MOCK_NAMES = ['Maya', 'Arun', 'Lena', 'Sol', 'River', 'Sky', 'Jade', 'Alex'];

// Format relative time
const formatRelativeTime = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const AVATAR_COLORS = ['#FFE5B4', '#B4E5D4', '#D4B4E5', '#E5D4B4', '#B4D4E5', '#E5B4D4'];

const MOCK_SHAREOUTS = {
  'Slow Morning': [
    { name: 'Maya', time: Date.now() - 120000, text: 'Morning coffee and birdsong' },
    { name: 'Arun', time: Date.now() - 300000, text: 'A quiet moment before the day begins' },
    { name: 'Lena', time: Date.now() - 600000, text: 'The sound of rain outside' }
  ],
  'Gentle De-Stress': [
    { name: 'Maya', time: Date.now() - 120000, text: 'Learning to breathe slower' },
    { name: 'Sol', time: Date.now() - 300000, text: 'Letting my body rest' }
  ]
};

function getAvatarColor(name) {
  const index = name.length % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export default function ChatTab({ station }) {
  const [comments, setComments] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const commentsContainerRef = useRef(null);
  const inputRef = useRef(null);
  const [showPrivacyChoice, setShowPrivacyChoice] = useState(false);
  const [pendingShareout, setPendingShareout] = useState(null);

  // Get today's reflection prompt
  const dayOfWeek = new Date().getDay();
  const todayPrompt = PROMPTS[station.name]?.[dayOfWeek] || "What's on your heart today?";

  // Load comments on mount
  useEffect(() => {
    const mocks = MOCK_SHAREOUTS[station.name] || MOCK_SHAREOUTS['Gentle De-Stress'];
    const userShareouts = getShareoutsForSpace(station.name, false);
    const formattedUserShareouts = userShareouts.map(formatShareoutForDisplay);
    const combined = formattedUserShareouts.map(s => ({
      id: s.name + s.time,
      name: s.name,
      text: s.text,
      timestamp: new Date(s.time).getTime()
    })).concat(mocks.map((m, i) => ({
      id: `mock-${i}`,
      name: m.name,
      text: m.text,
      timestamp: m.time
    })));
    setComments(combined.sort((a, b) => b.timestamp - a.timestamp));
  }, [station.name]);

  const completeShareout = (privacyMode) => {
    if (!pendingShareout) return;

    const saved = saveShareout({
      spaceName: station.name,
      prompt: todayPrompt,
      text: pendingShareout,
      privacy: privacyMode
    });

    if (!saved) {
      setShowPrivacyChoice(false);
      setPendingShareout(null);
      return;
    }

    const formatted = formatShareoutForDisplay(saved);
    const newComment = {
      id: formatted.name + formatted.time,
      name: formatted.name,
      text: formatted.text,
      timestamp: new Date(formatted.time).getTime()
    };

    setComments(prev => [newComment, ...prev]);
    setInputValue('');
    setShowPrivacyChoice(false);
    setPendingShareout(null);

    // Scroll to top to show new comment
    setTimeout(() => {
      if (commentsContainerRef.current) {
        commentsContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    setPendingShareout(trimmed);
    setShowPrivacyChoice(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col px-4 md:px-5 relative">
      {/* Sticky "Today's Reflection" header - Compact */}
      <div
        className="sticky top-0 z-40 bg-gradient-to-b from-[rgba(252,248,242,0.98)] to-transparent backdrop-blur-md pb-3 pt-2"
        style={{ paddingTop: 'calc(env(safe-area-inset-top,24px) + 120px)' }}
      >
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white/70 backdrop-blur-lg rounded-2xl p-4 md:p-5"
            style={{ boxShadow: '0 4px 16px rgba(30, 45, 46, 0.1)' }}
          >
            <h2 className="font-actay text-lg md:text-xl text-[#1e2d2e] mb-2">Today's Reflection</h2>
            <p className="font-hanken text-[#1e2d2e]/70 text-sm md:text-base leading-relaxed">
              {todayPrompt}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Scrollable content area - Comments only */}
      <div
        ref={commentsContainerRef}
        className="flex-1 overflow-y-auto pb-6"
      >
        <div className="max-w-2xl mx-auto space-y-3 pt-3">
          <AnimatePresence>
            {comments.length > 0 ? (
              comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/50 backdrop-blur-sm rounded-xl p-3 md:p-4"
                  style={{ boxShadow: '0 2px 8px rgba(30, 45, 46, 0.08)' }}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-semibold text-white flex-shrink-0"
                      style={{ backgroundColor: getAvatarColor(comment.name) }}
                    >
                      {comment.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="font-hanken text-[#1e2d2e] text-sm font-semibold">
                          {comment.name}
                        </span>
                        <span className="text-[#1e2d2e]/30 text-xs">·</span>
                        <span className="font-hanken text-[#1e2d2e]/50 text-xs">
                          {formatRelativeTime(comment.timestamp)}
                        </span>
                      </div>
                      <p className="font-hanken text-[#1e2d2e] text-sm leading-relaxed">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="font-hanken text-[#1e2d2e]/50 text-sm text-center py-6">
                No comments yet. Be the first to share your thoughts.
              </p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom composer - Always visible */}
      <div
        className="flex-shrink-0 bg-gradient-to-t from-[rgba(252,248,242,0.98)] to-transparent backdrop-blur-md"
        style={{ paddingBottom: 'env(safe-area-inset-bottom,24px)' }}
      >
        <div className="px-2 md:px-4 pt-4 pb-2">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 md:p-5" style={{ boxShadow: '0 -4px 16px rgba(30, 45, 46, 0.1)' }}>
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share your thoughts..."
                className="flex-1 min-w-[180px] h-11 md:h-12 px-4 rounded-full bg-white/70 backdrop-blur-sm border border-[#1e2d2e]/10 text-[#1e2d2e] placeholder-[#1e2d2e]/50 font-hanken text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#1e2d2e]/20"
              />
              <motion.button
                onClick={handleSend}
                whileTap={{ scale: 0.9 }}
                disabled={!inputValue.trim()}
                className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#1e2d2e] text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Choice Modal */}
      <AnimatePresence>
        {showPrivacyChoice && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => {
                setShowPrivacyChoice(false);
                setPendingShareout(null);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                <h3 className="font-actay text-xl text-[#1e2d2e] mb-4">How would you like to share?</h3>
                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => completeShareout('public')}
                    className="w-full px-6 py-3 rounded-full bg-[#1e2d2e] text-white font-hanken font-semibold"
                  >
                    Share with name
                  </button>
                  <button
                    onClick={() => completeShareout('anonymous')}
                    className="w-full px-6 py-3 rounded-full bg-white/70 text-[#1e2d2e] border border-[#1e2d2e]/20 font-hanken font-semibold"
                  >
                    Share anonymously
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShowPrivacyChoice(false);
                    setPendingShareout(null);
                  }}
                  className="w-full px-6 py-2 rounded-full text-[#1e2d2e]/50 font-hanken text-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
