import { useState, useEffect } from 'react';

const MOCK_USER_ID = 'dev-user-123';
const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : '';

export function useProgress(userId = MOCK_USER_ID) {
  const [progress, setProgress] = useState({
    today_lp: 0,
    present_today: false,
    streak: 0,
    lifetime_days: 0,
    milestones: [],
    sparkline: Array(30).fill(0),
    daily_target: 10,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/progress?user_id=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }
      const data = await response.json();
      setProgress(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError(err.message);
      // In dev mode, continue with default values
      if (import.meta.env.DEV) {
        setProgress(prev => ({ ...prev }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();

    // Refetch on window focus
    const handleFocus = () => {
      fetchProgress();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [userId]);

  return { progress, loading, error, refetch: fetchProgress };
}

