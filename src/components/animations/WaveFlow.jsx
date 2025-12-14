import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';

// Design System Constants
const PARTICLE_COLOR = 'rgba(30, 45, 46, 0.6)';
const PARTICLE_SIZE = 6;
const WAVE_WIDTH = 300;
const WAVE_HEIGHT = 150;
const PARTICLE_COUNT = 30;

export default function WaveFlow({ isActive }) {
  const [cycleProgress, setCycleProgress] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const startTime = Date.now();
    const cycleDuration = 8000; // 8 seconds per wave cycle

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setCycleProgress((elapsed % cycleDuration) / cycleDuration);
    }, 16);

    return () => clearInterval(interval);
  }, [isActive]);

  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      offset: i / PARTICLE_COUNT,
      verticalOffset: (Math.random() - 0.5) * 20 // Random vertical dispersion
    }));
  }, []);

  const getWavePosition = (progress, verticalOffset) => {
    const x = (progress * WAVE_WIDTH) - (WAVE_WIDTH / 2);
    // Sine wave with amplitude
    const y = Math.sin(progress * Math.PI * 4) * 40 + verticalOffset;
    return { x, y };
  };

  if (!isActive) return null;

  return (
    <div className="relative" style={{ width: WAVE_WIDTH, height: WAVE_HEIGHT }}>
      {/* Wave path guide - subtle */}
      <svg 
        className="absolute inset-0" 
        width={WAVE_WIDTH}
        height={WAVE_HEIGHT}
        style={{ transform: 'translate(-50%, -50%)', left: '50%', top: '50%' }}
      >
        <path
          d={`M 0,${WAVE_HEIGHT / 2} ${Array.from({ length: 50 }, (_, i) => {
            const x = (i / 49) * WAVE_WIDTH;
            const y = Math.sin((i / 49) * Math.PI * 4) * 40 + (WAVE_HEIGHT / 2);
            return `L ${x},${y}`;
          }).join(' ')}`}
          fill="none"
          stroke="rgba(30, 45, 46, 0.15)"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
      </svg>

      {/* Flowing particles along wave */}
      <div className="absolute inset-0" style={{ transform: 'translate(-50%, -50%)', left: '50%', top: '50%' }}>
        {particles.map((particle) => {
          const particleProgress = (cycleProgress + particle.offset) % 1;
          const pos = getWavePosition(particleProgress, particle.verticalOffset);
          
          return (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: '50%',
                top: '50%',
                x: pos.x,
                y: pos.y,
                width: `${PARTICLE_SIZE}px`,
                height: `${PARTICLE_SIZE}px`,
                backgroundColor: PARTICLE_COLOR,
              }}
              animate={{ 
                opacity: [0.3, 0.7, 0.3],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: particle.offset * 2.5
              }}
            />
          );
        })}
      </div>

      {/* Start and end markers */}
      <div
        className="absolute w-2 h-2 rounded-full bg-[#1e2d2e]/20"
        style={{ left: 0, top: '50%', transform: 'translateY(-50%)' }}
      />
      <div
        className="absolute w-2 h-2 rounded-full bg-[#1e2d2e]/20"
        style={{ right: 0, top: '50%', transform: 'translateY(-50%)' }}
      />
    </div>
  );
}

