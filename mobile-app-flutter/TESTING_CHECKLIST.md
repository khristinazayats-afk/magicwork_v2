# Flutter Mood-Based Ambient Sound Testing Checklist

## Test Preparation
- [ ] App successfully installed on iPhone 17
- [ ] Connected to internet (for Supabase sync)
- [ ] Have test user credentials ready

## First-Time User Experience (New User)

### 1. Onboarding Flow
- [ ] Splash screen appears
- [ ] After authentication, onboarding screen appears (not feed)
- [ ] Onboarding shows "How are you feeling?" title
- [ ] All 6 mood options visible with emojis:
  - Calm 😌
  - Stressed 😰
  - Focused 🎯
  - Creative 🎨
  - Energized ⚡
  - Sleepy 😴

### 2. Mood Selection
- [ ] Tap on a mood (e.g., "Stressed")
- [ ] Selected mood is highlighted
- [ ] "Next" button becomes enabled
- [ ] Tap "Next" to proceed

### 3. Intentions Step
- [ ] "What do you want to work on?" screen appears
- [ ] Can select multiple intentions
- [ ] "Complete" button enabled after selection
- [ ] Tap "Complete"

### 4. Post-Onboarding
- [ ] Navigates to feed screen
- [ ] Ambient sound starts playing automatically
- [ ] Verify correct sound for selected mood:
  - **Calm** → Gentle Waves
  - **Stressed** → Soft Rain
  - **Focused** → Forest Birds
  - **Creative** → Wind Chimes
  - **Energized** → Upbeat Rhythms
  - **Sleepy** → Deep Meditation

### 5. Data Persistence Check
- [ ] Close app completely
- [ ] Reopen app
- [ ] Onboarding does NOT appear again
- [ ] Same ambient sound plays automatically
- [ ] Mood persists across sessions

## Returning User Experience

### 1. Splash to Feed
- [ ] Splash screen appears
- [ ] Directly navigates to feed (skips onboarding)
- [ ] Ambient sound loads based on saved mood
- [ ] No delay or errors in sound loading

### 2. Mood Update (Future Enhancement)
- [ ] *Note: Currently mood is set during onboarding only*
- [ ] *Future: Add mood selector in feed to test updateMood()*

## Technical Verification

### 1. Console Logs
Check Flutter console for these logs:
- [ ] `Loading user mood from local storage`
- [ ] `User mood loaded: {moodId}`
- [ ] `Selecting ambient sound for mood: {moodName}`
- [ ] `Playing ambient sound: {url}`

### 2. Data Storage
Verify SharedPreferences contains:
- [ ] `onboarded_{userId}` = `true`
- [ ] `user_mood_{userId}` = `{moodId}`

### 3. Supabase Verification
Check `user_profiles` table:
- [ ] `current_mood` field updated
- [ ] `onboarding_completed` = `true`
- [ ] Timestamp updated

### 4. Audio Playback
- [ ] Sound plays at correct volume (0.15)
- [ ] Sound loops continuously
- [ ] No lag or stuttering
- [ ] Audio continues when app is backgrounded (optional)

## Edge Cases

### 1. Network Issues
- [ ] Test with airplane mode ON during onboarding
- [ ] Mood saves to local storage
- [ ] When internet returns, syncs to Supabase

### 2. Logout/Login
- [ ] Logout from app
- [ ] Login as same user
- [ ] Onboarding is skipped
- [ ] Same mood loads

### 3. Different Users
- [ ] Login as User A, complete onboarding with "Calm"
- [ ] Logout, login as User B, complete onboarding with "Stressed"
- [ ] Logout, login as User A → Calm sound plays
- [ ] Logout, login as User B → Stressed sound plays

## Known Issues to Watch For

- **String Interpolation**: Fixed (was `\$userId`, now `$userId`)
- **Deprecated withOpacity**: 8 warnings but no functional impact
- **Wireless Debug Speed**: May be slow, consider USB cable for faster testing

## Success Criteria

✅ **MVP Complete** if:
1. Onboarding appears for new users only
2. Mood selection works and persists
3. Correct ambient sound plays based on mood
4. Data syncs to Supabase
5. Returning users skip onboarding and load saved mood

## Notes

- Current implementation sets mood during onboarding only
- Future enhancement: Add mood selector in feed/profile for dynamic changes
- Pixabay CDN URLs are public and free to use
- Ambient sounds loop infinitely until user stops them

---

**Testing Started**: {Date/Time}
**Tested By**: {Name}
**Device**: iPhone 17 (iOS 26.3)
**Build**: Debug (wireless)
