import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function ProfileSetupScreen() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          username: username.toLowerCase(),
          display_name: displayName,
          bio: bio,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      navigate('/what-to-expect');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf8f2] px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto"
      >
        <h1 className="font-hanken text-[32px] font-bold text-[#1e2d2e] mb-2">
          Almost there
        </h1>
        <p className="text-[#1e2d2e]/60 mb-12">
          Tell us how you'd like to be known.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#1e2d2e] mb-2 px-1">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1e2d2e]/40 font-medium">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-14 rounded-2xl bg-white border border-[#1e2d2e]/10 pl-10 pr-6 font-hanken text-[#1e2d2e] focus:outline-none focus:border-[#1e2d2e]/30 transition-colors"
                placeholder="username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1e2d2e] mb-2 px-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full h-14 rounded-2xl bg-white border border-[#1e2d2e]/10 px-6 font-hanken text-[#1e2d2e] focus:outline-none focus:border-[#1e2d2e]/30 transition-colors"
              placeholder="Your Name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1e2d2e] mb-2 px-1">
              Bio (Optional)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full min-h-[120px] rounded-2xl bg-white border border-[#1e2d2e]/10 p-6 font-hanken text-[#1e2d2e] focus:outline-none focus:border-[#1e2d2e]/30 transition-colors resize-none"
              placeholder="A brief bit about you..."
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
            className="w-full h-16 rounded-full bg-[#1e2d2e] text-white font-hanken font-bold text-lg shadow-xl shadow-[#1e2d2e]/20 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}






