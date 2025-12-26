import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Ambient sounds - commented out until CDN is configured
// These will fail gracefully with error handling
const AMBIENT_SOUNDS = [
  // 'https://cdn.magicwork.app/ambient/soft-rain.mp3',
  // 'https://cdn.magicwork.app/ambient/gentle-waves.mp3',
  // 'https://cdn.magicwork.app/ambient/forest-birds.mp3',
  // 'https://cdn.magicwork.app/ambient/white-noise.mp3'
];

export default function AmbientSoundManager() {
  const audioRef = useRef(new Audio());
  const location = useLocation();
  const [currentSoundIndex, setCurrentSoundIndex] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    audio.loop = true;
    audio.volume = 0.15; // Low volume for ambient background

    // Handle audio loading errors gracefully
    const handleError = () => {
      console.log('Ambient sound failed to load, skipping');
      audio.pause();
    };
    audio.addEventListener('error', handleError);

    // Only play on main navigation screens
    const ambientRoutes = ['/feed', '/greeting', '/what-to-expect'];
    const shouldPlay = ambientRoutes.includes(location.pathname);

    if (shouldPlay && AMBIENT_SOUNDS.length > 0) {
      // Pick a random sound if not already playing
      if (audio.paused) {
        const randomIndex = Math.floor(Math.random() * AMBIENT_SOUNDS.length);
        setCurrentSoundIndex(randomIndex);
        audio.src = AMBIENT_SOUNDS[randomIndex];
        audio.play().catch(err => {
          // Silently handle autoplay errors - they're expected
          console.log('Ambient audio autoplay blocked:', err);
        });
      }
    } else {
      audio.pause();
    }

    return () => {
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, [location.pathname]);

  return null;
}






