import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/analytics_provider.dart';
import '../providers/auth_provider.dart';

class AnalyticsNavigationObserver extends NavigatorObserver {
  @override
  void didPush(Route<dynamic> route, Route<dynamic>? previousRoute) {
    super.didPush(route, previousRoute);
    _trackScreenView(route);
  }

  @override
  void didReplace({Route<dynamic>? newRoute, Route<dynamic>? oldRoute}) {
    super.didReplace(newRoute: newRoute, oldRoute: oldRoute);
    if (newRoute != null) {
      _trackScreenView(newRoute);
    }
  }

  void _trackScreenView(Route<dynamic> route) {
    try {
      final routeName = route.settings.name;
      if (routeName == null) return;

      // Get providers from the navigator context
      final context = route.navigator?.context;
      if (context == null) return;

      // Check if context is still mounted before accessing providers
      if (!context.mounted) return;

      AnalyticsProvider? analyticsProvider;
      AuthProvider? authProvider;
      
      try {
        analyticsProvider = Provider.of<AnalyticsProvider>(context, listen: false);
        authProvider = Provider.of<AuthProvider>(context, listen: false);
      } catch (e) {
        // Providers not available yet, skip tracking
        print('AnalyticsNavigationObserver: Providers not available: $e');
        return;
      }
      
      final userId = authProvider.user?.id;
      final screenName = _getScreenName(routeName);

      // Track screen view asynchronously to avoid blocking
      analyticsProvider.trackScreenView(
        screenName,
        userId: userId,
        properties: {
          'route': routeName,
          'timestamp': DateTime.now().toIso8601String(),
        },
      ).catchError((error) {
        // Silently handle errors to prevent crashes
        print('AnalyticsNavigationObserver: Error tracking screen view: $error');
      });
    } catch (e) {
      // Catch any unexpected errors to prevent crashes
      print('AnalyticsNavigationObserver: Unexpected error: $e');
    }
  }

  String _getScreenName(String route) {
    // Map routes to friendly screen names
    final screenNames = {
      '/splash': 'Splash',
      '/greeting': 'Greeting',
      '/login': 'Login',
      '/signup': 'Sign Up',
      '/profile-setup': 'Profile Setup',
      '/feed': 'Feed',
      '/practice/personalize': 'Practice Personalization',
      '/practice': 'Practice',
      '/practice/complete': 'Practice Complete',
      '/checkin': 'Emotional Check-in',
      '/intent': 'Intent Selection',
      '/profile': 'Profile',
      '/account': 'Account',
      '/what-to-expect': 'What to Expect',
    };
    return screenNames[route] ?? route.replaceAll('/', '').replaceAll('-', ' ');
  }
}

