// Favorites system for practices in localStorage
const STORAGE_KEY = 'magicwork_practiceFavorites';

// Load favorites from localStorage
export function loadFavorites() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return new Set();
    }
    const parsed = JSON.parse(data);
    return new Set(parsed);
  } catch (error) {
    console.error('[PracticeFavorites] Error loading favorites:', error);
    return new Set();
  }
}

// Save favorites to localStorage
function saveFavorites(favorites) {
  try {
    const array = Array.from(favorites);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(array));
  } catch (error) {
    console.error('[PracticeFavorites] Error saving favorites:', error);
  }
}

// Check if an item is favorited
export function isFavorited(itemId) {
  const favorites = loadFavorites();
  return favorites.has(itemId);
}

// Toggle favorite status
export function toggleFavorite(itemId) {
  const favorites = loadFavorites();
  if (favorites.has(itemId)) {
    favorites.delete(itemId);
  } else {
    favorites.add(itemId);
  }
  saveFavorites(favorites);
  return favorites.has(itemId);
}

// Add favorite
export function addFavorite(itemId) {
  const favorites = loadFavorites();
  favorites.add(itemId);
  saveFavorites(favorites);
}

// Remove favorite
export function removeFavorite(itemId) {
  const favorites = loadFavorites();
  favorites.delete(itemId);
  saveFavorites(favorites);
}


