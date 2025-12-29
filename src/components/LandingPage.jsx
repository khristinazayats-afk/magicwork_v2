import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AmbientSoundManager from './AmbientSoundManager';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [ambientSound, setAmbientSound] = useState('forest-birds');
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);

  const handleGetStarted = () => {
    navigate('/login');
  };

  const toggleSound = () => {
    setIsSoundPlaying(!isSoundPlaying);
  };

  return (
    <div className="min-h-screen bg-[#fcf8f2] font-hanken">
      {/* Ambient Sound Manager */}
      {isSoundPlaying && <AmbientSoundManager ambientSound={ambientSound} />}

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#1e2d2e]/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src="/assets/logos/magicwork-bw/PNG/B&W_Logo Design - MagicWork (V001)-12.png" 
              alt="Magicwork Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="text-2xl font-serif font-bold text-[#1e2d2e] tracking-tight">
              MAGICWORK
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[#1e2d2e]/70 hover:text-[#1e2d2e] transition-colors font-medium">
              Features
            </a>
            <a href="#practices" className="text-[#1e2d2e]/70 hover:text-[#1e2d2e] transition-colors font-medium">
              Practices
            </a>
            <a href="#journey" className="text-[#1e2d2e]/70 hover:text-[#1e2d2e] transition-colors font-medium">
              Your Journey
            </a>
            <button
              onClick={handleGetStarted}
              className="px-6 py-2.5 bg-[#1e2d2e] text-white rounded-full font-semibold 
                hover:bg-[#2a3f40] transition-all shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            <svg className="w-6 h-6 text-[#1e2d2e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t border-[#1e2d2e]/10"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              <a href="#features" className="text-[#1e2d2e]/70 hover:text-[#1e2d2e] transition-colors font-medium">
                Features
              </a>
              <a href="#practices" className="text-[#1e2d2e]/70 hover:text-[#1e2d2e] transition-colors font-medium">
                Practices
              </a>
              <a href="#journey" className="text-[#1e2d2e]/70 hover:text-[#1e2d2e] transition-colors font-medium">
                Your Journey
              </a>
              <button
                onClick={handleGetStarted}
                className="px-6 py-2.5 bg-[#1e2d2e] text-white rounded-full font-semibold 
                  hover:bg-[#2a3f40] transition-all text-center"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative aspect-square lg:aspect-auto lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
                {/* Placeholder for meditation image - using gradient until we can generate */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-orange-50">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-12">
                      <svg className="w-32 h-32 mx-auto mb-4 text-[#1e2d2e]/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-[#1e2d2e]/40 font-medium">Meditation Image</p>
                    </div>
                  </div>
                </div>
                {/* Sound toggle button */}
                <button
                  onClick={toggleSound}
                  className="absolute bottom-6 right-6 p-4 bg-white/90 backdrop-blur-sm rounded-full 
                    shadow-lg hover:shadow-xl transition-all group"
                >
                  {isSoundPlaying ? (
                    <svg className="w-6 h-6 text-[#1e2d2e]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-[#1e2d2e]/50" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                    </svg>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Right Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-[#1e2d2e] mb-4 leading-tight">
                  Meditation
                </h1>
                <h2 className="text-4xl md:text-5xl font-serif text-[#1e2d2e]/80 mb-6">
                  for Every Body
                </h2>
              </div>

              <p className="text-lg md:text-xl text-[#1e2d2e]/70 leading-relaxed max-w-xl">
                We believe meditation should be present in life every day. Let us help you find the right 
                practice for you. Explore our AI-powered personalized practices designed for your unique journey.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-4 bg-[#1e2d2e] text-white rounded-full font-bold text-lg 
                    hover:bg-[#2a3f40] transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  LEARN MORE
                </button>
                <button
                  onClick={() => setAmbientSound(ambientSound === 'forest-birds' ? 'ocean-waves' : 'forest-birds')}
                  className="px-8 py-4 bg-white border-2 border-[#1e2d2e]/20 text-[#1e2d2e] rounded-full 
                    font-bold text-lg hover:border-[#1e2d2e] transition-all"
                >
                  Change Sound
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#1e2d2e] mb-4">
              Your Personalized Journey
            </h2>
            <p className="text-xl text-[#1e2d2e]/70 max-w-2xl mx-auto">
              Discover features designed to support your meditation practice every step of the way
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                title: 'AI-Powered Practices',
                description: 'Personalized meditation scripts generated based on your emotional state and intentions'
              },
              {
                icon: (
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                ),
                title: 'Ambient Soundscapes',
                description: 'Immersive audio environments from forest birds to ocean waves to enhance your practice'
              },
              {
                icon: (
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ),
                title: 'Progress Tracking',
                description: 'Track your emotional journey with our 10-level vibe system and monthly progression tiers'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl 
                  hover:shadow-xl transition-all group"
              >
                <div className="text-[#1e2d2e] mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#1e2d2e] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#1e2d2e]/70 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Practices Section */}
      <section id="practices" className="py-20 bg-[#fcf8f2]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#1e2d2e] mb-4">
              Find Your Practice
            </h2>
            <p className="text-xl text-[#1e2d2e]/70 max-w-2xl mx-auto">
              From quick 5-minute sessions to deep 30-minute journeys
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { duration: '5 min', title: 'Quick Reset', intent: 'Boost Energy' },
              { duration: '10 min', title: 'Stress Relief', intent: 'Reduce Stress' },
              { duration: '15 min', title: 'Deep Calm', intent: 'Find Peace' },
              { duration: '30 min', title: 'Full Journey', intent: 'Transform' }
            ].map((practice, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-white rounded-xl border-2 border-[#1e2d2e]/10 
                  hover:border-[#1e2d2e] hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="text-4xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform">
                  {practice.duration}
                </div>
                <h3 className="text-xl font-bold text-[#1e2d2e] mb-2">
                  {practice.title}
                </h3>
                <p className="text-[#1e2d2e]/70">
                  {practice.intent}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="journey" className="py-20 bg-gradient-to-br from-purple-100 via-pink-50 to-orange-50">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#1e2d2e] mb-6">
              Begin Your Journey Today
            </h2>
            <p className="text-xl text-[#1e2d2e]/70 mb-8 max-w-2xl mx-auto">
              Join thousands discovering peace, clarity, and transformation through personalized meditation
            </p>
            <button
              onClick={handleGetStarted}
              className="px-12 py-5 bg-[#1e2d2e] text-white rounded-full font-bold text-xl 
                hover:bg-[#2a3f40] transition-all shadow-2xl hover:shadow-3xl hover:scale-105"
            >
              Start Free Trial
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#1e2d2e] text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img 
                src="/assets/logos/magicwork-bw/PNG/B&W_Logo Design - MagicWork (V001)-12.png" 
                alt="Magicwork Logo"
                className="w-8 h-8 object-contain brightness-0 invert"
              />
              <span className="text-xl font-serif font-bold">MAGICWORK</span>
            </div>
            <p className="text-white/70 text-center">
              © 2025 Magicwork. Your journey to inner peace.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-white/70 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-white/70 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-white/70 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
