import { motion } from 'framer-motion';

export default function FortressIcon() {
  return (
    <div className="relative w-56 h-56 mx-auto mb-8">
      {/* Subtle radial glow */}
      <motion.div
        className="absolute inset-0 rounded-full blur-3xl opacity-25"
        style={{
          background: 'radial-gradient(circle, #94D1C4 0%, #FFAF42 40%, transparent 70%)'
        }}
        animate={{
          opacity: [0.2, 0.35, 0.2],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Fortress SVG */}
      <motion.svg
        viewBox="0 0 120 120"
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <defs>
          {/* Gradient for depth */}
          <linearGradient id="stoneGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#BDB2CD" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#BDB2CD" stopOpacity="1" />
          </linearGradient>
          
          <linearGradient id="mintGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#94D1C4" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#94D1C4" stopOpacity="1" />
          </linearGradient>
          
          {/* Shield reinforcement effect */}
          <radialGradient id="shieldGlow">
            <stop offset="0%" stopColor="#FFAF42" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FFAF42" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Building up animation - foundation layer */}
        <motion.g
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          style={{ transformOrigin: "60px 85px" }}
        >
          {/* Base foundation */}
          <rect x="25" y="80" width="70" height="5" fill="#1e2d2e" opacity="0.3" />
        </motion.g>
        
        {/* Main structure builds up */}
        <motion.g
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
          style={{ transformOrigin: "60px 85px" }}
        >
          {/* Left wall */}
          <path 
            d="M 30 80 L 30 45 L 35 40 L 35 80 Z" 
            fill="url(#mintGradient)"
            stroke="#1e2d2e" 
            strokeWidth="0.5"
            opacity="0.9"
          />
          
          {/* Right wall */}
          <path 
            d="M 90 80 L 90 45 L 85 40 L 85 80 Z" 
            fill="url(#mintGradient)"
            stroke="#1e2d2e" 
            strokeWidth="0.5"
            opacity="0.9"
          />
          
          {/* Main central structure */}
          <rect 
            x="35" 
            y="40" 
            width="50" 
            height="40" 
            fill="url(#mintGradient)" 
            stroke="#1e2d2e"
            strokeWidth="0.5"
            opacity="0.95"
          />
          
          {/* Architectural details - windows */}
          <rect x="42" y="52" width="6" height="8" fill="#1e2d2e" opacity="0.15" rx="0.5" />
          <rect x="57" y="52" width="6" height="8" fill="#1e2d2e" opacity="0.15" rx="0.5" />
          <rect x="72" y="52" width="6" height="8" fill="#1e2d2e" opacity="0.15" rx="0.5" />
          
          {/* Main gate */}
          <path 
            d="M 55 80 L 55 65 Q 55 62 57.5 62 L 62.5 62 Q 65 62 65 65 L 65 80 Z"
            fill="#1e2d2e"
            opacity="0.25"
          />
        </motion.g>
        
        {/* Towers build up */}
        <motion.g
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" }}
          style={{ transformOrigin: "60px 85px" }}
        >
          {/* Left tower */}
          <rect x="20" y="35" width="12" height="45" fill="url(#stoneGradient)" stroke="#1e2d2e" strokeWidth="0.5" />
          <path d="M 20 35 L 26 30 L 32 35 Z" fill="url(#stoneGradient)" stroke="#1e2d2e" strokeWidth="0.5" />
          
          {/* Right tower */}
          <rect x="88" y="35" width="12" height="45" fill="url(#stoneGradient)" stroke="#1e2d2e" strokeWidth="0.5" />
          <path d="M 88 35 L 94 30 L 100 35 Z" fill="url(#stoneGradient)" stroke="#1e2d2e" strokeWidth="0.5" />
          
          {/* Center tower (tallest) */}
          <rect x="53" y="20" width="14" height="60" fill="url(#stoneGradient)" stroke="#1e2d2e" strokeWidth="0.5" />
          <path d="M 53 20 L 60 15 L 67 20 Z" fill="url(#stoneGradient)" stroke="#1e2d2e" strokeWidth="0.5" />
        </motion.g>
        
        {/* Reinforcement shield - expands outward showing strength */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8, type: "spring", stiffness: 150 }}
        >
          {/* Outer reinforcement ring */}
          <motion.circle
            cx="60"
            cy="50"
            r="18"
            fill="none"
            stroke="#FFAF42"
            strokeWidth="1.5"
            opacity="0.4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.8, 1.1, 1], opacity: [0, 0.4, 0.25] }}
            transition={{ delay: 1.4, duration: 1.2, ease: "easeOut" }}
          />
          
          {/* Shield emblem */}
          <path
            d="M 60 38 Q 65 38 68 42 L 68 48 Q 68 55 60 60 Q 52 55 52 48 L 52 42 Q 55 38 60 38 Z"
            fill="#fcf8f2"
            stroke="#1e2d2e"
            strokeWidth="0.5"
            opacity="0.95"
          />
          
          {/* Shield detail */}
          <path
            d="M 60 42 L 60 56"
            stroke="#FFAF42"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M 55 48 L 65 48"
            stroke="#FFAF42"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.8"
          />
        </motion.g>
        
        {/* Energy pulses showing fortification - very subtle */}
        <motion.circle
          cx="60"
          cy="50"
          r="20"
          fill="url(#shieldGlow)"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ 
            scale: [0.5, 1.5, 1.8],
            opacity: [0.4, 0.15, 0]
          }}
          transition={{
            delay: 1.5,
            duration: 2,
            ease: "easeOut"
          }}
        />
        
        {/* Cute flags on towers - appear after fortress is built */}
        <motion.g
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.4 }}
        >
          {/* Left tower flag */}
          <motion.path
            d="M 26 28 L 26 20 L 30 22 L 26 24 Z"
            fill="#FFAF42"
            animate={{ scaleX: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "26px 22px" }}
          />
          <line x1="26" y1="28" x2="26" y2="20" stroke="#1e2d2e" strokeWidth="0.5" />
          
          {/* Center tower flag */}
          <motion.path
            d="M 60 13 L 60 5 L 64 7 L 60 9 Z"
            fill="#94D1C4"
            animate={{ scaleX: [1, 1.15, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            style={{ transformOrigin: "60px 7px" }}
          />
          <line x1="60" y1="13" x2="60" y2="5" stroke="#1e2d2e" strokeWidth="0.5" />
          
          {/* Right tower flag */}
          <motion.path
            d="M 94 28 L 94 20 L 98 22 L 94 24 Z"
            fill="#BDB2CD"
            animate={{ scaleX: [1, 1.15, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            style={{ transformOrigin: "94px 22px" }}
          />
          <line x1="94" y1="28" x2="94" y2="20" stroke="#1e2d2e" strokeWidth="0.5" />
        </motion.g>
        
        {/* Cute sparkles around fortress - staggered appearance */}
        <motion.g>
          {/* Top sparkle */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.3 }}
          >
            <motion.circle
              cx="60"
              cy="8"
              r="1.5"
              fill="#FFAF42"
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.path
              d="M 60 6 L 60 10 M 58 8 L 62 8"
              stroke="#FFAF42"
              strokeWidth="0.8"
              strokeLinecap="round"
              animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "60px 8px" }}
            />
          </motion.g>
          
          {/* Left sparkle */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.3 }}
          >
            <motion.circle
              cx="15"
              cy="40"
              r="1.2"
              fill="#94D1C4"
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2.3, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            />
            <motion.path
              d="M 15 38.5 L 15 41.5 M 13.5 40 L 16.5 40"
              stroke="#94D1C4"
              strokeWidth="0.7"
              strokeLinecap="round"
              animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2.3, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              style={{ transformOrigin: "15px 40px" }}
            />
          </motion.g>
          
          {/* Right sparkle */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 2.0, duration: 0.3 }}
          >
            <motion.circle
              cx="105"
              cy="40"
              r="1.2"
              fill="#BDB2CD"
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            />
            <motion.path
              d="M 105 38.5 L 105 41.5 M 103.5 40 L 106.5 40"
              stroke="#BDB2CD"
              strokeWidth="0.7"
              strokeLinecap="round"
              animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              style={{ transformOrigin: "105px 40px" }}
            />
          </motion.g>
        </motion.g>
      </motion.svg>
    </div>
  );
}

