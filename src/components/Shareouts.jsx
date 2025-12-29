import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveShareout, getShareoutsForSpace, formatShareoutForDisplay } from '../utils/shareoutsStorage';
import { usePostEvent } from '../hooks/usePostEvent';
import MilestoneModal from './MilestoneModal';

const PROMPTS = {
  'Slow Morning': {
    0: "What are you grateful to wake up to?",
    1: "What's one thing you want to welcome this week?",
    2: "What are you sipping or savoring today?",
    3: "What's one cozy thing around you?",
    4: "Who or what helps you start softly?",
    5: "What's your morning mood in one word?",
    6: "What's one thing you want to welcome today?"
  },
  'Gentle De-Stress': {
    0: "What feels lighter as the week ends?",
    1: "What part of you needs kindness right now?",
    2: "What helped you slow down today?",
    3: "What made you smile lately for no reason?",
    4: "Who or what brings you calm?",
    5: "What are you proud to have let go of?",
    6: "How are you resting today?"
  },
  'Take a Walk': {
    0: "What's calling you outdoors?",
    1: "What do you want to notice as you move?",
    2: "What kind of walk do you need today?",
    3: "Where will your feet take you?",
    4: "What pace feels right for you?",
    5: "What's something you'd like to leave behind on this walk?",
    6: "What could surprise you outside?"
  },
  'Draw Your Feels': {
    0: "What story do you want to draw?",
    1: "What color fits your mood today and why?",
    2: "What emotion wants a color today?",
    3: "What shape feels like today's vibe?",
    4: "What would you like to express freely?",
    5: "What tiny thing inspired you?",
    6: "What does creativity mean for you today?"
  },
  'Move and Cool': {
    0: "Where in your body do you want ease?",
    1: "What kind of energy do you want to move?",
    2: "What part of you feels strong?",
    3: "What needs to be released today?",
    4: "What's one word for your movement mood?",
    5: "What energy do you want to shake off?",
    6: "What's your pace today — gentle or strong?"
  },
  'Tap to Ground': {
    0: "What's one gentle thing you're grateful for?",
    1: "What's something real you can touch?",
    2: "What's real under your feet?",
    3: "What feels steady or safe right now?",
    4: "What's one thing that calms your body?",
    5: "What helps you feel okay, even a little?",
    6: "What feels warm or comforting today?"
  },
  'Breathe to Relax': {
    0: "What will you breathe in for the week ahead?",
    1: "What does your next deep breath need?",
    2: "What helps your breath soften?",
    3: "What do you feel grateful for right now?",
    4: "What brings you peace today?",
    5: "What feels calm inside you?",
    6: "What are you ready to release as you exhale?"
  },
  'Get in the Flow State': {
    0: "What brings out your creativity?",
    1: "What do you want to give your full attention to?",
    2: "What does being in flow mean to you today?",
    3: "What keeps you focused with ease?",
    4: "What would make time disappear today?",
    5: "What made time fly today?",
    6: "What's lighting your curiosity now?"
  },
  'Drift into Sleep': {
    0: "What feels peaceful right now?",
    1: "What moment of today felt soft?",
    2: "What are you grateful to release?",
    3: "What's one sweet thought before sleep?",
    4: "What dream do you want to meet?",
    5: "Who or what brings you comfort?",
    6: "What soft thought do you want to hold?"
  }
};

const MOCK_SHAREOUTS = {
  'Slow Morning': [
    { name: 'Maya', time: '2 min ago', emoji: '🌿', text: 'Morning coffee and birdsong' },
    { name: 'Arun', time: '4 min ago', emoji: '🍃', text: 'A quiet moment before the day begins' },
    { name: 'Lena', time: '6 min ago', emoji: '🌸', text: 'The sound of rain outside' },
    { name: 'Jo', time: '7 min ago', emoji: '☁️', text: 'Gratitude for a new day' },
    { name: 'Tara', time: '9 min ago', emoji: '🌼', text: 'Soft light through the window' }
  ],
  'Gentle De-Stress': [
    { name: 'Maya', time: '2 min ago', emoji: '🌿', text: 'Learning to breathe slower' },
    { name: 'Sol', time: '3 min ago', emoji: '🍃', text: 'Letting my body rest' },
    { name: 'River', time: '5 min ago', emoji: '🌸', text: 'Just grateful to be here' }
  ],
  'Take a Walk': [
    { name: 'Maya', time: '2 min ago', emoji: '🌿', text: 'Fresh air and movement' },
    { name: 'Arun', time: '4 min ago', emoji: '🍃', text: 'Noticing the clouds today' },
    { name: 'Lena', time: '6 min ago', emoji: '🌸', text: 'One foot in front of the other' }
  ],
  'Draw Your Feels': [
    { name: 'Maya', time: 'just now', emoji: '🌿', text: 'Blue — for calm and depth' },
    { name: 'Sol', time: '3 min ago', emoji: '🍃', text: 'Drawing what I cannot say' },
    { name: 'River', time: '6 min ago', emoji: '🌸', text: 'Colors that feel like home' }
  ],
  'Move and Cool': [
    { name: 'Leo', time: '2 min ago', emoji: '🌿', text: 'Shaking off the tension' },
    { name: 'Noa', time: '5 min ago', emoji: '🍃', text: 'Feeling my body wake up' }
  ],
  'Tap to Ground': [
    { name: 'River', time: 'just now', emoji: '🌿', text: 'The floor beneath my feet' }
  ],
  'Breathe to Relax': [
    { name: 'Sol', time: '2 min ago', emoji: '🌿', text: 'One breath at a time' }
  ],
  'Get in the Flow State': [
    { name: 'Lena', time: 'just now', emoji: '🌿', text: 'Losing track of time creating' }
  ],
  'Drift into Sleep': [
    { name: 'Noa', time: '2 min ago', emoji: '🌿', text: 'Letting the day dissolve' }
  ]
};

