/**
 * Weekly Practice Tracking Utility
 * Tracks how many days a user has practiced this week
 */

const STORAGE_KEY = 'magicwork_weekly_tracking';

/**
 * Get the start of the current week (Monday)
 */
function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Get the current week key (YYYY-MM-DD format of Monday)
 */
export function getCurrentWeekKey() {
  const weekStart = getWeekStart();
  return `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
}

/**
 * Get today's date string (YYYY-MM-DD)
 */
function getTodayDateString() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

/**
 * Load weekly tracking data from localStorage
 */
function loadWeeklyData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return {
        week: getCurrentWeekKey(),
        practiceDays: []
      };
    }

    const parsed = JSON.parse(data);
    const currentWeek = getCurrentWeekKey();

    // Reset if it's a new week
    if (parsed.week !== currentWeek) {
      return {
        week: currentWeek,
        practiceDays: []
      };
    }

    return parsed;
  } catch (error) {
    console.error('[WeeklyTracking] Error loading data:', error);
    return {
      week: getCurrentWeekKey(),
      practiceDays: []
    };
  }
}

/**
 * Save weekly tracking data to localStorage
 */
function saveWeeklyData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('[WeeklyTracking] Error saving data:', error);
  }
}

/**
 * Record a practice day for this week
 * @returns {Object} Updated weekly stats
 */
export function recordWeeklyPractice() {
  const data = loadWeeklyData();
  const today = getTodayDateString();

  // Check if we already have a practice today
  if (!data.practiceDays.includes(today)) {
    data.practiceDays.push(today);
    saveWeeklyData(data);
  }

  return {
    daysThisWeek: data.practiceDays.length,
    practiceDays: data.practiceDays
  };
}

/**
 * Get mock weekly stats for testing
 * @param {number} days - Number of days to mock (1-7)
 * @returns {Object} Mock weekly stats
 */
function getMockWeeklyStats(days = 4) {
  const weekStart = getWeekStart();
  const practiceDays = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    practiceDays.push(dateString);
  }
  
  return {
    daysThisWeek: days,
    practiceDays: practiceDays,
    weekStart: getCurrentWeekKey()
  };
}

/**
 * Get current weekly stats
 * @returns {Object} Weekly practice stats
 */
export function getWeeklyStats() {
  // Check for mock mode via URL parameter
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const mockDays = params.get('mockWeeklyDays');
    if (mockDays !== null) {
      const days = parseInt(mockDays, 10);
      if (days >= 0 && days <= 7) {
        return getMockWeeklyStats(days);
      }
    }
  }
  
  const data = loadWeeklyData();
  return {
    daysThisWeek: data.practiceDays.length,
    practiceDays: data.practiceDays,
    weekStart: getCurrentWeekKey()
  };
}

/**
 * Check if user practiced today
 * @returns {boolean} True if practiced today
 */
export function practicedToday() {
  // Check for mock mode via URL parameter
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const mockDays = params.get('mockWeeklyDays');
    if (mockDays !== null) {
      const days = parseInt(mockDays, 10);
      // If mock days > 0, assume today is included
      return days > 0;
    }
  }
  
  const data = loadWeeklyData();
  const today = getTodayDateString();
  return data.practiceDays.includes(today);
}

