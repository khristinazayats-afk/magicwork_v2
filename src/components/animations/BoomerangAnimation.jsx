import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';

// Design System Constants
const BOOMERANG_SIZE = 300; // Size of the boomerang path
const PARTICLE_COUNT = 40;
const CYCLE_DURATION = 4000; // 4 seconds for full boomerang cycle (out and back)

// Slow Morning color palette
const COLORS = {
  mint: '#94D1C4',
  orange: '#FFAF42',
  purple: '#BDB2CD'
};

export default function BoomerangAnimation({ isActive }) {
  const [cycleProgress, setCycleProgress] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setCycleProgress((elapsed % CYCLE_DURATION) / CYCLE_DURATION);
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [isActive]);

  // Generate particles with varied properties
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      offset: i / PARTICLE_COUNT, // Stagger particles along the path
      size: 4 + Math.random() * 5, // Varied sizes 4-9px
      colorIndex: Math.floor(Math.random() * 3), // Random color from palette
      dispersion: (Math.random() - 0.5) * 15, // Random dispersion perpendicular to path
      speed: 0.8 + Math.random() * 0.4 // Slight speed variation
    }));
  }, []);

  // Calculate boomerang path position
  // Uses a curved trajectory that goes out and comes back (like a boomerang)
  const getBoomerangPosition = (normalizedProgress, particleOffset = 0) => {
    // Combine cycle progress with particle offset
    const t = (normalizedProgress + particleOffset) % 1;
    
    // Create boomerang path: curved trajectory
    // Forward: 0 to 0.5 (going out)
    // Backward: 0.5 to 1 (coming back)
    const isForward = t < 0.5;
    const pathT = isForward ? t * 2 : (1 - t) * 2; // Normalize to 0-1 for each direction
    
    // Boomerang trajectory: starts horizontal, curves up and out, then curves back
    // Use a parametric curve that creates a boomerang-like path
    const maxDistance = BOOMERANG_SIZE * 0.45;
    
    // Horizontal component (main direction)
    const horizontal = pathT * maxDistance * 2 - maxDistance; // Goes from -max to +max
    
    // Vertical component (creates the arc/curve)
    const vertical = Math.sin(pathT * Math.PI) * maxDistance * 0.4; // Arc height
    
    // Add rotation for boomerang effect (rotates as it travels)
    const rotation = pathT * Math.PI * 0.6 - Math.PI * 0.3; // -54° to +54°
    
    // Apply rotation to create the curved boomerang path
    const x = horizontal * Math.cos(rotation) - vertical * Math.sin(rotation);
    const y = horizontal * Math.sin(rotation) + vertical * Math.cos(rotation);
    
    // Calculate angle for perpendicular dispersion
    const angle = Math.atan2(y, x);
    const distance = Math.sqrt(x * x + y * y);
    
    return {
      x,
      y,
      angle,
      distance
    };
  };

  // Get color based on particle's color index
  const getParticleColor = (colorIndex) => {
    const colors = [COLORS.mint, COLORS.orange, COLORS.purple];
    return colors[colorIndex % colors.length];
  };

  if (!isActive) return null;

  return (
    <div className="relative" style={{ width: BOOMERANG_SIZE, height: BOOMERANG_SIZE }}>
      {/* Center marker */}
      <div
        className="absolute w-3 h-3 rounded-full"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: `${COLORS.mint}40`,
          boxShadow: `0 0 12px ${COLORS.mint}60`
        }}
      />

      {/* Boomerang path outline (subtle guide) - optional visual reference */}
      <svg 
        className="absolute inset-0" 
        width={BOOMERANG_SIZE} 
        height={BOOMERANG_SIZE}
        style={{ transform: 'translate(-50%, -50%)', left: '50%', top: '50%', opacity: 0.08 }}
      >
        <path
          d={`M ${BOOMERANG_SIZE / 2} ${BOOMERANG_SIZE / 2} 
              Q ${BOOMERANG_SIZE / 2 + BOOMERANG_SIZE * 0.25} ${BOOMERANG_SIZE / 2 - BOOMERANG_SIZE * 0.2},
                ${BOOMERANG_SIZE / 2 + BOOMERANG_SIZE * 0.4} ${BOOMERANG_SIZE / 2}
              Q ${BOOMERANG_SIZE / 2 + BOOMERANG_SIZE * 0.25} ${BOOMERANG_SIZE / 2 + BOOMERANG_SIZE * 0.2},
                ${BOOMERANG_SIZE / 2} ${BOOMERANG_SIZE / 2}`}
          fill="none"
          stroke={COLORS.mint}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Flowing particles along boomerang path */}
      <div className="absolute inset-0" style={{ transform: 'translate(-50%, -50%)', left: '50%', top: '50%' }}>
        {particles.map((particle) => {
          const particleProgress = (cycleProgress + particle.offset * particle.speed) % 1;
          const pos = getBoomerangPosition(particleProgress, 0);
          
          // Perpendicular offset for dispersion
          const perpAngle = pos.angle + Math.PI / 2;
          const perpX = Math.cos(perpAngle) * particle.dispersion;
          const perpY = Math.sin(perpAngle) * particle.dispersion;
          
          const particleColor = getParticleColor(particle.colorIndex);
          
          // Opacity based on position (fade at start/end, bright in middle)
          const opacity = Math.sin(particleProgress * Math.PI) * 0.5 + 0.5;
          
          return (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: '50%',
                top: '50%',
                x: pos.x + perpX,
                y: pos.y + perpY,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particleColor,
                opacity: opacity * 0.8,
                boxShadow: `0 0 ${particle.size * 2}px ${particleColor}80`
              }}
              animate={{
                opacity: [opacity * 0.6, opacity * 0.9, opacity * 0.6],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                opacity: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: particle.offset * 2
                },
                scale: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: particle.offset * 1.5
                }
              }}
            />
          );
        })}
      </div>

      {/* Additional trailing particles for smoother flow */}
      <div className="absolute inset-0" style={{ transform: 'translate(-50%, -50%)', left: '50%', top: '50%' }}>
        {particles.slice(0, Math.floor(PARTICLE_COUNT * 0.3)).map((particle) => {
          // Create trailing effect with slight delay
          const trailProgress = (cycleProgress + particle.offset * particle.speed - 0.05) % 1;
          if (trailProgress < 0) return null;
          
          const pos = getBoomerangPosition(trailProgress, 0);
          const perpAngle = pos.angle + Math.PI / 2;
          const perpX = Math.cos(perpAngle) * particle.dispersion;
          const perpY = Math.sin(perpAngle) * particle.dispersion;
          
          const particleColor = getParticleColor(particle.colorIndex);
          const opacity = Math.sin(trailProgress * Math.PI) * 0.3 + 0.2;
          
          return (
            <motion.div
              key={`trail-${particle.id}`}
              className="absolute rounded-full"
              style={{
                left: '50%',
                top: '50%',
                x: pos.x + perpX,
                y: pos.y + perpY,
                width: `${particle.size * 0.6}px`,
                height: `${particle.size * 0.6}px`,
                backgroundColor: particleColor,
                opacity: opacity * 0.5,
                boxShadow: `0 0 ${particle.size}px ${particleColor}40`
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

