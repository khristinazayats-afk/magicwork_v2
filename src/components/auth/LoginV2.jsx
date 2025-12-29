import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginV2() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/feed-v2');
      }
    }
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate('/feed-v2');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
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

      if (error) throw error;
      if (!data?.session) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session) {
          throw new Error('Login failed. Please try again.');
        }
      }

      await new Promise(resolve => setTimeout(resolve, 200));
      navigate('/feed-v2', { replace: true });
    } catch (err) {
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
          data: { name },
          emailRedirectTo: `${window.location.origin}/login-v2`,
        },
      });

      if (error) throw error;

      if (data.user && data.session) {
        navigate('/feed-v2');
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during signup. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/30 via-violet-50/20 via-orange-50/15 via-sage-50/30 to-sky-50/30 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Check your email</h1>
          <p className="text-slate-600 mb-8">
            We've sent a verification link to <strong>{email}</strong>
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setEmail('');
              setPassword('');
              setName('');
            }}
            className="w-full py-3 px-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >
            Back to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sage-400 via-violet-300 via-orange-300 to-pink-300 mb-4">
            <img 
              src="/assets/logos/magicwork-bw/PNG/B&W_Logo Design - MagicWork (V001)-12.png" 
              alt="Magicwork"
              className="w-12 h-12"
            />
          </div>
          <h1 className="text-3xl font-serif font-bold text-sage-800 mb-2">
            {isSignupMode ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-sage-600">
            {isSignupMode ? 'Start your journey to stillness' : 'Find your center, together'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-sage-100/50 p-8">
          <form onSubmit={isSignupMode ? handleSignup : handleLogin} className="space-y-5">
            {isSignupMode && (
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-sage-200 focus:ring-2 focus:ring-sage-400 focus:border-transparent outline-none transition-all bg-white/80"
                  placeholder="John Doe"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-sage-200 focus:ring-2 focus:ring-sage-400 focus:border-transparent outline-none transition-all bg-white/80"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-sage-200 focus:ring-2 focus:ring-sage-400 focus:border-transparent outline-none transition-all bg-white/80"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-sage-400 via-violet-400 via-orange-400 to-pink-400 text-white rounded-xl font-medium hover:from-sage-500 hover:via-violet-500 hover:via-orange-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-400/20"
            >
              {loading ? (isSignupMode ? 'Creating...' : 'Signing in...') : (isSignupMode ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignupMode(!isSignupMode)}
              className="text-sm text-sage-600 hover:text-sage-800 transition-colors"
            >
              {isSignupMode ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-sage-500 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}

