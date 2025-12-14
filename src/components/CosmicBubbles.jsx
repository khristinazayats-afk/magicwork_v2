import { motion } from 'framer-motion';
import { useMemo } from 'react';

const natureIcons = ['🍄', '🍃', '🌿', '🌱', '🌾', '🪵', '🌸', '🪷', '🍂', '🌺'];

export default function CosmicBubbles({ participantCount }) {
  // Generate random positions and icons for each participant
  const bubbles = useMemo(() => {
    return Array.from({ length: Math.min(participantCount, 40) }, (_, i) => {
      const angle = (i / participantCount) * Math.PI * 2;
      const radius = 35 + (Math.random() * 15); // 35-50% from center
      
      return {
        id: i,
        icon: natureIcons[Math.floor(Math.random() * natureIcons.length)],
        x: 50 + Math.cos(angle) * radius + (Math.random() - 0.5) * 10, // Add some randomness
        y: 50 + Math.sin(angle) * radius + (Math.random() - 0.5) * 10,
        size: 28 + Math.random() * 16, // 28-44px
        delay: Math.random() * 2, // Stagger animation
        duration: 3 + Math.random() * 2, // 3-5s float cycle
        floatRange: 8 + Math.random() * 12 // 8-20px float distance
      };
    });
  }, [participantCount]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-5">
      {/* Subtle cosmic glow effect */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.08) 0%, transparent 60%)'
        }}
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Connection lines - subtle */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <defs>
          <radialGradient id="lineGradient">
            <stop offset="0%" stopColor="#1e2d2e" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#1e2d2e" stopOpacity="0" />
          </radialGradient>
        </defs>
        {bubbles.slice(0, 15).map((bubble, i) => {
          const nextBubble = bubbles[(i + 1) % bubbles.length];
          return (
            <motion.line
              key={`line-${bubble.id}`}
              x1={`${bubble.x}%`}
              y1={`${bubble.y}%`}
              x2={`${nextBubble.x}%`}
              y2={`${nextBubble.y}%`}
              stroke="url(#lineGradient)"
              strokeWidth="0.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ duration: 2, delay: bubble.delay }}
            />
          );
        })}
      </svg>

      {/* Floating nature bubbles */}
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute"
          initial={{ 
            opacity: 0, 
            scale: 0,
            left: `${bubble.x}%`,
            top: `${bubble.y}%`
          }}
          animate={{ 
            opacity: 0.7,
            scale: 1,
            y: [0, -bubble.floatRange, 0, -bubble.floatRange],
          }}
          transition={{
            opacity: { duration: 1, delay: bubble.delay, ease: "easeOut" },
            scale: { duration: 0.6, delay: bubble.delay, type: "spring", stiffness: 200 },
            y: {
              duration: bubble.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: bubble.delay
            }
          }}
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {/* Bubble glow */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
              filter: 'blur(8px)'
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.6, 0.4]
            }}
            transition={{
              duration: bubble.duration * 0.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: bubble.delay
            }}
          />
          
          {/* Bubble */}
          <div 
            className="absolute inset-0 rounded-full backdrop-blur-sm flex items-center justify-center"
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(30, 45, 46, 0.15)',
              boxShadow: '0 2px 8px rgba(30, 45, 46, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.3)'
            }}
          >
            <span className="text-lg opacity-90" style={{ fontSize: `${bubble.size * 0.5}px` }}>
              {bubble.icon}
            </span>
          </div>

          {/* Shimmer effect */}
          <motion.div
            className="absolute top-1 left-1 w-2 h-2 rounded-full bg-white opacity-60 blur-sm"
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: bubble.delay + 1
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

