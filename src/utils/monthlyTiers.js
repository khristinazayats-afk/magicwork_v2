/**
 * Monthly Presence Tiers System
 * Tracks practice sessions per month and calculates tier levels
 */

const STORAGE_KEY = 'magicwork_monthly_tiers';

// Tier definitions
export const TIERS = {
  1: {
    id: 1,
    name: 'Emerging Light',
    range: [1, 4],
    headline: "Your aura is glowing.",
    secondaryTemplate: "You've stepped into your Emerging Light, together with {X} other humans this month."
  },
  2: {
    id: 2,
    name: 'Steady Glow',
    range: [5, 14],
    headline: "Your aura is growing steadier.",
    secondaryTemplate: "You've stepped into Steady Glow, together with {X} other humans this month."
  },
  3: {
    id: 3,
    name: 'Growing Radiance',
    range: [15, 22],
    headline: "Your aura is radiant.",
    secondaryTemplate: "You've stepped into Growing Radiance, alongside {X} humans this month."
  },
  4: {
    id: 4,
    name: 'Bright Presence',
    range: [23, 29],
    headline: "Your presence is bright.",
    secondaryTemplate: "You've stepped into Bright Presence, with {X} humans walking this path this month."
  },
  5: {
    id: 5,
    name: 'Luminous Being',
    range: [30, Infinity],
    headline: "Your light is luminous.",
    secondaryTemplate: "You've stepped into Luminous Being, together with {X} devoted humans this month."
  }
};

/**
 * Get the current month key (YYYY-MM format)
 */
function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Load monthly tracking data from localStorage
 */
function loadMonthlyData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return {
        month: getCurrentMonthKey(),
        sessions: [],
        consecutiveDays: 0,
        lastSessionDate: null
      };
    }

    const parsed = JSON.parse(data);
    const currentMonth = getCurrentMonthKey();

    // Reset if it's a new month
    if (parsed.month !== currentMonth) {
      return {
        month: currentMonth,
        sessions: [],
        consecutiveDays: 0,
        lastSessionDate: null
      };
    }

    return parsed;
  } catch (error) {
    console.error('[MonthlyTiers] Error loading data:', error);
    return {
      month: getCurrentMonthKey(),
      sessions: [],
      consecutiveDays: 0,
      lastSessionDate: null
    };
  }
}

/**
 * Save monthly tracking data to localStorage
 */
function saveMonthlyData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('[MonthlyTiers] Error saving data:', error);
  }
}

/**
 * Get today's date string (YYYY-MM-DD)
 */
function getTodayDateString() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

/**
 * Record a practice session (min. 1 minute)
 * @param {number} minutesPracticed - Minutes practiced in this session
 * @returns {Object} Updated stats
 */
export function recordPracticeSession(minutesPracticed = 1) {
  const data = loadMonthlyData();
  const today = getTodayDateString();

  // Add new session
  const newSession = {
    date: today,
    minutes: minutesPracticed,
    timestamp: Date.now()
  };

  // Check if we already have a session today (to avoid duplicates)
  const hasSessionToday = data.sessions.some(s => s.date === today);
  
  if (!hasSessionToday) {
    data.sessions.push(newSession);
    
    // Update consecutive days
    if (data.lastSessionDate) {
      const lastDate = new Date(data.lastSessionDate);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day
        data.consecutiveDays = (data.consecutiveDays || 0) + 1;
      } else if (daysDiff > 1) {
        // Streak broken, reset to 1
        data.consecutiveDays = 1;
      }
    } else {
      // First session
      data.consecutiveDays = 1;
    }
    
    data.lastSessionDate = today;
  } else {
    // Update existing session's minutes if this one is longer
    const existingSession = data.sessions.find(s => s.date === today);
    if (existingSession && minutesPracticed > existingSession.minutes) {
      existingSession.minutes = minutesPracticed;
    }
  }

  saveMonthlyData(data);

  return {
    sessionsThisMonth: data.sessions.length,
    consecutiveDays: data.consecutiveDays,
    tier: calculateTier(data.sessions.length),
    lastSessionDate: data.lastSessionDate
  };
}

/**
 * Calculate tier based on number of sessions this month
 * @param {number} sessionCount - Number of sessions this month
 * @returns {number} Tier (1-5)
 */
export function calculateTier(sessionCount) {
  if (sessionCount >= 30) return 5;
  if (sessionCount >= 23) return 4;
  if (sessionCount >= 15) return 3;
  if (sessionCount >= 5) return 2;
  if (sessionCount >= 1) return 1;
  return 1; // Default to tier 1
}

/**
 * Get mock tier info for testing
 * @param {number} tier - Tier level (1-5)
 * @param {number} sessions - Number of sessions this month
 * @param {number} consecutiveDays - Consecutive days practiced
 * @returns {Object} Mock tier info
 */
function getMockTierInfo(tier = 2, sessions = 8, consecutiveDays = 5) {
  const tierInfo = TIERS[tier];
  
  const mockCommunityCounts = {
    1: 1247,
    2: 892,
    3: 456,
    4: 203,
    5: 89
  };

  return {
    tier,
    tierInfo,
    sessionsThisMonth: sessions,
    consecutiveDays: consecutiveDays,
    communityCount: mockCommunityCounts[tier] || 100,
    lastSessionDate: getTodayDateString()
  };
}

/**
 * Get current tier and stats
 * @returns {Object} Current tier info and stats
 */
export function getCurrentTierInfo() {
  // Check for mock mode via URL parameter
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const mockTier = params.get('mockTier');
    if (mockTier !== null) {
      const tier = parseInt(mockTier, 10);
      if (tier >= 1 && tier <= 5) {
        // Calculate sessions and consecutive days based on tier
        const sessionsMap = {
          1: 2,
          2: 8,
          3: 18,
          4: 25,
          5: 32
        };
        const consecutiveDaysMap = {
          1: 2,
          2: 5,
          3: 12,
          4: 20,
          5: 28
        };
        return getMockTierInfo(tier, sessionsMap[tier], consecutiveDaysMap[tier]);
      }
    }
  }
  
  const data = loadMonthlyData();
  const sessionCount = data.sessions.length;
  const tier = calculateTier(sessionCount);
  const tierInfo = TIERS[tier];

  // Mock community count (in real app, this would come from backend)
  const mockCommunityCounts = {
    1: 1247,
    2: 892,
    3: 456,
    4: 203,
    5: 89
  };

  return {
    tier,
    tierInfo,
    sessionsThisMonth: sessionCount,
    consecutiveDays: data.consecutiveDays || 0,
    communityCount: mockCommunityCounts[tier] || 100,
    lastSessionDate: data.lastSessionDate
  };
}

/**
 * Get minutes from last session
 * @returns {number} Minutes from most recent session
 */
export function getLastSessionMinutes() {
  const data = loadMonthlyData();
  if (data.sessions.length === 0) return 0;
  
  const lastSession = data.sessions[data.sessions.length - 1];
  return lastSession.minutes || 1;
}