const AVATAR_COLORS = ['#FFE5B4', '#B4E5D4', '#D4B4E5', '#E5D4B4', '#B4D4E5', '#E5B4D4'];

export default function Shareouts({ spaceName, gradientStyle, onContinue, onClose }) {
  const { postEvent } = usePostEvent();
  const [shareouts, setShareouts] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [showToast, setShowToast] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [privacyMode, setPrivacyMode] = useState('public'); // 'private', 'anonymous', 'public'
  const [milestone, setMilestone] = useState(null);
  const commentsRef = useRef(null);
  const inputRef = useRef(null);

  const dayOfWeek = new Date().getDay();
  const todayPrompt = PROMPTS[spaceName]?.[dayOfWeek] || "What's on your heart today?";

  // Load mock shareouts and user's own shareouts
  useEffect(() => {
    const mocks = MOCK_SHAREOUTS[spaceName] || MOCK_SHAREOUTS['Gentle De-Stress'];
    
    // Load user's shareouts for this space
    const userShareouts = getShareoutsForSpace(spaceName, false); // Exclude private
    const formattedUserShareouts = userShareouts.map(formatShareoutForDisplay);
    
    // Combine: user's shareouts first, then mock data
    // Sort by time (newest first) - user shareouts will be newer
    const combined = [...formattedUserShareouts, ...mocks];
    combined.sort((a, b) => {
      // User shareouts first, then by time
      if (a.isOwn && !b.isOwn) return -1;
      if (!a.isOwn && b.isOwn) return 1;
      // Parse time for sorting (approximate)
      return 0; // Mock data already sorted
    });
    
    setShareouts(combined);
  }, [spaceName]);

  // no audio binding needed

  const getAvatarColor = (name) => {
    const index = name.length % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  };

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;

    // Save to localStorage
    const saved = saveShareout({
      spaceName,
      prompt: todayPrompt,
      text: inputValue.trim(),
      privacy: privacyMode
    });

    if (!saved) {
      // Handle error
      setShowToast('error');
      setTimeout(() => setShowToast(null), 3000);
      return;
    }

    // Track share post event (only for public/anonymous, not private)
    if (privacyMode !== 'private') {
      try {
        const result = await postEvent({
          event_type: 'share_post',
          metadata: {
            space: spaceName,
            privacy: privacyMode,
          },
        });
        
        if (result?.milestone_granted) {
          setMilestone(result.milestone_granted);
        }
      } catch (err) {
        console.error('Error tracking share post:', err);
      }
    }

    // Format for display
    const formatted = formatShareoutForDisplay(saved);
    
    // Add to top of list
    setShareouts(prev => [formatted, ...prev]);
    setInputValue('');
    
    // Show appropriate toast
    if (privacyMode === 'private') {
      setShowToast('saved');
    } else {
      setShowToast('shared');
    }
    
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // heart send removed

  // no skip controls

  return (
    <div className="full-viewport w-full relative overflow-hidden" style={gradientStyle}>
      {/* Close button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute right-6 z-50 w-8 h-8 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M6 18L18 6M6 6l12 12" stroke="#1e2d2e" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </motion.button>

      {/* Question of the day - prominent */}
      <motion.div 
        className="absolute top-0 left-0 right-0 z-30 px-8 text-center"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 4rem)',
          paddingBottom: '1.5rem'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="font-hanken text-[#1e2d2e]/80 text-[16px] md:text-[18px] mb-2">Before we begin, todays sweet challenge is to think about</p>
          <p className="font-actay text-[#1e2d2e] text-[24px] md:text-[32px] leading-tight italic font-bold">{todayPrompt}</p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1e2d2e]/60 animate-pulse" />
            <span className="font-hanken text-[#1e2d2e]/70 text-xs">New question every day</span>
          </div>
        </motion.div>
      </motion.div>

      {/* No music/feed elements here */}

      {/* Bottom sheet - integrated comment area */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20"
        style={{ height: 'min(65vh, 560px)' }}
      >
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
          className="h-full bg-white/80 backdrop-blur-lg rounded-t-3xl flex flex-col relative"
        >
          {/* Drag handle */}
          <div className="w-full flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-[#1e2d2e]/20 rounded-full" />
          </div>

          {/* Scrollable comments */}
          <div
            ref={commentsRef}
            className="flex-1 overflow-y-auto scroll-smooth px-6 pt-4 pb-[calc(160px+env(safe-area-inset-bottom,0px))]"
          >
            <div className="space-y-3">
              <AnimatePresence>
                {shareouts.map((shareout, index) => (
                  <motion.div
                    key={`${shareout.name}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-2"
                  >
                    <div 
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0"
                      style={{ backgroundColor: getAvatarColor(shareout.name) }}
                    >
                      {shareout.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="font-hanken text-[#1e2d2e] text-[12px] font-semibold">{shareout.name}</span>
                        {shareout.isOwn && (
                          <>
                            <span className="text-[#1e2d2e]/50 text-[10px]">•</span>
                            <span className="font-hanken text-[#1e2d2e]/60 text-[10px] italic">you</span>
                          </>
                        )}
                        <span className="text-[#1e2d2e]/50 text-[10px]">•</span>
                        <span className="font-hanken text-[#1e2d2e]/50 text-[10px]">{shareout.time}</span>
                      </div>
                      <p className="font-hanken text-[#1e2d2e] text-[13px] leading-snug">
                        <span className="mr-1 text-[12px]">{shareout.emoji}</span>{shareout.text}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Fixed bottom input area - inline typing */}
          <div
            className="absolute bottom-0 left-0 right-0 px-6 py-4 z-10 space-y-3"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
          >
            {/* Input row */}
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add your thoughts, or simply get inspired."
                className="flex-1 h-11 px-4 rounded-full bg-white/70 backdrop-blur-sm border border-white/30 text-[#1e2d2e] placeholder-[#1e2d2e]/50 font-hanken text-[14px] focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              
              {/* Heart send removed */}
              
              {/* Arrow button - sticky on right */}
              <motion.button
                onClick={onContinue}
                whileTap={{ scale: 0.9 }}
                className="w-11 h-11 rounded-full bg-[#1e2d2e] text-white flex items-center justify-center flex-shrink-0"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.button>
            </div>
            
            {/* Privacy options */}
            <div className="flex items-center gap-3">
              <span className="font-hanken text-[#1e2d2e] text-[12px] opacity-70">Share as:</span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="privacy"
                    value="public"
                    checked={privacyMode === 'public'}
                    onChange={(e) => setPrivacyMode('public')}
                    className="w-3.5 h-3.5 border-[#1e2d2e]/30 text-[#1e2d2e] focus:ring-2 focus:ring-white/50"
                  />
                  <span className="font-hanken text-[#1e2d2e] text-[11px]">Public</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="privacy"
                    value="anonymous"
                    checked={privacyMode === 'anonymous'}
                    onChange={(e) => setPrivacyMode('anonymous')}
                    className="w-3.5 h-3.5 border-[#1e2d2e]/30 text-[#1e2d2e] focus:ring-2 focus:ring-white/50"
                  />
                  <span className="font-hanken text-[#1e2d2e] text-[11px]">Anonymous</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="privacy"
                    value="private"
                    checked={privacyMode === 'private'}
                    onChange={(e) => setPrivacyMode('private')}
                    className="w-3.5 h-3.5 border-[#1e2d2e]/30 text-[#1e2d2e] focus:ring-2 focus:ring-white/50"
                  />
                  <span className="font-hanken text-[#1e2d2e] text-[11px]">Private</span>
                </label>
              </div>
            </div>

            {/* User circles row - left aligned */}
            <div className="flex -space-x-2">
              {shareouts.slice(0, 6).map((shareout, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-semibold text-white"
                  style={{ backgroundColor: getAvatarColor(shareout.name) }}
                >
                  {shareout.name[0]}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Toast - centered at bottom with background */}
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
              {showToast === 'saved' && '✨ Saved privately'}
              {showToast === 'error' && '⚠️ Could not save'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Milestone Modal */}
      <MilestoneModal
        milestone={milestone}
        onClose={() => setMilestone(null)}
        onWriteNote={() => {
          setMilestone(null);
          // Already in share prompt, just continue
          if (onContinue) onContinue();
        }}
      />
    </div>
  );
}


