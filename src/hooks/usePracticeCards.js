import { useState, useEffect } from 'react';

// Use deployed API URL for local development since serverless functions don't run locally
const API_BASE = import.meta.env.DEV 
  ? (import.meta.env.VITE_API_BASE_URL || 'https://magicwork.vercel.app')
  : '';

/**
 * Hook to fetch practice cards for a space
 * Each space has 4 cards (index 0-3) that can be edited independently
 * 
 * @param {string} spaceName - The name of the space (e.g., "Slow Morning")
 * @returns {Object} { cards: Array, loading: boolean, error: string }
 * 
 * @example
 * const { cards, loading } = usePracticeCards('Slow Morning');
 * // cards[0] = Card 0 data
 * // cards[1] = Card 1 data
 * // etc.
 */
export function usePracticeCards(spaceName) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!spaceName) {
      setLoading(false);
      return;
    }

    async function fetchCards() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `${API_BASE}/api/practice-cards?space=${encodeURIComponent(spaceName)}`
        );
        
        if (!response.ok) {
          // If API fails, return empty array (cards will use defaults)
          // Silently fail - don't log in production
          setCards([]);
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        
        // Ensure we have 4 cards (fill with defaults if needed)
        const cardsArray = Array.isArray(data) ? data : [];
        const cardsMap = new Map();
        
        // Map existing cards by index
        cardsArray.forEach(card => {
          cardsMap.set(card.card_index, card);
        });
        
        // Fill missing cards with defaults - each with a unique relaxing theme
        const defaultCardNames = [
          'Gentle Clouds',
          'Soothing Rain',
          'Calm Waves',
          'Peaceful Forest'
        ];
        
        const defaultDescriptions = [
          'Drift away with gentle clouds moving across the sky.',
          'Find calm in the gentle rhythm of falling rain.',
          'Let ocean waves wash away tension and stress.',
          'Immerse yourself in the tranquility of nature.'
        ];
        
        const finalCards = [];
        for (let i = 0; i < 4; i++) {
          if (cardsMap.has(i)) {
            finalCards.push(cardsMap.get(i));
          } else {
            // Default card data with relaxing themes
            finalCards.push({
              id: null,
              space_name: spaceName,
              card_index: i,
              title: defaultCardNames[i] || `${spaceName} - Card ${i + 1}`,
              description: defaultDescriptions[i] || 'A space for mindful presence.',
              guidance: null,
              is_practice_of_day: false,
              practice_type: 'ambient',
              duration_minutes: null,
              video_asset_id: null,
              audio_asset_id: null,
              status: 'active'
            });
          }
        }
        
        setCards(finalCards);
      } catch (err) {
        // Silently fail - don't log errors in production
        setError(err.message);
        // Return default cards on error with relaxing themes
        setCards([
          { space_name: spaceName, card_index: 0, title: 'Gentle Clouds', description: 'Drift away with gentle clouds moving across the sky.', status: 'active' },
          { space_name: spaceName, card_index: 1, title: 'Soothing Rain', description: 'Find calm in the gentle rhythm of falling rain.', status: 'active' },
          { space_name: spaceName, card_index: 2, title: 'Calm Waves', description: 'Let ocean waves wash away tension and stress.', status: 'active' },
          { space_name: spaceName, card_index: 3, title: 'Peaceful Forest', description: 'Immerse yourself in the tranquility of nature.', status: 'active' }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchCards();
  }, [spaceName]);

  return { cards, loading, error };
}


