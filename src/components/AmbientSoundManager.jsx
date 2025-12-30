import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { trackAmbientSoundPlayed, trackAmbientSoundChanged } from '../services/analytics';
import { supabase } from '../lib/supabase';

// Ambient sound types available for AI generation
const AMBIENT_TYPES = [
  'soft-rain',
  'gentle-waves',
  'forest-birds',
  'white-noise',
  'breathing-space',
  'temple-bells'
];

// Mood to ambient sound mapping
const MOOD_TO_AMBIENT_SOUND = {
  'calm': 'gentle-waves',
  'stressed': 'soft-rain',
  'energized': 'white-noise',
  'tired': 'temple-bells',
  'focused': 'forest-birds',
  'anxious': 'soft-rain'
};

// Fallback to local ambient sounds if API generation unavailable
const LOCAL_AMBIENT_SOUNDS = {
  'forest-birds': '/assets/ambient-spring-forest-15846.mp3',
  'soft-rain': '/assets/ambient-spring-forest-15846.mp3', // Use forest as fallback
  'gentle-waves': '/assets/ambient-spring-forest-15846.mp3',
  'white-noise': '/assets/ambient-spring-forest-15846.mp3',
  'breathing-space': '/assets/ambient-spring-forest-15846.mp3',
  'temple-bells': '/assets/ambient-spring-forest-15846.mp3'
};

export default function AmbientSoundManager() {
  const audioRef = useRef(new Audio());
  const location = useLocation();
  const [currentSoundIndex, setCurrentSoundIndex] = useState(0);
  const [currentSoundType, setCurrentSoundType] = useState(null);
  const [generatedSounds, setGeneratedSounds] = useState({});
  const [userInteracted, setUserInteracted] = useState(false);
  const [userMood, setUserMood] = useState(null);

  // Load user's mood from localStorage on mount
  useEffect(() => {
    async function loadUserMood() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const savedMood = localStorage.getItem(`user_mood_${user.id}`);
          if (savedMood) {
            setUserMood(savedMood);
            console.log(`[AmbientSoundManager] Loaded user mood: ${savedMood}`);
          }
        }
      } catch (error) {
        console.error('[AmbientSoundManager] Error loading user mood:', error);
      }
    }
    loadUserMood();

    // Listen for mood changes from onboarding
    const handleStorageChange = (e) => {
      if (e.key && e.key.includes('user_mood_')) {
        const newMood = e.newValue;
        if (newMood) {
          setUserMood(newMood);
          console.log(`[AmbientSoundManager] Mood updated to: ${newMood}`);
          // Stop current audio to trigger reload with new mood
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
          }
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Enable audio on first user interaction (required for autoplay)
  useEffect(() => {
    const enableAudio = () => {
      if (!userInteracted) {
        setUserInteracted(true);
        console.log('User interaction detected - ambient audio enabled');
      }
    };
    
    // Listen for any user interaction
    document.addEventListener('click', enableAudio, { once: true });
    document.addEventListener('touchstart', enableAudio, { once: true });
    
    return () => {
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
    };
  }, [userInteracted]);

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
        console.log(`API generation failed for ${type}, using local fallback`);
        // Use local fallback if API fails
        return LOCAL_AMBIENT_SOUNDS[type] || LOCAL_AMBIENT_SOUNDS['forest-birds'];
      }

      const data = await response.json();
      let audioUrl = data.audioUrl;
      
      // If API returns a fallback flag, use local sound
      if (data.fallback || data.note) {
        console.log(`Using local fallback for ${type}`);
        return LOCAL_AMBIENT_SOUNDS[type] || LOCAL_AMBIENT_SOUNDS['forest-birds'];
      }
      
      // Handle Hugging Face data URLs (base64 audio)
      // If it's a data URL, create a blob URL for better performance
      if (audioUrl && audioUrl.startsWith('data:audio/')) {
        // Convert data URL to blob URL
        const response = await fetch(audioUrl);
        const blob = await response.blob();
        audioUrl = URL.createObjectURL(blob);
      }
      
      // Cache the generated sound URL
      setGeneratedSounds(prev => ({ ...prev, [type]: audioUrl }));
      
      return audioUrl;
    } catch (error) {
      console.log(`Error generating ambient sound for ${type}, using local fallback:`, error.message);
      // Always return a fallback - never fail silently
      return LOCAL_AMBIENT_SOUNDS[type] || LOCAL_AMBIENT_SOUNDS['forest-birds'];
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

    if (shouldPlay && AMBIENT_TYPES.length > 0 && userInteracted) {
      // Generate and play ambient sound based on user's mood (if available)
      if (audio.paused) {
        // Prioritize mood-based sound, otherwise use current index
        let selectedType;
        if (userMood && MOOD_TO_AMBIENT_SOUND[userMood]) {
          selectedType = MOOD_TO_AMBIENT_SOUND[userMood];
          console.log(`[AmbientSoundManager] Using mood-based sound: ${selectedType} for mood: ${userMood}`);
        } else {
          selectedType = AMBIENT_TYPES[currentSoundIndex];
          console.log(`[AmbientSoundManager] Using default sound: ${selectedType}`);
        }
        
        // Generate the sound (or use cached version)
        generateAmbientSound(selectedType).then((soundUrl) => {
          if (soundUrl && audio.paused) {
            audio.src = soundUrl;
            audio.play().catch(err => {
              // Silently handle autoplay errors - they're expected
              console.log('Ambient audio autoplay blocked:', err);
            });
            
            // Track ambient sound played
            if (currentSoundType !== selectedType) {
              if (currentSoundType) {
                trackAmbientSoundChanged({
                  fromSound: currentSoundType,
                  toSound: selectedType,
                  spaceName: 'main'
                });
              } else {
                trackAmbientSoundPlayed({
                  soundType: selectedType,
                  spaceName: 'main',
                  emotionalState: userMood
                });
              }
              setCurrentSoundType(selectedType);
            }
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
        if (url && url.startsWith && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [location.pathname, currentSoundIndex, generatedSounds, currentSoundType, userInteracted, userMood]);

  return null;
}






