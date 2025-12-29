# AI Recommendations & Personalization System
**Status:** ✅ COMPLETE - All 4 features deployed and tested
**Date:** December 29, 2025

## Overview

Complete AI-powered personalization system that learns from user behavior to provide intelligent practice suggestions, personalized ambient sounds, and adaptive meditation experiences.

## 🎯 Core Features

### 1. AI-Powered Quick Practice Recommendations ✅
**Location:** `api/generate-recommendations.js`, `src/components/QuickPracticeSuggestions.jsx`

**What it does:**
- Analyzes user's meditation history (last 50 practices)
- Identifies favorite ambient sounds from usage patterns
- Detects time-of-day preferences (morning/afternoon/evening/night)
- Tracks successful emotional journeys (what works for this user)
- Generates 3 personalized "quick practice" suggestions

**AI Model:** Llama 3.1-8B via HF Inference Providers
**Cost:** ~$0.000006 per recommendation generation

**Recommendation includes:**
- **Title:** Catchy 3-5 word name
- **Duration:** 2, 5, or 10 minutes (optimized for user patterns)
- **Space:** User's most practiced spaces or complementary ones
- **Intent:** Goal based on success patterns (reduce_stress, improve_focus, etc.)
- **Emotional State:** Starting point (calm, neutral, slightly_anxious, etc.)
- **Ambient Sound:** User's favorite sounds from history
- **Reason:** Brief explanation (10-15 words) why this helps

**Example output:**
```json
{
  "recommendations": [
    {
      "title": "Your Favorite Reset",
      "duration": 5,
      "spaceName": "Gentle De-Stress",
      "intent": "reduce_stress",
      "emotionalState": "slightly_anxious",
      "ambientSound": "soft-rain",
      "reason": "Your most practiced space with your favorite ambient sound"
    }
  ]
}
```

**User Experience:**
- Shows horizontally scrollable cards above main practices list
- One-tap to start (no manual configuration needed)
- Auto-fills emotional state, intent, duration, ambient sound
- Updates based on time of day and recent patterns

---

### 2. Personalized Ambient Sound Selection ✅
**Location:** `api/generate-ambient.js`, `src/components/AmbientSoundManager.jsx`

**What it does:**
- Tracks which ambient sounds user plays most frequently
- Automatically selects user's favorite ambient sound when no specific type requested
- Returns personalized flag indicating if sound was user-preference based

**Sound types available:**
- soft-rain
- gentle-waves
- forest-birds
- white-noise
- breathing-space
- temple-bells

**How personalization works:**
```javascript
// If user has favorite ambient sound and no specific type requested
if (userPreferences?.favoriteAmbient && !type) {
  selectedType = userPreferences.favoriteAmbient;
  console.log(`[Ambient Personalization] Using user favorite: ${selectedType}`);
}
```

**Response includes personalization flag:**
```json
{
  "audioUrl": "https://d3hajr7xji31qq.cloudfront.net/ambient/soft-rain.mp3",
  "type": "soft-rain",
  "personalized": true,
  "note": "Using your favorite ambient sound based on history"
}
```

---

### 3. Enhanced Analytics Tracking ✅
**Location:** `src/services/analytics.js`

**New tracking events:**

#### `ambient_sound_played`
Tracks when user starts an ambient sound
```javascript
trackAmbientSoundPlayed({
  soundType: 'soft-rain',
  spaceName: 'Gentle De-Stress',
  emotionalState: 'slightly_anxious'
});
```

#### `ambient_sound_changed`
Tracks when user switches ambient sounds
```javascript
trackAmbientSoundChanged({
  fromSound: 'white-noise',
  toSound: 'gentle-waves',
  spaceName: 'Gentle De-Stress'
});
```

#### `quick_practice_selected`
Tracks when user selects AI recommendation
```javascript
trackQuickPracticeStarted({
  title: 'Evening Wind Down',
  duration: 5,
  spaceName: 'Gentle De-Stress',
  intent: 'reduce_stress',
  emotionalState: 'slightly_anxious',
  ambientSound: 'soft-rain'
});
```

