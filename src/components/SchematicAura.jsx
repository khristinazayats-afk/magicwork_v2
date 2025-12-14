import { motion } from 'framer-motion';
import { useMemo } from 'react';

// Design System Constants
const PARTICLE_COLOR = 'rgba(30, 45, 46, 0.6)';
const PARTICLE_SIZE = 6;
const GUIDE_COLOR = 'rgba(30, 45, 46, 0.2)';

// Tier-based configuration
const TIER_CONFIG = {
  1: { 
    radius: 60, 
    particleCount: 8, 
    rings: 1,
    pulseScale: 1.05
  },
  2: { 
    radius: 70, 
    particleCount: 12, 
    rings: 2,
    pulseScale: 1.08
  },
  3: { 
    radius: 80, 
    particleCount: 16, 
    rings: 3,
    pulseScale: 1.12
  },
  4: { 
    radius: 90, 
    particleCount: 20, 
    rings: 4,
    pulseScale: 1.15
  },
  5: { 
    radius: 100, 
    particleCount: 24, 
    rings: 5,
    pulseScale: 1.18
  }
};

export default function SchematicAura({ tier = 1 }) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG[1];
  
  // Generate particles in circular orbit
  const particles = useMemo(() => {
    return Array.from({ length: config.particleCount }, (_, i) => ({
      id: i,
      offset: i / config.particleCount,
      radialOffset: (Math.random() - 0.5) * 10, // Dispersion
      delay: i * 0.1
    }));
  }, [config.particleCount]);

  return (
    <motion.div 
      className="relative flex items-center justify-center" 
      style={{ width: config.radius * 2.5, height: config.radius * 2.5 }}
      animate={{
        scale: [1, 1.05, 1]
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <svg 
        className="absolute inset-0" 
        style={{ transform: 'translate(-50%, -50%)', left: '50%', top: '50%' }}
        viewBox={`0 0 ${config.radius * 2.5} ${config.radius * 2.5}`}
      >
        {/* Guide circles - schematic rings */}
        {Array.from({ length: config.rings }).map((_, i) => {
          const ringRadius = config.radius * (0.4 + (i * 0.2));
          return (
            <circle
              key={`ring-${i}`}
              cx="50%"
              cy="50%"
              r={ringRadius}
              fill="none"
              stroke={GUIDE_COLOR}
              strokeWidth="1.5"
              strokeDasharray={i === config.rings - 1 ? "4 4" : "none"}
              opacity={0.3 - (i * 0.05)}
            />
          );
        })}
        
        {/* Center marker */}
        <circle
          cx="50%"
          cy="50%"
          r="2"
          fill={PARTICLE_COLOR}
          opacity="0.4"
        />
      </svg>

      {/* Orbiting particles */}
      <div className="absolute inset-0" style={{ transform: 'translate(-50%, -50%)', left: '50%', top: '50%' }}>
        {particles.map((particle) => {
          const angle = particle.offset * Math.PI * 2 - Math.PI / 2; // Start from top
          const radius = config.radius + particle.radialOffset;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: '50%',
                top: '50%',
                width: `${PARTICLE_SIZE}px`,
                height: `${PARTICLE_SIZE}px`,
                backgroundColor: PARTICLE_COLOR,
              }}
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{ 
                x: [0, x, 0],
                y: [0, y, 0],
                opacity: tier === 1 
                  ? [0.4, 0.6, 0.4] 
                  : [0.4, 0.7, 0.4],
                scale: tier === 1 
                  ? [1, 1.1, 1] 
                  : [1, config.pulseScale, 1]
              }}
              transition={{
                x: {
                  duration: 8 + (tier * 2),
                  repeat: Infinity,
                  ease: "linear"
                },
                y: {
                  duration: 8 + (tier * 2),
                  repeat: Infinity,
                  ease: "linear"
                },
                opacity: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: particle.delay
                },
                scale: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: particle.delay
                }
              }}
            />
          );
        })}
      </div>
    </motion.div>
  );
}

