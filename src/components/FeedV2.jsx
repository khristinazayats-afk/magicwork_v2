import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getWeeklyStats } from '../utils/weeklyTracking';
import { getCurrentVibe, calculateCurrentVibe, getWeeklyMinutes } from '../utils/vibeSystem';
import { getCurrentStreak } from '../utils/sessionTracking';
import stationsData from '../data/stations.json';
import SettingsBottomSheet from './SettingsBottomSheet';
import ProfileScreen from './ProfileScreen';
import ProgressStats from './ProgressStats';
import HomeScreenSummary from './HomeScreenSummary';
import PracticeCard from './PracticeCard';
import { getRecommendedSpaceWithReason } from '../services/suggestionsService';
import { supabase } from '../lib/supabase';

const INITIAL_STATIONS = stationsData?.stations || [];

export default function FeedV2() {
  const [spaces] = useState(INITIAL_STATIONS);
  const [greeting, setGreeting] = useState('Good afternoon');
  const [recommendedSpace, setRecommendedSpace] = useState(null);
  const [recommendedReason, setRecommendedReason] = useState('');
  const [weeklyStats, setWeeklyStats] = useState(() => getWeeklyStats());
  const [currentVibe, setCurrentVibe] = useState(null);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeSpaceIndex, setActiveSpaceIndex] = useState(null);
  const [isAdminDesktop, setIsAdminDesktop] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Good morning');
    else if (hour >= 12 && hour < 17) setGreeting('Good afternoon');
    else if (hour >= 17 && hour < 21) setGreeting('Good evening');
    else setGreeting('Good night');

    (async () => {
      const rec = await getRecommendedSpaceWithReason(spaces);
      if (rec?.space) {
        setRecommendedSpace(rec.space);
        setRecommendedReason(rec.reason || '');
      }
    })();
  }, [spaces]);

  // Check admin access for desktop-only badge
  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const width = window.innerWidth || document.documentElement.clientWidth;
        if (width < 1024) {
          if (mounted) setIsAdminDesktop(false);
          return;
        }
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (mounted) setIsAdminDesktop(false);
          return;
        }
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role, is_admin')
          .eq('user_id', user.id)
          .maybeSingle();
        const isAdmin = Boolean(
          (profile && (profile.role === 'admin' || profile.is_admin === true)) ||
          (user.email && user.email.endsWith('@magicwork.app'))
        );
        if (mounted) setIsAdminDesktop(isAdmin);
      } catch {
        if (mounted) setIsAdminDesktop(false);
      }
    }
    check();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const stats = getWeeklyStats();
    const minutes = getWeeklyMinutes();
    const streak = getCurrentStreak();
    
    const vibeData = getCurrentVibe();
    const vibe = calculateCurrentVibe(minutes, stats.daysThisWeek, streak);
    
    setWeeklyStats(stats);
    setWeeklyMinutes(minutes);
    setCurrentVibe({
      ...vibeData,
      vibe,
      totalMinutes: minutes
    });
  }, []);

  const handleJoin = (index) => {
    setActiveSpaceIndex(index);
  };

  const handleLeave = () => {
    setActiveSpaceIndex(null);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-pink-50/20 via-violet-50/20 via-orange-50/15 via-sage-50/40 to-sky-50/30 relative scroll-container">
        {/* Mobile Hamburger Menu */}
        {activeSpaceIndex === null && (
          <motion.button
            onClick={() => setShowSettings(true)}
            whileTap={{ scale: 0.9 }}
            className="md:hidden fixed top-4 left-4 z-40 p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-sm"
            aria-label="Menu"
            style={{ marginTop: 'env(safe-area-inset-top, 0)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12h18M3 6h18M3 18h18" stroke="#1e2d2e" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </motion.button>
        )}

        {/* Header */}
        {activeSpaceIndex === null && (
          <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-sage-100/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage-400 via-violet-300 via-orange-300 to-pink-300 flex items-center justify-center">
                    <img 
                      src="/assets/logos/magicwork-bw/PNG/B&W_Logo Design - MagicWork (V001)-12.png" 
                      alt="Magicwork"
                      className="w-8 h-8"
                    />
                  </div>
                  <h1 className="text-xl font-serif font-semibold text-sage-800">Magicwork</h1>
                </div>
                {isAdminDesktop && (
                  <a
                    href="/admin/analytics"
                    className="hidden md:inline-flex px-3 py-2 rounded-xl bg-sage-100 hover:bg-sage-200 transition-colors text-sage-700 text-sm font-medium"
                    title="Admin Analytics"
                  >
                    Admin
                  </a>
                )}
                <button
                  onClick={() => setShowProfile(true)}
                  className="w-10 h-10 rounded-full bg-sage-100 hover:bg-sage-200 transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 text-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {activeSpaceIndex === null && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Greeting Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <h2 className="text-4xl font-serif font-bold text-sage-800 mb-2">{greeting}</h2>
              <p className="text-sage-600 text-lg">Find your center with guided practices</p>
            </motion.div>

            {/* Progress Stats */}
            <div className="mb-8">
              <ProgressStats />
            </div>

            {/* Vibe Summary */}
            <div className="mb-8">
              <HomeScreenSummary variant="white" onVibeClick={() => setShowProfile(true)} />
            </div>

            {/* Featured Practice */}
            {recommendedSpace && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-12"
              >
                <h3 className="text-xl font-serif font-semibold text-sage-800 mb-1">Recommended for You</h3>
                {recommendedReason && (
                  <p className="text-sm text-sage-600 mb-4">{recommendedReason}</p>
                )}
                <motion.div
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleJoin(spaces.indexOf(recommendedSpace))}
                  className="bg-gradient-to-r from-sage-300 via-violet-200 via-orange-200 to-pink-200 rounded-3xl p-8 text-sage-900 relative overflow-hidden cursor-pointer group hover:scale-[1.01] transition-transform duration-150 will-change-transform"
                >
                  <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 rounded-full bg-white/40 text-sage-800 text-xs font-bold uppercase tracking-wider">
                        Quick Start
                      </span>
                    </div>
                    <h4 className="text-2xl font-serif font-bold mb-2">{recommendedSpace.name}</h4>
                    <p className="text-sage-700 mb-6">{recommendedSpace.description || 'A space to come back to center, together'}</p>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoin(spaces.indexOf(recommendedSpace));
                        }}
                        className="bg-white/90 text-sage-700 px-6 py-3 rounded-xl font-medium hover:bg-white transition-colors"
                      >
                        Start Practice
                      </button>
                      <div className="w-12 h-12 rounded-full bg-white/40 flex items-center justify-center text-sage-800">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 5l8 7-8 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Practices Grid */}
            <div>
              <h3 className="text-xl font-serif font-semibold text-sage-800 mb-4">All Practices</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {spaces.map((space, index) => (
                  <motion.div
                    key={space.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleJoin(index)}
                    className="group bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-sage-100/50 hover:scale-[1.02] will-change-transform"
                  >
                    <div className="w-full h-48 rounded-xl bg-gradient-to-br from-sky-100 via-violet-100 via-orange-100 to-pink-100 mb-4 flex items-center justify-center overflow-hidden">
                      <div className="text-6xl opacity-40">
                        {space.name.includes('Morning') ? '🌅' : 
                         space.name.includes('Sleep') ? '🌙' : 
                         space.name.includes('Walk') ? '🚶' : 
                         space.name.includes('Draw') ? '✏️' : 
                         space.name.includes('Move') ? '💃' : 
                         space.name.includes('Breathe') ? '🫁' : 
                         space.name.includes('Flow') ? '🌀' : 
                         space.name.includes('Ground') ? '🌱' : '🧘'}
                      </div>
                    </div>

                    <h4 className="text-xl font-serif font-semibold text-sage-800 mb-2 group-hover:text-sage-600 transition-colors">
                      {space.name}
                    </h4>
                    <p className="text-sage-600 text-sm mb-4 line-clamp-2">
                      {space.description || 'A space for mindful presence and healing'}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-sage-100">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#E52431] animate-pulse" />
                        <span className="text-xs text-sage-500 font-medium">
                          Live Now
                        </span>
                      </div>
                      <span className="text-sage-600 text-sm font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Start <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Practice Card View (Mobile) */}
        {activeSpaceIndex !== null && (
          <div className="fixed inset-0 z-40 md:hidden">
            <PracticeCard
              station={spaces[activeSpaceIndex]}
              isActive={true}
              hasInteracted={true}
              showFirstTimeHint={false}
              swipeHintReady={true}
              onBack={handleLeave}
              currentIndex={activeSpaceIndex + 1}
              totalPractices={spaces.length}
              onJoin={() => {}}
              onLeave={handleLeave}
              isCurrentlyActive={true}
            />
          </div>
        )}
      </div>

      {/* Settings Bottom Sheet */}
      <SettingsBottomSheet isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Profile Screen */}
      {showProfile && (
        <ProfileScreen onBack={() => setShowProfile(false)} />
      )}
    </>
  );
}
