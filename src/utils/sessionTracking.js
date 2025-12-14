/**
 * Session Tracking Utility
 * Tracks completed practice sessions with full details
 */

const SESSIONS_KEY = 'magicwork_sessions';

/**
 * Save a completed practice session
 * @param {Object} session - Session data
 * @param {string} session.spaceName - Name of the practice space
 * @param {number} session.duration - Duration in seconds
 * @param {string} session.mode - 'guided' or 'ambient'
 * @param {number} [session.heartsSent] - Number of hearts sent (ambient mode)
 */
export function saveSession({ spaceName, duration, mode, heartsSent = 0 }) {
  try {
    const sessions = loadSessions();
    const newSession = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      spaceName,
      duration,
      mode,
      heartsSent,
      completedAt: new Date().toISOString(),
      timestamp: Date.now()
    };
    
    sessions.push(newSession);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    
    return newSession;
  } catch (error) {
    console.warn('[SessionTracking] Error saving session:', error);
    return null;
  }
}

/**
 * Load all sessions from localStorage
 * @returns {Array} Array of session objects
 */
export function loadSessions() {
  try {
    const data = localStorage.getItem(SESSIONS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.warn('[SessionTracking] Error loading sessions:', error);
    return [];
  }
}

/**
 * Get sessions for a specific space
 * @param {string} spaceName - Name of the space
 * @returns {Array} Filtered sessions
 */
export function getSessionsForSpace(spaceName) {
  const sessions = loadSessions();
  return sessions.filter(s => s.spaceName === spaceName);
}

/**
 * Get total practice time in seconds
 * @returns {number} Total seconds
 */
export function getTotalPracticeTime() {
  const sessions = loadSessions();
  return sessions.reduce((total, session) => total + session.duration, 0);
}

/**
 * Get total number of completed practices
 * @returns {number} Total count
 */
export function getTotalPracticeCount() {
  return loadSessions().length;
}

/**
 * Calculate current streak (consecutive days with at least one practice)
 * @returns {number} Streak in days
 */
export function getCurrentStreak() {
  const sessions = loadSessions();
  if (sessions.length === 0) return 0;
  
  // Sort by date (newest first)
  const sorted = [...sessions].sort((a, b) => b.timestamp - a.timestamp);
  
  // Group by date
  const dates = new Set();
  sorted.forEach(session => {
    const date = new Date(session.timestamp).toDateString();
    dates.add(date);
  });
  
  // Calculate consecutive days
  const uniqueDates = Array.from(dates);
  if (uniqueDates.length === 0) return 0;
  
  let streak = 0;
  const today = new Date().toDateString();
  
  // Check if today or yesterday has a practice
  const hasToday = uniqueDates.includes(today);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  const hasYesterday = uniqueDates.includes(yesterdayStr);
  
  if (!hasToday && !hasYesterday) return 0;
  
  // Start counting from today or yesterday
  let checkDate = hasToday ? new Date() : yesterday;
  
  for (let i = 0; i < uniqueDates.length + 1; i++) {
    const dateStr = checkDate.toDateString();
    if (uniqueDates.includes(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * Get most used space (favorite)
 * @returns {string|null} Space name or null
 */
export function getFavoriteSpace() {
  const sessions = loadSessions();
  if (sessions.length === 0) return null;
  
  const spaceCounts = {};
  sessions.forEach(session => {
    spaceCounts[session.spaceName] = (spaceCounts[session.spaceName] || 0) + 1;
  });
  
  const entries = Object.entries(spaceCounts);
  if (entries.length === 0) return null;
  
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

/**
 * Get count of unique spaces tried
 * @returns {number} Count of unique spaces (max 9)
 */
export function getSpacesTriedCount() {
  const sessions = loadSessions();
  const uniqueSpaces = new Set(sessions.map(s => s.spaceName));
  return uniqueSpaces.size;
}

