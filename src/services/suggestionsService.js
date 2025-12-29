import { supabase } from '../lib/supabase';
import { loadSessions } from '../utils/sessionTracking';

function timeOfDayFallback(spaces) {
  const hour = new Date().getHours();
  const pick = (name) => spaces.find((s) => s.name === name) || null;
  if (hour >= 5 && hour < 12) return pick('Slow Morning');
  if (hour >= 12 && hour < 17) return pick('Get in the Flow State');
  if (hour >= 17 && hour < 21) return pick('Gentle De-Stress');
  return pick('Drift into Sleep');
}

async function fetchAnalyticsSummary(userId) {
  try {
    const qs = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
    const res = await fetch(`/api/analytics-summary${qs}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getRecommendedSpace(spaces) {
  try {
    const local = loadSessions();
    if (local && local.length) {
      const counts = local.reduce((acc, s) => {
        acc[s.spaceName] = (acc[s.spaceName] || 0) + 1;
        return acc;
      }, {});
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      if (top) {
        const found = spaces.find((s) => s.name === top[0]);
        if (found) return found;
      }
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('practice_sessions')
        .select('space_name, count')
        .eq('user_id', user.id)
        .limit(50);
      if (data && data.length) {
        const counts = data.reduce((acc, r) => {
          acc[r.space_name] = (acc[r.space_name] || 0) + (r.count || 1);
          return acc;
        }, {});
        const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        if (top) {
          const found = spaces.find((s) => s.name === top[0]);
          if (found) return found;
        }
      }
    }

    return timeOfDayFallback(spaces);
  } catch {
    return timeOfDayFallback(spaces);
  }
}

export async function getRecommendedSpaceWithReason(spaces) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const summary = await fetchAnalyticsSummary(user?.id);

    // If no summary, reuse basic method
    if (!summary) {
      const space = await getRecommendedSpace(spaces);
      return { space, reason: 'Time-of-day and recent use' };
    }

    const scores = new Map();
    const nowHour = new Date().getHours();
    const todPref = summary.timeOfDayPreference || 'afternoon';
    const todMatch = (h) => (
      (todPref === 'morning' && h >= 5 && h < 12) ||
      (todPref === 'afternoon' && h >= 12 && h < 17) ||
      (todPref === 'evening' && h >= 17 && h < 21) ||
      (todPref === 'night' && (h >= 21 || h < 5))
    );

    // Seed scores from topSpaces
    for (const ts of (summary.topSpaces || [])) {
      const base = ts.count * 1.0; // frequency weight
      const recencyBoost = ts.lastSeenDaysAgo != null ? Math.max(0, 7 - ts.lastSeenDaysAgo) * 0.2 : 0;
      const saturationPenalty = ts.count >= 5 ? 1.0 : 0; // nudge novelty
      scores.set(ts.space, base + recencyBoost - saturationPenalty);
    }

    // Add small streak boost globally
    const streakBoost = Math.min(summary.streak || 0, 7) * 0.1;

    // Consider time-of-day preference
    const todBoost = todMatch(nowHour) ? 0.5 : 0;

    // Pick best scoring space from available list; if not present, fallback
    let best = null;
    let bestScore = -Infinity;
    for (const s of spaces) {
      const base = scores.get(s.name) || 0;
      const total = base + streakBoost + todBoost;
      if (total > bestScore) {
        bestScore = total;
        best = s;
      }
    }

    if (!best) {
      const fallback = await getRecommendedSpace(spaces);
      return { space: fallback, reason: 'Time-of-day and recent use' };
    }

    // Build reason string
    const tsMatch = (summary.topSpaces || []).find(t => t.space === best.name);
    const because = [];
    if (tsMatch) because.push(`recent focus in ${best.name}`);
    if (todMatch(nowHour)) because.push(`your ${todPref} preference`);
    if ((summary.streak || 0) >= 3) because.push(`a ${summary.streak}-day streak`);
    const reason = because.length ? `Recommended based on ${because.join(', ')}` : 'Recommended for balance and novelty';

    return { space: best, reason };
  } catch {
    const space = await getRecommendedSpace(spaces);
    return { space, reason: 'Time-of-day and recent use' };
  }
}
