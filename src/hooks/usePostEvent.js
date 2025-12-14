import { useState } from 'react';

const MOCK_USER_ID = 'dev-user-123';
const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : '';

export function usePostEvent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const postEvent = async ({ event_type, metadata = {}, occurred_at }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: MOCK_USER_ID,
          event_type,
          metadata,
          occurred_at: occurred_at || new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post event');
      }

      const data = await response.json();
      
      if (!data.success) {
        // Cap reached or other non-error response
        return {
          success: false,
          message: data.message,
          milestone_granted: null,
        };
      }

      return {
        success: true,
        lp_earned: data.lp_earned,
        today_lp: data.today_lp,
        streak: data.streak,
        lifetime_days: data.lifetime_days,
        milestone_granted: data.milestone_granted,
      };
    } catch (err) {
      console.error('Error posting event:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { postEvent, loading, error };
}