**Database tables used:**
- `analytics_events` - All event tracking
- `events` - Gamification events (practice_complete, etc.)
- `daily_counters` - Daily practice tracking, streak calculation

---

### 4. User History Analysis Engine ✅
**Location:** `api/generate-recommendations.js` (analyzeUserHistory function)

**Analyzes:**

#### Practice Patterns
```sql
SELECT event_id, occurred_at, properties
FROM events
WHERE user_id = ${userId}
  AND event_type = 'practice_complete'
ORDER BY occurred_at DESC
LIMIT 50
```

Returns:
- Space names most used
- Intents most selected
- Emotional states most common
- Practice durations preferred

#### Ambient Sound Preferences
```sql
SELECT 
  properties->>'ambientSound' as sound_type,
  COUNT(*)::int as usage_count,
  MAX(occurred_at) as last_used
FROM events
WHERE user_id = ${userId}
  AND event_type = 'ambient_sound_played'
GROUP BY properties->>'ambientSound'
ORDER BY usage_count DESC
LIMIT 10
```

Returns favorite sounds ranked by usage

#### Time-of-Day Patterns
Categorizes practices into:
- Morning (5am-12pm)
- Afternoon (12pm-5pm)
- Evening (5pm-9pm)
- Night (9pm-5am)

Tracks which periods user meditates most

#### Emotional Journeys (Success Patterns)
Tracks: `emotionalState → intent` combinations that user repeats
Example: "slightly_anxious → reduce_stress" used 15 times = proven pattern

**AI Prompt Construction:**
Uses all this data to ask Llama 3.1-8B:
```
USER HISTORY:
- Total practices: 47
- Top spaces: Gentle De-Stress (18x), Slow Morning (12x), Drift into Sleep (8x)
- Favorite ambient sounds: soft-rain (24x), gentle-waves (15x), forest-birds (8x)
- Time preferences: evening=22, morning=15, night=10
- Successful patterns: slightly_anxious→reduce_stress (15x), neutral→improve_focus (8x)

CURRENT CONTEXT:
- Time of day: evening
- Current emotional state: slightly_anxious

Generate 3 personalized quick practice suggestions...
```

---

## 🎨 UI/UX Components

### QuickPracticeSuggestions Component
**Location:** `src/components/QuickPracticeSuggestions.jsx`

**Features:**
- Horizontally scrollable cards (280px each)
- Gradient backgrounds (purple/pink theme)
- Show/hide toggle to minimize when not needed
- Loading states with skeleton cards
- Error handling with fallback suggestions
- Animated entrance (staggered 0.1s delay per card)

**Card displays:**
- Title & duration badge
- Reason text (10-15 words)
- Intent & ambient sound tags
- "Start Now" button with play icon

**Integration:**
```jsx
<QuickPracticeSuggestions 
  currentSpaceName={station?.name}
  onSelectPractice={(quickPractice) => {
    // Auto-starts practice with pre-filled values
  }}
/>
```

---

## 📊 Data Flow

### 1. User Completes Practice
```
Practice Session
  ↓
trackPracticeCompleted()
  ↓
Insert into analytics_events
  ↓
Properties: {spaceName, intent, emotionalState, durationSeconds}
```

### 2. User Plays Ambient Sound
```
Ambient Sound Starts
  ↓
trackAmbientSoundPlayed()
  ↓
Insert into analytics_events
  ↓
Properties: {ambientSound: 'soft-rain', spaceName, emotionalState}
```

### 3. Generate Recommendations
```
User Opens Practices Tab
  ↓
QuickPracticeSuggestions loads
  ↓
POST /api/generate-recommendations
  ↓
analyzeUserHistory(userId)
  ↓
Query last 50 practices
Query ambient preferences
Calculate time patterns
Track emotional journeys
  ↓
generateRecommendations(history, context)
  ↓
Build AI prompt with user patterns
  ↓
Call HF Llama 3.1-8B
  ↓
Parse JSON response
  ↓
Return 3 personalized suggestions
  ↓
Display as cards with 1-tap start
```

