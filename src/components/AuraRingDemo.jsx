import { useState } from 'react';
import { motion } from 'framer-motion';
import { gradientStyle, FEED_GRADIENTS } from '../styles/gradients';
import HypnoticAuraVisual from './HypnoticAuraVisual';

// Moon phase SVG paths
const MOON_PHASE_PATHS = {
  'new-moon': <circle cx="50" cy="50" r="45" fill="#1e2d2e" opacity="0.2" />,
  'waxing-crescent': (
    <path d="M 50 10 A 40 40 0 0 1 50 90 A 40 40 0 0 0 50 10 Z" fill="#1e2d2e" opacity="0.4" />
  ),
  'first-quarter': (
    <path d="M 50 10 A 40 40 0 0 1 50 90 L 50 10 Z" fill="#1e2d2e" opacity="0.6" />
  ),
  'waxing-gibbous': (
    <path d="M 50 10 A 40 40 0 0 1 50 90 A 40 40 0 0 1 50 10 Z" fill="#1e2d2e" opacity="0.75" />
  ),
  'full-moon': <circle cx="50" cy="50" r="45" fill="#1e2d2e" opacity="0.9" />,
  'waning-gibbous': (
    <path d="M 50 10 A 40 40 0 0 0 50 90 A 40 40 0 0 0 50 10 Z" fill="#1e2d2e" opacity="0.75" />
  ),
  'last-quarter': (
    <path d="M 50 10 A 40 40 0 0 0 50 90 L 50 10 Z" fill="#1e2d2e" opacity="0.6" />
  ),
  'zen-eclipse': (
    <>
      <circle cx="50" cy="50" r="45" fill="#1e2d2e" opacity="0.95" />
      <circle cx="50" cy="50" r="48" fill="none" stroke="#94D1C4" strokeWidth="1" opacity="0.4" />
    </>
  )
};

// Different practice states to showcase
const PRACTICE_STATES = [
  {
    id: 'early',
    label: 'Early Practice',
    daysPracticed: 5,
    daysPossible: 365,
    aura: {
      id: 'new-moon',
      name: 'New Moon',
      label: 'Dimmed Light, Spirits High'
    },
    gradient: 'gentleDeStress',
    description: 'Just beginning your journey'
  },
  {
    id: 'building',
    label: 'Building Consistency',
    daysPracticed: 42,
    daysPossible: 365,
    aura: {
      id: 'waxing-crescent',
      name: 'Waxing Crescent',
      label: 'Tiny Cloud of Calm'
    },
    gradient: 'slowMorning',
    description: 'Your practice is taking root'
  },
  {
    id: 'strong',
    label: 'Strong Consistency',
    daysPracticed: 120,
    daysPossible: 365,
    aura: {
      id: 'first-quarter',
      name: 'First Quarter',
      label: 'Cosmic Heartbeat'
    },
    gradient: 'breatheToRelax',
    description: 'A steady rhythm is forming'
  },
  {
    id: 'very-strong',
    label: 'Very Strong Consistency',
    daysPracticed: 250,
    daysPossible: 365,
    aura: {
      id: 'full-moon',
      name: 'Full Moon',
      label: 'The Universe Holds Your Hand'
    },
    gradient: 'driftIntoSleep',
    description: 'Deep, sustained presence'
  }
];

// Aura Ring Component - Using HypnoticAuraVisual
function AuraRing({ aura, completionRatio, size = 240 }) {
  return (
    <div className="relative flex items-center justify-center">
      <HypnoticAuraVisual aura={aura} completionRatio={completionRatio} />
    </div>
  );
}

