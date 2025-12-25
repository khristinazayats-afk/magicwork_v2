import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { usePresence } from '../hooks/usePresence';

export default function ProgressStats() {
  const onlineCount = usePresence();
  const [stats, setStats] = useState({
    today_lp: 0,
    streak: 0,
    lifetime_days: 0,
    daily_target: 10
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Call our progress API
        const response = await fetch(`/api/progress?user_id=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Error fetching progress stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/40 backdrop-blur-sm rounded-3xl p-6 border border-[#1e2d2e]/5"
      >
        <p className="text-[10px] font-hanken font-bold text-[#1e2d2e]/40 uppercase tracking-widest mb-2">Light Points</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-[#1e2d2e]">{stats.today_lp}</span>
          <span className="text-xs text-[#1e2d2e]/40">/ {stats.daily_target}</span>
        </div>
        <div className="w-full h-1.5 bg-[#1e2d2e]/5 rounded-full mt-3 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((stats.today_lp / stats.daily_target) * 100, 100)}%` }}
            className="h-full bg-[#E52431]"
          />
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/40 backdrop-blur-sm rounded-3xl p-6 border border-[#1e2d2e]/5"
      >
        <p className="text-[10px] font-hanken font-bold text-[#1e2d2e]/40 uppercase tracking-widest mb-2">Day Streak</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-[#1e2d2e]">{stats.streak}</span>
          <span className="text-xs text-[#1e2d2e]/40">days</span>
        </div>
        <div className="text-[10px] text-[#1e2d2e]/60 mt-2">✨ Consistent practice</div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/40 backdrop-blur-sm rounded-3xl p-6 border border-[#1e2d2e]/5"
      >
        <p className="text-[10px] font-hanken font-bold text-[#1e2d2e]/40 uppercase tracking-widest mb-2">Lifetime</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-[#1e2d2e]">{stats.lifetime_days}</span>
          <span className="text-xs text-[#1e2d2e]/40">days</span>
        </div>
        <div className="text-[10px] text-[#1e2d2e]/60 mt-2">🌱 Growing stillness</div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/40 backdrop-blur-sm rounded-3xl p-6 border border-[#1e2d2e]/5"
      >
        <p className="text-[10px] font-hanken font-bold text-[#1e2d2e]/40 uppercase tracking-widest mb-2">Humans Live</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#4CAF50] animate-pulse" />
          <span className="text-2xl font-bold text-[#1e2d2e]">{onlineCount}</span>
        </div>
        <div className="text-[10px] text-[#1e2d2e]/60 mt-2">🌍 Practicing together</div>
      </motion.div>
    </div>
  );
}

