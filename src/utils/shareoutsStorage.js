/**
 * Shareouts Storage Utility
 * Manages user shareouts in localStorage
 */

const SHAREOUTS_KEY = 'magicwork_shareouts';

/**
 * Save a shareout
 * @param {Object} shareout - Shareout data
 * @param {string} shareout.spaceName - Name of the space
 * @param {string} shareout.prompt - The prompt text
 * @param {string} shareout.text - User's response text
 * @param {string} shareout.privacy - 'private', 'anonymous', or 'public'
 * @returns {Object} Saved shareout with id and timestamp
 */
export function saveShareout({ spaceName, prompt, text, privacy }) {
  try {
    const shareouts = loadShareouts();
    const newShareout = {
      id: `shareout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      spaceName,
      prompt,
      text,
      privacy,
      timestamp: Date.now(),
      completedAt: new Date().toISOString()
    };
    
    shareouts.push(newShareout);
    localStorage.setItem(SHAREOUTS_KEY, JSON.stringify(shareouts));
    
    return newShareout;
  } catch (error) {
    console.warn('[ShareoutsStorage] Error saving shareout:', error);
    return null;
  }
}

/**
 * Load all shareouts from localStorage
 * @returns {Array} Array of shareout objects
 */
export function loadShareouts() {
  try {
    const data = localStorage.getItem(SHAREOUTS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.warn('[ShareoutsStorage] Error loading shareouts:', error);
    return [];
  }
}

/**
 * Get shareouts for a specific space
 * @param {string} spaceName - Name of the space
 * @param {boolean} includePrivate - Whether to include private shareouts
 * @returns {Array} Filtered shareouts
 */
export function getShareoutsForSpace(spaceName, includePrivate = true) {
  const shareouts = loadShareouts();
  return shareouts.filter(s => {
    if (s.spaceName !== spaceName) return false;
    if (!includePrivate && s.privacy === 'private') return false;
    return true;
  });
}

/**
 * Format shareout for display
 * @param {Object} shareout - Shareout object from storage
 * @returns {Object} Formatted shareout with display properties
 */
export function formatShareoutForDisplay(shareout) {
  const now = Date.now();
  const diff = now - shareout.timestamp;
  const minutes = Math.floor(diff / 60000);
  
  let timeDisplay;
  if (minutes < 1) {
    timeDisplay = 'just now';
  } else if (minutes < 60) {
    timeDisplay = `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`;
  } else {
    const hours = Math.floor(minutes / 60);
    timeDisplay = `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  return {
    id: shareout.id,
    name: shareout.privacy === 'anonymous' ? 'Someone' : 'You',
    time: timeDisplay,
    emoji: shareout.privacy === 'private' ? '✨' : shareout.emoji || '🌿',
    text: shareout.text,
    privacy: shareout.privacy,
    isOwn: true
  };
}

