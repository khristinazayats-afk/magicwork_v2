# Card Features Implementation Guide

## Overview
This document outlines the new card features that need to be implemented for the Vercel project (prj_dndWKafuHj6qtj6VAFQveIuDaTNq).

## Features Implemented

### ✅ 1. Database Schema
- **File**: `database/migrations/create_usage_tracking_table.sql`
- **Tables Created**:
  - `practice_sessions` - Tracks completed sessions
  - `active_sessions` - Tracks currently active sessions for live counts
- **Tracks**: space_name, card_index, video_asset_id, audio_asset_id, duration, voice selection

### ✅ 2. API Endpoints
- **File**: `api/usage-tracking.js`
- **Endpoints**:
  - `POST /api/usage-tracking?action=start` - Start session
  - `POST /api/usage-tracking?action=heartbeat` - Keep session alive
  - `POST /api/usage-tracking?action=complete` - Complete session
  - `GET /api/usage-tracking?action=live-count&space=X&card=0` - Get live count for card
  - `GET /api/usage-tracking?action=live-counts&space=X` - Get all card counts

### ✅ 3. Hooks & Utilities
- **File**: `src/hooks/useUsageTracking.js` - Usage tracking hook
- **File**: `src/constants/completionMessages.js` - Rotating completion messages
- **File**: `src/constants/voiceAudioOptions.js` - Voice audio options

### ✅ 4. Components
- **File**: `src/components/TimerVoiceSelectionModal.jsx` - Timer & voice selection
- **File**: `src/components/CompletionMessageScreen.jsx` - Completion message display

## Features to Implement in PracticesTab

### 1. Preview Video Clips
- Cards should show a **short preview clip** (first 10-15 seconds) that loops
- Not the full video loop
- When user clicks, show timer selection modal

### 2. Timer Selection Flow
- User clicks card → Timer/Voice selection modal appears
- User selects duration (5, 10, 15, 20, 30 min or unlimited)
- User selects voice audio option
- Click "Start Practice"

### 3. Practice Session Flow
- After timer selection:
  - Start tracking session in database
  - Switch to full video loop
  - Start audio (based on voice selection)
  - Show countdown timer on screen
  - Update heartbeat every 30 seconds

### 4. Completion Flow
- When timer reaches 0 or user finishes:
  - Stop video/audio
  - Track completion in database
  - Show custom completion message (rotating)
  - Return to card preview

### 5. Live User Counts
- Each preview card shows: "X are practicing now"
- Count is specific to that space + card_index
- Updates every 10 seconds
- Only shows on preview cards (not during practice)

## Implementation Steps

### Step 1: Update PracticesTab Imports
Add new imports:
```javascript
import { useUsageTracking } from '../../hooks/useUsageTracking';
import TimerVoiceSelectionModal from '../TimerVoiceSelectionModal';
import CompletionMessageScreen from '../CompletionMessageScreen';
import { getCompletionMessageByDuration } from '../../constants/completionMessages';
```

### Step 2: Add State Management
Add new state variables:
- `showTimerModal` - Show/hide timer selection
- `selectedCardForPractice` - Which card user clicked
- `showCompletionMessage` - Show completion screen
- `completionMessage` - The message to show
- `voiceAudioSelected` - Selected voice audio ID
- `previewVideoRefs` - Refs for preview videos (to control playback)

### Step 3: Update Card Click Handler
Replace `handleTunePlayPause` with:
- Show timer selection modal
- Don't start playback immediately

### Step 4: Add Preview Video Logic
- Create preview video elements that play first 15 seconds and loop
- Use `currentTime` to reset to 0 after 15 seconds
- Muted, autoplay, loop (but only first 15 seconds)

### Step 5: Add Practice Start Handler
- Called from TimerVoiceSelectionModal
- Start session tracking
- Switch to full video
- Start audio based on voice selection
- Start countdown timer

### Step 6: Add Completion Handler
- When timer reaches 0 or user finishes
- Complete session tracking
- Show completion message
- Clean up

### Step 7: Update Live User Count Display
- Use `useUsageTracking` hook
- Display `liveCounts[cardIndex]` on each preview card
- Only show during preview (not during practice)

## Database Migration

Run the migration:
```bash
# Set POSTGRES_URL first
export POSTGRES_URL="your-connection-string"

# Run migration
node scripts/run-practice-cards-migration.js
# Then run usage tracking migration
psql $POSTGRES_URL < database/migrations/create_usage_tracking_table.sql
```

## Testing Checklist

- [ ] Preview videos show short clips (15 seconds)
- [ ] Clicking card shows timer selection modal
- [ ] Timer selection works (duration + voice)
- [ ] Practice starts with full video + audio + countdown
- [ ] Live user counts update on preview cards
- [ ] Completion message shows when practice ends
- [ ] Usage is tracked in database
- [ ] Heartbeat keeps session alive
- [ ] Session completes properly

## Next Steps

1. Update PracticesTab component with all features
2. Test preview video clips
3. Test timer selection flow
4. Test practice session flow
5. Test completion flow
6. Test live user counts
7. Verify database tracking
8. Deploy to Vercel

