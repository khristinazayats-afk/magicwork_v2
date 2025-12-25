/**
 * Achievements System
 * Tracks and calculates achievements based on practice sessions
 */

import { loadSessions, getTotalPracticeTime, getCurrentStreak, getSpacesTriedCount } from './sessionTracking';

const ACHIEVEMENTS_KEY = 'magiwork_achievements';

/**
 * Achievement definitions
 */
export const ACHIEVEMENTS = {
  FIRST_PRACTICE: {
    id: 'first_practice',
    name: 'First Step',
    description: 'Completed your first practice',
    icon: '🌟',
    unlocked: false
  },
  TEN_PRACTICES: {
    id: 'ten_practices',
    name: 'Building Momentum',
    description: 'Completed 10 practices',
    icon: '🌱',
    unlocked: false
  },
  ALL_SPACES: {
    id: 'all_spaces',
    name: 'Explorer',
    description: 'Tried all 9 calm spaces',
    icon: '🗺️',
    unlocked: false
  },
  SEVEN_DAY_STREAK: {
    id: 'seven_day_streak',
    name: 'Weekly Warrior',
    description: '7 day practice streak',
    icon: '🔥',
    unlocked: false
  },
  THIRTY_DAY_STREAK: {
    id: 'thirty_day_streak',
    name: 'Monthly Master',
    description: '30 day practice streak',
    icon: '💫',
    unlocked: false
  },
  SIXTY_MINUTES: {
    id: 'sixty_minutes',
    name: 'Hour of Calm',
    description: '60 minutes of practice',
    icon: '⏰',
    unlocked: false
  },
  THREE_HUNDRED_MINUTES: {
    id: 'three_hundred_minutes',
    name: 'Five Hour Fortress',
    description: '300 minutes of practice',
    icon: '🏰',
    unlocked: false
  },
  THOUSAND_MINUTES: {
    id: 'thousand_minutes',
    name: 'Champion of Calm',
    description: '1000 minutes of practice',
    icon: '👑',
    unlocked: false
  }
};

/**
 * Load unlocked achievements from localStorage
 * @returns {Set} Set of achievement IDs
 */
function loadUnlockedAchievements() {
  try {
    const data = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (!data) return new Set();
    const ids = JSON.parse(data);
    return new Set(ids);
  } catch (error) {
    console.warn('[Achievements] Error loading achievements:', error);
    return new Set();
  }
}

/**
 * Save unlocked achievements to localStorage
 * @param {Set} unlockedSet - Set of achievement IDs
 */
function saveUnlockedAchievements(unlockedSet) {
  try {
    const ids = Array.from(unlockedSet);
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(ids));
  } catch (error) {
    console.warn('[Achievements] Error saving achievements:', error);
  }
}

/**
 * Unlock an achievement
 * @param {string} achievementId - ID of the achievement
 * @returns {boolean} True if newly unlocked, false if already unlocked
 */
function unlockAchievement(achievementId) {
  const unlocked = loadUnlockedAchievements();
  if (unlocked.has(achievementId)) {
    return false; // Already unlocked
  }
  
  unlocked.add(achievementId);
  saveUnlockedAchievements(unlocked);
  return true; // Newly unlocked
}

/**
 * Check and unlock achievements based on current progress
 * @returns {Array} Array of newly unlocked achievement objects
 */
export function checkAndUnlockAchievements() {
  const sessions = loadSessions();
  const totalTime = getTotalPracticeTime();
  const streak = getCurrentStreak();
  const spacesTried = getSpacesTriedCount();
  const practiceCount = sessions.length;
  
  const newlyUnlocked = [];
  
  // First practice
  if (practiceCount >= 1) {
    if (unlockAchievement('first_practice')) {
      newlyUnlocked.push(ACHIEVEMENTS.FIRST_PRACTICE);
    }
  }
  
  // Ten practices
  if (practiceCount >= 10) {
    if (unlockAchievement('ten_practices')) {
      newlyUnlocked.push(ACHIEVEMENTS.TEN_PRACTICES);
    }
  }
  
  // All spaces
  if (spacesTried >= 9) {
    if (unlockAchievement('all_spaces')) {
      newlyUnlocked.push(ACHIEVEMENTS.ALL_SPACES);
    }
  }
  
  // Seven day streak
  if (streak >= 7) {
    if (unlockAchievement('seven_day_streak')) {
      newlyUnlocked.push(ACHIEVEMENTS.SEVEN_DAY_STREAK);
    }
  }
  
  // Thirty day streak
  if (streak >= 30) {
    if (unlockAchievement('thirty_day_streak')) {
      newlyUnlocked.push(ACHIEVEMENTS.THIRTY_DAY_STREAK);
    }
  }
  
  // Sixty minutes
  if (totalTime >= 3600) { // 60 * 60 seconds
    if (unlockAchievement('sixty_minutes')) {
      newlyUnlocked.push(ACHIEVEMENTS.SIXTY_MINUTES);
    }
  }
  
  // Three hundred minutes
  if (totalTime >= 18000) { // 300 * 60 seconds
    if (unlockAchievement('three_hundred_minutes')) {
      newlyUnlocked.push(ACHIEVEMENTS.THREE_HUNDRED_MINUTES);
    }
  }
  
  // Thousand minutes
  if (totalTime >= 60000) { // 1000 * 60 seconds
    if (unlockAchievement('thousand_minutes')) {
      newlyUnlocked.push(ACHIEVEMENTS.THOUSAND_MINUTES);
    }
  }
  
  return newlyUnlocked;
}

/**
 * Get all unlocked achievements
 * @returns {Array} Array of achievement objects
 */
export function getUnlockedAchievements() {
  const unlocked = loadUnlockedAchievements();
  const allAchievements = Object.values(ACHIEVEMENTS);
  
  return allAchievements.filter(achievement => unlocked.has(achievement.id));
}

/**
 * Get achievement progress (for display)
 * @returns {Object} Progress data
 */
export function getAchievementProgress() {
  const sessions = loadSessions();
  const totalTime = getTotalPracticeTime();
  const streak = getCurrentStreak();
  const spacesTried = getSpacesTriedCount();
  const practiceCount = sessions.length;
  
  return {
    practiceCount,
    totalMinutes: Math.floor(totalTime / 60),
    streak,
    spacesTried,
    nextMilestones: {
      nextPractice: practiceCount < 10 ? 10 - practiceCount : null,
      nextSpace: spacesTried < 9 ? 9 - spacesTried : null,
      nextStreak: streak < 7 ? 7 : streak < 30 ? 30 : null,
      nextMinutes: totalTime < 3600 ? 60 - Math.floor(totalTime / 60) :
                   totalTime < 18000 ? 300 - Math.floor(totalTime / 60) :
                   totalTime < 60000 ? 1000 - Math.floor(totalTime / 60) : null
    }
  };
}

