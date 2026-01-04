import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Real-time presence tracking for practice spaces
 * Tracks active users in each space using Supabase Realtime
 */
export function usePresenceTracking(spaceName) {
  const [participantCount, setParticipantCount] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  
  // Join space - mark user as present
  const joinSpace = useCallback(async () => {
    if (!spaceName || isTracking) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Insert presence record with upsert to avoid duplicates
      const { error } = await supabase
        .from('space_presence')
        .upsert({
          user_id: user.id,
          space_name: spaceName,
          last_heartbeat: new Date().toISOString(),
          is_active: true
        }, {
          onConflict: 'user_id,space_name'
        });
      
      if (error) {
        console.error('Error joining space:', error);
      } else {
        setIsTracking(true);
      }
    } catch (err) {
      console.error('Error in joinSpace:', err);
    }
  }, [spaceName, isTracking]);
  
  // Leave space - remove presence
  const leaveSpace = useCallback(async () => {
    if (!spaceName || !isTracking) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      await supabase
        .from('space_presence')
        .delete()
        .eq('user_id', user.id)
        .eq('space_name', spaceName);
      
      setIsTracking(false);
    } catch (err) {
      console.error('Error in leaveSpace:', err);
    }
  }, [spaceName, isTracking]);
  
  // Update heartbeat every 30 seconds to show active
  useEffect(() => {
    if (!isTracking || !spaceName) return;
    
    const heartbeatInterval = setInterval(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        await supabase
          .from('space_presence')
          .update({ 
            last_heartbeat: new Date().toISOString(),
            is_active: true
          })
          .eq('user_id', user.id)
          .eq('space_name', spaceName);
      } catch (err) {
        console.error('Heartbeat error:', err);
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(heartbeatInterval);
  }, [isTracking, spaceName]);
  
  // Subscribe to presence changes
  useEffect(() => {
    if (!spaceName) return;
    
    // Get initial count
    const fetchCount = async () => {
      try {
        // Count active users (last heartbeat within 2 minutes)
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
        
        const { count, error } = await supabase
          .from('space_presence')
          .select('*', { count: 'exact', head: true })
          .eq('space_name', spaceName)
          .eq('is_active', true)
          .gte('last_heartbeat', twoMinutesAgo);
        
        if (!error && count !== null) {
          setParticipantCount(count);
        }
      } catch (err) {
        console.error('Error fetching presence count:', err);
      }
    };
    
    fetchCount();
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel(`space:${spaceName}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'space_presence',
          filter: `space_name=eq.${spaceName}`
        },
        () => {
          fetchCount(); // Refresh count on any change
        }
      )
      .subscribe();
    
    // Refresh count every minute to remove stale presence
    const refreshInterval = setInterval(fetchCount, 60000);
    
    return () => {
      channel.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [spaceName]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isTracking) {
        leaveSpace();
      }
    };
  }, [isTracking, leaveSpace]);
  
  return {
    participantCount,
    joinSpace,
    leaveSpace,
    isTracking
  };
}

/**
 * Get all spaces with their participant counts
 */
export async function getAllSpacesPresence() {
  try {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('space_presence')
      .select('space_name')
      .eq('is_active', true)
      .gte('last_heartbeat', twoMinutesAgo);
    
    if (error) {
      console.error('Error fetching all presence:', error);
      return {};
    }
    
    // Count by space name
    const counts = {};
    data.forEach(row => {
      counts[row.space_name] = (counts[row.space_name] || 0) + 1;
    });
    
    return counts;
  } catch (err) {
    console.error('Error in getAllSpacesPresence:', err);
    return {};
  }
}
