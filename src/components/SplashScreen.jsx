import { motion } from 'framer-motion';
import { useState } from 'react';

export default function SplashScreen({ onEnter }) {
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleCircleTap = () => {
    setHasInteracted(true);
    onEnter();
  };

  return (
    <div className="full-viewport w-full relative overflow-hidden bg-[#fcf8f2]">

      {/* Main Content positioned from 15% mobile, 20% desktop from top */}
      <div className="absolute top-[15%] md:top-[20%] left-0 right-0 px-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md md:max-w-4xl mx-auto space-y-8 md:space-y-12"
        >
          {/* Logo */}
          <div className="flex justify-start md:justify-center">
            <img 
              src="/assets/logos/magicwork-bw/PNG/B&W_Logo Design - MagicWork (V001)-12.png" 
              alt="MagicWork Logo"
              className="h-20 w-20 md:h-20 md:w-20"
            />
          </div>

          {/* Main Headline */}
          <motion.h1 
            className="font-actay font-bold text-[#172223] text-[24px] leading-tight text-left md:text-center md:text-[36px] md:whitespace-nowrap"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <span className="md:hidden">Join the magic<br />of calm</span>
            <span className="hidden md:inline">Join the magic of calm</span>
          </motion.h1>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-left md:text-center"
          >
            <p className="font-hanken text-[#172223] text-[20px] md:text-[24px] leading-relaxed md:whitespace-nowrap">
              <span className="md:hidden">Nurture your nervous system with mindful presence</span>
              <span className="hidden md:inline">Nurture your nervous system with mindful presence</span>
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Button area positioned at fixed percentage from bottom */}
      {/* 15% from bottom for mobile, 20% for desktop - matches all CTAs */}
      <div className="absolute left-0 right-0 px-8 z-20 cta-bottom">
        <div className="w-full max-w-md md:max-w-4xl mx-auto flex flex-col items-center space-y-3 md:space-y-3">
          {/* Tap Hint - appears above button */}
          {!hasInteracted && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="font-hanken text-[#172223]/60 text-base md:text-base text-center"
            >
              Tap to begin
            </motion.p>
          )}
          
          {/* Mint arrow button - smaller on mobile */}
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCircleTap}
            aria-label="Tap to begin"
            className="p-0 bg-transparent shadow-none"
          >
            <div className="w-[48px] h-[48px] md:w-[64px] md:h-[64px] rounded-full bg-[#94d1c4] flex items-center justify-center shadow-lg">
              <svg className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5l8 7-8 7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Removed bottom-pinned CTA to keep placement consistent with Steps screen */}

      {/* Safe Area Support */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="pt-[env(safe-area-inset-top)]" />
        <div className="pb-[env(safe-area-inset-bottom)]" />
        <div className="pl-[env(safe-area-inset-left)]" />
        <div className="pr-[env(safe-area-inset-right)]" />
      </div>
    </div>
  );
}
