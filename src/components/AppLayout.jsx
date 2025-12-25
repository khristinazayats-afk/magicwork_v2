import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Practice', path: '/feed', icon: '🧘' },
    { name: 'Profile', path: '/profile', icon: '👤' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#fcf8f2] flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#fcf8f2]/80 backdrop-blur-sm border-b border-[#1e2d2e]/5 z-50">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e2d2e" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h1 className="font-hanken font-bold text-[#1e2d2e] text-lg">Magiwork</h1>
        <div className="w-10" />
      </div>

      {/* Desktop Sidebar */}
      <motion.aside 
        className={`fixed md:relative inset-y-0 left-0 w-64 bg-white border-r border-[#1e2d2e]/5 z-50 transform md:transform-none transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="h-full flex flex-col p-6">
          <div className="mb-12">
            <h1 className="font-hanken font-bold text-[24px] text-[#1e2d2e]">Magiwork</h1>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
                  isActive(item.path) 
                    ? 'bg-[#1e2d2e] text-white shadow-lg' 
                    : 'text-[#1e2d2e]/60 hover:bg-[#1e2d2e]/5 hover:text-[#1e2d2e]'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-hanken font-semibold">{item.name}</span>
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-[#1e2d2e]/5">
            <p className="text-[10px] font-hanken text-[#1e2d2e]/30 uppercase tracking-widest text-center">
              Shared Stillness
            </p>
          </div>
        </div>

        {/* Mobile Sidebar Close Button */}
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2 text-[#1e2d2e]/40"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto">
        {children}
      </main>

      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
        />
      )}
    </div>
  );
}





