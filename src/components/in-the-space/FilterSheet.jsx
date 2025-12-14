import { motion, AnimatePresence } from 'framer-motion';

export function FilterSheet({ isOpen, onClose, filter, onFilterChange }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 max-h-[60vh] overflow-y-auto"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 24px)' }}
          >
            <div className="w-12 h-1 bg-[#1e2d2e] opacity-20 rounded-full mx-auto mb-6" />
            <h3 className="font-hanken text-xl font-semibold text-[#1e2d2e] mb-6">Filter</h3>
            <div className="space-y-3">
              {['All', 'Practices', 'Sounds', 'Favorited'].map((filterName) => (
                <button
                  key={filterName}
                  onClick={() => {
                    onFilterChange(filterName);
                    onClose();
                  }}
                  className={filter === filterName ? 'w-full px-6 py-4 rounded-full font-hanken text-base transition-all bg-[#1e2d2e] text-white' : 'w-full px-6 py-4 rounded-full font-hanken text-base transition-all bg-white bg-opacity-70 text-[#1e2d2e] border border-[#1e2d2e] border-opacity-20'}
                >
                  {filterName}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

