import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function usePresence() {
  const [onlineCount, setOnlineCount] = useState(1); // Default to at least 1 (self)

  useEffect(() => {
    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: 'user',
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setOnlineCount(count > 0 ? count : 1);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        // console.log('join', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // console.log('leave', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data: { user } } = await supabase.auth.getUser();
          await channel.track({ 
            user_id: user?.id || 'anonymous',
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return onlineCount;
}






