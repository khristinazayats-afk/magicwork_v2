import { motion } from 'framer-motion';
import { useMemo } from 'react';

// Design System Constants - matching brand
const BRAND_COLOR = 'rgba(30, 45, 46, 0.6)';
const EARTH_COLOR = '#a89b8f';
const SOIL_COLOR = '#d4ccc0';
const SPROUT_COLOR = '#94d1c4';
const MOSS_COLOR = '#94d1c4';
const WORM_COLOR = '#b8a99b';
const MYCELIUM_COLOR = 'rgba(255, 255, 255, 0.3)';

// Component dimensions
const VIEWBOX_SIZE = 200;
const GROUND_LEVEL = 140;

export default function QuietGround({ isActive = true }) {
  // Generate random positions for organic feel
  const seeds = useMemo(() => [
    { id: 0, x: 80, y: 170, size: 2, delay: 0 },
    { id: 1, x: 110, y: 165, size: 2.5, delay: 0.2 },
    { id: 2, x: 130, y: 172, size: 2, delay: 0.4 },
    { id: 3, x: 60, y: 168, size: 2.5, delay: 0.1 },
  ], []);

  const sprouts = useMemo(() => [
    { id: 0, x: 100, y: 160, height: 6, delay: 0.5 },
  ], []);

  const worms = useMemo(() => [
    { id: 0, x: 70, y: 175, length: 12, delay: 0 },
    { id: 1, x: 140, y: 172, length: 10, delay: 0.3 },
  ], []);

  const mycelium = useMemo(() => [
    { 
      id: 0, 
      x: 90, 
      y: 180, 
      branches: [
        { angle: 0, length: 10 },
        { angle: 120, length: 9 },
        { angle: 240, length: 11 }
      ],
      delay: 0.6 
    },
    { 
      id: 1, 
      x: 120, 
      y: 182, 
      branches: [
        { angle: 45, length: 8 },
        { angle: 135, length: 12 },
        { angle: 225, length: 9 },
        { angle: 315, length: 10 }
      ],
      delay: 0.8 
    },
  ], []);

  const mossPatches = useMemo(() => [
    { id: 0, x: 70, y: 178, size: 3, delay: 0.2 },
    { id: 1, x: 135, y: 180, size: 2.5, delay: 0.4 },
  ], []);

  if (!isActive) return null;

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto bg-gradient-to-br from-magiwork-cream via-magiwork-beige to-white rounded-3xl overflow-hidden" style={{ boxShadow: '0 8px 32px rgba(30, 45, 46, 0.08)' }}>
      {/* Soft soil texture base */}
      <div className="absolute inset-0 opacity-40" style={{
        background: `radial-gradient(ellipse at bottom, ${SOIL_COLOR}50 0%, transparent 60%),
                     radial-gradient(circle at 30% 70%, ${SOIL_COLOR}30 0%, transparent 40%),
                     radial-gradient(circle at 70% 30%, ${SOIL_COLOR}20 0%, transparent 40%)`
      }} />
      
      <svg
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Soft ground layer */}
        <rect x="0" y={GROUND_LEVEL} width={VIEWBOX_SIZE} height={VIEWBOX_SIZE - GROUND_LEVEL} fill={SOIL_COLOR} opacity="0.2" />
        
        {/* Seeds - gently pulsing */}
        {seeds.map((seed) => (
          <g key={seed.id}>
            <motion.circle
              cx={seed.x}
              cy={seed.y}
              r={seed.size}
              fill={EARTH_COLOR}
              opacity={0.8}
              animate={{
                opacity: [0.6, 0.9, 0.6],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: seed.delay,
              }}
            />
            <motion.circle
              cx={seed.x}
              cy={seed.y}
              r={seed.size * 0.5}
              fill="#fff"
              opacity={0.3}
              animate={{
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: seed.delay,
              }}
            />
          </g>
        ))}

        {/* Tiny sprouts - gentle sway */}
        {sprouts.map((sprout) => (
          <g key={sprout.id}>
            <motion.line
              x1={sprout.x}
              y1={sprout.y}
              x2={sprout.x}
              y2={sprout.y - sprout.height}
              stroke={SPROUT_COLOR}
              strokeWidth="0.5"
              opacity={0.6}
              animate={{
                opacity: [0.5, 0.7, 0.5],
                pathLength: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: sprout.delay,
              }}
            />
            <motion.ellipse
              cx={sprout.x - 1.5}
              cy={sprout.y - sprout.height + 1}
              rx="1.5"
              ry="2"
              fill={SPROUT_COLOR}
              opacity={0.5}
              transform={`rotate(-20 ${sprout.x} ${sprout.y - sprout.height + 1})`}
              animate={{
                opacity: [0.4, 0.6, 0.4],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: sprout.delay + 0.2,
              }}
            />
            <motion.ellipse
              cx={sprout.x + 1.5}
              cy={sprout.y - sprout.height + 1}
              rx="1.5"
              ry="2"
              fill={SPROUT_COLOR}
              opacity={0.5}
              transform={`rotate(20 ${sprout.x} ${sprout.y - sprout.height + 1})`}
              animate={{
                opacity: [0.4, 0.6, 0.4],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: sprout.delay + 0.3,
              }}
            />
          </g>
        ))}

        {/* Single faint root thread - very subtle growth animation */}
        <g>
          <motion.line
            x1={100}
            y1={160}
            x2={100}
            y2={178}
            stroke="#8a7f73"
            strokeWidth="0.5"
            opacity={0.4}
            animate={{
              opacity: [0.3, 0.5, 0.3],
              pathLength: [0.9, 1, 0.9],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.line
            x1={100}
            y1={178}
            x2={95}
            y2={185}
            stroke="#8a7f73"
            strokeWidth="0.3"
            opacity={0.3}
            animate={{
              opacity: [0.2, 0.4, 0.2],
              pathLength: [0.85, 1, 0.85],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
        </g>

        {/* Very subtle mycelium lines - fade in/out */}
        {mycelium.map((myc) => (
          <g key={myc.id} opacity={0.3}>
            {myc.branches.map((branch, i) => {
              const angleRad = branch.angle * Math.PI / 180;
              return (
                <motion.line
                  key={i}
                  x1={myc.x}
                  y1={myc.y}
                  x2={myc.x + Math.cos(angleRad) * branch.length}
                  y2={myc.y + Math.sin(angleRad) * branch.length}
                  stroke={MYCELIUM_COLOR}
                  strokeWidth="0.5"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 0.3, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: myc.delay + (i * 0.2),
                  }}
                />
              );
            })}
          </g>
        ))}

        {/* Simple funky worms - minimal, earthy movement */}
        {worms.map((worm) => (
          <motion.g 
            key={worm.id}
            initial={{ x: 0, y: 0, rotate: 0 }}
            animate={{
              x: [0, 0.5, -0.5, 0],
              y: [0, 0.3, -0.3, 0],
              rotate: [0, 1, -1, 0],
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: worm.delay,
            }}
          >
            <path
              d={`M ${worm.x} ${worm.y} Q ${worm.x + worm.length * 0.3} ${worm.y - 2} ${worm.x + worm.length * 0.5} ${worm.y} T ${worm.x + worm.length} ${worm.y}`}
              fill="none"
              stroke={WORM_COLOR}
              strokeWidth="1"
              opacity={0.6}
              strokeLinecap="round"
            />
          </motion.g>
        ))}

        {/* Moss patches - soft pulsing */}
        {mossPatches.map((moss) => (
          <motion.circle
            key={moss.id}
            cx={moss.x}
            cy={moss.y}
            r={moss.size}
            fill={MOSS_COLOR}
            opacity={0.15}
            animate={{
              opacity: [0.1, 0.2, 0.1],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: moss.delay,
            }}
          />
        ))}
      </svg>
    </div>
  );
}

