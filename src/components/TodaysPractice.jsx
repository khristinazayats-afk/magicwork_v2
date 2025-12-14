import { motion } from 'framer-motion';

// Practice descriptions for each space
const PRACTICE_INFO = {
  'Slow Morning': {
    title: 'Morning Presence',
    description: 'Begin your day with intention alongside others',
    duration: '3 minutes',
    cue: 'Notice three things you are grateful for'
  },
  'Gentle De-Stress': {
    title: 'Physiological Sigh',
    description: 'A double inhale followed by a long exhale to calm your nervous system',
    duration: '2 minutes',
    cue: 'Drop your shoulders. Breathe out slowly'
  },
  'Take a Walk': {
    title: 'Mindful Steps',
    description: 'Let each step ground you in the present moment',
    duration: '5-10 minutes',
    cue: 'Count ten soft steps in silence'
  },
  'Draw Your Feels': {
    title: 'Creative Flow',
    description: 'Express your emotions through gentle, mindful drawing',
    duration: '5 minutes',
    cue: 'Pick a color. One continuous line'
  },
  'Move and Cool': {
    title: 'Body Release',
    description: 'Move with intention to release tension and find ease',
    duration: '5 minutes',
    cue: 'Sway side to side with your breath'
  },
  'Tap to Ground': {
    title: 'Grounding Practice',
    description: 'Reconnect with your body through gentle tapping',
    duration: '3 minutes',
    cue: 'Press both feet into the floor'
  },
  'Breathe to Relax': {
    title: 'Box Breathing',
    description: 'Structured breathing to find focus and release tension',
    duration: '4 minutes',
    cue: 'Inhale 4, exhale 6'
  },
  'Get in the Flow State': {
    title: 'Physiological Sigh',
    description: 'An energizing breath pattern to awaken and activate',
    duration: '2 minutes',
    cue: 'Ten brisk breaths, then rest'
  },
  'Drift into Sleep': {
    title: 'Sleep Preparation',
    description: 'Gently transition into restful sleep',
    duration: '5 minutes',
    cue: 'Count from 30 down to 0'
  }
};

export default function TodaysPractice({ spaceName, gradientStyle, onContinue }) {
  const practiceInfo = PRACTICE_INFO[spaceName] || PRACTICE_INFO['Gentle De-Stress'];

  return (
    <div 
      className="full-viewport w-full relative overflow-hidden flex flex-col items-center justify-center px-8"
      style={gradientStyle}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="w-full max-w-md text-center"
      >
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <h1 className="font-actay text-[#1e2d2e] text-3xl font-bold mb-3">
            Today's Collective Practice
          </h1>
          <p className="font-hanken text-[#1e2d2e]/70 text-lg">
            {practiceInfo.title}
          </p>
        </motion.div>

        {/* Practice Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 mb-8"
          style={{ boxShadow: '0 8px 32px rgba(30, 45, 46, 0.12)' }}
        >
          {/* Description */}
          <p className="font-hanken text-[#1e2d2e] text-base leading-relaxed mb-6">
            {practiceInfo.description}
          </p>

          {/* Duration */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#1e2d2e" strokeWidth="2" opacity="0.6"/>
              <path d="M12 6v6l4 2" stroke="#1e2d2e" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
            </svg>
            <span className="font-hanken text-[#1e2d2e]/80 text-sm font-medium">
              {practiceInfo.duration}
            </span>
          </div>

          {/* Cue */}
          <div className="bg-[#1e2d2e]/5 rounded-2xl px-6 py-4">
            <p className="font-hanken text-[#1e2d2e]/90 text-base font-medium italic">
              "{practiceInfo.cue}"
            </p>
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          onClick={onContinue}
          whileTap={{ scale: 0.96, backgroundColor: 'rgba(30, 45, 46, 0.95)' }}
          whileHover={{ scale: 1.01 }}
          className="w-full h-14 rounded-full bg-[#1e2d2e]/90 backdrop-blur-sm text-white font-hanken font-semibold text-base"
          style={{ boxShadow: '0 4px 16px rgba(30, 45, 46, 0.25)' }}
        >
          Begin Practice
        </motion.button>

        {/* Participant hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="font-hanken text-[#1e2d2e]/50 text-sm mt-4"
        >
          Others are practicing with you right now
        </motion.p>
      </motion.div>
    </div>
  );
}

