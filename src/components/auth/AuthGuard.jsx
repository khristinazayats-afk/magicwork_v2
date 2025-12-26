import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { getTotalPracticeTime } from '../../utils/sessionTracking';

export default function AuthGuard({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trialExpired, setTrialExpired] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session) {
        // Check if user is a trial user
        const isTrial = session.user.user_metadata?.is_trial;
        if (isTrial) {
          const totalSeconds = getTotalPracticeTime();
          const limitSeconds = session.user.user_metadata?.trial_limit_seconds || 420;
          
          if (totalSeconds >= limitSeconds) {
            setTrialExpired(true);
          }
        }
      }
      
      setLoading(false);
      if (!session) {
        navigate('/greeting');
      }
    }

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        const isTrial = session.user.user_metadata?.is_trial;
        if (isTrial) {
          const totalSeconds = getTotalPracticeTime();
          const limitSeconds = session.user.user_metadata?.trial_limit_seconds || 420;
          if (totalSeconds >= limitSeconds) {
            setTrialExpired(true);
          }
        }
      } else {
        navigate('/greeting');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcf8f2] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#1e2d2e]/10 border-t-[#1e2d2e] rounded-full animate-spin" />
      </div>
    );
  }

  if (trialExpired) {
    return (
      <div className="min-h-screen bg-[#fcf8f2] flex flex-col items-center justify-center px-8 text-center relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#94d1c4]/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#e52431]/10 rounded-full blur-[80px]" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-10"
        >
          <div className="text-7xl mb-10">✨</div>
          <h1 className="font-hanken text-[36px] md:text-[48px] font-bold text-[#1e2d2e] mb-6 leading-tight">
            Your free calm<br />is complete
          </h1>
          <p className="font-hanken text-lg md:text-xl text-[#1e2d2e]/70 mb-14 max-w-md mx-auto leading-relaxed">
            You've reached your 7-minute trial limit. We hope these small moments of stillness helped you find your center today.
          </p>
          
          <div className="space-y-4 w-full max-w-sm mx-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/signup')}
              className="w-full h-16 rounded-full bg-[#1e2d2e] text-white font-hanken font-bold text-lg shadow-xl shadow-[#1e2d2e]/20"
            >
              Unlock full access
            </motion.button>
            
            <button
              onClick={() => supabase.auth.signOut()}
              className="w-full h-14 text-[#1e2d2e]/40 font-hanken font-bold text-sm hover:text-[#1e2d2e]/60 transition-colors"
            >
              Log out and return later
            </button>
          </div>
        </motion.div>
        
        {/* Branding badge */}
        <div className="absolute bottom-12 flex flex-col items-center">
          <img 
            src="/assets/logos/magicwork-bw/PNG/B&W_Logo Design - Magicwork (V001)-12.png" 
            alt="Magicwork"
            className="h-8 w-8 opacity-20 mb-2"
          />
          <span className="text-[10px] font-hanken font-bold text-[#1e2d2e]/20 uppercase tracking-[0.2em]">Magicwork</span>
        </div>
      </div>
    );
  }

  return session ? children : null;
}






