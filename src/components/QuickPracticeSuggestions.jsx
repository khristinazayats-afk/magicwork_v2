import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

/**
 * QuickPracticeSuggestions - AI-powered personalized quick practice cards
 * Shows above the main practices list with suggestions based on user history
 */
export default function QuickPracticeSuggestions({ 
  onSelectPractice,
  currentSpaceName = null 
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, [currentSpaceName]);

  const loadSuggestions = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Determine time of day
      const hour = new Date().getHours();
      let timeOfDay;
      if (hour >= 5 && hour < 12) timeOfDay = 'morning';
      else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
      else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
      else timeOfDay = 'night';

      // Call AI recommendations API
      const response = await fetch('/api/generate-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          timeOfDay,
          currentEmotionalState: null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to load suggestions');
      }

      const data = await response.json();
      setSuggestions(data.recommendations || []);
    } catch (err) {
      console.error('Error loading practice suggestions:', err);
      setError(err.message);
      // Show fallback suggestions
      setSuggestions(getFallbackSuggestions());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackSuggestions = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return [
        {
          title: 'Morning Energizer',
          duration: 5,
          spaceName: 'Slow Morning',
          intent: 'boost_energy',
          emotionalState: 'neutral',
          ambientSound: 'forest-birds',
          reason: 'Perfect start to your day with energizing breathwork'
        }
      ];
    } else if (hour >= 12 && hour < 17) {
      return [
        {
          title: 'Midday Focus',
          duration: 10,
          spaceName: 'Get in the Flow State',
          intent: 'improve_focus',
          emotionalState: 'neutral',
          ambientSound: 'white-noise',
          reason: 'Sharpen your concentration for afternoon productivity'
        }
      ];
    } else if (hour >= 17 && hour < 21) {
      return [
        {
          title: 'Evening Wind Down',
          duration: 5,
          spaceName: 'Gentle De-Stress',
          intent: 'reduce_stress',
          emotionalState: 'slightly_anxious',
          ambientSound: 'gentle-waves',
          reason: 'Release the day\'s tension and find your calm'
        }
      ];
    } else {
      return [
        {
          title: 'Sleep Preparation',
          duration: 10,
          spaceName: 'Drift into Sleep',
          intent: 'better_sleep',
          emotionalState: 'calm',
          ambientSound: 'soft-rain',
          reason: 'Gentle transition into peaceful deep sleep'
        }
      ];
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    // Track suggestion selection
    trackSuggestionClick(suggestion);
    
    // Pass to parent to start practice
    if (onSelectPractice) {
      onSelectPractice({
        ...suggestion,
        isQuickPractice: true
      });
    }
  };

  const trackSuggestionClick = async (suggestion) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('analytics_events').insert({
        user_id: user?.id,
        event_name: 'quick_practice_selected',
        event_category: 'recommendations',
        properties: {
          title: suggestion.title,
          duration: suggestion.duration,
          spaceName: suggestion.spaceName,
          intent: suggestion.intent,
          emotionalState: suggestion.emotionalState,
          ambientSound: suggestion.ambientSound
        },
        occurred_at: new Date().toISOString()
      });
    } catch (err) {
      console.log('Analytics tracking failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="mb-6 px-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 animate-pulse" />
          <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3].map(i => (
            <div 
              key={i}
              className="min-w-[280px] h-24 bg-white/5 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || suggestions.length === 0) {
    return null; // Hide if no suggestions
  }

  return (
    <AnimatePresence>
      {expanded && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-sm">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-sm font-hanken font-bold text-[#1e2d2e]/70 uppercase tracking-wide">
                ✨ Quick Practices for You
              </h3>
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="text-[#1e2d2e]/40 hover:text-[#1e2d2e]/70 transition-colors p-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Suggestion Cards - Horizontal Scroll (left to right) */}
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide scroll-smooth snap-x snap-mandatory -mx-1 px-1">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="min-w-[320px] snap-start bg-white 
                  border-2 border-[#1e2d2e]/10 rounded-2xl p-5 
                  hover:border-[#1e2d2e]/20 hover:shadow-lg
                  transition-all active:scale-98 text-left group flex-shrink-0"
              >
                {/* Title & Duration */}
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-hanken font-bold text-[#1e2d2e] group-hover:text-purple-600 transition-colors pr-2">
                    {suggestion.title || 'Quick Practice'}
                  </h4>
                  <span className="text-xs font-mono font-semibold text-white bg-[#1e2d2e] px-3 py-1.5 rounded-full whitespace-nowrap">
                    {suggestion.duration || 5} min
                  </span>
                </div>

                {/* Space Name */}
                {suggestion.spaceName && (
                  <div className="mb-2 text-sm font-hanken font-medium text-purple-600">
                    {suggestion.spaceName}
                  </div>
                )}

                {/* Reason */}
                <p className="text-sm text-[#1e2d2e]/70 mb-4 line-clamp-2">
                  {suggestion.reason || 'A personalized practice just for you'}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {suggestion.intent && (
                    <span className="text-xs font-mono uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full">
                      {suggestion.intent.replace(/_/g, ' ')}
                    </span>
                  )}
                  {suggestion.ambientSound && (
                    <span className="text-xs font-mono uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
                      {suggestion.ambientSound.replace(/-/g, ' ')}
                    </span>
                  )}
                </div>

                {/* Quick Start Indicator */}
                <div className="flex items-center gap-2 text-[#1e2d2e]/50 group-hover:text-[#1e2d2e]/80 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  <span className="text-xs font-hanken font-semibold uppercase tracking-wider">
                    Start Now
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Show Again Button (when collapsed) */}
        </motion.div>
      )}
      
      {!expanded && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setExpanded(true)}
          className="mb-6 w-full py-3 bg-white 
            border-2 border-[#1e2d2e]/10 hover:border-[#1e2d2e]/20
            rounded-xl text-sm text-[#1e2d2e]/70
            hover:text-[#1e2d2e] hover:shadow-md transition-all 
            flex items-center justify-center gap-2 font-hanken font-semibold"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Show Quick Practices
        </motion.button>
      )}
    </AnimatePresence>
  );
}
