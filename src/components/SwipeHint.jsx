import { motion } from 'framer-motion';

export default function SwipeHint() {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Up arrow */}
      <motion.div
        animate={{ 
          y: [-3, 0, -3], 
          opacity: [0.3, 0.6, 0.3] 
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 2,
          ease: "easeInOut",
          delay: 0
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 15l-6-6-6 6" stroke="#1e2d2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
        </svg>
      </motion.div>
      
      {/* Down arrow */}
      <motion.div
        animate={{ 
          y: [0, 3, 0], 
          opacity: [0.6, 0.3, 0.6] 
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 2,
          ease: "easeInOut",
          delay: 0
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 9l6 6 6-6" stroke="#1e2d2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
        </svg>
      </motion.div>
    </div>
  );
}
