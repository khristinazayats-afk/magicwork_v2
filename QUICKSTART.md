# Quick Start Guide - Monetization System

Get up and running in 30 minutes.

## Step 1: Get API Keys (10 minutes)

### Sign Up for Services
1. **RevenueCat**: https://www.revenuecat.com (iOS & Android subscriptions)
   - Create account → Create app → Get iOS API key → Get Android API key
   
2. **Stripe**: https://stripe.com (Web payments)
   - Create account → Get publishable key → Get secret key
   
3. **Amplitude**: https://amplitude.com (Analytics)
   - Create account → Create project → Get API key
   
4. **Firebase**: https://firebase.google.com (Push notifications)
   - Create project → Enable Cloud Messaging → Get config

## Step 2: Configure Environment (5 minutes)

### Copy Template
```bash
cp .env.example .env
cp .env.example .env.local
```

### Add Your Keys
Edit `.env` and `.env.local`:

```bash
# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# RevenueCat
REVENUECAT_API_KEY_IOS=appl_xxxxx
REVENUECAT_API_KEY_ANDROID=goog_xxxxx

# Amplitude
AMPLITUDE_API_KEY=amp_xxxxx
REACT_APP_AMPLITUDE_API_KEY=amp_xxxxx

# Firebase (get from Firebase console)
REACT_APP_FIREBASE_API_KEY=AIza...
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
```

## Step 3: Download Firebase Config Files (5 minutes)

### iOS
1. Go to Firebase Console → Project Settings
2. Add iOS app (Bundle ID: `com.yourapp.identifier`)
3. Download `GoogleService-Info.plist`
4. Place in: `mobile-app-flutter/ios/Runner/`

### Android
1. Go to Firebase Console → Project Settings
2. Add Android app (Package name: `com.yourapp.identifier`)
3. Download `google-services.json`
4. Place in: `mobile-app-flutter/android/app/`

## Step 4: Create Database Tables (5 minutes)

Run in your PostgreSQL database:

```sql
-- Subscriptions
CREATE TABLE subscription_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  billing_period VARCHAR(50) NOT NULL,
  stripe_price_id VARCHAR(255),
  active BOOLEAN DEFAULT true
);

CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  status VARCHAR(50),
  current_period_end TIMESTAMP
);

-- Notifications
CREATE TABLE notification_subscriptions (
  token VARCHAR(255),
  topic VARCHAR(255),
  PRIMARY KEY (token, topic)
);
```

## Step 5: Install Dependencies (3 minutes)

### Mobile
```bash
cd mobile-app-flutter
flutter pub get
```

### Web
```bash
npm install
```

## Step 6: Test Locally

### Test Mobile Subscriptions
```bash
cd mobile-app-flutter
flutter run
# Navigate to Settings → Upgrade (or use /paywall route)
# You should see subscription options
```

### Test Web Subscriptions
```bash
npm run dev
# Visit http://localhost:3000/paywall
# You should see Stripe checkout
```

### Test Analytics
Open browser console and check:
```javascript
// Should see Amplitude initialized
amplitudeService.trackScreenView('test_page')
// Check Amplitude dashboard
```

### Test Push Notifications
1. Allow notifications when prompted
2. Check Firebase console
3. Send test notification
4. Should appear on device

## Step 7: Deploy (2 minutes)

### Mobile
```bash
# iOS
flutter build ios --release
# Upload to TestFlight or App Store

# Android
flutter build apk --release
# Upload to Play Store internal testing
```

### Web
```bash
npm run build
# Deploy to Vercel or your hosting
# Don't forget to set environment variables!
```

## Verify Everything Works

### Checklist
- [ ] Can see paywall screen (mobile & web)
- [ ] Can toggle notification settings
- [ ] Can complete test purchase (use test card 4242 4242 4242 4242)
- [ ] Can see events in Amplitude dashboard
- [ ] Can send test notification from Firebase
- [ ] Database has subscription data

## Common Test Scenarios

### Test Stripe Checkout (Web)
Use card: `4242 4242 4242 4242`
```
Exp: 12/25
CVC: 123
```
Status: ✅ Immediate success

### Test Analytics
```dart
// Flutter
amplitudeService.trackPracticeStart('meditation', 10);

// React
amplitudeService.trackPracticeStart('meditation', 10);
```
Check Amplitude dashboard → should see event

### Test Push Notification
```bash
# From Firebase Console
# Send notification to topic: meditation_reminders
# Should appear on device/web
```

## Troubleshooting

### Paywall not showing
- Check route exists: `/paywall`
- Check SubscriptionProvider initialized in main.dart
- Check network requests in DevTools

### Purchases not working
- Check RevenueCat API keys correct
- Test on TestFlight (not local)
- Check Bundle ID matches RevenueCat

### Analytics not showing
- Check Amplitude API key
- Check initialize() called with userId
- Wait 5-10 minutes for data to appear

### Notifications not arriving
- Check Firebase config files placed correctly
- Check permissions granted
- Check topic subscriptions in database

## Next Steps

1. **Read Full Guides**:
   - `MONETIZATION_SETUP.md` - Complete setup
   - `LAUNCH_CHECKLIST.md` - Pre-launch tasks

2. **Set Up Webhooks**:
   - Stripe: Add webhook endpoint in dashboard
   - Firebase: Configure background message handling

3. **Create Content**:
   - Write paywall copy
   - Design hero image
   - Create feature list

4. **Plan Growth**:
   - A/B test pricing tiers
   - Plan marketing campaigns
   - Set up analytics dashboards

---

## Key Files Created

**Mobile (Flutter)**:
- `lib/services/subscription_service.dart` - RevenueCat
- `lib/services/amplitude_analytics_service.dart` - Analytics
- `lib/services/fcm_service.dart` - Push notifications
- `lib/screens/paywall_screen.dart` - Paywall UI
- `lib/screens/notification_settings_screen.dart` - Settings

**Web (React)**:
- `src/components/SubscriptionPaywall.jsx` - Paywall
- `src/services/amplitude.js` - Analytics
- `src/services/pushNotifications.js` - Push
- `api/subscriptions.js` - API
- `api/notifications.js` - API

**Config**:
- `.env.example` - Template
- `MONETIZATION_SETUP.md` - Full guide
- `LAUNCH_CHECKLIST.md` - Tasks

---

## Support

- **RevenueCat Help**: https://support.revenuecat.com
- **Stripe Support**: https://support.stripe.com
- **Firebase Support**: https://firebase.google.com/support
- **Amplitude Support**: https://help.amplitude.com

---

**Time to Complete**: ~30 minutes ⏱️
**Complexity**: 🟡 Medium
**Status**: 🟢 Ready to Use
