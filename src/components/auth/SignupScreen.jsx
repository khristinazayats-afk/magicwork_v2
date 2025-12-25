import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) throw error;

      if (data.user && data.session) {
        navigate('/profile-setup');
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
          <Link 
            to="/login"
            className="inline-block px-8 py-4 rounded-full bg-[#1e2d2e] text-white font-hanken font-bold"
          >
            Back to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf8f2] flex flex-col justify-center px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto"
      >
        <h1 className="font-hanken text-[32px] font-bold text-[#1e2d2e] mb-2 text-center">
          Create Account
        </h1>
        <p className="text-[#1e2d2e]/60 text-center mb-12">
          Start your journey to stillness.
        </p>

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#1e2d2e] mb-2 px-1">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-14 rounded-2xl bg-white border border-[#1e2d2e]/10 px-6 font-hanken text-[#1e2d2e] focus:outline-none focus:border-[#1e2d2e]/30 transition-colors"
              placeholder="Your Name"
              required
            />
          </div>

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
              placeholder="Min. 6 characters"
              minLength={6}
              required
            />
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
            {loading ? 'Creating...' : 'Sign Up'}
          </motion.button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-[#1e2d2e]/60 text-sm">
            Already have an account?{' '}
            <Link 
              to="/login"
              className="font-bold text-[#1e2d2e] hover:underline underline-offset-4"
            >
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}






