import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import ProfileScreen from './ProfileScreen';

export default function SettingsBottomSheet({ isOpen, onClose }) {
  const [showProfile, setShowProfile] = useState(false);
  
  // Mock user settings
  const settingsItems = [
    { id: 'profile', label: 'Profile' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'about', label: 'About' },
    { id: 'help', label: 'Help & Support' }
  ];
  
  if (showProfile) {
    return <ProfileScreen onBack={() => setShowProfile(false)} />;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Side Drawer - slides from left */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 z-50 bg-white w-80 max-w-[85vw] overflow-y-auto shadow-2xl"
            style={{ paddingTop: 'env(safe-area-inset-top,24px)', paddingBottom: 'env(safe-area-inset-bottom,24px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#1e2d2e]/10">
              <h3 className="font-hanken text-xl font-semibold text-[#1e2d2e]">Settings</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-[#1e2d2e]/5 transition-colors"
                aria-label="Close"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="#1e2d2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            {/* Settings Items */}
            <div className="p-4 space-y-1">
              {settingsItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'profile') {
                      setShowProfile(true);
                    } else {
                      console.log(`Settings item clicked: ${item.id}`);
                      // Handle other settings items
                    }
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-3 rounded-xl bg-transparent hover:bg-[#1e2d2e]/5 transition-colors flex items-center justify-between text-left"
                >
                  <span className="font-hanken text-base text-[#1e2d2e]">{item.label}</span>
                  <svg 
                    className="w-5 h-5 text-[#1e2d2e]/40" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

