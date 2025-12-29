# Complete Analytics & User Profile Setup

## Overview

This setup provides comprehensive user profiles and full analytics tracking for the Magicwork app.

## Database Tables

### 1. **user_profiles**
Complete user information including:
- Username, display name, first/last name
- Bio and avatar
- Preferences (language, timezone, notifications)
- Privacy settings
- Onboarding status
- Account status

### 2. **user_sessions**
Tracks app usage sessions:
- Session start/end times
- Device information
- App version
- Screens viewed
- Events count

### 3. **analytics_events**
Comprehensive event tracking:
- Event name, category, type
- Screen name
- Custom properties
- User context
- Device info
- Timestamp

### 4. **user_behavior_analytics**
Daily aggregated insights:
- Engagement metrics (sessions, duration, screens)
- Practice metrics (started, completed, minutes)
- Content engagement (views, interactions)
- Social engagement (shares, likes)
- Error tracking
- Performance metrics

## Setup Instructions

### Step 1: Run Database Schema

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/pujvtikwdmxlfrqfsjpu/sql
2. Open `database/setup_complete_schema.sql`
3. Copy and paste entire SQL script
4. Click **Run**

### Step 2: Install Flutter Dependencies

```bash
cd mobile-app-flutter
flutter pub get
```

### Step 3: Initialize Analytics in App

Add to `main.dart`:

```dart
import 'services/analytics_service.dart';

final analyticsService = AnalyticsService();

// In _initializeApp():
final userId = Supabase.instance.client.auth.currentUser?.id;
await analyticsService.startSession(userId);
```

### Step 4: Track Events Throughout App

```dart
// Track screen views
analyticsService.trackScreenView(
  screenName: 'feed',
  userId: currentUserId,
);

// Track user actions
analyticsService.trackAction(
  actionName: 'practice_started',
  screenName: 'feed',
  properties: {'practice_type': 'meditation'},
);

// Track practice completion
analyticsService.trackPracticeComplete(
  userId: currentUserId,
  practiceType: 'meditation',
  durationMinutes: 10,
);
```

## Analytics Events Tracked

### Navigation Events
- `screen_view` - Every screen visit
- `navigation` - Route changes

### User Actions
- `practice_started` - User starts a practice
- `practice_complete` - Practice finished
- `content_viewed` - Content item viewed
- `content_interacted` - User interacts with content
- `share_post` - User shares content
- `like_sent` - User sends a like

### System Events
- `app_opened` - App launch
- `app_backgrounded` - App goes to background
- `error` - Any error occurrence
- `performance` - Performance metrics

## User Profile Management

### Create/Update Profile

```dart
final profileService = UserProfileService();

await profileService.upsertProfile(
  userId: currentUserId,
  username: 'johndoe',
  displayName: 'John Doe',
  firstName: 'John',
  lastName: 'Doe',
  bio: 'Meditation enthusiast',
  preferredLanguage: 'en',
);
```

### Check Username Availability

```dart
final available = await profileService.isUsernameAvailable('johndoe');
```

### Upload Avatar

```dart
final avatarUrl = await profileService.uploadAvatar(userId, imageFile);
```

## Analytics Queries

### Get User Session History
```sql
SELECT * FROM user_sessions
WHERE user_id = 'user-id'
ORDER BY start_time DESC
LIMIT 10;
```

### Get User Events
```sql
SELECT * FROM analytics_events
WHERE user_id = 'user-id'
ORDER BY occurred_at DESC
LIMIT 100;
```

### Get Daily Behavior Analytics
```sql
SELECT * FROM user_behavior_analytics
WHERE user_id = 'user-id'
ORDER BY date DESC
LIMIT 30;
```

### Get Most Active Users
```sql
SELECT 
  user_id,
  SUM(sessions_count) as total_sessions,
  SUM(total_session_duration_seconds) as total_duration
FROM user_behavior_analytics
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY user_id
ORDER BY total_sessions DESC
LIMIT 10;
```

## Security

- ✅ All tables have RLS enabled
- ✅ Users can only access their own data
- ✅ Analytics events can be anonymous (user_id can be null)
- ✅ Public profiles can be viewed based on privacy settings

## Next Steps

1. ✅ Run database schema
2. ✅ Install Flutter dependencies
3. ✅ Initialize analytics service
4. ✅ Add tracking throughout app
5. ✅ Set up profile management UI
6. ✅ Create analytics dashboard (optional)

Your analytics system is now ready to track everything!










