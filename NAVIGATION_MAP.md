# 🗺️ MagicWork Navigation Map - Cards & Sections

## Overview
This document maps out all the cards displayed in each section of the MagicWork application.

---

## 📱 Main Application Flow

```
App.jsx
├── SplashScreen (on first load)
├── StepsScreen (onboarding)
└── Feed (main experience)
    ├── HomeScreenSummary (sticky header)
    └── PracticeCard × 9 (infinite scroll)
        └── [Click "Join"] → PracticeJoinedTabs
            ├── PracticesTab (4 cards per space)
            └── ChatTab (reflection cards)
```

---

## 🎯 Section 1: Main Feed (`Feed.jsx`)

### Cards Displayed: **9 Space Cards** (PracticeCard components)

Each card represents a "space" that users can scroll through vertically:

1. **Slow Morning**
   - Description: "A space to begin the day slowly, side by side."
   - Gradient: `slowMorning` (Mint → Orange → Orange → Purple)
   - Participant count: Random (20-70)

2. **Gentle De-Stress**
   - Description: "A space to come back to center, together."
   - Gradient: `gentleDeStress` (Purple → Orange → Orange → Mint)
   - Participant count: Random (20-70)

3. **Take a Walk**
   - Description: "A quiet space for mindful steps."
   - Gradient: `takeAWalk` (Mint → Orange → Orange → Purple)
   - Participant count: Random (20-70)

4. **Draw Your Feels**
   - Description: "A creative space where emotions flow by hand."
   - Gradient: `journalYourFeels` (Purple → Mint → Mint → Orange)
   - Participant count: Random (20-70)

5. **Move and Cool**
   - Description: "A space to release energy and find ease."
   - Gradient: `moveAndCool` (Orange → Mint → Mint → Purple)
   - Participant count: Random (20-70)

6. **Tap to Ground**
   - Description: "A grounding space to reconnect with your body."
   - Gradient: `drawToGround` (Purple → Mint → Mint → Orange)
   - Participant count: Random (20-70)

7. **Breathe to Relax**
   - Description: "A space for slow breaths and unwinding."
   - Gradient: `breatheToRelax` (Orange → Purple → Purple → Mint)
   - Participant count: Random (20-70)

8. **Get in the Flow State**
   - Description: "A space to focus on what matters."
   - Gradient: `breatheToGetActive` (Mint → Purple → Purple → Orange)
   - Participant count: Random (20-70)
   - Special: Shows FirstTimeGuide hint on first visit

9. **Drift into Sleep**
   - Description: "A space to slow down and drift off together."
   - Gradient: `driftIntoSleep` (Orange → Purple → Purple → Mint)
   - Participant count: Random (20-70)

### Card Structure (PracticeCard.jsx)
Each card shows:
- **Title**: Space name (e.g., "Slow Morning")
- **Description**: Subheadline when not joined
- **Cue**: Instruction when joined (e.g., "Notice three things you are grateful for.")
- **Participant Counter**: "X humans here" with pulsing dot
- **Join Button**: Opens the space
- **Video Background**: Optional (from content assets)
- **Gradient Background**: Space-specific gradient

---

## 🎨 Section 2: Inside a Space (`PracticeJoinedTabs.jsx`)

When user clicks "Join" on any space card, they enter the tabbed interface.

### Tab Structure:
```
PracticeJoinedTabs
├── Header (station name + back button)
└── PracticesTab (main content)
```

---

## 🎴 Section 3: Practices Tab (`PracticesTab.jsx`)

### Cards Displayed: **4 Identical Cards per Space**

Each space shows **4 cards** that are identical in structure but may have different video backgrounds:

#### Card Structure (per space):
**Each card is now INDEPENDENT** - you can edit one without affecting others!

1. **Card 0 (Video 1)**
   - **Video**: Must be `clouds.mp4` (or first video if clouds not found)
   - **Type**: Practice/Sound card
   - **Content**: Fetched from `contentSet.visuals[0]` or fallback
   - **Data Source**: `practice_cards` table (space_name + card_index = 0)
   - **Has Own**: Title, description, guidance, practice type

