import { motion } from 'framer-motion';
import { useMemo } from 'react';

// Brand colors with variations
const COLORS = {
  mint: '#94D1C4',
  orange: '#FFAF42',
  purple: '#BDB2CD',
  darkGreen: '#1e2d2e',
  white: '#FFFFFF',
  lightBlue: '#A8D5E2',
  pink: '#F5B5C1',
  yellow: '#FFE5A0'
};

// Generate flowing, segmented rings - organic and overlapping
function generateFlowingRings(practiceDays) {
  const rings = [];
  const baseRadius = 25;
  const maxRadius = 48;
  
  // Number of rings grows with practice (exponential)
  const ringCount = Math.min(3 + Math.floor(Math.pow(practiceDays, 0.6)), 10);
  
  for (let ring = 0; ring < ringCount; ring++) {
    const radius = baseRadius + (ring * (maxRadius - baseRadius) / ringCount);
    
    // Create organic, flowing shape (not perfect circle)
    const segments = 8 + (ring * 2); // More segments for outer rings
    const points = [];
    
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      // Add organic variation - flowing, not rigid
      const variation = Math.sin(angle * 2 + ring) * 2 + Math.cos(angle * 3) * 1.5;
      const x = 50 + Math.cos(angle) * (radius + variation);
      const y = 50 + Math.sin(angle) * (radius + variation);
      points.push({ x, y, angle });
    }
    
    // Color segments - each ring has multiple colors
    const colorPalette = [
      [COLORS.mint, COLORS.lightBlue, COLORS.purple],
      [COLORS.purple, COLORS.pink, COLORS.mint],
      [COLORS.orange, COLORS.yellow, COLORS.mint],
      [COLORS.mint, COLORS.purple, COLORS.orange],
      [COLORS.pink, COLORS.purple, COLORS.lightBlue]
    ];
    const colors = colorPalette[ring % colorPalette.length];
    
    rings.push({
      id: ring,
      points,
      radius,
      colors,
      segments,
      opacity: 0.4 + (ring / ringCount) * 0.3,
      delay: ring * 0.2
    });
  }
  
  return rings;
}


export default function HypnoticAuraVisual({ aura, completionRatio, tier = 1, minutesPracticed = 1, sessionsThisMonth = 1, consecutiveDays = 0 }) {
  // Calculate practice days for exponential growth
  const totalPracticeDays = Math.max(sessionsThisMonth, consecutiveDays);
  
  // Generate flowing rings
  const flowingRings = useMemo(() => generateFlowingRings(totalPracticeDays), [totalPracticeDays]);
  
  // Size grows with practice
  const baseSize = 200;
  const size = Math.min(baseSize + (totalPracticeDays * 10), 400);
  
  // Glow intensity - exponential
  const glowIntensity = Math.min(0.4 + (totalPracticeDays * 0.12) + Math.pow(totalPracticeDays, 1.3) * 0.04, 1.0);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="absolute inset-0"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Gradient definitions for segmented rings */}
          {flowingRings.map((ring, ringIndex) => (
            <linearGradient key={`gradient-${ringIndex}`} id={`ringGradient-${ringIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              {ring.colors.map((color, colorIndex) => (
                <stop 
                  key={colorIndex}
                  offset={`${(colorIndex / ring.colors.length) * 100}%`} 
                  stopColor={color} 
                  stopOpacity={ring.opacity * glowIntensity}
                />
              ))}
            </linearGradient>
          ))}
          
          {/* Soft blur for organic edges */}
          <filter id="softBlur">
            <feGaussianBlur stdDeviation="1" result="blur" />
          </filter>
        </defs>

        {/* Flowing, segmented rings - overlapping and organic */}
        {flowingRings.map((ring) => {
          // Create path from points
          const pathData = ring.points.map((point, i) => {
            return i === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`;
          }).join(' ') + ' Z';
          
          return (
            <motion.g key={ring.id}>
              {/* Main ring path with gradient */}
              <motion.path
                d={pathData}
                fill={`url(#ringGradient-${ring.id})`}
                opacity={ring.opacity * glowIntensity}
                filter="url(#softBlur)"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: [
                    ring.opacity * glowIntensity * 0.7,
                    ring.opacity * glowIntensity,
                    ring.opacity * glowIntensity * 0.7
                  ],
                  scale: [1, 1.02 + (ring.id * 0.01), 1],
                  rotate: totalPracticeDays > 1 ? [0, 360] : [0, 0]
                }}
                transition={{
                  opacity: {
                    duration: 4 + ring.id * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: ring.delay
                  },
                  scale: {
                    duration: 6 + ring.id * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: ring.delay
                  },
                  rotate: {
                    duration: 30 + (ring.id * 5),
                    repeat: Infinity,
                    ease: "linear",
                    delay: ring.delay
                  }
                }}
              />
              
              {/* Segmented color sections within ring */}
              {ring.points.map((point, i) => {
                const nextPoint = ring.points[(i + 1) % ring.points.length];
                const centerX = 50;
                const centerY = 50;
                
                // Create segment path
                const segmentPath = `M ${centerX} ${centerY} L ${point.x} ${point.y} L ${nextPoint.x} ${nextPoint.y} Z`;
                const colorIndex = Math.floor((i / ring.points.length) * ring.colors.length);
                const segmentColor = ring.colors[colorIndex % ring.colors.length];
                
                return (
                  <motion.path
                    key={`segment-${ring.id}-${i}`}
                    d={segmentPath}
                    fill={segmentColor}
                    opacity={ring.opacity * glowIntensity * 0.6}
                    filter="url(#softBlur)"
                    animate={{
                      opacity: [
                        ring.opacity * glowIntensity * 0.4,
                        ring.opacity * glowIntensity * 0.7,
                        ring.opacity * glowIntensity * 0.4
                      ]
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: (ring.delay + i * 0.1)
                    }}
                  />
                );
              })}
            </motion.g>
          );
        })}

      </svg>
    </div>
  );
}
