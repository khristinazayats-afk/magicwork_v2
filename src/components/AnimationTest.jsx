import { useState } from 'react';
import { motion } from 'framer-motion';
import WaveFlow from './animations/WaveFlow';
import BoomerangAnimation from './animations/BoomerangAnimation';
import QuietGround from './animations/QuietGround';

const animations = [
  { id: 'wave', name: 'Wave Flow', component: WaveFlow },
  { id: 'boomerang', name: 'Boomerang (Slow Morning)', component: BoomerangAnimation },
  { id: 'quiet-ground', name: 'Quiet Ground', component: QuietGround },
];

export default function AnimationTest() {
  const [selectedAnimation, setSelectedAnimation] = useState('wave');
  const [isPlaying, setIsPlaying] = useState(true);

  const ActiveAnimation = animations.find(a => a.id === selectedAnimation)?.component;

  return (
    <div className="h-screen w-full bg-[#fcf8f2] overflow-hidden">
      {/* Controls */}
      <div className="absolute top-6 left-6 right-6 z-50 flex items-center justify-between">
        <div className="flex gap-2">
          {animations.map(anim => (
            <button
              key={anim.id}
              onClick={() => setSelectedAnimation(anim.id)}
              className={`px-4 py-2 rounded-lg font-hanken text-sm font-medium transition-colors ${
                selectedAnimation === anim.id
                  ? 'bg-[#1e2d2e] text-white'
                  : 'bg-white/50 text-[#1e2d2e] hover:bg-white/70'
              }`}
            >
              {anim.name}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-4 py-2 rounded-lg bg-[#1e2d2e] text-white font-hanken text-sm font-medium"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>

      {/* Info */}
      <div className="absolute bottom-6 left-6 right-6 z-50 text-center">
        <div className="inline-block px-6 py-3 rounded-full bg-white/80 backdrop-blur-sm">
          <p className="font-hanken text-[#1e2d2e] text-sm font-medium">
            Animation Test Environment
          </p>
          <p className="font-hanken text-[#1e2d2e]/60 text-xs mt-1">
            Dark circles · Schematic · Playful
          </p>
        </div>
      </div>

      {/* Animation Display */}
      <div className="h-full flex items-center justify-center">
        {ActiveAnimation && <ActiveAnimation isActive={isPlaying} />}
      </div>
    </div>
  );
}

