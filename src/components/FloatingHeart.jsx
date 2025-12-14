import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function FloatingHeart({ onComplete, startX }) {
  const [randomSeed] = useState(() => Math.random() * Math.PI * 2); // Random seed for wave pattern

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 6000); // Even slower - 6 seconds
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Create smooth wave motion path with dramatic left/right movement
  const waveKeyframes = Array.from({ length: 15 }, (_, i) => {
    const progress = i / 14;
    // More wave cycles and larger amplitude for dramatic movement
    const waveOffset = Math.sin((progress * Math.PI * 4.5) + randomSeed) * 140;
    return waveOffset;
  });

  return (
    <motion.div
      initial={{ 
        y: 0, 
        opacity: 1, 
        scale: 1, 
        x: 0,
        rotate: 0
      }}
      animate={{ 
        y: -900, // Float all the way up (beyond screen height)
        opacity: [1, 1, 1, 1, 1, 0.95, 0.8, 0], // Stay visible much longer, fade at end
        scale: [1, 1.25, 1.2, 1.15, 1.12, 1.1, 1.08, 1.05], // Gentle grow
        x: waveKeyframes, // Dramatic smooth fluid wave motion
        rotate: [0, 7, -7, 10, -10, 9, -9, 7, -7, 5, -5, 3, -3, 2, 0] // Smooth rocking
      }}
      transition={{ 
        duration: 6, // Even slower for more graceful movement
        ease: "linear", // Constant speed
        opacity: {
          times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1],
          duration: 6,
          ease: "easeInOut"
        },
        scale: {
          times: [0, 0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 1],
          duration: 6,
          ease: "easeOut"
        },
        y: {
          duration: 6,
          ease: "linear" // Constant upward speed
        },
        x: {
          times: [0, 0.07, 0.14, 0.21, 0.28, 0.35, 0.42, 0.5, 0.57, 0.64, 0.71, 0.78, 0.85, 0.92, 1],
          duration: 6,
          ease: "easeInOut" // Smooth fluid motion
        },
        rotate: {
          times: [0, 0.07, 0.14, 0.21, 0.28, 0.35, 0.42, 0.5, 0.57, 0.64, 0.71, 0.78, 0.85, 0.92, 1],
          duration: 6,
          ease: "easeInOut"
        }
      }}
      className="absolute pointer-events-none text-4xl z-50"
      style={{ 
        bottom: '11rem', // Start from Send Heart button vertical position
        left: startX || '75%', // Use passed position or default to right button
        transform: 'translateX(-50%)',
        filter: 'drop-shadow(0 4px 16px rgba(255, 105, 180, 0.4))' // More glow
      }}
    >
      💗
    </motion.div>
  );
}

