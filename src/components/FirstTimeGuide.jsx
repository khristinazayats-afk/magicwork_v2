import { motion } from 'framer-motion';

export default function FirstTimeGuide({ onDismiss }) {
  return (
    <motion.div 
      className="fixed inset-0 z-50 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      {/* Blur overlay - blurs the card underneath */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="absolute inset-0"
        style={{ 
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(255, 255, 255, 0.2)'
        }}
      />

      {/* Content overlay */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="absolute inset-0 flex flex-col items-center justify-center px-8"
      >
        {/* Text content */}
        <div className="text-center space-y-3 mb-8">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="font-hanken font-semibold text-[#1e2d2e] text-xl leading-relaxed"
          >
            There's a space waiting for you.
          </motion.p>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="font-hanken text-[#1e2d2e]/80 text-base leading-relaxed max-w-sm mx-auto"
          >
            Scroll to find the one that fits your moment.
          </motion.p>
        </div>

        {/* Vertical scroll animation (up and down arrows) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex flex-col items-center gap-1"
        >
          {/* Up arrow */}
          <motion.svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            animate={{ y: [-3, 0, -3] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <path
              d="M7 14L12 9L17 14"
              stroke="#1e2d2e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.6"
            />
          </motion.svg>

          {/* Down arrow */}
          <motion.svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            animate={{ y: [3, 0, 3] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <path
              d="M7 10L12 15L17 10"
              stroke="#1e2d2e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.6"
            />
          </motion.svg>
        </motion.div>

        {/* Let's Begin Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          onClick={() => {
            console.log('[FirstTimeGuide] Let\'s begin button clicked');
            if (onDismiss) {
              onDismiss();
            } else {
              console.error('[FirstTimeGuide] onDismiss is not defined!');
            }
          }}
          className="mt-8 px-8 py-3 bg-[#1e2d2e] text-white font-hanken font-semibold rounded-full shadow-lg hover:bg-[#2a3d3e] transition-colors pointer-events-auto"
        >
          Let's begin
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

