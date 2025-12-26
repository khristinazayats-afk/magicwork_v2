import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Ambient sound types available for AI generation
const AMBIENT_TYPES = [
  'soft-rain',
  'gentle-waves',
  'forest-birds',
  'white-noise',
  'breathing-space',
  'temple-bells'
];

export default function AmbientSoundManager() {
  const audioRef = useRef(new Audio());
  const location = useLocation();
  const [currentSoundIndex, setCurrentSoundIndex] = useState(0);
  const [generatedSounds, setGeneratedSounds] = useState({});

  // Generate ambient sound on demand using AI
  const generateAmbientSound = async (type) => {
    try {
      // Check if we already generated this type (cache it)
      if (generatedSounds[type]) {
        return generatedSounds[type];
      }

      const response = await fetch('/api/generate-ambient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate ambient sound');
      }

      const data = await response.json();
      const audioUrl = data.audioUrl;
      
      // Cache the generated sound URL
      setGeneratedSounds(prev => ({ ...prev, [type]: audioUrl }));
      
      return audioUrl;
    } catch (error) {
      console.error('Error generating ambient sound:', error);
      return null;
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    audio.loop = true;
    audio.volume = 0.15; // Low volume for ambient background

    // Handle audio loading errors gracefully
    const handleError = () => {
      console.log('Ambient sound failed to load, trying next');
      // Try next sound type
      const nextIndex = (currentSoundIndex + 1) % AMBIENT_TYPES.length;
      setCurrentSoundIndex(nextIndex);
    };
    audio.addEventListener('error', handleError);

    // Only play on main navigation screens
    const ambientRoutes = ['/feed', '/greeting', '/what-to-expect'];
    const shouldPlay = ambientRoutes.includes(location.pathname);

    if (shouldPlay && AMBIENT_TYPES.length > 0) {
      // Generate and play a random ambient sound if not already playing
      if (audio.paused) {
        const randomType = AMBIENT_TYPES[currentSoundIndex];
        
        // Generate the sound (or use cached version)
        generateAmbientSound(randomType).then((soundUrl) => {
          if (soundUrl && audio.paused) {
            audio.src = soundUrl;
            audio.play().catch(err => {
              // Silently handle autoplay errors - they're expected
              console.log('Ambient audio autoplay blocked:', err);
            });
          }
        });
      }
    } else {
      audio.pause();
    }

    return () => {
      audio.removeEventListener('error', handleError);
      audio.pause();
      // Clean up blob URLs
      Object.values(generatedSounds).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [location.pathname, currentSoundIndex, generatedSounds]);

  return null;
}






