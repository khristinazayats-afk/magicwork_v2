// Favorites utility functions
// Stores favorite tracks and stations in localStorage

const FAVORITES_KEY = 'practiceApp_favorites';

// Get all favorites from localStorage
function getFavorites() {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading favorites from localStorage:', error);
  }
  return { tracks: [], stations: [] };
}

// Save favorites to localStorage
function saveFavorites(favorites) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Error saving favorites to localStorage:', error);
  }
}

// Check if a track is favorited
export function isTrackFavorited(trackId) {
  const favorites = getFavorites();
  return favorites.tracks.includes(trackId);
}

// Toggle track favorite status
export function toggleTrackFavorite(trackId) {
  const favorites = getFavorites();
  const index = favorites.tracks.indexOf(trackId);
  
  if (index > -1) {
    // Remove from favorites
    favorites.tracks.splice(index, 1);
  } else {
    // Add to favorites
    favorites.tracks.push(trackId);
  }
  
  saveFavorites(favorites);
  return index === -1; // Return true if added, false if removed
}

// Check if a station is favorited
export function isStationFavorited(stationName) {
  const favorites = getFavorites();
  return favorites.stations.includes(stationName);
}

// Toggle station favorite status
export function toggleStationFavorite(stationName) {
  const favorites = getFavorites();
  const index = favorites.stations.indexOf(stationName);
  
  if (index > -1) {
    // Remove from favorites
    favorites.stations.splice(index, 1);
  } else {
    // Add to favorites
    favorites.stations.push(stationName);
  }
  
  saveFavorites(favorites);
  return index === -1; // Return true if added, false if removed
}














