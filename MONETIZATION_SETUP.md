# Monetization & Analytics Setup Guide

This guide covers the implementation of RevenueCat (mobile subscriptions), Stripe (web payments), Amplitude (analytics), and Firebase Cloud Messaging (push notifications).

## Overview

### Mobile App (Flutter)
- **Subscriptions**: RevenueCat SDK
- **Analytics**: Amplitude
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **State Management**: Provider pattern with SubscriptionProvider

### Web App (React)
- **Subscriptions**: Stripe Checkout
- **Analytics**: Amplitude
- **Push Notifications**: Firebase Cloud Messaging (web)

---

## 1. Mobile Setup (Flutter)

### Step 1: RevenueCat Configuration

#### Get RevenueCat API Keys
1. Sign up at https://www.revenuecat.com
2. Create an app project
3. Get API keys for iOS and Android

#### Add Keys to Environment
```bash
# Create/update .env file in mobile-app-flutter/
REVENUECAT_API_KEY_IOS=appl_xxxxx
REVENUECAT_API_KEY_ANDROID=goog_xxxxx
```

#### Configure in Flutter
The `SubscriptionService` automatically loads these keys. Verify in:
- `lib/services/subscription_service.dart` (lines 20-30)

### Step 2: Amplitude Configuration

#### Get Amplitude API Key
1. Sign up at https://amplitude.com
2. Create a project
3. Copy the API key

#### Add to Environment
```bash
AMPLITUDE_API_KEY=amp_xxxxx
```

#### Service Location
- `lib/services/amplitude_analytics_service.dart`
- Automatically initialized when user logs in

### Step 3: Firebase Configuration

#### Create Firebase Project
1. Go to https://firebase.google.com/console
2. Create a new project
3. Enable Cloud Messaging

#### Download Configuration Files

**For iOS:**
1. Add iOS app to Firebase project
2. Download `GoogleService-Info.plist`
3. Place in `mobile-app-flutter/ios/Runner/`

**For Android:**
1. Add Android app to Firebase project
2. Download `google-services.json`
3. Place in `mobile-app-flutter/android/app/`

#### Get Firebase Keys
Add these to `.env`:
```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_MESSAGING_SENDER_ID=123456789
```

### Step 4: Initialize Services in main.dart

The services are already integrated:
```dart
// lib/main.dart - Look for these initializations:
SubscriptionProvider().initialize(currentUser.id);
PushNotificationService().initialize();
```

### Step 5: Add Paywall & Settings Screens

Both screens are already created:
- Paywall: `/paywall` route
- Notification Settings: `/notification-settings` route

Add to your navigation:
```dart
// Show paywall when user taps upgrade button
context.push('/paywall');

// Show notification settings
context.push('/notification-settings');
```

---

## 2. Web Setup (React)

### Step 1: Stripe Configuration

#### Get Stripe Keys
1. Sign up at https://stripe.com
2. Get publishable and secret keys
3. Create subscription products and prices

#### Add to Environment
```bash
# .env or .env.local
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

#### Use in React
```jsx
import SubscriptionPaywall from './components/SubscriptionPaywall';

// In your component
<SubscriptionPaywall 
  userId={userId} 
  onSubscribeSuccess={() => console.log('Subscribed!')}
/>
```

### Step 2: Amplitude Setup (Web)

#### Environment Configuration
```bash
REACT_APP_AMPLITUDE_API_KEY=amp_xxxxx
```

#### Initialize in App
```jsx
import amplitudeService from './services/amplitude';

// On app load or user login
useEffect(() => {
  amplitudeService.initialize(userId);
}, [userId]);
```

#### Track Events
```jsx
// Track practice
amplitudeService.trackPracticeStart('meditation', 10);

// Track subscriptions
amplitudeService.trackSubscriptionEvent('purchase', 'premium-monthly', 9.99);

// Track pages
amplitudeService.trackScreenView('paywall', { utm_source: 'email' });
```

### Step 3: Firebase Web Push Notifications

#### Get Firebase Credentials
From Firebase Console:
1. Project Settings → Service Accounts
2. Generate private key (JSON)
3. Download configuration

#### Add Environment Variables
```bash
REACT_APP_FIREBASE_API_KEY=AIza...
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_VAPID_KEY=your-vapid-public-key
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

#### Initialize in App
```jsx
import pushNotificationService from './services/pushNotifications';

useEffect(() => {
  pushNotificationService.initialize();
  
  // Subscribe to topics
  pushNotificationService.subscribeToUserNotifications(userId);
}, [userId]);
```

#### Service Worker
The service worker is at: `public/firebase-messaging-sw.js`

Update with your Firebase config (replace placeholders)

---

## 3. Backend API Setup

### Step 1: Create Database Tables

Run these SQL commands:

