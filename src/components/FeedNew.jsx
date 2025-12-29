import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import SettingsBottomSheet from './SettingsBottomSheet';
import HomeScreenSummary from './HomeScreenSummary';
import ProfileScreen from './ProfileScreen';
import PracticeCard from './PracticeCard';
import ProgressStats from './ProgressStats';
import QuickPracticeSuggestions from './QuickPracticeSuggestions';
import OnboardingModal from './OnboardingModal';
import stationsData from '../data/stations.json';
import { supabase } from '../lib/supabase';

export default function Feed({ onBack }) {
  const [spaces] = useState(stationsData?.stations || []);
  const [greeting, setGreeting] = useState('Good afternoon');
  const [recommendedSpace, setRecommendedSpace] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeSpaceIndex, setActiveSpaceIndex] = useState(null);
  const [isAdminDesktop, setIsAdminDesktop] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const audioRef = useRef(null);
  const [ambientSound, setAmbientSound] = useState('forest-birds');
  const [isSoundPlaying, setIsSoundPlaying] = useState(true);

  // Verify user account stats on mount
  useEffect(() => {
    async function verifyUserStats() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('User verification failed:', userError);
          return;
        }

        // Check if user has completed onboarding
        const hasOnboarded = localStorage.getItem(`onboarded_${user.id}`);
        if (!hasOnboarded) {
          setShowOnboarding(true);
        }

        // Fetch user's meditation stats
        const { data: stats, error: statsError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (statsError && statsError.code !== 'PGRST116') {
          console.error('Error fetching stats:', statsError);
        }

        // If no stats exist, create initial record
        if (!stats) {
          const { data: newStats, error: insertError } = await supabase
            .from('user_stats')
            .insert([
              {
                user_id: user.id,
                total_sessions: 0,
                total_minutes: 0,
                current_streak: 0,
                longest_streak: 0,
                vibe_level: 1,
                light_points: 0
              }
            ])
            .select()
            .single();

          if (insertError) {
            console.error('Error creating stats:', insertError);
          } else {
            setUserStats(newStats);
          }
        } else {
          setUserStats(stats);
        }

        // Check for admin role
        if (user.user_metadata?.role === 'admin') {
          setIsAdminDesktop(true);
        }
      } catch (err) {
        console.error('Error verifying user:', err);
      }
    }

    verifyUserStats();
  }, []);

  // Update greeting and recommendation based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    let newGreeting = 'Good afternoon';
    let recommendedName = 'Get in the Flow State';

    if (hour >= 5 && hour < 12) {
      newGreeting = 'Good morning';
      recommendedName = 'Slow Morning';
    } else if (hour >= 12 && hour < 17) {
      newGreeting = 'Good afternoon';
      recommendedName = 'Get in the Flow State';
    } else if (hour >= 17 && hour < 21) {
      newGreeting = 'Good evening';
      recommendedName = 'Gentle De-Stress';
    } else {
      newGreeting = 'Good night';
      recommendedName = 'Drift into Sleep';
    }

    setGreeting(newGreeting);
    setRecommendedSpace(spaces.find(s => s.name === recommendedName));
  }, [spaces]);

  const handleJoin = (index) => {
    setActiveSpaceIndex(index);
  };

  const handleLeave = () => {
    setActiveSpaceIndex(null);
  };

  // Handle onboarding completion
  const handleOnboardingComplete = async (data) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        localStorage.setItem(`onboarded_${user.id}`, JSON.stringify(data));
        localStorage.setItem(`user_mood_${user.id}`, data.mood);
        localStorage.setItem(`user_intentions_${user.id}`, JSON.stringify(data.intentions));
      }
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
    setShowOnboarding(false);
    setHasSeenOnboarding(true);
  };

  // Generate ambient sound
  useEffect(() => {
    const generateSound = async () => {
      try {
        if (!audioRef.current || !isSoundPlaying) return;

        const response = await fetch('/api/generate-ambient', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: ambientSound }),
        });

        if (response.ok) {
          const data = await response.json();
          if (audioRef.current) {
            audioRef.current.src = data.audioUrl;
            audioRef.current.volume = 0.15;
            audioRef.current.loop = true;
            audioRef.current.play().catch(e => {
              console.log('Autoplay prevented:', e);
            });
          }
        }
      } catch (error) {
        console.error('Error generating ambient sound:', error);
      }
    };

    generateSound();
  }, [ambientSound, isSoundPlaying]);

  return (
    <>
      {/* Ambient Sound */}
      <audio ref={audioRef} />

      {/* Onboarding Modal */}
      <OnboardingModal 
        isOpen={showOnboarding} 
        onComplete={handleOnboardingComplete}
      />

      <div className="w-full min-h-screen bg-[#fcf8f2] overflow-y-auto">
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

        {/* Dashboard Header */}
        {activeSpaceIndex === null && (
          <div className="w-full px-6 py-8 md:px-12 md:py-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-2">
                <h1 className="font-hanken font-bold text-[32px] md:text-[48px] text-[#1e2d2e]">
                  {greeting}
                </h1>
                {isAdminDesktop && (
                  <a
                    href="/admin/analytics"
                    className="hidden md:inline-flex px-3 py-2 rounded-xl bg-[#1e2d2e]/10 hover:bg-[#1e2d2e]/20 text-[#1e2d2e] text-sm font-medium transition-colors"
                    title="Admin Analytics"
                  >
                    Admin
                  </a>
                )}
              </div>
              <div className="mb-4" />
              
              <div className="flex flex-col md:flex-row gap-6 mb-12">
                <ProgressStats userStats={userStats} />
                <HomeScreenSummary variant="white" onVibeClick={() => setShowProfile(true)} />
              </div>

              {recommendedSpace && (
                <div className="mb-12">
                  <h2 className="text-sm font-hanken font-bold text-[#1e2d2e]/40 uppercase tracking-widest mb-4">
                    Recommended for you
                  </h2>
                  <motion.div
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleJoin(spaces.indexOf(recommendedSpace))}
                    className="bg-[#94d1c4]/20 rounded-[32px] p-8 border-2 border-[#94d1c4]/30 cursor-pointer flex items-center justify-between group overflow-hidden relative hover:scale-[1.01] transition-transform duration-200"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full bg-[#94d1c4] text-white text-[10px] font-bold uppercase tracking-wider">
                          Quick Start
                        </span>
                        <h3 className="font-hanken font-bold text-2xl text-[#1e2d2e]">{recommendedSpace.name}</h3>
                      </div>
                      <p className="font-hanken text-[#1e2d2e]/60">
                        {recommendedSpace.description || "The perfect way to spend a few moments right now."}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#1e2d2e] flex items-center justify-center text-white relative z-10 shadow-lg group-hover:bg-[#1e2d2e]/90 transition-colors duration-200">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 5l8 7-8 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>

            {/* Quick Practice Suggestions */}
            <QuickPracticeSuggestions 
              onSelectSuggestion={(suggestion) => {
                const spaceIndex = spaces.findIndex(s => 
                  s.name.toLowerCase().includes(suggestion.intent?.toLowerCase()) ||
                  suggestion.title?.toLowerCase().includes(s.name.toLowerCase())
                ) || 0;
                handleJoin(spaceIndex);
              }}
            />

            {/* Practice Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spaces.map((space, index) => {
                // Generate preview image URL based on space name
                const previewImage = space.previewImage || `/assets/practice-previews/${space.name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
                
                return (
                  <motion.div
                    key={`grid-${space.name}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleJoin(index)}
                    className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-[#1e2d2e]/5 cursor-pointer relative group h-80 flex flex-col justify-end hover:scale-[1.02] transition-all duration-200"
                  >
                    {/* Preview Image */}
                    <div className="absolute inset-0 overflow-hidden">
                      <img 
                        src={previewImage}
                        alt={space.name}
                        className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500"
                        onError={(e) => {
                          // Fallback gradient if image doesn't exist
                          e.target.style.display = 'none';
                          e.target.parentElement.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 p-8">
                      <h3 className="font-hanken font-bold text-2xl text-[#1e2d2e] mb-2">{space.name}</h3>
                      <p className="font-hanken text-[#1e2d2e]/60 text-sm mb-4 line-clamp-2">
                        {space.description || "A quiet space for presence."}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#E52431] animate-pulse" />
                        <span className="text-[10px] font-hanken font-semibold text-[#1e2d2e]/40 uppercase tracking-widest">
                          Live Now
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Desktop PracticeCard Overlay - shown when card clicked */}
      {activeSpaceIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/50">
          <PracticeCard
            station={spaces[activeSpaceIndex]}
            isActive={true}
            hasInteracted={true}
            showFirstTimeHint={false}
            swipeHintReady={true}
            onBack={handleLeave}
            currentIndex={activeSpaceIndex + 1}
            totalPractices={spaces.length}
            onJoin={() => handleJoin(activeSpaceIndex)}
            onLeave={handleLeave}
            isCurrentlyActive={true}
          />
        </div>
      )}
      
      <SettingsBottomSheet isOpen={showSettings} onClose={() => setShowSettings(false)} />
      
      {showProfile && (
        <ProfileScreen onBack={() => setShowProfile(false)} />
      )}
    </>
  );
}
