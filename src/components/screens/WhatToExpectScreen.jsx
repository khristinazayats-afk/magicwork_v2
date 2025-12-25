import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function WhatToExpectScreen() {
  const navigate = useNavigate();

  const features = [
    { icon: '✨', title: 'AI Practices', text: 'Personalized meditation scripts based on your mood.' },
    { icon: '🌍', title: 'Shared Presence', text: 'Practice in real-time with humans across the world.' },
    { icon: '🎵', title: 'Generative Audio', text: 'Ambient soundscapes crafted for your intention.' },
    { icon: '📈', title: 'Mindful Growth', text: 'Track your progress and emotional evolution.' },
  ];

  return (
    <div className="min-h-screen bg-[#fcf8f2] flex flex-col px-8 py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-md mx-auto flex-1 flex flex-col"
      >
        <h1 className="font-hanken text-[32px] font-bold text-[#1e2d2e] mb-12">
          What to expect
        </h1>

        <div className="space-y-8 flex-1">
          {features.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="font-hanken font-bold text-[#1e2d2e] text-lg mb-1">
                  {item.title}
                </h3>
                <p className="text-[#1e2d2e]/60 text-sm leading-relaxed">
                  {item.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/feed')}
          className="w-full h-16 rounded-full bg-[#1e2d2e] text-white font-hanken font-bold text-lg shadow-xl shadow-[#1e2d2e]/20 mt-12"
        >
          Begin Journey
        </motion.button>
      </motion.div>
    </div>
  );
}






