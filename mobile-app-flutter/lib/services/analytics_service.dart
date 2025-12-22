import 'package:supabase_flutter/supabase_flutter.dart';
import 'dart:io';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:package_info_plus/package_info_plus.dart';

class AnalyticsService {
  final SupabaseClient _supabase = Supabase.instance.client;
  String? _currentSessionId;
  Map<String, dynamic>? _deviceInfo;
  Map<String, dynamic>? _appInfo;

  AnalyticsService() {
    _initializeDeviceInfo();
  }

  Future<void> _initializeDeviceInfo() async {
    try {
      final deviceInfoPlugin = DeviceInfoPlugin();
      final packageInfo = await PackageInfo.fromPlatform();

      if (Platform.isIOS) {
        final iosInfo = await deviceInfoPlugin.iosInfo;
        _deviceInfo = {
          'device_type': 'ios',
          'device_id': iosInfo.identifierForVendor,
          'device_model': iosInfo.model,
          'device_name': iosInfo.name,
          'system_version': iosInfo.systemVersion,
          'system_name': iosInfo.systemName,
        };
      } else if (Platform.isAndroid) {
        final androidInfo = await deviceInfoPlugin.androidInfo;
        _deviceInfo = {
          'device_type': 'android',
          'device_id': androidInfo.id,
          'device_model': androidInfo.model,
          'device_brand': androidInfo.brand,
          'system_version': androidInfo.version.release,
          'sdk_int': androidInfo.version.sdkInt,
        };
      }

      _appInfo = {
        'app_version': packageInfo.version,
        'build_number': packageInfo.buildNumber,
        'package_name': packageInfo.packageName,
      };
    } catch (e) {
      print('Error initializing device info: $e');
    }
  }

  /// Start a new user session
  Future<String?> startSession(String? userId) async {
    try {
      _currentSessionId = DateTime.now().millisecondsSinceEpoch.toString();
      
      await _supabase.from('user_sessions').insert({
        'user_id': userId ?? 'anonymous',
        'session_id': _currentSessionId,
        'device_type': _deviceInfo?['device_type'] ?? 'unknown',
        'device_id': _deviceInfo?['device_id'],
        'app_version': _appInfo?['app_version'],
        'platform_version': _deviceInfo?['system_version'],
        'start_time': DateTime.now().toIso8601String(),
        'metadata': {
          'device_info': _deviceInfo,
          'app_info': _appInfo,
        },
      });

      return _currentSessionId;
    } catch (e) {
      print('Error starting session: $e');
      return null;
    }
  }

  /// End current session
  Future<void> endSession() async {
    if (_currentSessionId == null) return;

    try {
      final startTime = DateTime.now(); // Should be stored when session started
      final duration = DateTime.now().difference(startTime).inSeconds;

      await _supabase
          .from('user_sessions')
          .update({
            'end_time': DateTime.now().toIso8601String(),
            'duration_seconds': duration,
          })
          .eq('session_id', _currentSessionId!);

      _currentSessionId = null;
    } catch (e) {
      print('Error ending session: $e');
    }
  }

  /// Track an analytics event
  Future<void> trackEvent({
    required String eventName,
    String? userId,
    String? eventCategory,
    String? eventType,
    String? screenName,
    Map<String, dynamic>? properties,
    Map<String, dynamic>? userProperties,
  }) async {
    try {
      await _supabase.from('analytics_events').insert({
        'user_id': userId,
        'session_id': _currentSessionId,
        'event_name': eventName,
        'event_category': eventCategory ?? 'user_action',
        'event_type': eventType,
        'screen_name': screenName,
        'properties': properties ?? {},
        'user_properties': userProperties ?? {},
        'device_info': _deviceInfo ?? {},
        'occurred_at': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      print('Error tracking event: $e');
    }
  }

  /// Track screen view
  Future<void> trackScreenView({
    required String screenName,
    String? userId,
    Map<String, dynamic>? properties,
  }) async {
    await trackEvent(
      eventName: 'screen_view',
      userId: userId,
      eventCategory: 'navigation',
      eventType: 'view',
      screenName: screenName,
      properties: properties,
    );

    // Update session screen views
    if (_currentSessionId != null) {
      try {
        final session = await _supabase
            .from('user_sessions')
            .select('screen_views')
            .eq('session_id', _currentSessionId!)
            .single();

        final screenViews = List<Map<String, dynamic>>.from(
          session['screen_views'] ?? []
        );
        screenViews.add({
          'screen_name': screenName,
          'timestamp': DateTime.now().toIso8601String(),
        });

        await _supabase
            .from('user_sessions')
            .update({
              'screen_views': screenViews,
              'events_count': (session['events_count'] ?? 0) + 1,
            })
            .eq('session_id', _currentSessionId!);
      } catch (e) {
        print('Error updating session screen views: $e');
      }
    }
  }

  /// Track user action (click, tap, etc.)
  Future<void> trackAction({
    required String actionName,
    String? userId,
    String? screenName,
    Map<String, dynamic>? properties,
  }) async {
    await trackEvent(
      eventName: actionName,
      userId: userId,
      eventCategory: 'user_action',
      eventType: 'click',
      screenName: screenName,
      properties: properties,
    );
  }

  /// Track practice completion
  Future<void> trackPracticeComplete({
    required String userId,
    required String practiceType,
    required int durationMinutes,
    Map<String, dynamic>? properties,
  }) async {
    await trackEvent(
      eventName: 'practice_complete',
      userId: userId,
      eventCategory: 'practice',
      eventType: 'complete',
      properties: {
        'practice_type': practiceType,
        'duration_minutes': durationMinutes,
        ...?properties,
      },
    );
  }

  /// Track error
  Future<void> trackError({
    String? userId,
    required String errorMessage,
    String? errorType,
    String? screenName,
    Map<String, dynamic>? properties,
  }) async {
    await trackEvent(
      eventName: 'error',
      userId: userId,
      eventCategory: 'error',
      eventType: errorType ?? 'unknown',
      screenName: screenName,
      properties: {
        'error_message': errorMessage,
        ...?properties,
      },
    );
  }

  /// Update daily behavior analytics
  Future<void> updateBehaviorAnalytics({
    required String userId,
    required DateTime date,
    Map<String, dynamic>? metrics,
  }) async {
    try {
      final dateStr = date.toIso8601String().split('T')[0];

      await _supabase.from('user_behavior_analytics').upsert({
        'user_id': userId,
        'date': dateStr,
        ...?metrics,
        'updated_at': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      print('Error updating behavior analytics: $e');
    }
  }
}
