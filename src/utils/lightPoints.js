// Light Points system for localStorage
const STORAGE_KEY = 'magiwork_lightPoints';
const LIGHT_POINTS_PER_PRACTICE = 5;
const SECONDS_PER_LIGHT_POINT = 10;
const MAX_DAILY_TUNE_POINTS = 6; // 60 seconds = 6 points max

// Get today's date string (YYYY-MM-DD)
function getTodayDateString() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// Load light points data from localStorage
export function loadLightPoints() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return {
        lightPointsTotal: 0,
        lightPointsToday: 0,
        tuneListeningSecondsToday: 0,
        tuneRewardedSecondsToday: 0,
        practiceOfDayCompletedAt: null,
        lastDate: getTodayDateString()
      };
    }

    const parsed = JSON.parse(data);
    const today = getTodayDateString();

    // Reset today's values if it's a new day
    if (parsed.lastDate !== today) {
      return {
        ...parsed,
        lightPointsToday: 0,
        tuneListeningSecondsToday: 0,
        tuneRewardedSecondsToday: 0,
        practiceOfDayCompletedAt: parsed.lastDate === today ? parsed.practiceOfDayCompletedAt : null,
        lastDate: today
      };
    }

    return parsed;
  } catch (error) {
    console.error('[LightPoints] Error loading data:', error);
    return {
      lightPointsTotal: 0,
      lightPointsToday: 0,
      tuneListeningSecondsToday: 0,
      tuneRewardedSecondsToday: 0,
      practiceOfDayCompletedAt: null,
      lastDate: getTodayDateString()
    };
  }
}

// Save light points data to localStorage
function saveLightPoints(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('[LightPoints] Error saving data:', error);
  }
}

// Check if practice of the day is completed today
export function isPracticeOfDayCompleted() {
  const data = loadLightPoints();
  const today = getTodayDateString();
  return data.practiceOfDayCompletedAt === today;
}

// Complete practice of the day and award light points
export function completePracticeOfDay() {
  const data = loadLightPoints();
  const today = getTodayDateString();

  // Check if already completed today
  if (data.practiceOfDayCompletedAt === today) {
    return {
      success: false,
      message: 'Already completed today',
      lightPoints: data.lightPointsTotal
    };
  }

  // Award light points
  const newTotal = data.lightPointsTotal + LIGHT_POINTS_PER_PRACTICE;
  const newToday = data.lightPointsToday + LIGHT_POINTS_PER_PRACTICE;

  const updated = {
    ...data,
    lightPointsTotal: newTotal,
    lightPointsToday: newToday,
    practiceOfDayCompletedAt: today,
    lastDate: today
  };

  saveLightPoints(updated);

  return {
    success: true,
    lightPoints: newTotal,
    lightPointsToday: newToday,
    pointsAwarded: LIGHT_POINTS_PER_PRACTICE
  };
}

// Add listening seconds and award light points if thresholds are crossed
export function addListeningSeconds(seconds) {
  const data = loadLightPoints();
  const today = getTodayDateString();

  // Reset if new day
  if (data.lastDate !== today) {
    data.lightPointsToday = 0;
    data.tuneListeningSecondsToday = 0;
    data.tuneRewardedSecondsToday = 0;
    data.lastDate = today;
  }

  // Add seconds
  const newListeningSeconds = data.tuneListeningSecondsToday + seconds;
  
  // Calculate how many 10-second thresholds have been crossed
  const previousThresholds = Math.floor(data.tuneRewardedSecondsToday / SECONDS_PER_LIGHT_POINT);
  const newThresholds = Math.floor(newListeningSeconds / SECONDS_PER_LIGHT_POINT);
  const thresholdsCrossed = newThresholds - previousThresholds;

  // Cap daily reward (max 6 points = 60 seconds)
  const maxRewardedSeconds = MAX_DAILY_TUNE_POINTS * SECONDS_PER_LIGHT_POINT;
  const cappedListeningSeconds = Math.min(newListeningSeconds, maxRewardedSeconds);
  const cappedThresholds = Math.floor(cappedListeningSeconds / SECONDS_PER_LIGHT_POINT);
  const cappedThresholdsCrossed = cappedThresholds - previousThresholds;

  // Award light points for crossed thresholds
  let pointsAwarded = 0;
  let newTotal = data.lightPointsTotal;
  let newToday = data.lightPointsToday;

  if (cappedThresholdsCrossed > 0) {
    pointsAwarded = cappedThresholdsCrossed;
    newTotal = data.lightPointsTotal + pointsAwarded;
    newToday = data.lightPointsToday + pointsAwarded;
  }

  const updated = {
    ...data,
    lightPointsTotal: newTotal,
    lightPointsToday: newToday,
    tuneListeningSecondsToday: cappedListeningSeconds,
    tuneRewardedSecondsToday: cappedThresholds * SECONDS_PER_LIGHT_POINT,
    lastDate: today
  };

  saveLightPoints(updated);

  return {
    listeningSeconds: cappedListeningSeconds,
    lightPoints: newTotal,
    lightPointsToday: newToday,
    pointsAwarded,
    thresholdsCrossed: cappedThresholdsCrossed
  };
}

// Get current light points stats
export function getLightPointsStats() {
  const data = loadLightPoints();
  return {
    total: data.lightPointsTotal,
    today: data.lightPointsToday,
    listeningSeconds: data.tuneListeningSecondsToday,
    practiceCompleted: isPracticeOfDayCompleted()
  };
}


