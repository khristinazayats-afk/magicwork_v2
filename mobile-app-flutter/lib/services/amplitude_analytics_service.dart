import 'package:amplitude_flutter/amplitude.dart';
import 'package:flutter/foundation.dart';

class AmplitudeAnalyticsService {
  static const String _amplitudeApiKey = String.fromEnvironment(
    'AMPLITUDE_API_KEY',
    defaultValue: '',
  );

  static final Amplitude _amplitude = Amplitude.getInstance();
  bool _isInitialized = false;

  bool get isInitialized => _isInitialized;

  /// Initialize Amplitude
  Future<void> initialize(String? userId) async {
    if (_isInitialized) return;

    if (_amplitudeApiKey.isEmpty) {
      debugPrint('Amplitude API key not configured');
      return;
    }

    try {
      // Initialize with API key
      await _amplitude.init(_amplitudeApiKey);

      // Set user ID if available
      if (userId != null && userId.isNotEmpty) {
        await setUserId(userId);
      }

      _isInitialized = true;
      debugPrint('Amplitude initialized successfully');
    } catch (e) {
      debugPrint('Amplitude initialization error: $e');
    }
  }

  /// Set user ID
  Future<void> setUserId(String userId) async {
    try {
      await _amplitude.setUserId(userId);
    } catch (e) {
      debugPrint('Error setting Amplitude user ID: $e');
    }
  }

  /// Track screen view
  Future<void> trackScreenView(String screenName) async {
    if (!_isInitialized) return;

    try {
      await _amplitude.logEvent('Screen Viewed', {
        'screen_name': screenName,
        'timestamp': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      debugPrint('Error tracking screen view: $e');
    }
  }

  /// Track practice start
  Future<void> trackPracticeStart(String practiceName, int durationMinutes) async {
    if (!_isInitialized) return;

    try {
      await _amplitude.logEvent('Practice Started', {
        'practice_name': practiceName,
        'duration_minutes': durationMinutes,
        'timestamp': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      debugPrint('Error tracking practice start: $e');
    }
  }

  /// Track practice completion
  Future<void> trackPracticeComplete(
    String practiceName,
    int durationMinutes,
    String mood,
    int vibeLevel,
  ) async {
    if (!_isInitialized) return;

    try {
      await _amplitude.logEvent('Practice Completed', {
        'practice_name': practiceName,
        'duration_minutes': durationMinutes,
        'mood': mood,
        'vibe_level': vibeLevel,
        'timestamp': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      debugPrint('Error tracking practice completion: $e');
    }
  }

  /// Track subscription event
  Future<void> trackSubscriptionEvent(String eventType, {
    String? packageId,
    double? price,
    String? currency,
  }) async {
    if (!_isInitialized) return;

    try {
      final properties = {
        'event_type': eventType,
        'timestamp': DateTime.now().toIso8601String(),
      };

      if (packageId != null) properties['package_id'] = packageId;
      if (price != null) properties['price'] = price;
      if (currency != null) properties['currency'] = currency;

      await _amplitude.logEvent('Subscription Event', properties);
    } catch (e) {
      debugPrint('Error tracking subscription event: $e');
    }
  }

  /// Track mood check-in
  Future<void> trackMoodCheckIn(String mood, String intent) async {
    if (!_isInitialized) return;

    try {
      await _amplitude.logEvent('Mood Check In', {
        'mood': mood,
        'intent': intent,
        'timestamp': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      debugPrint('Error tracking mood check-in: $e');
    }
  }

  /// Track user engagement
  Future<void> trackUserEngagement(String actionType, {
    Map<String, dynamic>? properties,
  }) async {
    if (!_isInitialized) return;

    try {
      final eventProperties = {
        'action_type': actionType,
        'timestamp': DateTime.now().toIso8601String(),
        ...?properties,
      };

      await _amplitude.logEvent('User Engagement', eventProperties);
    } catch (e) {
      debugPrint('Error tracking user engagement: $e');
    }
  }

  /// Track retention metrics
  Future<void> trackRetention(int daysSinceInstall) async {
    if (!_isInitialized) return;

    try {
      await _amplitude.logEvent('User Retention', {
        'days_since_install': daysSinceInstall,
        'timestamp': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      debugPrint('Error tracking retention: $e');
    }
  }

  /// Track crash/error (for additional error logging beyond Sentry)
  Future<void> trackError(String errorMessage, String errorType) async {
    if (!_isInitialized) return;

    try {
      await _amplitude.logEvent('Error Occurred', {
        'error_message': errorMessage,
        'error_type': errorType,
        'timestamp': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      debugPrint('Error tracking error event: $e');
    }
  }

  /// Set user properties for segmentation
  Future<void> setUserProperties(Map<String, dynamic> properties) async {
    if (!_isInitialized) return;

    try {
      for (final entry in properties.entries) {
        await _amplitude.setUserProperty(entry.key, entry.value);
      }
    } catch (e) {
      debugPrint('Error setting user properties: $e');
    }
  }

  /// Flush events to Amplitude
  Future<void> flush() async {
    if (!_isInitialized) return;

    try {
      await _amplitude.uploadEvents();
    } catch (e) {
      debugPrint('Error flushing Amplitude events: $e');
    }
  }
}
