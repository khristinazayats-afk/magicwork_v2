import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function LandingV2() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login-v2');
  };

  return (
    <div className="bg-gradient-to-br from-pink-50/30 via-violet-50/20 via-orange-50/20 via-sage-50/40 to-sky-50/30 relative">
      {/* Navigation Header */}
      <div className="sticky top-0 left-0 right-0 z-50 px-6 md:px-12 py-6 bg-gradient-to-b from-pink-50/60 to-transparent backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left - Contact Button */}
          <button className="px-6 py-2 rounded-full border border-sage-300 text-sage-600 font-medium text-sm hover:bg-sage-50/50 transition-colors">
            CONTACT
          </button>

          {/* Center - Logo */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 mb-2">
              <img 
                src="/assets/logos/magicwork-bw/PNG/B&W_Logo Design - MagicWork (V001)-12.png" 
                alt="Magicwork Logo"
                className="w-full h-full object-contain"
                loading="lazy"
                decoding="async"
                fetchpriority="low"
              />
            </div>
            <h1 className="text-lg font-serif font-semibold text-slate-900 tracking-tight">
              MAGICWORK
            </h1>
          </div>

          {/* Right - Navigation */}
          <nav className="flex items-center gap-6">
            <a href="#" className="text-slate-700 font-serif text-sm hover:text-sage-600 transition-colors">Home</a>
            <a href="#" className="text-slate-700 font-serif text-sm hover:text-sage-600 transition-colors">Practice</a>
            <a href="#" className="text-slate-700 font-serif text-sm hover:text-sage-600 transition-colors">Journey</a>
          </nav>
        </div>
      </div>

      {/* Hero Section - Landscape Background */}
      <div className="relative h-screen flex items-center justify-center">
        {/* Landscape Illustration Background */}
        <div className="absolute inset-0 overflow-hidden will-change-transform">
          {/* Sky Gradient - Pastel */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-violet-50/30 via-orange-50/20 via-rose-50/20 to-sage-50/40" />
          
          {/* Mountains - Backdrop - Earthy Pastels */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3">
            <svg className="w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
              <path d="M0,400 L0,300 Q200,250 400,280 T800,260 T1200,300 L1200,400 Z" fill="#d4c5b9" opacity="0.5" />
              <path d="M0,400 L0,320 Q300,280 600,300 T1200,320 L1200,400 Z" fill="#c9b8aa" opacity="0.4" />
            </svg>
          </div>

          {/* Water/Lake - Soft Pastel */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-b from-sky-100/50 via-violet-100/40 via-orange-100/30 via-sage-100/50 to-sand-100/60 opacity-70" />

          {/* Trees - Right Side Forest - Sage Green */}
          <div className="absolute bottom-0 right-0 w-1/3 h-2/3 flex items-end">
            <div className="w-full h-full flex items-end justify-end gap-4 pr-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-8 h-32 bg-sage-400 rounded-t-full opacity-50" style={{ height: `${80 + i * 20}px` }} />
              ))}
            </div>
          </div>

          {/* Tree - Left Side - Soft Earthy Colors */}
          <div className="absolute bottom-0 left-0 w-1/4 h-3/5 flex items-end pl-12">
            <div className="relative">
              {/* Tree Trunk */}
              <div className="w-6 h-32 bg-sand-400 rounded-t-full opacity-60" />
          {/* Tree Crown - Soft Pastels */}
          <div className="absolute -top-16 -left-12 w-32 h-32 bg-gradient-to-br from-peach-200 via-orange-200 via-rose-200 to-apricot-200 rounded-full opacity-60 blur-sm" />
          <div className="absolute -top-12 -left-8 w-24 h-24 bg-gradient-to-br from-apricot-200 via-orange-200 to-peach-200 rounded-full opacity-70" />
            </div>
          </div>

          {/* Dock - Left Side - Earthy Brown */}
          <div className="absolute bottom-0 left-0 w-32 h-16 bg-sand-600 opacity-50 rounded-t-lg" style={{ bottom: '25%', left: '8%' }} />

          {/* Sun/Moon - Soft Pastel */}
          <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-peach-200 rounded-full opacity-30 blur-xl" />
        </div>

        {/* Hero Text Overlay */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center mt-32">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-serif font-bold text-sage-800 mb-6 leading-tight"
          >
            Your Healing Journey Starts With Magicwork
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-lg md:text-xl text-sage-700 font-sans max-w-3xl mx-auto leading-relaxed"
          >
            A safe haven for finding your center through meditation and mindfulness. 
            This space is for your healing journey with guided practices, ambient sounds, and AI-powered guidance.
          </motion.p>
        </div>
      </div>

      {/* Lower Content Section */}
      <div className="relative bg-white py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center will-change-transform">
          {/* Left Side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-sage-800">
              As A Seeker, Can You Relate To The Wording Below?
            </h2>
            
            <p className="text-lg text-sage-700 font-sans leading-relaxed">
              Many of us do. If you keep silent it may have negative effect on your physical and mental health.
            </p>

            {/* Relatable Statements */}
            <div className="space-y-6">
              {[
                "I try to find peace but my mind won't stop racing. I thought meditation would help - how do I actually quiet my thoughts? What am I doing wrong?",
                "I try not to worry - but the negative thoughts are obsessive. I feel so alone in my struggle.",
                "I don't want to tell anyone - they won't understand, or they'll give me simple answers. I've tried everything, the more I force it, the more stressed I become.",
                "The cycle starts, gets better, I have hope that things will change, and they do, but then the cycle starts again. I worry all the time. How can I find lasting calm?"
              ].map((statement, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full border-2 border-sage-300 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sage-500 text-xs font-bold">×</span>
                  </div>
                  <p className="text-sage-700 font-sans leading-relaxed">{statement}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleGetStarted}
              className="px-8 py-3 rounded-full border border-sage-300 text-sage-600 font-medium hover:bg-sage-50/50 transition-colors"
            >
              JOIN MAGICWORK
            </button>
          </motion.div>

          {/* Right Side - Illustrative Scene */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="relative h-96 lg:h-[500px]"
          >
            {/* Landscape Illustration */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              {/* Water Background - Pastel */}
              <div className="absolute inset-0 bg-gradient-to-b from-sky-100/50 via-violet-100/40 via-orange-100/30 via-sage-100/50 to-sand-100/60" />
              
              {/* Rocks/House Platform */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4">
                {/* Rocks - Earthy */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-sand-300 rounded-t-full opacity-70" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-24 bg-sand-400 rounded-t-full opacity-60" />
                
                {/* House */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-24 h-20 bg-sand-600 rounded-lg opacity-70">
                  {/* Windows with warm glow */}
                  <div className="absolute top-2 left-2 w-6 h-6 bg-peach-200 rounded opacity-70" />
                  <div className="absolute top-2 right-2 w-6 h-6 bg-peach-200 rounded opacity-70" />
                </div>

                {/* Path/Steps */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 bg-sand-600 rounded-t-lg opacity-60" />
              </div>

              {/* Trees - Pastel */}
              <div className="absolute bottom-0 left-8">
                <div className="w-12 h-24 bg-gradient-to-br from-peach-200 to-apricot-200 rounded-full opacity-60" />
              </div>
              <div className="absolute bottom-0 right-8">
                <div className="w-10 h-20 bg-sage-400 rounded-full opacity-50" />
              </div>

              {/* Small Figures/People */}
              <div className="absolute bottom-12 left-1/4 w-3 h-6 bg-sand-500 rounded-full opacity-60" />
              <div className="absolute bottom-16 right-1/4 w-3 h-6 bg-sand-500 rounded-full opacity-60" />

              {/* Lanterns/Lights - Soft Glow */}
              <div className="absolute bottom-20 left-1/3 w-2 h-2 bg-peach-300 rounded-full opacity-60 blur-sm" />
              <div className="absolute bottom-24 right-1/3 w-2 h-2 bg-peach-300 rounded-full opacity-60 blur-sm" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
