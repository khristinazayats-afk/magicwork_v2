import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function GreetingScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fcf8f2] flex flex-col justify-center items-center px-8 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-12">
          <img 
            src="/assets/logos/magicwork-bw/PNG/B&W_Logo Design - MagicWork (V001)-12.png" 
            alt="Magicwork Logo"
            className="h-20 w-20"
            loading="lazy"
            decoding="async"
            fetchpriority="low"
          />
        </div>
        
        <h1 className="font-hanken text-[40px] font-bold text-[#1e2d2e] leading-tight mb-6">
          Welcome to<br />Magicwork
        </h1>
        
        <p className="font-hanken text-lg text-[#1e2d2e]/70 mb-16 leading-relaxed">
          A shared space for collective stillness and mindfulness.
        </p>

        <div className="space-y-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/signup')}
            className="w-full h-16 rounded-full bg-[#1e2d2e] text-white font-hanken font-bold text-lg shadow-xl shadow-[#1e2d2e]/20"
          >
            Get Started
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/signup?trial=true')}
            className="w-full h-16 rounded-full bg-[#94d1c4] text-[#1e2d2e] font-hanken font-bold text-lg shadow-xl shadow-[#94d1c4]/20"
          >
            Guest login (to be optimized)
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login')}
            className="w-full h-16 rounded-full bg-white border-2 border-[#1e2d2e]/10 text-[#1e2d2e] font-hanken font-bold text-lg"
          >
            I have an account
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}






