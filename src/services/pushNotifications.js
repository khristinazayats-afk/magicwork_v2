import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

class WebPushNotificationService {
  constructor() {
    this.messaging = null;
    this.initialized = false;
    this.deviceToken = null;
  }

  /**
   * Initialize Firebase Cloud Messaging
   */
  async initialize() {
    try {
      const firebaseConfig = {
        apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
        authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
        storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.REACT_APP_FIREBASE_APP_ID,
      };

      // Check if any config is missing
      if (!firebaseConfig.projectId) {
        console.warn('Firebase config incomplete - push notifications disabled');
        return;
      }

      // Initialize Firebase
      const app = initializeApp(firebaseConfig);
      this.messaging = getMessaging(app);

      // Request permission and get token
      await this._requestPermissionAndGetToken();

      // Listen for foreground messages
      this._setupForegroundMessageHandler();

      this.initialized = true;
      console.log('Push notifications initialized');
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  }

  /**
   * Request notification permission and get device token
   */
  async _requestPermissionAndGetToken() {
    try {
      // Check if notifications are supported
      if (!('serviceWorker' in navigator)) {
        console.log('Service Workers not supported');
        return;
      }

      // Register service worker
      await navigator.serviceWorker.register('/firebase-messaging-sw.js');

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return;
      }

      // Get token
      const token = await getToken(this.messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
      });

      if (token) {
        this.deviceToken = token;
        console.log('Device token:', token);
        return token;
      } else {
        console.log('Failed to get device token');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }

  /**
   * Handle foreground messages
   */
  _setupForegroundMessageHandler() {
    if (!this.messaging) return;

    onMessage(this.messaging, (payload) => {
      console.log('Message received:', payload);

      const notificationTitle = payload.notification?.title || 'New Message';
      const notificationOptions = {
        body: payload.notification?.body,
        icon: payload.notification?.icon || '/icon-192x192.png',
        tag: payload.notification?.tag || 'notification',
        data: payload.data || {},
      };

      // Show notification
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(notificationTitle, notificationOptions);
        });
      }
    });
  }

  /**
   * Subscribe to topic
   */
  async subscribeToTopic(topic) {
    try {
      if (!this.deviceToken) {
        console.log('No device token available');
        return;
      }

      const response = await fetch('/api/notifications/subscribe-topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: this.deviceToken,
          topic,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe to topic');
      }

      console.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error('Error subscribing to topic:', error);
    }
  }

  /**
   * Unsubscribe from topic
   */
  async unsubscribeFromTopic(topic) {
    try {
      if (!this.deviceToken) {
        console.log('No device token available');
        return;
      }

      const response = await fetch('/api/notifications/unsubscribe-topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: this.deviceToken,
          topic,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to unsubscribe from topic');
      }

      console.log(`Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
    }
  }

  /**
   * Subscribe to user-specific notifications
   */
  async subscribeToUserNotifications(userId) {
    try {
      await this.subscribeToTopic(`user_${userId}`);
      await this.subscribeToTopic('meditation_reminders');
      await this.subscribeToTopic('app_updates');
    } catch (error) {
      console.error('Error subscribing to user notifications:', error);
    }
  }

  /**
   * Get device token
   */
  getDeviceToken() {
    return this.deviceToken;
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled() {
    return this.initialized && this.deviceToken !== null;
  }
}

export default new WebPushNotificationService();