```sql
-- Subscription packages
CREATE TABLE subscription_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  billing_period VARCHAR(50) NOT NULL,
  description TEXT,
  stripe_price_id VARCHAR(255),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  stripe_customer_id VARCHAR(255),
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Subscription payments
CREATE TABLE subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stripe_invoice_id VARCHAR(255),
  amount INTEGER,
  currency VARCHAR(3),
  paid_at TIMESTAMP DEFAULT NOW()
);

-- Notification subscriptions
CREATE TABLE notification_subscriptions (
  token VARCHAR(255),
  topic VARCHAR(255),
  subscribed_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (token, topic)
);

-- Scheduled notifications
CREATE TABLE scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic VARCHAR(255),
  title VARCHAR(255),
  body TEXT,
  scheduled_time TIMESTAMP,
  data JSONB,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications sent log
CREATE TABLE notifications_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic VARCHAR(255),
  title VARCHAR(255),
  body TEXT,
  sent_at TIMESTAMP DEFAULT NOW()
);
```

### Step 2: Configure API Routes

The API endpoints are ready at:
- `/api/subscriptions/*` - Stripe integration
- `/api/notifications/*` - Firebase messaging

### Step 3: Setup Webhooks

#### Stripe Webhooks
1. Go to Stripe Dashboard → Webhooks
2. Add webhook endpoint: `https://your-domain/api/subscriptions/webhook`
3. Subscribe to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`

4. Get webhook secret and add to `.env`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Firebase Cloud Messaging
1. Go to Firebase Console → Cloud Messaging
2. Get Server API Key
3. Add to backend environment

---

## 4. Testing

### Mobile Testing

#### RevenueCat
1. Test purchases with TestFlight (iOS) or internal testing (Android)
2. Check RevenueCat dashboard for test purchases

#### Amplitude
1. Open app and perform actions
2. Check Amplitude dashboard for events appearing in real-time

#### Push Notifications
1. Device must be signed in to Supabase
2. Send test notification from Firebase Console
3. Should appear on device lock screen

### Web Testing

#### Stripe
```bash
# Use these test cards:
4242 4242 4242 4242  # Visa (success)
5555 5555 5555 4444  # Mastercard (success)
```

#### Amplitude
1. Visit site and perform actions
2. Check Amplitude dashboard

#### Firebase Push (Web)
1. Must use HTTPS (not localhost for production testing)
2. Allow notification permissions when prompted
3. Send test message from Firebase Console

---

## 5. Deployment

### Mobile
1. Build with RevenueCat and Firebase configs in place
2. Deploy to App Store / Play Store
3. Enable subscriptions in store dashboards

### Web
1. Install dependencies: `npm install`
2. Set environment variables in deployment platform
3. Deploy to Vercel / hosting platform

---

## 6. Monitoring

### Amplitude Dashboard
- Track subscription funnel
- Monitor feature usage
- Analyze user retention

### Stripe Dashboard
- Monitor subscription revenue
- Track churn rate
- Manage failed payments

### Firebase Console
- View notification delivery rates
- Monitor crash reports
- Check analytics

### RevenueCat Dashboard
- Monitor iOS/Android subscriptions
- Track customer events
- Manage entitlements

---

## 7. Important Notes

⚠️ **Security**
- Never commit `.env` files
- Use separate keys for dev/prod
- Rotate API keys regularly
- Use HTTPS in production

⚠️ **Testing**
- Test with sandbox/test credentials first
- Verify webhooks are working
- Test on real devices

⚠️ **Configuration**
- Keep analytics enabled from day 1
- Set up error tracking early
- Monitor costs (Stripe, Amplitude, Firebase)

---

## Files Created/Modified

### Flutter
- ✅ `lib/services/subscription_service.dart` - RevenueCat integration
- ✅ `lib/services/amplitude_analytics_service.dart` - Analytics
- ✅ `lib/services/fcm_service.dart` - Push notifications
- ✅ `lib/providers/subscription_provider.dart` - State management
- ✅ `lib/screens/paywall_screen.dart` - Subscription UI
- ✅ `lib/screens/notification_settings_screen.dart` - Settings
- ✅ `lib/main.dart` - Service initialization
- ✅ `pubspec.yaml` - Dependencies

### Web
- ✅ `src/components/SubscriptionPaywall.jsx` - Stripe checkout
- ✅ `src/services/amplitude.js` - Analytics
- ✅ `src/services/pushNotifications.js` - Firebase messaging
- ✅ `public/firebase-messaging-sw.js` - Service worker
- ✅ `api/subscriptions.js` - Stripe API
- ✅ `api/notifications.js` - Firebase API
- ✅ `package.json` - Dependencies

### Configuration
- ✅ `.env.example` - Environment template

---

## Troubleshooting

### RevenueCat not working
- Check API keys are correct
- Verify bundle ID matches (iOS)
- Check Android package name
- Test with TestFlight/internal testing

### Firebase not sending notifications
- Verify service worker is registered
- Check notification permissions granted
- Verify topic subscriptions
- Check Firebase console logs

### Amplitude not tracking
- Check API key is correct
- Verify initialize() called with userId
- Check browser console for errors
- Allow analytics in user settings

### Stripe webhook not working
- Verify endpoint URL is public
- Check webhook secret is correct
- Monitor Stripe Dashboard for failed attempts
- Test with Stripe CLI locally

---

For support: contact the team or check specific dashboard documentation
