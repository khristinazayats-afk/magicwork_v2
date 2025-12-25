import { motion } from 'framer-motion';
import React from 'react';

// Vibe badges configuration
const VIBE_BADGES = [
  { name: 'Sleepy Otter', vibe: 'Sleepy', key: 'otter', emoji: '🦦' },
  { name: 'Unbothered Tortoise', vibe: 'Unbothered', key: 'tortoise', emoji: '🐢' },
  { name: 'Calm Polar Bear', vibe: 'Calm', key: 'polarBear', emoji: '🐻‍❄️' },
  { name: 'Chilled Capybara', vibe: 'Chilled', key: 'capybara', emoji: '🦫' },
  { name: 'Serene Quokka', vibe: 'Serene', key: 'quokka', emoji: '🦘' },
  { name: 'Resourceful Owl', vibe: 'Resourceful', key: 'owl', emoji: '🦉' },
  { name: 'Resilient Deer', vibe: 'Resilient', key: 'deer', emoji: '🦌' },
  { name: 'Cool Koala', vibe: 'Cool', key: 'koala', emoji: '🐨' },
  { name: 'Zenned Panda', vibe: 'Zenned', key: 'panda', emoji: '🐼' },
  { name: 'Collected Alpaca', vibe: 'Collected', key: 'alpaca', emoji: '🦙' },
];

// Badge component with emojis
function VibeBadgeSVG({ animal, vibe, emoji }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-3"
    >
      {/* Badge Circle with soft glow */}
      <div className="relative">
        {/* Outer glow */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-20"
          style={{
            background: 'radial-gradient(circle, #94D1C4 0%, #FFAF42 50%, #BDB2CD 100%)',
            transform: 'scale(1.3)'
          }}
        />
        
        {/* Badge container */}
        <div
          className="relative w-32 h-32 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(148, 209, 196, 0.15) 0%, rgba(255, 175, 66, 0.1) 50%, rgba(189, 178, 205, 0.15) 100%)',
            border: '2px solid rgba(30, 45, 46, 0.08)',
            boxShadow: 'inset 0 2px 8px rgba(255, 255, 255, 0.3), 0 4px 16px rgba(30, 45, 46, 0.06)',
            backdropFilter: 'blur(8px)'
          }}
        >
          {/* Inner glow */}
          <div
            className="absolute inset-2 rounded-full opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(148, 209, 196, 0.2) 0%, transparent 70%)',
            }}
          />
          
          {/* Emoji */}
          <div className="relative z-10 text-6xl filter drop-shadow-sm">
            {emoji}
          </div>
          
          {/* Subtle shimmer effect */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)',
            }}
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
      </div>
      
      {/* Badge labels */}
      <div className="text-center">
        <div className="font-hanken font-medium text-[#1e2d2e] text-base">
          {animal}
        </div>
        <div className="font-hanken text-[#1e2d2e]/60 text-sm mt-0.5">
          {vibe}
        </div>
      </div>
    </motion.div>
  );
}

export default function VibeBadgesTest() {
  return (
    <div className="min-h-screen w-full bg-[#fcf8f2] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="font-actay font-bold text-[#1e2d2e] text-3xl md:text-4xl mb-3">
            Your Vibe This Week
          </h1>
          <p className="font-hanken text-[#1e2d2e]/70 text-base md:text-lg">
            Minimal, soft magiwork aesthetics
          </p>
        </motion.div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-12">
          {VIBE_BADGES.map((badge, index) => (
            <motion.div
              key={badge.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <VibeBadgeSVG
                animal={badge.name}
                vibe={badge.vibe}
                emoji={badge.emoji}
              />
            </motion.div>
          ))}
        </div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-16 p-6 rounded-2xl"
          style={{
            background: 'rgba(148, 209, 196, 0.08)',
            border: '1px solid rgba(30, 45, 46, 0.08)'
          }}
        >
          <h2 className="font-actay font-semibold text-[#1e2d2e] text-lg mb-3">
            ✨ Your Vibe This Week
          </h2>
          <p className="font-hanken text-[#1e2d2e]/70 text-sm leading-relaxed">
            Each badge represents a different vibe with playful animal emojis. 
            The soft, minimal design uses magiwork brand colors and captures the essence of each animal's unique energy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

