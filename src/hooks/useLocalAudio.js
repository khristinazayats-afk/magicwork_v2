/**
 * Simple local audio player hook
 * Replaces useAudioStream - only plays local MP3 files, no streaming
 */

import { useEffect, useRef, useState } from 'react';
import { useAmbientSound } from '../contexts/AmbientSoundContext';

// Development-only logging helper
const isDev = import.meta.env.DEV;
const devWarn = isDev ? console.warn.bind(console) : () => {};
const devError = console.error.bind(console); // keep errors in prod

export function useLocalAudio() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackInfo, setCurrentTrackInfo] = useState(null);
  const { pauseAmbient, startAmbient, setAmbientMode } = useAmbientSound();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      // If looping is enabled, it will restart automatically
    };

    const handleError = (e) => {
      devError('[LocalAudio] Error:', {
        error: audio.error,
        code: audio.error?.code,
        message: audio.error?.message,
        src: audio.src
      });
      setIsPlaying(false);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  /**
   * Play local audio file from station
   */
  const playStation = (station) => {
    if (!audioRef.current || !station?.localMusic?.file) {
      devWarn('[LocalAudio] No audio file available for station:', station?.name);
      return;
    }

    // Prevent overlapping sounds: stop the ambient bowls while station audio plays.
    pauseAmbient();

    const audio = audioRef.current;
    const music = station.localMusic;

    // Set audio source
    audio.src = music.file;
    audio.loop = music.loop !== false; // Default to looping

    // Set track info
    setCurrentTrackInfo({
      title: music.title || station.name,
      artist: music.artist || 'Unknown',
      source: music.source || 'Local',
      file: music.file
    });

    // Play
    audio.play().catch(err => {
      devError('[LocalAudio] Play failed:', err);
      setIsPlaying(false);
    });
  };

  /**
   * Pause audio
   */
  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    // Bring back the calm bowls ambiance when station audio stops.
    setAmbientMode('menu');
    startAmbient('menu');
  };

  /**
   * Resume audio
   */
  const resume = async () => {
    if (audioRef.current && audioRef.current.paused) {
      try {
        // Prevent overlap: bowls off while resuming station audio.
        pauseAmbient();
        await audioRef.current.play();
        return true;
      } catch (err) {
        devError('[LocalAudio] Resume failed:', err);
        return false;
      }
    }
    return false;
  };

  return {
    audioRef,
    isPlaying,
    currentTrackInfo,
    playStation,
    pause,
    resume
  };
}

