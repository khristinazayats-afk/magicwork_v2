import { createContext, useContext, useRef, useState } from 'react';

const AudioContext = createContext(null);

/**
 * Mock Audio Provider - for testing
 * Only supports local audio files, no streaming
 */
export function MockAudioProvider({ children }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTrackInfo, setCurrentTrackInfo] = useState({
    title: 'Ambient Soundscape',
    artist: 'Nature Sounds',
    type: 'uploaded',
    isLocal: true
  });

  const mockAudio = {
    audioRef,
    isPlaying,
    currentTrackInfo,
    pause: () => setIsPlaying(false),
    resume: () => setIsPlaying(true),
    playStation: async (station) => {
      console.log('Mock: playStation', station);
      if (station?.localMusic?.file) {
        setIsPlaying(true);
        setCurrentTrackInfo({
          title: station.localMusic.title || station.name + ' Music',
          artist: station.localMusic.artist || 'Test Artist',
          type: 'uploaded',
          isLocal: true,
          file: station.localMusic.file
        });
        return station.localMusic.file;
      }
      return null;
    }
  };

  return (
    <AudioContext.Provider value={mockAudio}>
      <audio ref={audioRef} />
      {children}
    </AudioContext.Provider>
  );
}

// Mock audio hook for testing
export function useMockAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useMockAudio must be used within MockAudioProvider');
  }
  return context;
}




