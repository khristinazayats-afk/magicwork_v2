import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-[#fcf8f2] flex flex-col justify-center px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto"
      >
        <h1 className="font-hanken text-[32px] font-bold text-[#1e2d2e] mb-2 text-center">
          Welcome Back
        </h1>
        <p className="text-[#1e2d2e]/60 text-center mb-12">
          Find your center, together.
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
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

        <div className="mt-12 text-center">
          <p className="text-[#1e2d2e]/60 text-sm">
            Don't have an account?{' '}
            <Link 
              to="/signup"
              className="font-bold text-[#1e2d2e] hover:underline underline-offset-4"
            >
              Create Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}






