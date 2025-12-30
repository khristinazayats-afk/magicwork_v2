# Mood-Based Ambient Sound System

## Overview
The ambient sound system now automatically adjusts based on the user's emotional state selected during onboarding. When users indicate how they're feeling, the app plays calming soundscapes matched to their mood.

## Mood to Ambient Sound Mapping

| User Mood | Ambient Sound | Description |
|-----------|--------------|-------------|
| 😌 Calm | `gentle-waves` | Peaceful ocean waves for maintaining calm |
| 😰 Stressed | `soft-rain` | Soothing rain sounds to reduce stress |
| ⚡ Energized | `white-noise` | Clean ambient noise for energized focus |
| 😴 Tired | `temple-bells` | Gentle temple bells for rest and recovery |
| 🎯 Focused | `forest-birds` | Natural forest sounds to maintain focus |
| 😟 Anxious | `soft-rain` | Calming rain to ease anxiety |

## How It Works

### 1. **Onboarding Flow** (`src/components/OnboardingModal.jsx`)
- User selects their current mood from 6 options
- Mood is saved to localStorage: `user_mood_${userId}`
- OnComplete callback passes mood to parent component

### 2. **Feed Component** (`src/components/FeedNew.jsx`)
```javascript
const moodToAmbientSound = {
  'calm': 'gentle-waves',
  'stressed': 'soft-rain',
  'energized': 'white-noise',
  'tired': 'temple-bells',
  'focused': 'forest-birds',
  'anxious': 'soft-rain'
};
```

On mount:
- Loads user's saved mood from localStorage
- Sets ambient sound based on mood mapping
- Logs: `Setting ambient sound based on mood "stressed": soft-rain`

On onboarding complete:
- Immediately switches ambient sound to match new mood
- Logs: `Mood "anxious" selected, switching ambient sound to: soft-rain`

### 3. **Global Ambient Manager** (`src/components/AmbientSoundManager.jsx`)
The global ambient sound manager:
- Loads user mood on mount from localStorage
- Listens for mood changes via storage events
- Prioritizes mood-based sound over default rotation
- Tracks emotional state in analytics

```javascript
// Prioritize mood-based sound
if (userMood && MOOD_TO_AMBIENT_SOUND[userMood]) {
  selectedType = MOOD_TO_AMBIENT_SOUND[userMood];
  console.log(`Using mood-based sound: ${selectedType} for mood: ${userMood}`);
}
```

### 4. **API Generation** (`api/generate-ambient.js`)
Each ambient sound type has a specific AI prompt:
- `soft-rain`: "gentle rain falling softly, peaceful meditation ambiance"
- `gentle-waves`: "ocean waves gently lapping the shore, calm seaside atmosphere"
- `forest-birds`: "peaceful forest with distant bird calls, nature meditation"
- `white-noise`: "soft ambient background white noise, calming soundscape"
- `temple-bells`: "distant peaceful temple bells, meditation atmosphere"

## Technical Implementation

### State Management
```javascript
// FeedNew.jsx
const [ambientSound, setAmbientSound] = useState('forest-birds');

// Load mood on mount
useEffect(() => {
  const userMood = localStorage.getItem(`user_mood_${user.id}`);
  if (userMood && moodToAmbientSound[userMood]) {
    setAmbientSound(moodToAmbientSound[userMood]);
  }
}, []);

// Update on onboarding complete
const handleOnboardingComplete = async (data) => {
  if (data.mood && moodToAmbientSound[data.mood]) {
    setAmbientSound(moodToAmbientSound[data.mood]);
  }
};
```

### Storage Keys
- `onboarded_${userId}`: Full onboarding data (mood, intentions, timestamp)
- `user_mood_${userId}`: Current mood string ('calm', 'stressed', etc.)
- `user_intentions_${userId}`: Array of user intentions

### Analytics Tracking
```javascript
trackAmbientSoundPlayed({
  soundType: selectedType,
  spaceName: 'main',
  emotionalState: userMood  // Now includes user's mood
});
```

## User Experience

1. **First Visit**
   - User opens app → OnboardingModal appears
   - Selects mood (e.g., "Stressed" 😰)
   - Ambient sound immediately switches to `soft-rain`
   - Calming rain sounds begin playing

2. **Return Visits**
   - App loads → checks localStorage for saved mood
   - Automatically plays last selected mood's ambient sound
   - No need to re-select mood

3. **Changing Mood**
   - User completes onboarding again (future feature: mood selector)
   - Ambient sound updates instantly to match new mood
   - Smooth transition between soundscapes

## Debugging

Enable console logs to see mood-based sound selection:
```javascript
console.log(`[AmbientSoundManager] Loaded user mood: ${savedMood}`);
console.log(`[AmbientSoundManager] Using mood-based sound: ${selectedType} for mood: ${userMood}`);
console.log(`Mood "${data.mood}" selected, switching ambient sound to: ${moodToAmbientSound[data.mood]}`);
```

## Fallback Behavior

1. **No mood selected**: Uses default rotation (`AMBIENT_TYPES[currentSoundIndex]`)
2. **API fails**: Falls back to local file `/assets/ambient-spring-forest-15846.mp3`
3. **Invalid mood**: Defaults to `'forest-birds'`

## Future Enhancements

- [ ] Allow users to change mood without full re-onboarding
- [ ] Add more ambient sound types (crackling fire, cosmic sounds, etc.)
- [ ] Time-based mood suggestions (evening = tired, morning = energized)
- [ ] Practice-specific ambient sounds (breathwork = breathing-space)
- [ ] Mood-based meditation recommendations
- [ ] Smooth crossfade between ambient sound changes

## Testing

To test the mood-based ambient sound system:

1. Clear localStorage: `localStorage.clear()`
2. Refresh app
3. Complete onboarding and select a mood
4. Check console logs for: `Setting ambient sound based on mood "X": Y`
5. Verify correct ambient sound is playing
6. Close and reopen app - sound should persist based on saved mood

## Files Modified

- `src/components/FeedNew.jsx` - Added mood mapping and loading logic
- `src/components/AmbientSoundManager.jsx` - Added mood-based sound prioritization
- `src/components/OnboardingModal.jsx` - Already captures mood (no changes needed)
- `api/generate-ambient.js` - Already supports all ambient types (no changes needed)
