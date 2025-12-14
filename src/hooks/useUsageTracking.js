import { useState, useEffect, useRef } from 'react';

const API_BASE = import.meta.env.DEV 
  ? (import.meta.env.VITE_API_BASE_URL || 'https://magicwork.vercel.app')
  : '';

/**
 * Hook for tracking practice sessions and getting live user counts
 */
export function useUsageTracking(spaceName) {
  const [liveCounts, setLiveCounts] = useState({ 0: 0, 1: 0, 2: 0, 3: 0 });
  const [loading, setLoading] = useState(true);
  const sessionIdRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);

  // Generate unique session ID
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }, []);

  // Fetch live user counts for all cards in the space
  const fetchLiveCounts = async () => {
    if (!spaceName) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/usage-tracking?action=live-counts&space=${encodeURIComponent(spaceName)}`
      );
      
      if (response.ok) {
        const counts = await response.json();
        setLiveCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching live counts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Start a practice session
  const startSession = async (cardIndex, cardId, videoAssetId, audioAssetId, videoUrl, audioUrl, selectedDurationMinutes, voiceAudioSelected) => {
    if (!spaceName || !sessionIdRef.current) return;

    try {
      await fetch(`${API_BASE}/api/usage-tracking?action=start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionIdRef.current,
          space_name: spaceName,
          card_index: cardIndex,
          card_id: cardId,
          video_asset_id: videoAssetId,
          audio_asset_id: audioAssetId,
          video_url: videoUrl,
          audio_url: audioUrl,
          selected_duration_minutes: selectedDurationMinutes,
          voice_audio_selected: voiceAudioSelected
        })
      });

      // Start heartbeat to keep session alive
      heartbeatIntervalRef.current = setInterval(() => {
        updateHeartbeat();
      }, 30000); // Every 30 seconds

      // Refresh live counts
      fetchLiveCounts();
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  // Update heartbeat
  const updateHeartbeat = async () => {
    if (!sessionIdRef.current) return;

    try {
      await fetch(`${API_BASE}/api/usage-tracking?action=heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionIdRef.current
        })
      });
    } catch (error) {
      console.error('Error updating heartbeat:', error);
    }
  };

  // Complete a practice session
  const completeSession = async (cardIndex, cardId, videoAssetId, audioAssetId, videoUrl, audioUrl, durationSeconds, selectedDurationMinutes, voiceAudioSelected, completionMessage) => {
    if (!spaceName || !sessionIdRef.current) return;

    try {
      // Stop heartbeat
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }

      await fetch(`${API_BASE}/api/usage-tracking?action=complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionIdRef.current,
          space_name: spaceName,
          card_index: cardIndex,
          card_id: cardId,
          video_asset_id: videoAssetId,
          audio_asset_id: audioAssetId,
          video_url: videoUrl,
          audio_url: audioUrl,
          duration_seconds: durationSeconds,
          selected_duration_minutes: selectedDurationMinutes,
          voice_audio_selected: voiceAudioSelected,
          completion_message_shown: completionMessage
        })
      });

      // Refresh live counts
      fetchLiveCounts();

      // Generate new session ID for next session
      sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  // Fetch live counts on mount and periodically
  useEffect(() => {
    if (!spaceName) return;

    fetchLiveCounts();
    
    // Refresh counts every 10 seconds
    const interval = setInterval(fetchLiveCounts, 10000);

    return () => {
      clearInterval(interval);
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [spaceName]);

  return {
    liveCounts,
    loading,
    startSession,
    completeSession,
    getLiveCount: (cardIndex) => liveCounts[cardIndex] || 0
  };
}