### 4. User Selects Quick Practice
```
User Taps Suggestion Card
  ↓
trackQuickPracticeStarted()
  ↓
Auto-fill: emotionalState, intent, duration, ambientSound
  ↓
Skip to generation step (no manual selection needed)
  ↓
Generate script, voice, video
  ↓
Start practice immediately
```

---

## 🧪 Testing

### Test Recommendations API
```bash
curl -X POST "https://magicwork-main.vercel.app/api/generate-recommendations" \
  -H "Content-Type: application/json" \
  -d '{"timeOfDay": "evening", "currentEmotionalState": "slightly_anxious"}' \
  | jq '.recommendations'
```

**Expected output:**
```json
{
  "recommendations": [
    {
      "title": "Evening Calm Retreat",
      "duration": 10,
      "spaceName": "Gentle De-Stress",
      "intent": "reduce_stress",
      "emotionalState": "slightly_anxious",
      "ambientSound": "soft-rain",
      "reason": "Gentle ocean sounds calm anxious minds in the evening."
    },
    // ... 2 more
  ],
  "provider": "ai",
  "context": {
    "totalPractices": 47,
    "favoriteAmbient": "soft-rain",
    "timeOfDay": "evening"
  }
}
```

### Test Personalized Ambient Sound
```bash
curl -X POST "https://magicwork-main.vercel.app/api/generate-ambient" \
  -H "Content-Type: application/json" \
  -d '{"userPreferences": {"favoriteAmbient": "forest-birds"}}' \
  | jq '.'
```

**Expected output:**
```json
{
  "audioUrl": "https://d3hajr7xji31qq.cloudfront.net/ambient/forest-birds.mp3",
  "type": "forest-birds",
  "personalized": true,
  "note": "Using your favorite ambient sound"
}
```

---

## 💰 Cost Analysis

### AI Recommendations
- **Model:** Llama 3.1-8B via HF Inference Providers
- **Cost per request:** ~$0.000006
- **Typical usage:** 1-3 requests per user per day
- **Monthly cost (1000 users):** ~$0.18-0.54/month

### Ambient Sound Personalization
- **Cost:** $0 (uses CDN, no AI generation)
- **Storage:** Pre-cached MP3 files on CloudFront
- **Bandwidth:** Included in CDN costs

### Analytics Tracking
- **Cost:** $0 (Postgres database queries)
- **Storage:** ~100 bytes per event
- **Monthly storage (1000 users, 5 practices/day):** ~15 MB/month

**Total monthly cost:** ~$0.18-0.54 for AI recommendations only

---

## 🚀 Deployment Status

### Deployed Files ✅
- `api/generate-recommendations.js` - AI recommendation endpoint
- `api/generate-ambient.js` - Updated with personalization
- `src/components/QuickPracticeSuggestions.jsx` - UI component
- `src/components/AmbientSoundManager.jsx` - Updated with tracking
- `src/components/in-the-space/PracticesTab.jsx` - Integrated recommendations
- `src/services/analytics.js` - Enhanced tracking functions

### Production URL
https://magicwork-main.vercel.app

### Inspect Deployment
https://vercel.com/velariqs-projects/magicwork-main/8JG2KGP2SBwvLdyNhJQ2N1atds5J

---

## 📈 Future Enhancements

### Caching Layer
Implement Redis/Vercel KV to cache recommendations:
- Cache key: `user_id:timeOfDay:emotionalState`
- TTL: 1 hour (refresh on new practices)
- Reduces API calls by ~70%

### Pre-generated Popular Combinations
Offline generate common patterns:
- Morning energy boost
- Midday focus reset
- Evening stress relief
- Night sleep preparation

Store in CDN like ambient sounds (instant loading, $0 cost)

### Collaborative Filtering
"Users like you also enjoyed..."
- Compare practice patterns across similar users
- Recommend spaces/intents tried by similar profiles
- A/B test recommendation algorithms

### Real-time Adaptation
Update recommendations during session:
- If user skips suggestion → learn preference
- If user completes → boost similar suggestions
- Track skip rate, completion rate per recommendation type

---

## 🔍 Monitoring

