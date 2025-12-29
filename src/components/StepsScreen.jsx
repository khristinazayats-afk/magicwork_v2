import { motion } from 'framer-motion';

export default function StepsScreen({ onContinue, onBack }) {
  return (
    <div className="full-viewport w-full bg-[#fcf8f2] overflow-hidden">
      {/* Title & Steps Area */}
      <div
        className="absolute inset-0 px-8 z-10 flex flex-col"
        style={{ 
          paddingTop: 'env(safe-area-inset-top, 24px)',
          paddingBottom: 'calc(15% + env(safe-area-inset-bottom, 0px) + 4.5rem)' 
        }}
      >
        <div className="w-full max-w-md md:max-w-4xl mx-auto flex flex-col h-full justify-center">
          {/* H1 - Block 1 - top */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-shrink-0 mb-12 md:mb-16"
          >
            <h1 className="font-actay font-bold text-[#172223] text-[24px] md:text-[36px] text-left md:text-center">
              What to expect inside
            </h1>
          </motion.div>

          {/* OL list - Block 2 - centered between title and CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-shrink-0 flex justify-start md:justify-center w-full"
          >
            <ol className="grid grid-rows-3 gap-7 md:gap-10 md:max-w-2xl w-full md:w-auto">
              <li className="grid grid-cols-[2.5rem_1fr] md:grid-cols-[3rem_1fr] items-center gap-4 md:gap-5">
                <div className="w-8 md:w-10 flex justify-center">
                  <img src="/assets/icons/leaf.svg" alt="Leaf icon" className="w-7 h-7 md:w-10 md:h-10" loading="lazy" decoding="async" fetchpriority="low" />
                </div>
                <div className="flex-1">
                  <p className="font-hanken font-semibold text-[#172223] text-base md:text-xl leading-snug uppercase">9 Calm Spaces</p>
                  <p className="font-hanken text-[#172223]/70 text-sm md:text-lg leading-snug">Enter and stay where it resonates most.</p>
                </div>
              </li>
              <li className="grid grid-cols-[2.5rem_1fr] md:grid-cols-[3rem_1fr] items-center gap-4 md:gap-5">
                <div className="w-8 md:w-10 flex justify-center">
                  <img src="/assets/icons/heart.svg" alt="Heart icon" className="w-7 h-7 md:w-10 md:h-10" loading="lazy" decoding="async" fetchpriority="low" />
                </div>
                <div className="flex-1">
                  <p className="font-hanken font-semibold text-[#172223] text-base md:text-xl leading-snug uppercase">Practice Presence</p>
                  <p className="font-hanken text-[#172223]/70 text-sm md:text-lg leading-snug">Build awareness through breath, stillness, and creativity.</p>
                </div>
              </li>
              <li className="grid grid-cols-[2.5rem_1fr] md:grid-cols-[3rem_1fr] items-center gap-4 md:gap-5">
                <div className="w-8 md:w-10 flex justify-center">
                  <img src="/assets/icons/yogi.svg" alt="Yogi icon" className="w-7 h-7 md:w-10 md:h-10" loading="lazy" decoding="async" fetchpriority="low" />
                </div>
                <div className="flex-1">
                  <p className="font-hanken font-semibold text-[#172223] text-base md:text-xl leading-snug uppercase">Nervous System, Strong</p>
                  <p className="font-hanken text-[#172223]/70 text-sm md:text-lg leading-snug">Show up daily and observe benefits of pausing.</p>
                </div>
              </li>
            </ol>
          </motion.div>
        </div>
      </div>

      {/* Continue Button - positioned at same height as splash screen mint button */}
      {/* 15% from bottom for mobile, 20% for desktop - matches splash screen */}
      <div className="absolute left-0 right-0 px-8 z-20 cta-bottom">
        <div className="w-full max-w-md mx-auto">
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            whileTap={{ scale: 0.95, opacity: 0.9 }}
            whileHover={{ scale: 1.02 }}
            onClick={onContinue}
            className="w-full h-14 rounded-full bg-[#1e2d2e]/90 backdrop-blur-sm text-white font-hanken font-semibold text-base"
            style={{ boxShadow: '0 4px 16px rgba(30, 45, 46, 0.25)' }}
          >
            Let's begin
          </motion.button>
        </div>
      </div>
    </div>
  );
}
