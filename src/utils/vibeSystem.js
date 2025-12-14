/**
 * Vibe System - Weekly Nervous System States
 * Tracks weekly practice and determines user's current vibe state
 */

import { loadSessions } from './sessionTracking';
import { getWeeklyStats } from './weeklyTracking';
import { getCurrentStreak } from './sessionTracking';

// The 10 Vibe States with their requirements and benefits
export const VIBES = {
  1: {
    id: 1,
    name: 'Sleepy Otter',
    emoji: '🦦',
    effort: '1–5 min • 1 day',
    benefit: 'Even tiny pauses reduce nervous system noise.',
    microcopy: 'A gentle beginning is still a beginning.',
    minMinutes: 1,
    maxMinutes: 5,
    minDays: 1,
    maxDays: 1,
    minStreak: 0
  },
  2: {
    id: 2,
    name: 'Unbothered Tortoise',
    emoji: '🐢',
    effort: '5–10 min • 1–2 days',
    benefit: 'Slow, steady presence calms the vagus nerve.',
    microcopy: 'Slow is powerful.',
    minMinutes: 5,
    maxMinutes: 10,
    minDays: 1,
    maxDays: 2,
    minStreak: 0
  },
  3: {
    id: 3,
    name: 'Calm Polar Bear',
    emoji: '🐻‍❄️',
    effort: '10–20 min • 2–3 days',
    benefit: 'Your baseline stress response is cooling.',
    microcopy: 'You found deep chill in the middle of your week.',
    minMinutes: 10,
    maxMinutes: 20,
    minDays: 2,
    maxDays: 3,
    minStreak: 0
  },
  4: {
    id: 4,
    name: 'Chilled Capybara',
    emoji: '🦫',
    effort: '15–25 min • 3 days',
    benefit: 'Your body is relaxing into a safe rhythm.',
    microcopy: 'Soft ease is settling in.',
    minMinutes: 15,
    maxMinutes: 25,
    minDays: 3,
    maxDays: 3,
    minStreak: 0
  },
  5: {
    id: 5,
    name: 'Serene Quokka',
    emoji: '🐹',
    effort: '20–35 min • 3–4 days • 2-day streak',
    benefit: 'Tiny joyful pauses improved emotional clarity.',
    microcopy: 'Little joys are reshaping your inner world.',
    minMinutes: 20,
    maxMinutes: 35,
    minDays: 3,
    maxDays: 4,
    minStreak: 2
  },
  6: {
    id: 6,
    name: 'Resourceful Owl',
    emoji: '🦉',
    effort: '30–45 min • 4–5 days',
    benefit: 'Your breath and mind are finding structure.',
    microcopy: 'Clarity comes quietly.',
    minMinutes: 30,
    maxMinutes: 45,
    minDays: 4,
    maxDays: 5,
    minStreak: 0
  },
  7: {
    id: 7,
    name: 'Resilient Deer',
    emoji: '🦌',
    effort: '40–60 min • 5 days • 3-day streak',
    benefit: 'You recover from stress more gracefully.',
    microcopy: 'Your calm moves with elegance.',
    minMinutes: 40,
    maxMinutes: 60,
    minDays: 5,
    maxDays: 5,
    minStreak: 3
  },
  8: {
    id: 8,
    name: 'Cool Koala',
    emoji: '🐨',
    effort: '55–75 min • 5–6 days • 4-day streak',
    benefit: 'Calm is becoming easier to access and sustain.',
    microcopy: 'You\'re regulated without even trying.',
    minMinutes: 55,
    maxMinutes: 75,
    minDays: 5,
    maxDays: 6,
    minStreak: 4
  },
  9: {
    id: 9,
    name: 'Zenned Panda',
    emoji: '🐼',
    effort: '75–90 min • 6 days • 5-day streak',
    benefit: 'Your system is entering restorative calm.',
    microcopy: 'You\'re living inside a long, soft exhale.',
    minMinutes: 75,
    maxMinutes: 90,
    minDays: 6,
    maxDays: 6,
    minStreak: 5
  },
  10: {
    id: 10,
    name: 'Collected Alpaca',
    emoji: '🦙',
    effort: '90+ min • 6–7 days • 6–7 day streak',
    benefit: 'Your nervous system is regulated and harmonious.',
    microcopy: 'You\'ve built something steady inside yourself.',
    minMinutes: 90,
    maxMinutes: Infinity,
    minDays: 6,
    maxDays: 7,
    minStreak: 6
  }
};

/**
 * Calculate current vibe based on weekly stats
 * @param {number} totalMinutes - Total minutes practiced this week
 * @param {number} daysPracticed - Number of days practiced this week
 * @param {number} currentStreak - Current consecutive day streak
 * @returns {Object} Current vibe object
 */
export function calculateCurrentVibe(totalMinutes = 0, daysPracticed = 0, currentStreak = 0) {
  // Check vibes in reverse order (highest first) to find the best match
  for (let i = 10; i >= 1; i--) {
    const vibe = VIBES[i];
    
    // Check if user meets minimum requirements
    const meetsMinutes = totalMinutes >= vibe.minMinutes;
    const meetsDays = daysPracticed >= vibe.minDays && daysPracticed <= vibe.maxDays;
    const meetsStreak = vibe.minStreak === 0 || currentStreak >= vibe.minStreak;
    
    if (meetsMinutes && meetsDays && meetsStreak) {
      return vibe;
    }
  }
  
  // Default to Sleepy Otter if no practice yet
  return VIBES[1];
}

/**
 * Calculate total minutes practiced this week
 * @returns {number} Total minutes this week
 */
export function getWeeklyMinutes() {
  const sessions = loadSessions();
  const weeklyStats = getWeeklyStats();
  
  // Get week start date
  const weekStartDate = new Date(weeklyStats.weekStart);
  weekStartDate.setHours(0, 0, 0, 0);
  
  // Filter sessions from this week
  const weekSessions = sessions.filter(session => {
    const sessionDate = new Date(session.timestamp);
    return sessionDate >= weekStartDate;
  });
  
  // Sum up minutes (sessions store duration in seconds)
  const totalSeconds = weekSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  return Math.floor(totalSeconds / 60);
}

/**
 * Get current vibe for this week
 * @returns {Object} Current vibe with stats
 */
export function getCurrentVibe() {
  const weeklyStats = getWeeklyStats();
  const streak = getCurrentStreak();
  const totalMinutes = getWeeklyMinutes();
  
  const vibe = calculateCurrentVibe(totalMinutes, weeklyStats.daysThisWeek, streak);
  
  // Mock community count (in real app, this would come from backend)
  const mockCommunityCounts = {
    1: 1247,
    2: 892,
    3: 456,
    4: 203,
    5: 189,
    6: 156,
    7: 98,
    8: 67,
    9: 45,
    10: 23
  };
  
  return {
    vibe,
    totalMinutes,
    daysPracticed: weeklyStats.daysThisWeek,
    streak,
    communityCount: mockCommunityCounts[vibe.id] || 100
  };
}

/**
 * Get vibe by ID
 * @param {number} vibeId - Vibe ID (1-10)
 * @returns {Object} Vibe object
 */
export function getVibeById(vibeId) {
  return VIBES[vibeId] || VIBES[1];
}

/**
 * Get all vibes (for display purposes)
 * @returns {Array} Array of all vibe objects
 */
export function getAllVibes() {
  return Object.values(VIBES);
}