### Key Metrics to Track

#### Recommendation Performance
- Click-through rate (suggestions → starts)
- Completion rate (started → finished)
- Skip rate (dismissed without trying)
- Time to start (how quickly users engage)

#### Personalization Accuracy
- Favorite ambient sound prediction accuracy
- Time-of-day preference accuracy
- Emotional journey pattern matching success
- User satisfaction ratings (future feature)

#### System Health
- API response time (recommendations endpoint)
- Cache hit rate (when implemented)
- Database query performance
- AI model latency (HF Inference Providers)

### Dashboards
- HF: https://huggingface.co/settings/billing
- Vercel Analytics: https://vercel.com/velariqs-projects/magicwork-main/analytics
- Supabase: https://app.supabase.com (analytics_events table)

---

## 🎓 How It Works (User Perspective)

### First-Time User Experience
1. User opens Practices tab
2. Sees generic time-of-day suggestions (no history yet)
3. Completes a few practices
4. Analytics start tracking preferences

### Returning User Experience (After 5+ Practices)
1. User opens Practices tab
2. Sees **personalized** quick practice cards:
   - "Your Favorite Reset" (most used space + favorite ambient)
   - "Perfect for evening" (time-optimized)
   - "Quick Energy Boost" (duration preference)
3. User taps suggestion → **instant start** (no configuration)
4. AI generates script based on their emotional patterns
5. Voice narration uses their successful journey patterns
6. Background video evolves from their emotional state to goal
7. **Their favorite ambient sound plays automatically**

### Learning Loop
```
User completes practice
  ↓
System learns: space preference, ambient sound, time-of-day, emotional journey
  ↓
Next visit: Better recommendations based on patterns
  ↓
Higher engagement, faster starts, more completions
  ↓
More data → even better recommendations
  ↓
Continuous improvement cycle
```

---

## 🎯 Success Criteria

✅ **AI recommendations generate in <2 seconds**
✅ **Ambient sound personalization works on first request**
✅ **Analytics tracking captures all events**
✅ **Quick practice cards load on Practices tab**
✅ **One-tap start from recommendations**
✅ **User history analysis returns patterns**
✅ **Fallback recommendations when no history**
✅ **Mobile-optimized horizontal scroll cards**

---

## 📝 API Reference

### POST /api/generate-recommendations
Generate AI-powered practice recommendations

**Request:**
```json
{
  "user_id": "optional-user-id",
  "timeOfDay": "morning|afternoon|evening|night",
  "currentEmotionalState": "calm|neutral|slightly_anxious|anxious|very_anxious"
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "title": "Morning Energizer",
      "duration": 5,
      "spaceName": "Slow Morning",
      "intent": "boost_energy",
      "emotionalState": "neutral",
      "ambientSound": "forest-birds",
      "reason": "Perfect start with energizing breathwork"
    }
  ],
  "provider": "ai",
  "context": {
    "totalPractices": 47,
    "favoriteAmbient": "soft-rain",
    "timeOfDay": "morning"
  }
}
```

### POST /api/generate-ambient
Generate or retrieve personalized ambient sound

**Request:**
```json
{
  "type": "soft-rain|gentle-waves|forest-birds|white-noise|breathing-space|temple-bells",
  "emotionalState": "optional",
  "spaceName": "optional",
  "userPreferences": {
    "favoriteAmbient": "soft-rain"
  }
}
```

**Response:**
```json
{
  "audioUrl": "https://d3hajr7xji31qq.cloudfront.net/ambient/soft-rain.mp3",
  "type": "soft-rain",
  "personalized": true,
  "note": "Using your favorite ambient sound"
}
```

---

## ✨ Summary

Complete personalization system that:
1. **Learns** from every meditation session
2. **Adapts** recommendations based on patterns
3. **Simplifies** user experience (1-tap quick practices)
4. **Personalizes** ambient sounds automatically
5. **Tracks** everything for continuous improvement

**Result:** Users get intelligent suggestions that actually work for them, reducing decision fatigue and increasing engagement.

*Context improved by Giga AI: AI Recommendations & Personalization System documentation*
