import { useEffect, useRef } from 'react';
import { usePostEvent } from './usePostEvent';

// Track listening time and post tune_play events every 60 seconds
export function useTuneTracking(isPlaying, audioRef) {
  const { postEvent } = usePostEvent();
  const accumulatedSecondsRef = useRef(0);
  const intervalRef = useRef(null);
  const lastPostTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!isPlaying || !audioRef?.current) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Check visibility and playing state every second
    intervalRef.current = setInterval(() => {
      const isVisible = document.visibilityState === 'visible';
      const isActuallyPlaying = !audioRef.current?.paused && !audioRef.current?.ended;

      if (isVisible && isActuallyPlaying) {
        accumulatedSecondsRef.current += 1;

        // Post every 60 seconds
        const now = Date.now();
        if (accumulatedSecondsRef.current >= 60 && now - lastPostTimeRef.current >= 60000) {
          const minutesToPost = Math.floor(accumulatedSecondsRef.current / 60);
          
          postEvent({
            event_type: 'tune_play',
            metadata: {
              duration_sec: minutesToPost * 60,
            },
          }).catch(err => {
            console.error('Error posting tune_play event:', err);
          });

          accumulatedSecondsRef.current = accumulatedSecondsRef.current % 60;
          lastPostTimeRef.current = now;
        }
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, audioRef, postEvent]);

  // Reset on unmount or when stopped
  useEffect(() => {
    if (!isPlaying) {
      accumulatedSecondsRef.current = 0;
      lastPostTimeRef.current = Date.now();
    }
  }, [isPlaying]);
}

