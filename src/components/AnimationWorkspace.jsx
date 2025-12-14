import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnimationControls from './animation-workspace/AnimationControls';

// Import animations by practice category
import WaveFlow from './animations/WaveFlow';
import SpringForestGrounding from './animations/SpringForestGrounding';
import BoomerangLab from './animations/BoomerangLab';

// Practice categories with their animations
const PRACTICE_CATEGORIES = {
  movement: {
    name: 'Movement',
    icon: '🌊',
    animations: [
      { id: 'wave', name: 'Wave Flow', component: WaveFlow },
    ]
  },
  grounding: {
    name: 'Grounding',
    icon: '🌳',
    animations: [
      { id: 'forest', name: 'Spring Forest Grounding', component: SpringForestGrounding },
    ]
  },
  experimental: {
    name: 'Experimental',
    icon: '🧪',
    animations: [
      { id: 'boomerang', name: 'Boomerang Lab', component: BoomerangLab },
    ]
  }
};

export default function AnimationWorkspace() {
  const [selectedCategory, setSelectedCategory] = useState('movement');
  const [selectedAnimation, setSelectedAnimation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);

  const category = PRACTICE_CATEGORIES[selectedCategory];
  
  // Auto-select first animation when category changes
  useEffect(() => {
    if (category && category.animations.length > 0) {
      const firstAnimationId = category.animations[0].id;
      // Only set if no animation selected or current selection doesn't exist in new category
      if (selectedAnimation === null || !category.animations.find(a => a.id === selectedAnimation)) {
        setSelectedAnimation(firstAnimationId);
      }
    }
  }, [selectedCategory]); // Only depend on selectedCategory to avoid loops

  const currentAnimation = category?.animations.find(a => a.id === selectedAnimation) || category?.animations[0];
  const ActiveAnimation = currentAnimation?.component;

  return (
    <div className="h-screen w-full bg-[#fcf8f2] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#1e2d2e]/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-hanken text-2xl font-bold text-[#1e2d2e]">
              Animation Workspace
            </h1>
            <p className="font-hanken text-sm text-[#1e2d2e]/60 mt-1">
              Build and test animations for different practices
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-[#1e2d2e]/10">
            <span className="font-hanken text-xs font-medium text-[#1e2d2e]">
              Dark Circles · Schematic · Playful
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Practice Categories */}
        <div className="w-64 border-r border-[#1e2d2e]/10 bg-white/50 overflow-y-auto">
          <div className="p-4">
            <h2 className="font-hanken text-sm font-semibold text-[#1e2d2e] mb-3 uppercase tracking-wide">
              Practice Categories
            </h2>
            <div className="space-y-1">
              {Object.entries(PRACTICE_CATEGORIES).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedCategory(key);
                    setSelectedAnimation(category.animations[0]?.id || null);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg font-hanken text-sm font-medium transition-colors ${
                    selectedCategory === key
                      ? 'bg-[#1e2d2e] text-white'
                      : 'bg-white/50 text-[#1e2d2e] hover:bg-white/70'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    <span>{category.name}</span>
                    <span className="ml-auto text-xs opacity-60">
                      {category.animations.length}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Animation List */}
          {category && (
            <div className="p-4 border-t border-[#1e2d2e]/10">
              <h3 className="font-hanken text-xs font-semibold text-[#1e2d2e] mb-3 uppercase tracking-wide">
                {category.name} Animations
              </h3>
              <div className="space-y-1">
                {category.animations.map((anim) => (
                  <button
                    key={anim.id}
                    onClick={() => setSelectedAnimation(anim.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg font-hanken text-sm transition-colors ${
                      selectedAnimation === anim.id
                        ? 'bg-[#1e2d2e] text-white'
                        : 'bg-white/30 text-[#1e2d2e] hover:bg-white/50'
                    }`}
                  >
                    {anim.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Controls Bar */}
          <div className="px-6 py-4 border-b border-[#1e2d2e]/10 bg-white/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-hanken text-lg font-semibold text-[#1e2d2e]">
                  {currentAnimation?.name || 'Select an animation'}
                </h2>
                <p className="font-hanken text-xs text-[#1e2d2e]/60 mt-1">
                  {category?.name} Practice
                </p>
              </div>
              <AnimationControls
                isPlaying={isPlaying}
                onPlayPause={() => setIsPlaying(!isPlaying)}
                speed={speed}
                onSpeedChange={setSpeed}
                onReset={() => {
                  setIsPlaying(false);
                  setTimeout(() => setIsPlaying(true), 100);
                }}
              />
            </div>
          </div>

          {/* Animation Display */}
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#fcf8f2] to-[#f5efe0] overflow-hidden">
            {ActiveAnimation ? (
              <div className="relative">
                <ActiveAnimation isActive={isPlaying} speed={speed} />
              </div>
            ) : (
              <div className="text-center">
                <p className="font-hanken text-[#1e2d2e]/40 text-lg">
                  Select an animation to preview
                </p>
              </div>
            )}
          </div>

          {/* Info Footer */}
          <div className="px-6 py-3 border-t border-[#1e2d2e]/10 bg-white/30">
            <div className="flex items-center justify-between text-xs">
              <div className="font-hanken text-[#1e2d2e]/60">
                <span className="font-medium">Design System:</span> Particle Color: rgba(30, 45, 46, 0.6) · Size: 6px
              </div>
              <div className="font-hanken text-[#1e2d2e]/60">
                Speed: {speed}x
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

