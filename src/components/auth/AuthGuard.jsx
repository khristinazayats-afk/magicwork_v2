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
      <div className="min-h-screen bg-[#fcf8f2] flex flex-col items-center justify-center px-8 text-center">
        <div className="text-6xl mb-8">✨</div>
        <h1 className="font-hanken text-3xl font-bold text-[#1e2d2e] mb-4">Your free calm is complete</h1>
        <p className="font-hanken text-[#1e2d2e]/70 mb-12 max-w-sm">
          You've reached your 7-minute trial limit. We hope these moments helped you find your center.
        </p>
        <button
          onClick={() => navigate('/signup')}
          className="w-full max-w-xs h-16 rounded-full bg-[#1e2d2e] text-white font-hanken font-bold text-lg"
        >
          Join Magiwork for full access
        </button>
        <button
          onClick={() => supabase.auth.signOut()}
          className="mt-4 text-sm text-[#1e2d2e]/60 font-medium"
        >
          Log Out
        </button>
      </div>
    );
  }

  return session ? children : null;
}






