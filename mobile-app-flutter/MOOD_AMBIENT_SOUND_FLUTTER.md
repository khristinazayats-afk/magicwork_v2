# Flutter App: Mood-Based Ambient Sound Implementation ✅

## Overview
The Flutter mobile app now supports mood-based ambient sound personalization, matching the web app's functionality. Users select their emotional state during onboarding, and the app automatically plays calming soundscapes matched to their mood.

---

## Files Created/Modified

### ✅ Created Files

1. **`lib/constants/mood_constants.dart`** - Mood mapping constants
   - 6 mood options (calm, stressed, energized, tired, focused, anxious)
   - Mood-to-ambient-sound mapping
   - Pixabay CDN URLs for each sound type
   - Helper methods for mood lookups

2. **`lib/screens/onboarding_screen.dart`** - Onboarding UI
   - Two-step onboarding flow (mood → intentions)
   - Material Design with animations
   - SharedPreferences + Supabase persistence
   - Automatic ambient sound update on completion

### ✅ Modified Files

3. **`lib/widgets/ambient_sound_manager.dart`** - Ambient sound engine
   - Added mood-based sound selection
   - SharedPreferences + Supabase mood loading
   - `updateMood()` method for dynamic switching
   - Comprehensive logging for debugging

4. **`lib/services/user_profile_service.dart`** - User profile management
   - Added `saveMood(userId, moodId)` method
   - Added `getMood(userId)` method
   - Supabase integration for mood persistence

---

## Mood Mapping

| User Mood | Ambient Sound | Pixabay URL |
|-----------|--------------|-------------|
| 😌 Calm | `gentle-waves` | Relaxing Meditation |
| 😰 Stressed | `soft-rain` | Deep Meditation Ambient |
| ⚡ Energized | `white-noise` | Deep Meditation Ambient |
| 😴 Tired | `temple-bells` | Tibetan Bowls Meditation |
| 🎯 Focused | `forest-birds` | Spiritual Healing Zen |
| 😟 Anxious | `soft-rain` | Deep Meditation Ambient |

---

## How It Works

### 1. First Launch - Onboarding
```dart
// User opens app for the first time
// OnboardingScreen appears (you need to integrate into main.dart)
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => OnboardingScreen(
      onComplete: () {
        // Navigate to home screen
      },
    ),
  ),
);
```

### 2. Mood Selection
- User selects mood from 6 options
- Auto-advances to intentions step (400ms delay)
- User selects intentions (optional)
- Clicks "Complete" or "Skip for now"

### 3. Data Persistence
```dart
// Saved to SharedPreferences (fast local storage)
'user_mood_${userId}': 'stressed'
'user_intentions_${userId}': ['reduce-stress', 'better-sleep']
'onboarded_${userId}': true

// Also saved to Supabase (cloud backup)
user_profiles table:
- current_mood: 'stressed'
- onboarding_completed: true
- onboarding_data: { mood, intentions, timestamp }
```

### 4. Ambient Sound Loading
```dart
// AmbientSoundManager initialization sequence:
1. Load user's mood from SharedPreferences
2. If not found, check Supabase
3. Select ambient sound based on mood
4. Start playback with selected sound
5. Log selection: "Using mood-based sound for mood 'stressed': https://..."
```

### 5. Dynamic Mood Updates
```dart
// When user changes mood (future feature)
final ambientManager = context.findAncestorStateOfType<_AmbientSoundManagerState>();
await ambientManager?.updateMood('calm');

// This will:
// - Save new mood to SharedPreferences + Supabase
// - Stop current ambient sound
// - Start new mood-based ambient sound
```

---

## Integration Steps

### Step 1: Add Onboarding Check to Main App

Update your main navigation to check for onboarding status:

```dart
// lib/main.dart or your router configuration

Future<bool> checkOnboardingStatus() async {
  final userId = Supabase.instance.client.auth.currentUser?.id;
  if (userId == null) return false;
  
  final prefs = await SharedPreferences.getInstance();
  return prefs.getBool('onboarded_$userId') ?? false;
}

// In your router or initial screen:
@override
Widget build(BuildContext context) {
  return FutureBuilder<bool>(
    future: checkOnboardingStatus(),
    builder: (context, snapshot) {
      if (snapshot.data == false) {
        return OnboardingScreen(
          onComplete: () {
            // Reload or navigate to home
            setState(() {});
          },
        );
      }
      return HomeScreen(); // Your main app screen
    },
  );
}
```

### Step 2: Update Supabase Schema (Optional)

If your `user_profiles` table doesn't have these columns, add them:

```sql
-- Add mood tracking columns
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS current_mood TEXT,
ADD COLUMN IF NOT EXISTS mood_updated_at TIMESTAMP WITH TIME ZONE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_mood 
ON user_profiles(current_mood);
```

### Step 3: Test the Implementation

1. **Clear app data** (to simulate first launch)
   ```bash
   # iOS Simulator
   xcrun simctl uninstall booted com.yourcompany.magicwork
   
   # Android Emulator
   adb uninstall com.yourcompany.magicwork
   ```

2. **Rebuild and run**
   ```bash
   cd mobile-app-flutter
   flutter clean
   flutter pub get
   flutter run
   ```

