import { useState, useRef, createContext } from 'react';
import Shareouts from './Shareouts';
import TodaysPractice from './TodaysPractice';
import { gradientStyle } from '../styles/gradients';

// Mock audio context for testing
const MockAudioContext = createContext();

// Mock audio provider component
function MockAudioProvider({ children }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  
  const mockAudioContext = {
    audioRef,
    isPlaying,
    currentTrackInfo: {
      title: 'Ambient Soundscape',
      artist: 'Nature Sounds',
      type: 'uploaded'
    },
    pause: () => setIsPlaying(!isPlaying),
    play: () => setIsPlaying(true),
    stop: () => setIsPlaying(false)
  };

  return (
    <>
      <audio ref={audioRef} />
      {children(mockAudioContext)}
    </>
  );
}

export default function ShareoutsTest() {
  const [showShareouts, setShowShareouts] = useState(true);
  const [showTodaysPractice, setShowTodaysPractice] = useState(false);

  const spaceName = 'Gentle De-Stress';
  const gradientKey = 'gentleDeStress';

  const handleShareoutsContinue = () => {
    setShowShareouts(false);
    setShowTodaysPractice(true);
  };

  const handleShareoutsClose = () => {
    setShowShareouts(false);
    alert('Shareouts closed');
  };

  const handleTodaysPracticeContinue = () => {
    setShowTodaysPractice(false);
    alert('Today\'s Practice complete - would go to main practice');
  };

  const handleReset = () => {
    setShowShareouts(true);
    setShowTodaysPractice(false);
  };

  return (
    <MockAudioProvider>
      {(audioContext) => (
        <div className="h-screen w-full relative">
          {/* Hidden audio element for mock */}
          <audio ref={audioContext.audioRef} />
          
          {/* Reset button */}
          {!showShareouts && !showTodaysPractice && (
            <div className="h-screen w-full flex items-center justify-center" style={gradientStyle(gradientKey)}>
              <button
                onClick={handleReset}
                className="px-8 py-4 bg-[#1e2d2e] text-white rounded-full font-hanken font-semibold"
              >
                Reset Test
              </button>
            </div>
          )}

          {/* Shareouts Screen */}
          {showShareouts && (
            <Shareouts
              spaceName={spaceName}
              gradientStyle={gradientStyle(gradientKey)}
              onContinue={handleShareoutsContinue}
              onClose={handleShareoutsClose}
            />
          )}

          {/* Today's Practice Screen */}
          {showTodaysPractice && (
            <TodaysPractice
              spaceName={spaceName}
              gradientStyle={gradientStyle(gradientKey)}
              onContinue={handleTodaysPracticeContinue}
            />
          )}
        </div>
      )}
    </MockAudioProvider>
  );
}

