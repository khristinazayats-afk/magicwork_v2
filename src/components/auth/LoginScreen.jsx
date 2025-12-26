import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Auto-redirect if user is already signed in (e.g. after email confirmation)
  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/feed');
      }
    }
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate('/feed');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/feed');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/feed`,
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(`SSO Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf8f2] flex flex-col justify-center px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="flex justify-center mb-8">
          <img 
            src="/assets/logos/magicwork-bw/PNG/B&W_Logo Design - MagicWork (V001)-12.png" 
            alt="Magicwork Logo"
            className="h-16 w-16"
          />
        </div>

        <h1 className="font-hanken text-[32px] font-bold text-[#1e2d2e] mb-2 text-center">
          Welcome Back
        </h1>
        <p className="text-[#1e2d2e]/60 text-center mb-12">
          Find your center, together.
        </p>

        {/* SSO Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSSO('google')}
            className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-white border border-[#1e2d2e]/10 font-hanken font-semibold text-[#1e2d2e] shadow-sm hover:bg-[#1e2d2e]/5 transition-colors"
          >
            <img src="https://www.gstatic.com/firebase/anonymous-logos/google.png" alt="Google" className="w-5 h-5 opacity-80" />
            <span>Google</span>
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSSO('apple')}
            className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-white border border-[#1e2d2e]/10 font-hanken font-semibold text-[#1e2d2e] shadow-sm hover:bg-[#1e2d2e]/5 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="opacity-80">
              <path d="M17.05 20.28c-.98.95-2.05 1.72-3.22 1.72-1.17 0-1.55-.72-2.92-.72-1.37 0-1.8.72-2.92.72-1.12 0-2.22-.82-3.22-1.72C2.72 18.25 1 15.15 1 12.12c0-3.3 2.12-5.05 4.15-5.05 1.08 0 2.1.72 2.75.72.65 0 1.78-.78 2.98-.78 1.25 0 2.38.55 3.1 1.45-2.52 1.48-2.1 4.75.42 5.85-.82 2.02-1.9 4.02-3.35 5.97zM12.03 6.3c-.02-2.15 1.75-3.95 3.85-4.05.15 2.25-1.82 4.22-3.85 4.05z"/>
            </svg>
            <span>Apple</span>
          </motion.button>
        </div>

        <div className="relative mb-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#1e2d2e]/5"></div>
          </div>
          <span className="relative px-4 bg-[#fcf8f2] text-[#1e2d2e]/30 text-[10px] font-bold uppercase tracking-widest">
            Or continue with email
          </span>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 mb-12">
          <div>
            <label className="block text-sm font-semibold text-[#1e2d2e] mb-2 px-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 rounded-2xl bg-white border border-[#1e2d2e]/10 px-6 font-hanken text-[#1e2d2e] focus:outline-none focus:border-[#1e2d2e]/30 transition-colors"
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1e2d2e] mb-2 px-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-14 rounded-2xl bg-white border border-[#1e2d2e]/10 px-6 font-hanken text-[#1e2d2e] focus:outline-none focus:border-[#1e2d2e]/30 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex justify-end">
            <Link 
              to="/forgot-password"
              className="text-sm font-medium text-[#1e2d2e]/60 hover:text-[#1e2d2e] transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-full bg-[#1e2d2e] text-white font-hanken font-bold text-base shadow-lg shadow-[#1e2d2e]/20 disabled:opacity-50"
          >
            {loading ? 'Entering...' : 'Login'}
          </motion.button>
        </form>

        <div className="space-y-4 border-t border-[#1e2d2e]/5 pt-8">
          <p className="text-[#1e2d2e]/40 text-[10px] font-bold uppercase tracking-widest text-center mb-4">
            Other options
          </p>
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/signup')}
            className="w-full h-14 rounded-full bg-[#1e2d2e]/5 text-[#1e2d2e] font-hanken font-bold text-sm"
          >
            Create Account
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/signup?trial=true')}
            className="w-full h-14 rounded-full bg-[#94d1c4]/20 text-[#1e2d2e] font-hanken font-bold text-sm border border-[#94d1c4]/30"
          >
            Guest login (to be optimized)
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}






