import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

export default function MilestoneModal({ milestone, onClose, onWriteNote }) {
  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!milestone) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-[#172223]/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative bg-[#fcf8f2] rounded-2xl p-8 max-w-md w-full shadow-xl"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Title */}
          <h2 className="font-actay font-bold text-[#172223] text-2xl mb-4 text-center">
            {milestone.title}
          </h2>

          {/* Reward copy */}
          <p className="font-hanken text-[#172223]/80 text-base mb-4 text-center leading-relaxed">
            {milestone.reward_copy}
          </p>

          {/* Science link */}
          <p className="font-hanken text-[#172223]/60 text-sm mb-6 text-center italic">
            {milestone.science_link}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onWriteNote}
              className="flex-1 h-12 rounded-full bg-[#1e2d2e]/90 text-white font-hanken font-semibold text-sm hover:bg-[#1e2d2e] transition-colors"
            >
              Write a note
            </button>
            <button
              onClick={onClose}
              className="flex-1 h-12 rounded-full bg-[#172223]/10 text-[#172223] font-hanken font-semibold text-sm hover:bg-[#172223]/20 transition-colors"
            >
              Continue
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

