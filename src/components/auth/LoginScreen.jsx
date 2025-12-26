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
      // Validate input
      if (!email.trim()) {
        throw new Error('Please enter your email address.');
      }
      if (!password) {
        throw new Error('Please enter your password.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('Supabase login error:', error);
        // Provide user-friendly error messages
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Invalid credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email address before logging in.';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'No account found with this email. Please sign up first.';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Too many login attempts. Please wait a moment and try again.';
        }
        throw new Error(errorMessage);
      }

      // Verify session was created
      if (!data?.session) {
        // Try to get session one more time
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData?.session) {
          throw new Error('Login failed. Please try again.');
        }
      }

      // Small delay to ensure session is fully established
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Navigate to feed
      navigate('/feed', { replace: true });
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login. Please try again.');
      setLoading(false);
    }
  };

  const handleSSO = async (provider) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/feed`,
        }
      });
      if (error) {
        console.error('SSO error:', error);
        setError(`SSO login is not configured yet. Please use email login for now.`);
        setLoading(false);
      }
      // If successful, the OAuth flow will redirect away from this page
    } catch (err) {
      console.error('SSO exception:', err);
      setError(`SSO login is not configured yet. Please use email login for now.`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf8f2] flex flex-col px-6 py-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center"
      >
        <div className="flex justify-center mb-6">
          <img 
            src="/assets/logos/magicwork-bw/PNG/B&W_Logo Design - MagicWork (V001)-12.png" 
            alt="Magicwork Logo"
            className="h-12 w-12"
          />
        </div>

        <h1 className="font-hanken text-[28px] font-bold text-[#1e2d2e] mb-1 text-center">
          Welcome Back
        </h1>
        <p className="text-[#1e2d2e]/60 text-center mb-8 text-sm">
          Find your center, together.
        </p>

        {/* SSO Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSSO('google')}
            className="flex items-center justify-center gap-2 h-12 rounded-xl bg-white border border-[#1e2d2e]/10 font-hanken font-semibold text-sm text-[#1e2d2e] shadow-sm hover:bg-[#1e2d2e]/5 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="opacity-80">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Google</span>
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSSO('apple')}
            className="flex items-center justify-center gap-2 h-12 rounded-xl bg-white border border-[#1e2d2e]/10 font-hanken font-semibold text-sm text-[#1e2d2e] shadow-sm hover:bg-[#1e2d2e]/5 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="opacity-80">
              <path d="M17.05 20.28c-.98.95-2.05 1.72-3.22 1.72-1.17 0-1.55-.72-2.92-.72-1.37 0-1.8.72-2.92.72-1.12 0-2.22-.82-3.22-1.72C2.72 18.25 1 15.15 1 12.12c0-3.3 2.12-5.05 4.15-5.05 1.08 0 2.1.72 2.75.72.65 0 1.78-.78 2.98-.78 1.25 0 2.38.55 3.1 1.45-2.52 1.48-2.1 4.75.42 5.85-.82 2.02-1.9 4.02-3.35 5.97zM12.03 6.3c-.02-2.15 1.75-3.95 3.85-4.05.15 2.25-1.82 4.22-3.85 4.05z"/>
            </svg>
            <span>Apple</span>
          </motion.button>
        </div>

        <div className="relative mb-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#1e2d2e]/5"></div>
          </div>
          <span className="relative px-3 bg-[#fcf8f2] text-[#1e2d2e]/30 text-[9px] font-bold uppercase tracking-widest">
            Or email
          </span>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 mb-8">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 rounded-xl bg-white border border-[#1e2d2e]/10 px-5 font-hanken text-sm text-[#1e2d2e] focus:outline-none focus:border-[#1e2d2e]/30 transition-colors"
              placeholder="Email"
              required
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 rounded-xl bg-white border border-[#1e2d2e]/10 px-5 font-hanken text-sm text-[#1e2d2e] focus:outline-none focus:border-[#1e2d2e]/30 transition-colors"
              placeholder="Password"
              required
            />
          </div>

          <div className="flex justify-end mt-1">
            <Link 
              to="/forgot-password"
              className="text-xs font-medium text-[#1e2d2e]/40 hover:text-[#1e2d2e] transition-colors"
            >
              Forgot?
            </Link>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-red-50 text-red-700 text-sm font-medium border-2 border-red-200"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-[#1e2d2e] text-white font-hanken font-bold text-sm shadow-md disabled:opacity-50 mt-2"
          >
            {loading ? 'Entering...' : 'Login'}
          </motion.button>
        </form>

        <div className="space-y-3 border-t border-[#1e2d2e]/5 pt-6">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/signup')}
            className="w-full h-12 rounded-full bg-[#1e2d2e]/5 text-[#1e2d2e] font-hanken font-bold text-sm"
          >
            Create Account
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/signup?trial=true')}
            className="w-full h-12 rounded-full bg-[#94d1c4]/20 text-[#1e2d2e] font-hanken font-bold text-sm border border-[#94d1c4]/30"
          >
            Guest login (to be optimized)
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}