3. **Expected behavior:**
   - Onboarding screen appears on first launch
   - Select mood "Stressed" 😰
   - Select intention "Reduce Stress" 🌬️
   - Click "Complete"
   - Console logs: `[AmbientSoundManager] Loaded user mood: stressed`
   - Console logs: `[AmbientSoundManager] Using mood-based sound for mood "stressed": https://...`
   - Soft rain ambient sound starts playing
   - Close and reopen app → same ambient sound persists

---

## Console Logs for Debugging

Enable verbose logging to see mood-based selection:

```dart
[AmbientSoundManager] Loaded user mood: stressed
[AmbientSoundManager] Using mood-based sound for mood "stressed": https://cdn.pixabay.com/audio/2022/05/27/audio_1808f30302.mp3
[OnboardingScreen] Onboarding complete: mood=stressed, intentions=[reduce-stress]
[AmbientSoundManager] Mood updated to: calm
[AmbientSoundManager] Using mood-based sound for mood "calm": https://cdn.pixabay.com/audio/2023/05/30/audio_3fe4a09837.mp3
```

---

## Testing Checklist

### ✅ Onboarding Flow
- [ ] Onboarding screen appears on first launch
- [ ] Can select all 6 mood options
- [ ] Auto-advances to intentions step after mood selection
- [ ] Can select multiple intentions
- [ ] "Complete" button disabled until at least one intention selected
- [ ] "Skip for now" works without selecting intentions
- [ ] Loading indicator shows during save

### ✅ Mood Persistence
- [ ] Mood saved to SharedPreferences (`user_mood_${userId}`)
- [ ] Mood saved to Supabase (`user_profiles.current_mood`)
- [ ] Onboarding flag saved (`onboarded_${userId}`)
- [ ] Onboarding doesn't show again on subsequent launches

### ✅ Ambient Sound Selection
- [ ] Mood-based sound plays after onboarding complete
- [ ] Console logs show mood-based selection
- [ ] Correct sound URL matches selected mood
- [ ] Sound persists after app restart (same mood = same sound)
- [ ] Sound stops during practice sessions (existing behavior)

### ✅ Error Handling
- [ ] Works when offline (uses SharedPreferences fallback)
- [ ] Works when Supabase query fails (graceful degradation)
- [ ] Falls back to random sound if mood not found
- [ ] No crashes if user not authenticated

---

## Future Enhancements

### Quick Mood Selector Widget
Add a floating button or settings option to change mood without re-onboarding:

```dart
// Example mood selector widget
class MoodQuickSelector extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: Icon(Icons.mood),
      onPressed: () {
        showModalBottomSheet(
          context: context,
          builder: (context) => MoodSelectorSheet(),
        );
      },
    );
  }
}
```

### Time-Based Mood Suggestions
Suggest moods based on time of day:
- Morning (6am-10am): Energized ⚡
- Afternoon (2pm-5pm): Focused 🎯
- Evening (8pm-11pm): Calm 😌 or Tired 😴

### Mood History Tracking
Track mood changes over time:
```dart
// Add to user_profiles table
mood_history JSONB[]

// Save mood changes
{
  "mood": "stressed",
  "timestamp": "2025-12-30T10:30:00Z",
  "trigger": "morning_checkin"
}
```

---

## Comparison with Web App

| Feature | Web App (React) | Flutter App | Status |
|---------|----------------|-------------|--------|
| Mood Onboarding | ✅ OnboardingModal | ✅ OnboardingScreen | ✅ Parity |
| 6 Mood Options | ✅ Yes | ✅ Yes | ✅ Parity |
| Intention Selection | ✅ Yes | ✅ Yes | ✅ Parity |
| Mood Mapping | ✅ Yes | ✅ Yes | ✅ Parity |
| localStorage | ✅ Yes | ✅ SharedPreferences | ✅ Parity |
| Supabase Sync | ✅ Yes | ✅ Yes | ✅ Parity |
| Dynamic Mood Update | ✅ Yes | ✅ updateMood() | ✅ Parity |
| Analytics Tracking | ✅ Yes | 🟡 Not yet | ⏳ Todo |
| Mood History | ❌ No | ❌ No | 🔮 Future |

---

## Dependencies Used

All required dependencies are already in `pubspec.yaml`:

```yaml
dependencies:
  supabase_flutter: ^2.0.0     # Cloud backend
  shared_preferences: ^2.2.2   # Local storage
  audioplayers: ^6.5.1         # Audio playback
  go_router: ^17.0.1           # Navigation
```

No additional packages needed! ✅

---

## Troubleshooting

### Issue: Onboarding doesn't appear
**Solution:** Check if `onboarded_${userId}` is already set in SharedPreferences. Clear app data to reset.

### Issue: Ambient sound doesn't change
**Solution:** Check console logs for mood loading. Verify `current_mood` is saved in Supabase.

### Issue: "GoRouterState not found" error
**Solution:** Wrap AmbientSoundManager calls in try-catch (already implemented in the code).

### Issue: Audio doesn't play on iOS
**Solution:** Ensure app has audio background mode enabled in `Info.plist`:
```xml
<key>UIBackgroundModes</key>
<array>
  <string>audio</string>
</array>
```

---

## Summary

✅ **Files Created:** 2  
✅ **Files Modified:** 2  
✅ **Dependencies Added:** 0 (all existing)  
✅ **Breaking Changes:** None  
✅ **Migration Required:** None (backward compatible)  

The Flutter app now has **feature parity** with the web app for mood-based ambient sound personalization! 🎉

Next steps: Integrate OnboardingScreen into your main navigation flow and test on both iOS and Android devices.
