import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const AMBIENT_SOUNDS = [
  'https://cdn.magiwork.app/ambient/soft-rain.mp3',
  'https://cdn.magiwork.app/ambient/gentle-waves.mp3',
  'https://cdn.magiwork.app/ambient/forest-birds.mp3',
  'https://cdn.magiwork.app/ambient/white-noise.mp3'
];

export default function AmbientSoundManager() {
  const audioRef = useRef(new Audio());
  const location = useLocation();
  const [currentSoundIndex, setCurrentSoundIndex] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    audio.loop = true;
    audio.volume = 0.15; // Low volume for ambient background

    // Only play on main navigation screens
    const ambientRoutes = ['/feed', '/greeting', '/what-to-expect'];
    const shouldPlay = ambientRoutes.includes(location.pathname);

    if (shouldPlay) {
      // Pick a random sound if not already playing
      if (audio.paused) {
        const randomIndex = Math.floor(Math.random() * AMBIENT_SOUNDS.length);
        setCurrentSoundIndex(randomIndex);
        audio.src = AMBIENT_SOUNDS[randomIndex];
        audio.play().catch(err => console.log('Ambient audio autoplay blocked:', err));
      }
    } else {
      audio.pause();
    }

    return () => {
      audio.pause();
    };
  }, [location.pathname]);

  return null;
}






