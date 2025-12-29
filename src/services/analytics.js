import { supabase } from '../lib/supabase';

async function getUserId() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}

async function postGamificationEvent(eventType, metadata) {
  try {
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: eventType, metadata }),
    });
  } catch (e) {
    // Non-blocking: ignore failures
  }
}

export async function trackEvent({ name, category = 'practice', properties = {}, screen = null }) {
  const userId = await getUserId();
  const payload = {
    user_id: userId,
    event_name: name,
    event_category: category,
    screen_name: screen,
    properties,
    occurred_at: new Date().toISOString(),
  };

  try {
    await supabase.from('analytics_events').insert(payload);
  } catch (e) {
    // Fallback: log locally if table not available
    console.log('[analytics_events]', payload);
  }
}

export async function trackPracticeStarted({ spaceName, intent, emotionalState, durationSeconds }) {
  return trackEvent({
    name: 'practice_started',
    properties: { spaceName, intent, emotionalState, durationSeconds },
  });
}

export async function trackPracticeCompleted({ spaceName, intent, emotionalState, durationSeconds }) {
  // Record in Supabase analytics table
  await trackEvent({
    name: 'practice_complete',
    properties: { spaceName, intent, emotionalState, durationSeconds },
  });
  // Also record gamification event for aggregation API
  await postGamificationEvent('practice_complete', {
    space: spaceName,
    intent,
    emotional_state: emotionalState,
    duration_sec: durationSeconds,
  });
}

export async function trackScreenView({ screen }) {
  return trackEvent({ name: 'screen_view', category: 'navigation', screen });
}
