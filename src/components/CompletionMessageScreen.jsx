import { motion, AnimatePresence } from 'framer-motion';
import { getCompletionMessageByDuration } from '../constants/completionMessages';

/**
 * Completion Message Screen
 * Shows custom encouraging message when practice finishes
 */
export default function CompletionMessageScreen({
  isOpen,
  onClose,
  durationSeconds,
  message
}) {
  if (!isOpen) return null;

  const displayMessage = message || getCompletionMessageByDuration(durationSeconds);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[110] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl p-8 md:p-10 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-6xl mb-6"
          >
            ✨
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-hanken text-xl md:text-2xl font-semibold text-[#1e2d2e] mb-4 leading-relaxed"
          >
            {displayMessage}
          </motion.p>

          {durationSeconds > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="font-hanken text-[#1e2d2e]/60 text-sm md:text-base mb-6"
            >
              {Math.floor(durationSeconds / 60)} minutes of presence
            </motion.p>
          )}

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={onClose}
            whileTap={{ scale: 0.95 }}
            className="w-full px-6 py-4 rounded-full bg-[#1e2d2e] text-white font-hanken font-semibold text-base md:text-lg hover:bg-[#1e2d2e]/90 transition-all"
          >
            Continue
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

