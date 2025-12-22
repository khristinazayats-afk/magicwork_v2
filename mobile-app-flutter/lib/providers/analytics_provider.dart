import 'package:flutter/foundation.dart';
import '../services/analytics_service.dart';

class AnalyticsProvider extends ChangeNotifier {
  final AnalyticsService _analyticsService = AnalyticsService();
  String? _currentSessionId;
  bool _isInitialized = false;

  String? get currentSessionId => _currentSessionId;
  bool get isInitialized => _isInitialized;

  /// Initialize analytics and start session
  Future<void> initialize(String? userId) async {
    if (_isInitialized) return;

    try {
      _currentSessionId = await _analyticsService.startSession(userId);
      _isInitialized = true;
      notifyListeners();
    } catch (e) {
      print('Error initializing analytics: $e');
    }
  }

  /// Track screen view
  Future<void> trackScreenView(String screenName, {String? userId, Map<String, dynamic>? properties}) async {
    await _analyticsService.trackScreenView(
      screenName: screenName,
      userId: userId,
      properties: properties,
    );
  }

  /// Track user action
  Future<void> trackAction({
    required String actionName,
    String? userId,
    String? screenName,
    Map<String, dynamic>? properties,
  }) async {
    await _analyticsService.trackAction(
      actionName: actionName,
      userId: userId,
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
    await _analyticsService.trackPracticeComplete(
      userId: userId,
      practiceType: practiceType,
      durationMinutes: durationMinutes,
      properties: properties,
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
    await _analyticsService.trackError(
      userId: userId,
      errorMessage: errorMessage,
      errorType: errorType,
      screenName: screenName,
      properties: properties,
    );
  }

  /// End current session
  Future<void> endSession() async {
    await _analyticsService.endSession();
    _currentSessionId = null;
    _isInitialized = false;
    notifyListeners();
  }
}