// Single State Card
function StateCard({ state, isSelected, onSelect }) {
  const completionRatio = state.daysPracticed / state.daysPossible;
  const bgGradient = gradientStyle(state.gradient);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect(state.id)}
      className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all ${
        isSelected ? 'ring-4 ring-[#94D1C4] ring-opacity-50' : 'ring-2 ring-white/20'
      }`}
      style={{ ...bgGradient, minHeight: '500px' }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center">
        {/* Label */}
        <div className="mb-6">
          <h3 className="font-hanken text-lg font-semibold text-white/90 mb-1">
            {state.label}
          </h3>
          <p className="font-hanken text-sm text-white/70">
            {state.description}
          </p>
          <p className="font-hanken text-xs text-white/60 mt-2">
            {state.daysPracticed} / {state.daysPossible} days
          </p>
        </div>

        {/* Aura Ring */}
        <div className="my-8">
          <AuraRing 
            aura={state.aura} 
            completionRatio={completionRatio}
            size={200}
          />
        </div>

        {/* Aura Info */}
        <div className="mt-6">
          <div className="font-hanken text-xl font-medium text-white/90 mb-1">
            {state.aura.name}
          </div>
          <div className="font-hanken text-base text-white/80">
            {state.aura.label}
          </div>
        </div>

        {/* Consistency Indicator */}
        <div className="mt-6 w-full max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-hanken text-xs text-white/70">Consistency</span>
            <span className="font-hanken text-xs text-white/90 font-semibold">
              {Math.round(completionRatio * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionRatio * 100}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-white/60 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Overlay for selected state */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-white/5 pointer-events-none"
        />
      )}
    </motion.div>
  );
}

// Main Demo Component
export default function AuraRingDemo() {
  const [selectedState, setSelectedState] = useState(PRACTICE_STATES[0].id);

  return (
    <div className="min-h-screen bg-[#fcf8f2] overflow-y-auto py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-5">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-hanken text-3xl md:text-4xl font-semibold text-[#1e2d2e] mb-4">
            Aura Ring Consistency Demo
          </h1>
          <p className="font-hanken text-base text-[#1e2d2e]/70 max-w-2xl mx-auto">
            Watch how the aura ring grows brighter and more defined as practice consistency increases.
            Each example uses a different feed space background gradient.
          </p>
        </div>

        {/* State Selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {PRACTICE_STATES.map((state) => (
            <button
              key={state.id}
              onClick={() => setSelectedState(state.id)}
              className={`px-6 py-2.5 rounded-full font-hanken text-sm font-medium transition-all ${
                selectedState === state.id
                  ? 'bg-[#1e2d2e] text-white'
                  : 'bg-white/70 text-[#1e2d2e] border border-[#1e2d2e]/20 hover:bg-white/90'
              }`}
            >
              {state.label}
            </button>
          ))}
        </div>

        {/* Selected State - Large View */}
        <div className="mb-12">
          {PRACTICE_STATES.map((state) => {
            if (state.id !== selectedState) return null;
            return (
              <motion.div
                key={state.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <StateCard
                  state={state}
                  isSelected={true}
                  onSelect={setSelectedState}
                />
              </motion.div>
            );
          })}
        </div>

        {/* All States Grid */}
        <div className="mb-8">
          <h2 className="font-hanken text-xl font-semibold text-[#1e2d2e] mb-6 text-center">
            All States Side by Side
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRACTICE_STATES.map((state) => (
              <StateCard
                key={state.id}
                state={state}
                isSelected={selectedState === state.id}
                onSelect={setSelectedState}
              />
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 md:p-8 max-w-3xl mx-auto">
          <h3 className="font-hanken text-lg font-semibold text-[#1e2d2e] mb-4">
            How the Aura Ring Reflects Consistency
          </h3>
          <div className="space-y-3 font-hanken text-sm text-[#1e2d2e]/70">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#94D1C4] mt-1.5 flex-shrink-0" />
              <p><strong>Glow Intensity:</strong> The soft halo around the moon grows brighter with more consistent practice.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#94D1C4] mt-1.5 flex-shrink-0" />
              <p><strong>Ring Thickness:</strong> The outer progress ring becomes more prominent as you build consistency.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#94D1C4] mt-1.5 flex-shrink-0" />
              <p><strong>Ring Fill:</strong> The progress ring fills based on days practiced out of possible days.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#94D1C4] mt-1.5 flex-shrink-0" />
              <p><strong>Moon Phase:</strong> The moon phase itself reflects your current aura level.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

