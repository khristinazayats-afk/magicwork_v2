import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gradientStyle } from '../styles/gradients';
import HypnoticAuraVisual from './HypnoticAuraVisual';
import { getCurrentTierInfo, getLastSessionMinutes, recordPracticeSession, TIERS } from '../utils/monthlyTiers';

// Nervous system benefit messages (rotating)
const NERVOUS_SYSTEM_MESSAGES = [
  "Your nervous system noticed this pause.",
  "Your cortisol softened a little.",
  "You practiced self-kindness, even if life is busy.",
  "Small pauses like this add up to a steadier you.",
  "You slowed down — this is how long-term change begins.",
  "Just by being here, you're helping others feel less alone."
];

// Get a random nervous system message
function getRandomNervousSystemMessage() {
  return NERVOUS_SYSTEM_MESSAGES[Math.floor(Math.random() * NERVOUS_SYSTEM_MESSAGES.length)];
}

// Top label options
const TOP_LABELS = [
  "Today's moment of presence",
  "You took a pause today"
];

export default function PracticeCompleteScreen({ minutesPracticed = 7, onClose, onReturnToSpace }) {
  const [tierInfo, setTierInfo] = useState(null);
  const [nervousSystemMessage, setNervousSystemMessage] = useState('');
  const [topLabel] = useState(TOP_LABELS[Math.floor(Math.random() * TOP_LABELS.length)]);
  const [gradient] = useState('gentleDeStress'); // Can be changed to any gradient from FEED_GRADIENTS

  useEffect(() => {
    // Record this practice session
    const result = recordPracticeSession(minutesPracticed);
    
    // Get updated tier info
    const updatedTierInfo = getCurrentTierInfo();
    setTierInfo(updatedTierInfo);
    
    // Set random nervous system message
    setNervousSystemMessage(getRandomNervousSystemMessage());
  }, [minutesPracticed]);

  if (!tierInfo) {
    // Loading state
    return (
      <div className="min-h-screen flex items-center justify-center" style={gradientStyle(gradient)}>
        <div className="text-white font-hanken">Loading...</div>
      </div>
    );
  }

  const bgGradient = gradientStyle(gradient);
  const tier = TIERS[tierInfo.tier];
  const secondaryText = tier.secondaryTemplate.replace('{X}', tierInfo.communityCount.toLocaleString());

  // Mock aura object for HypnoticAuraVisual (keeping compatibility)
  const mockAura = {
    id: `tier-${tierInfo.tier}`,
    name: tier.name,
    label: tier.headline
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex flex-col px-4 md:px-6 py-8 md:py-12"
      style={bgGradient}
    >
      {/* Top area: Back/close + label */}
      <div className="flex items-center justify-between mb-8">
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors font-hanken text-sm"
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex-1 text-center"
        >
          <p className="font-hanken text-sm md:text-base text-white/90">
            {topLabel}
          </p>
        </motion.div>
        <div className="w-6" /> {/* Spacer for centering */}
      </div>

      {/* Middle area: Aura visual + tier text */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 mb-8">
        {/* Large aura visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          className="flex justify-center"
        >
          <HypnoticAuraVisual
            aura={mockAura}
            completionRatio={tierInfo.tier / 5}
            tier={tierInfo.tier}
            minutesPracticed={minutesPracticed}
          />
        </motion.div>

        {/* Tier headline and secondary text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center space-y-3 max-w-md"
        >
          <h1 className="font-hanken text-2xl md:text-3xl font-medium text-white leading-relaxed drop-shadow-lg">
            {tier.headline}
          </h1>
          <p className="font-hanken text-base md:text-lg text-white/90 leading-relaxed drop-shadow-sm">
            {secondaryText}
          </p>
        </motion.div>
      </div>

      {/* Lower area: Session summary + action button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="space-y-6 max-w-md mx-auto w-full"
      >
        {/* Session summary block */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 space-y-4" style={{ boxShadow: '0 4px 16px rgba(30, 45, 46, 0.15)' }}>
          {/* Line 1: Minutes this session */}
          <p className="font-hanken text-base md:text-lg text-[#1e2d2e] leading-relaxed">
            You gave yourself {minutesPracticed} {minutesPracticed === 1 ? 'minute' : 'minutes'} of real presence.
          </p>

          {/* Line 2: Consecutive days */}
          {tierInfo.consecutiveDays > 0 && (
            <p className="font-hanken text-base md:text-lg text-[#1e2d2e] leading-relaxed">
              Day {tierInfo.consecutiveDays} {tierInfo.consecutiveDays === 1 ? 'of showing up' : 'of showing up'} for yourself this month.
            </p>
          )}

          {/* Line 3: Nervous system benefit */}
          <p className="font-hanken text-base md:text-lg text-[#1e2d2e]/80 leading-relaxed italic">
            {nervousSystemMessage}
          </p>
        </div>

        {/* Primary action button */}
        <motion.button
          onClick={onReturnToSpace || onClose}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-white/90 hover:bg-white text-[#1e2d2e] font-hanken text-base md:text-lg font-medium py-4 px-6 rounded-2xl transition-all shadow-lg"
          style={{ boxShadow: '0 4px 16px rgba(30, 45, 46, 0.2)' }}
        >
          {onReturnToSpace ? 'Return to space' : 'Back to feed'}
        </motion.button>

        {/* Optional secondary link */}
        <div className="text-center">
          <button
            onClick={() => {
              // Navigate to monthly view (if implemented)
              console.log('Navigate to monthly view');
            }}
            className="font-hanken text-sm text-white/80 hover:text-white transition-colors underline"
          >
            See my month
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
