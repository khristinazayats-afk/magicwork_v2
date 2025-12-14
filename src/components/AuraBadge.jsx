import { motion } from 'framer-motion';

// Moon phase SVG paths
const MOON_PHASE_PATHS = {
  'New Moon': <circle cx="50%" cy="50%" r="45%" fill="#1e2d2e" opacity="0.2" />,
  'Waxing Crescent': (
    <path d="M 50 10 A 40 40 0 0 1 50 90 A 40 40 0 0 0 50 10 Z" fill="#1e2d2e" opacity="0.4" />
  ),
  'First Quarter': (
    <path d="M 50 10 A 40 40 0 0 1 50 90 L 50 10 Z" fill="#1e2d2e" opacity="0.6" />
  ),
  'Waxing Gibbous': (
    <path d="M 50 10 A 40 40 0 0 1 50 90 A 40 40 0 0 1 50 10 Z" fill="#1e2d2e" opacity="0.75" />
  ),
  'Full Moon': <circle cx="50%" cy="50%" r="45%" fill="#1e2d2e" opacity="0.9" />,
  'Waning Gibbous': (
    <path d="M 50 10 A 40 40 0 0 0 50 90 A 40 40 0 0 0 50 10 Z" fill="#1e2d2e" opacity="0.75" />
  ),
  'Last Quarter': (
    <path d="M 50 10 A 40 40 0 0 0 50 90 L 50 10 Z" fill="#1e2d2e" opacity="0.6" />
  ),
  'Waning Crescent': (
    <path d="M 50 10 A 40 40 0 0 0 50 90 A 40 40 0 0 1 50 10 Z" fill="#1e2d2e" opacity="0.4" />
  ),
  'Supermoon': (
    <>
      <circle cx="50%" cy="50%" r="45%" fill="#1e2d2e" opacity="1" />
      <circle cx="50%" cy="50%" r="50%" fill="none" stroke="#94D1C4" strokeWidth="2" opacity="0.3" />
    </>
  ),
  'Zen Eclipse': (
    <>
      <circle cx="50%" cy="50%" r="45%" fill="#1e2d2e" opacity="0.95" />
      <circle cx="50%" cy="50%" r="48%" fill="none" stroke="#1e2d2e" strokeWidth="1" opacity="0.4" />
    </>
  )
};

const SIZE_CONFIG = {
  sm: { size: 48, textSize: 'text-sm' },
  md: { size: 80, textSize: 'text-base' },
  lg: { size: 120, textSize: 'text-lg' }
};

export default function AuraBadge({ aura, size = 'md' }) {
  const { phaseName, label } = aura;
  const { size: circleSize, textSize } = SIZE_CONFIG[size];

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Moon Phase Circle */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative"
        style={{ width: circleSize, height: circleSize }}
      >
        {/* Outer glow for Supermoon and Zen Eclipse */}
        {(phaseName === 'Supermoon' || phaseName === 'Zen Eclipse') && (
          <div
            className="absolute inset-0 rounded-full blur-md opacity-20"
            style={{
              background: '#1e2d2e',
              transform: 'scale(1.2)'
            }}
          />
        )}
        
        {/* Moon Phase SVG */}
        <svg
          width={circleSize}
          height={circleSize}
          viewBox="0 0 100 100"
          className="absolute inset-0"
        >
          {/* Background circle */}
          <circle cx="50" cy="50" r="45" fill="none" stroke="#1e2d2e" strokeWidth="1" opacity="0.1" />
          {/* Moon phase shape */}
          {MOON_PHASE_PATHS[phaseName] || MOON_PHASE_PATHS['New Moon']}
        </svg>
      </motion.div>

      {/* Phase Name */}
      <div className="text-center">
        <div className={`font-hanken font-medium text-[#1e2d2e] ${textSize}`}>
          {phaseName}
        </div>
        <div className={`font-hanken text-[#1e2d2e]/70 ${size === 'sm' ? 'text-xs' : 'text-sm'} mt-0.5`}>
          {label}
        </div>
      </div>
    </div>
  );
}

