import { useEffect, useRef, useState } from 'react';

export default function LandingAudioPlayer({ ambientSound, isPlaying }) {
  const audioRef = useRef(null);
  const [soundUrl, setSoundUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate ambient sound when ambientSound changes
  useEffect(() => {
    const generateSound = async () => {
      if (!ambientSound) return;
      
      setIsGenerating(true);
      try {
        const response = await fetch('/api/generate-ambient', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: ambientSound }),
        });

        if (response.ok) {
          const data = await response.json();
          setSoundUrl(data.audioUrl);
        }
      } catch (error) {
        console.error('Error generating ambient sound:', error);
      } finally {
        setIsGenerating(false);
      }
    };

    generateSound();
  }, [ambientSound]);

  // Handle audio playback
  useEffect(() => {
    if (!audioRef.current || !soundUrl) return;

    audioRef.current.src = soundUrl;
    audioRef.current.volume = 0.2;
    audioRef.current.loop = true;
    
    if (isPlaying && !isGenerating) {
      // Try to play, handling autoplay restrictions
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Autoplay prevented - user interaction required:', error);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [soundUrl, isPlaying, isGenerating]);

  return <audio ref={audioRef} />;
}