2. **Card 1 (Video 2)**
   - **Video**: Second video (skips clouds if it's at index 0)
   - **Type**: Practice/Sound card
   - **Content**: Fetched from `contentSet.visuals[1]` or fallback
   - **Data Source**: `practice_cards` table (space_name + card_index = 1)
   - **Has Own**: Title, description, guidance, practice type

3. **Card 2 (Video 3)**
   - **Video**: Third video (skips clouds if it's at index 0 or 1)
   - **Type**: Practice/Sound card
   - **Content**: Fetched from `contentSet.visuals[2]` or fallback
   - **Data Source**: `practice_cards` table (space_name + card_index = 2)
   - **Has Own**: Title, description, guidance, practice type

4. **Card 3 (Video 4)**
   - **Video**: Fourth video (skips clouds if it's at index 0, 1, or 2)
   - **Type**: Practice/Sound card
   - **Content**: Fetched from `contentSet.visuals[3]` or last available
   - **Data Source**: `practice_cards` table (space_name + card_index = 3)
   - **Has Own**: Title, description, guidance, practice type

#### Card Features:
- **Video Background**: Each card can have a unique video
- **Expandable**: Clicking a card opens full-screen practice view
- **Practice of the Day**: One card per space can be marked as "Practice of the Day"
- **Favorite Toggle**: Users can favorite cards
- **Filter Options**: All, Sounds, Practices, Guided, Favorited

#### Special Cards:
- **Practice of the Day Card**: 
  - Shows description (3-5 sentences)
  - Has completion tracking
  - Awards light points on completion

---

## 💬 Section 4: Chat Tab (`ChatTab.jsx`)

### Cards Displayed: **Reflection/Comment Cards**

#### Card Structure:
- **Avatar**: Colored circle with first letter of name
- **Name**: Display name (or "Anonymous" for anonymous shares)
- **Timestamp**: Relative time (e.g., "2m ago", "1h ago")
- **Text**: User's reflection/comment
- **Background**: White/50 with backdrop blur

#### Card Types:
1. **User's Own Shareouts**: Saved from previous sessions
2. **Mock Shareouts**: Pre-populated example comments
3. **New Comments**: Real-time additions from input

#### Card Features:
- **Sticky Header**: "Today's Reflection" with daily prompt
- **Input Composer**: Bottom input for new reflections
- **Privacy Options**: Share with name or anonymously

---

## 📊 Card Data Sources

### Main Feed Cards:
- **Source**: `public/data/stations.json`
- **Fields**: `name`, `label`, `guidance`, `description`, `instructions`, `localMusic`

### Practices Tab Cards:
- **Source**: 
  - **Card Metadata**: `usePracticeCards()` hook → Database `practice_cards` table
  - **Content Assets**: `useContentSet()` hook → Database `content_assets` table
- **Fields**: 
  - **Card Data**: `title`, `description`, `guidance`, `is_practice_of_day`, `practice_type`, `duration_minutes`
  - **Content**: `visuals[]`, `audio[]`, `name`, `space_name`
- **Fallback**: Local assets from `config/assets.js` (CANVA_ASSETS)
- **Key Feature**: Each card (0-3) has its own independent data in the database

### Chat Tab Cards:
- **Source**: 
  - User shareouts: `localStorage` via `shareoutsStorage.js`
  - Mock data: Hardcoded in `ChatTab.jsx` (MOCK_SHAREOUTS)

---

## 🔄 Card Interactions

### Main Feed Cards:
1. **Scroll**: Navigate between spaces (infinite loop)
2. **Join**: Enter the space → Opens PracticeJoinedTabs
3. **Swipe Hint**: Shows on "Get in the Flow State" (first time)

### Practices Tab Cards:
1. **Click**: Expand to full-screen practice view
2. **Favorite**: Toggle favorite status (heart icon)
3. **Filter**: Show All/Sounds/Practices/Guided/Favorited
4. **Practice of Day**: Complete for light points

### Chat Tab Cards:
1. **View**: Scroll through comments
2. **Add**: Create new reflection via input
3. **Privacy**: Choose public or anonymous sharing

---

## 🎨 Visual Hierarchy

```
Main Feed
├── HomeScreenSummary (sticky, top)
├── PracticeCard 1 (full viewport)
├── PracticeCard 2 (full viewport)
├── ...
└── PracticeCard 9 (full viewport)

Inside Space (PracticeJoinedTabs)
├── Header (fixed, top)
└── PracticesTab (scrollable)
    ├── Card 0 (Video 1)
    ├── Card 1 (Video 2)
    ├── Card 2 (Video 3)
    └── Card 3 (Video 4)

Chat Tab
├── Today's Reflection (sticky, top)
├── Comment Card 1
├── Comment Card 2
├── ...
└── Input Composer (sticky, bottom)
```

---

## 🔧 Files to Modify for Card Changes

### Main Feed Cards:
- `src/components/PracticeCard.jsx` - Card structure and behavior
- `public/data/stations.json` - Card data (names, descriptions, etc.)
- `src/components/Feed.jsx` - Feed layout and infinite scroll

### Practices Tab Cards:
- `src/components/in-the-space/PracticesTab.jsx` - Card rendering and logic
- `src/hooks/useContentSet.js` - Content fetching (videos, audio)
- `src/hooks/usePracticeCards.js` - Card metadata fetching (titles, descriptions)
- Database `practice_cards` table - Individual card data (title, description, etc.)
- Database `content_assets` table - Card content (videos, audio)
- `api/practice-cards.js` - API for managing card data

### Chat Tab Cards:
- `src/components/in-the-space/ChatTab.jsx` - Comment card structure
- `src/utils/shareoutsStorage.js` - Shareout storage/retrieval
- `src/constants/prompts.js` - Daily reflection prompts

---

## 📝 Summary

**Total Cards in Application:**
- **Main Feed**: 9 space cards (PracticeCard)
- **Practices Tab**: 4 cards per space (36 total across all spaces)
- **Chat Tab**: Variable (depends on user shareouts + mock data)

**Key Points:**
1. Each space has 4 **independent** cards in PracticesTab (can be edited separately)
2. Each card has its own title, description, and guidance from database
3. Cards can have unique video backgrounds
4. Cards support filtering and favoriting
5. Chat cards are dynamically generated from user input
6. All cards use gradient backgrounds specific to their space
7. **NEW**: Cards are stored in `practice_cards` table - edit one without affecting others!

---

*Last Updated: Based on current codebase structure*

