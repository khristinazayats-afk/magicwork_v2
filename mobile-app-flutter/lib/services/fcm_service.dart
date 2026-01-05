import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest.dart' as tz;
import 'package:timezone/timezone.dart';

/// Background message handler - must be a top-level function
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint('Handling a background message: ${message.messageId}');
}

class PushNotificationService {
  static final FirebaseMessaging _firebaseMessaging =
      FirebaseMessaging.instance;

  static final FlutterLocalNotificationsPlugin
      _flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();

  bool _isInitialized = false;
  String? _deviceToken;

  bool get isInitialized => _isInitialized;
  String? get deviceToken => _deviceToken;

  /// Initialize Firebase and push notifications
  Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      // Initialize Firebase
      await Firebase.initializeApp();

      // Set background message handler
      FirebaseMessaging.onBackgroundMessage(
        _firebaseMessagingBackgroundHandler,
      );

      // Request notification permissions (iOS)
      final settings = await _firebaseMessaging.requestPermission(
        alert: true,
        announcement: true,
        badge: true,
        carPlay: true,
        criticalAlert: true,
        provisional: true,
        sound: true,
      );

      debugPrint('Notification permissions: ${settings.authorizationStatus}');

      // Get device token
      _deviceToken = await _firebaseMessaging.getToken();
      debugPrint('FCM Device Token: $_deviceToken');

      // Initialize local notifications
      await _initializeLocalNotifications();

      // Handle foreground messages
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        _handleForegroundMessage(message);
      });

      // Handle notification tap (when app is in background or terminated)
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        _handleNotificationTap(message);
      });

      _isInitialized = true;
      debugPrint('Push notification service initialized');
    } catch (e) {
      debugPrint('Push notification initialization error: $e');
    }
  }

  /// Initialize local notifications for displaying messages in foreground
  Future<void> _initializeLocalNotifications() async {
    const AndroidInitializationSettings androidInitSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const DarwinInitializationSettings iosInitSettings =
        DarwinInitializationSettings(
      requestSoundPermission: true,
      requestBadgePermission: true,
      requestAlertPermission: true,
    );

    const InitializationSettings initSettings = InitializationSettings(
      android: androidInitSettings,
      iOS: iosInitSettings,
    );

    await _flutterLocalNotificationsPlugin.initialize(
      initSettings,
      onDidReceiveNotificationResponse: (NotificationResponse response) {
        _handleNotificationTap(null);
      },
    );
  }

  /// Handle foreground messages
  void _handleForegroundMessage(RemoteMessage message) {
    debugPrint('Foreground message received: ${message.notification?.title}');

    final notification = message.notification;
    if (notification != null) {
      _flutterLocalNotificationsPlugin.show(
        notification.hashCode,
        notification.title,
        notification.body,
        const NotificationDetails(
          android: AndroidNotificationDetails(
            'meditation_channel',
            'Meditation Notifications',
            channelDescription: 'Notifications for meditation reminders',
            importance: Importance.max,
            priority: Priority.high,
            showWhen: true,
          ),
          iOS: DarwinNotificationDetails(
            presentAlert: true,
            presentBadge: true,
            presentSound: true,
          ),
        ),
      );
    }
  }

  /// Handle notification tap
  void _handleNotificationTap(RemoteMessage? message) {
    debugPrint('Notification tapped');
    // Handle navigation based on notification data
    // Example: Navigate to practice screen or specific practice
    if (message?.data.isNotEmpty ?? false) {
      final data = message?.data;
      debugPrint('Notification data: $data');
      // Implement navigation logic here
    }
  }

  /// Subscribe to topic for targeted notifications
  Future<void> subscribeToTopic(String topic) async {
    try {
      await _firebaseMessaging.subscribeToTopic(topic);
      debugPrint('Subscribed to topic: $topic');
    } catch (e) {
      debugPrint('Error subscribing to topic: $e');
    }
  }

  /// Unsubscribe from topic
  Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await _firebaseMessaging.unsubscribeFromTopic(topic);
      debugPrint('Unsubscribed from topic: $topic');
    } catch (e) {
      debugPrint('Error unsubscribing from topic: $e');
    }
  }

  /// Subscribe user to notifications based on preferences
  Future<void> subscribeToNotifications(String userId) async {
    try {
      // Subscribe to user-specific topic
      await subscribeToTopic('user_$userId');

      // Subscribe to meditation reminders
      await subscribeToTopic('meditation_reminders');

      // Subscribe to app updates
      await subscribeToTopic('app_updates');

      debugPrint('User subscribed to notifications');
    } catch (e) {
      debugPrint('Error subscribing user to notifications: $e');
    }
  }

  /// Schedule local meditation reminder
  Future<void> scheduleMeditationReminder({
    required String title,
    required String body,
    required DateTime scheduledTime,
  }) async {
    try {
      await _flutterLocalNotificationsPlugin.zonedSchedule(
        0,
        title,
        body,
        TZDateTime.from(scheduledTime, local),
        const NotificationDetails(
          android: AndroidNotificationDetails(
            'meditation_reminder_channel',
            'Meditation Reminders',
            channelDescription: 'Daily meditation reminders',
            importance: Importance.high,
            priority: Priority.high,
          ),
          iOS: DarwinNotificationDetails(
            presentAlert: true,
            presentBadge: true,
            presentSound: true,
          ),
        ),
        androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      );

      debugPrint('Meditation reminder scheduled for: $scheduledTime');
    } catch (e) {
      debugPrint('Error scheduling meditation reminder: $e');
    }
  }

  /// Cancel scheduled notification
  Future<void> cancelScheduledNotification(int id) async {
    try {
      await _flutterLocalNotificationsPlugin.cancel(id);
    } catch (e) {
      debugPrint('Error canceling notification: $e');
    }
  }

  /// Get initial notification (when app was terminated)
  Future<RemoteMessage?> getInitialNotification() async {
    return await _firebaseMessaging.getInitialMessage();
  }

  /// Update token (call when device token changes)
  Future<void> updateToken() async {
    try {
      _deviceToken = await _firebaseMessaging.getToken();
      debugPrint('Device token updated: $_deviceToken');
    } catch (e) {
      debugPrint('Error updating device token: $e');
    }
  }
}
