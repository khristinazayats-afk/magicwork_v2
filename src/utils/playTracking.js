/**
 * Play Tracking Utility
 * Tracks how many times a user has played each station per month
 * Resets automatically on new month
 */

const STORAGE_KEY = 'magiwork_play_tracking';

/**
 * Get the current month key (YYYY-MM format)
 */
function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Load tracking data from localStorage
 */
function loadTrackingData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return { month: getCurrentMonthKey(), plays: {} };
    
    const parsed = JSON.parse(data);
    
    // Reset if it's a new month
    if (parsed.month !== getCurrentMonthKey()) {
      return { month: getCurrentMonthKey(), plays: {} };
    }
    
    return parsed;
  } catch (error) {
    console.warn('[PlayTracking] Error loading data:', error);
    return { month: getCurrentMonthKey(), plays: {} };
  }
}

/**
 * Save tracking data to localStorage
 */
function saveTrackingData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('[PlayTracking] Error saving data:', error);
  }
}

/**
 * Increment play count for a station
 * @param {string} stationName - Name of the station
 */
export function incrementPlayCount(stationName) {
  const data = loadTrackingData();
  
  if (!data.plays[stationName]) {
    data.plays[stationName] = 0;
  }
  
  data.plays[stationName]++;
  saveTrackingData(data);
  
  console.log(`[PlayTracking] ${stationName}: ${data.plays[stationName]} plays this month`);
  
  return data.plays[stationName];
}

/**
 * Get play count for a station
 * @param {string} stationName - Name of the station
 * @returns {number} Number of plays this month
 */
export function getPlayCount(stationName) {
  const data = loadTrackingData();
  return data.plays[stationName] || 0;
}

/**
 * Check if a station has been played more than X times this month
 * @param {string} stationName - Name of the station
 * @param {number} threshold - Threshold number (default: 5)
 * @returns {boolean} True if played more than threshold times
 */
export function hasExceededPlayLimit(stationName, threshold = 5) {
  const playCount = getPlayCount(stationName);
  return playCount > threshold;
}

/**
 * Reset play count for a specific station (for testing)
 * @param {string} stationName - Name of the station
 */
export function resetStationPlayCount(stationName) {
  const data = loadTrackingData();
  if (data.plays[stationName]) {
    delete data.plays[stationName];
    saveTrackingData(data);
    console.log(`[PlayTracking] Reset play count for ${stationName}`);
  }
}

/**
 * Get all play statistics (for debugging)
 */
export function getAllPlayStats() {
  const data = loadTrackingData();
  return {
    month: data.month,
    stations: data.plays
  };
}

