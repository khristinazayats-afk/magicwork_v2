import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function EmailVerifiedScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in after email verification
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // User is authenticated, redirect to feed after 3 seconds
        setTimeout(() => navigate('/feed'), 3000);
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#fcf8f2] flex flex-col justify-center px-8 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl"
        >
          ✓
        </motion.div>

        <h1 className="font-hanken text-[32px] font-bold text-[#1e2d2e] mb-4">
          Email Verified!
        </h1>

        <p className="text-[#1e2d2e]/60 mb-2 text-lg">
          Welcome to MagicWork
        </p>
        
        <p className="text-[#1e2d2e]/50 mb-12 text-sm">
          Your account is all set. We're taking you to your personalized feed...
        </p>

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-8 h-8 border-3 border-[#1e2d2e]/20 border-t-[#1e2d2e] rounded-full mx-auto"
        />

        <p className="text-[#1e2d2e]/40 text-xs mt-12">
          Redirecting in a moment...
        </p>
      </motion.div>
    </div>
  );
}
