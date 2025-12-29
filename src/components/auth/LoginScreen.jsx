import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isTrial = queryParams.get('trial') === 'true';

  // If trial parameter is present, switch to signup mode
  useEffect(() => {
    if (isTrial) {
      setIsSignupMode(true);
    }
  }, [isTrial]);

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

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name,
            is_trial: isTrial,
            trial_limit_seconds: 420, // 7 minutes
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) throw error;

      if (data.user && data.session) {
        navigate('/profile-setup');
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'An error occurred during signup. Please try again.');
      setLoading(false);
    }
  };

  const handleSSO = async (provider) => {
    // SSO providers are not enabled in Supabase - show helpful message
    setError(`SSO login (${provider}) is not configured yet. Please use email login for now.`);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#fcf8f2] flex flex-col justify-center px-8 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 text-3xl">
            📧
          </div>
          <h1 className="font-hanken text-[28px] font-bold text-[#1e2d2e] mb-4">
            Verify Your Email
          </h1>
          <p className="text-[#1e2d2e]/60 mb-12">
            We've sent a verification link to <strong>{email}</strong>. Please confirm your email address to continue.
          </p>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSuccess(false);
              setIsSignupMode(false);
              setEmail('');
              setPassword('');
              setName('');
            }}
            className="inline-block px-8 py-4 rounded-full bg-[#1e2d2e] text-white font-hanken font-bold"
          >
            Back to Login
          </motion.button>
        </motion.div>
      </div>
    );
  }

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
            loading="lazy"
            decoding="async"
            fetchpriority="low"
          />
        </div>

        <h1 className="font-hanken text-[28px] font-bold text-[#1e2d2e] mb-1 text-center">
          {isSignupMode ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="text-[#1e2d2e]/60 text-center mb-8 text-sm">
          {isSignupMode 
            ? (isTrial ? 'Join for a 7-minute trial.' : 'Start your journey to stillness.')
            : 'Find your center, together.'}
        </p>

        <form onSubmit={isSignupMode ? handleSignup : handleLogin} className="space-y-4 mb-6">
          {isSignupMode && (
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 rounded-xl bg-white border border-[#1e2d2e]/10 px-5 font-hanken text-sm text-[#1e2d2e] focus:outline-none focus:border-[#1e2d2e]/30 transition-colors"
                placeholder="Display Name"
                required
              />
            </div>
          )}
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
              placeholder={isSignupMode ? "Password (Min. 6 chars)" : "Password"}
              minLength={isSignupMode ? 6 : undefined}
              required
            />
          </div>

          {!isSignupMode && (
            <div className="flex justify-end mt-1">
              <Link 
                to="/forgot-password"
                className="text-xs font-medium text-[#1e2d2e]/40 hover:text-[#1e2d2e] transition-colors"
              >
                Forgot?
              </Link>
            </div>
          )}

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
            {loading ? (isSignupMode ? 'Creating...' : 'Entering...') : (isSignupMode ? 'Sign Up' : 'Login')}
          </motion.button>
        </form>

        <div className="space-y-3 border-t border-[#1e2d2e]/5 pt-6">
          {!isSignupMode ? (
            <>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsSignupMode(true);
                  setError(null);
                  setPassword('');
                  setName('');
                }}
                className="w-full h-12 rounded-full bg-[#1e2d2e]/5 text-[#1e2d2e] font-hanken font-bold text-sm"
              >
                Create Account
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  navigate('/login?trial=true');
                }}
                className="w-full h-12 rounded-full bg-[#94d1c4]/20 text-[#1e2d2e] font-hanken font-bold text-sm border border-[#94d1c4]/30"
              >
                Guest Login
              </motion.button>
            </>
          ) : (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsSignupMode(false);
                setError(null);
                setPassword('');
                setName('');
              }}
              className="w-full h-12 rounded-full bg-white border-2 border-[#1e2d2e]/10 text-[#1e2d2e] font-hanken font-bold text-sm"
            >
              I have an account
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}






