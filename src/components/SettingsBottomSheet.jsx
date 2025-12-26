import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import ProfileScreen from './ProfileScreen';

export default function SettingsBottomSheet({ isOpen, onClose }) {
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
    navigate('/greeting');
  };

  // Mock user settings
  const settingsItems = [
    { id: 'profile', label: 'My Profile', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy & Safety', icon: '🔒' },
    { id: 'about', label: 'About Magicwork', icon: '🕯️' },
    { id: 'logout', label: 'Logout', icon: '🚪', danger: true }
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
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Side Drawer - slides from left */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 z-50 bg-[#fcf8f2] w-80 max-w-[85vw] overflow-y-auto shadow-2xl flex flex-col"
            style={{ paddingTop: 'env(safe-area-inset-top,24px)', paddingBottom: 'env(safe-area-inset-bottom,24px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-[#1e2d2e]/5">
              <div>
                <h3 className="font-actay text-2xl font-bold text-[#1e2d2e]">Settings</h3>
                <p className="text-[10px] font-hanken text-[#1e2d2e]/40 uppercase tracking-widest mt-1">Version 1.0.0</p>
              </div>
              <button
                onClick={onClose}
                className="p-3 rounded-full bg-[#1e2d2e]/5 hover:bg-[#1e2d2e]/10 transition-colors"
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="#1e2d2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            {/* Settings Items */}
            <div className="p-6 space-y-2 flex-1">
              {settingsItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'profile') {
                      setShowProfile(true);
                    } else if (item.id === 'logout') {
                      handleLogout();
                    } else {
                      console.log(`Settings item clicked: ${item.id}`);
                    }
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full px-5 py-4 rounded-2xl transition-all flex items-center justify-between text-left ${
                    item.danger 
                      ? 'text-red-500 hover:bg-red-50' 
                      : 'text-[#1e2d2e] hover:bg-[#1e2d2e]/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xl opacity-70">{item.icon}</span>
                    <span className="font-hanken font-semibold">{item.label}</span>
                  </div>
                  <svg 
                    className={`w-5 h-5 ${item.danger ? 'text-red-300' : 'text-[#1e2d2e]/20'}`} 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5"
                  >
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.button>
              ))}
            </div>

            <div className="p-8 border-t border-[#1e2d2e]/5 text-center">
              <p className="font-hanken text-[11px] text-[#1e2d2e]/30 leading-relaxed uppercase tracking-[0.2em]">
                Built for humans<br />by Magicwork
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

