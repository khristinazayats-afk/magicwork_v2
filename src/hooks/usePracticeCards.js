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
          console.warn(`Failed to fetch practice cards for ${spaceName}: ${response.statusText}`);
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
        
        // Fill missing cards with defaults
        const finalCards = [];
        for (let i = 0; i < 4; i++) {
          if (cardsMap.has(i)) {
            finalCards.push(cardsMap.get(i));
          } else {
            // Default card data
            finalCards.push({
              id: null,
              space_name: spaceName,
              card_index: i,
              title: `${spaceName} - Card ${i + 1}`,
              description: 'A space for mindful presence.',
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
        console.error('Error fetching practice cards:', err);
        setError(err.message);
        // Return default cards on error
        setCards([
          { space_name: spaceName, card_index: 0, title: `${spaceName} - Card 1`, description: 'A space for mindful presence.', status: 'active' },
          { space_name: spaceName, card_index: 1, title: `${spaceName} - Card 2`, description: 'A space for mindful presence.', status: 'active' },
          { space_name: spaceName, card_index: 2, title: `${spaceName} - Card 3`, description: 'A space for mindful presence.', status: 'active' },
          { space_name: spaceName, card_index: 3, title: `${spaceName} - Card 4`, description: 'A space for mindful presence.', status: 'active' }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchCards();
  }, [spaceName]);

  return { cards, loading, error };
}


