import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

import 'config/app_config.dart';
import 'providers/auth_provider.dart';
import 'providers/theme_provider.dart';
import 'providers/analytics_provider.dart';
import 'providers/user_profile_provider.dart';
import 'providers/subscription_provider.dart';
import 'services/fcm_service.dart';
import 'widgets/analytics_navigation_observer.dart';
import 'widgets/ambient_sound_manager.dart';
import 'screens/splash_screen.dart';
import 'screens/onboarding_screen.dart';
import 'screens/greeting_screen.dart';
import 'screens/login_screen.dart';
import 'screens/signup_screen.dart';
import 'screens/forgot_password_screen.dart';
import 'screens/profile_setup_screen.dart';
import 'screens/feed_screen.dart';
import 'screens/practice_personalization_screen.dart';
import 'screens/practice_screen.dart';
import 'screens/after_practice_modal.dart';
import 'screens/emotional_checkin_screen.dart';
import 'screens/intent_selection_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/user_account_screen.dart';
import 'screens/what_to_expect_screen.dart';
import 'screens/paywall_screen.dart';
import 'screens/notification_settings_screen.dart';
import 'theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Sentry only if DSN is provided
  // If no DSN, skip Sentry initialization to avoid errors
  const sentryDsn = String.fromEnvironment('SENTRY_DSN', defaultValue: '');
  if (sentryDsn.isNotEmpty) {
    await SentryFlutter.init(
      (options) {
        options.dsn = sentryDsn;
        options.tracesSampleRate = 1.0;
        options.debug = false; // Disable debug logs in production
      },
      appRunner: () => runApp(const MyApp()),
    );
  } else {
    // Run app without Sentry if no DSN provided
    runApp(const MyApp());
  }
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: _initializeApp(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const MaterialApp(
            home: Scaffold(
              body: Center(child: CircularProgressIndicator()),
            ),
          );
        }
        
        return MultiProvider(
          providers: [
            ChangeNotifierProvider(create: (_) => AuthProvider()),
            ChangeNotifierProvider(create: (_) => ThemeProvider()),
            ChangeNotifierProvider(create: (_) => AnalyticsProvider()),
            ChangeNotifierProvider(create: (_) => UserProfileProvider()),
            ChangeNotifierProvider(create: (_) => SubscriptionProvider()),
          ],
          child: Consumer5<ThemeProvider, AuthProvider, AnalyticsProvider, UserProfileProvider, SubscriptionProvider>(
            builder: (context, themeProvider, authProvider, analyticsProvider, profileProvider, subscriptionProvider, _) {
              // Initialize services when user is authenticated
              final currentUser = authProvider.user;
              if (currentUser != null) {
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  if (context.mounted) {
                    try {
                      // Initialize analytics
                      if (!analyticsProvider.isInitialized) {
                        analyticsProvider.initialize(currentUser.id);
                      }
                      
                      // Load user profile
                      profileProvider.loadProfile(currentUser.id);
                      
                      // Initialize subscriptions
                      subscriptionProvider.initialize(currentUser.id);
                      
                      // Initialize push notifications
                      PushNotificationService().initialize();
                    } catch (e) {
                      print('Error initializing services: $e');
                    }
                  }
                });
              }

              return MaterialApp.router(
                title: AppConfig.appName,
                debugShowCheckedModeBanner: false,
                theme: AppTheme.lightTheme,
                darkTheme: AppTheme.darkTheme,
                themeMode: themeProvider.themeMode,
                routerConfig: _router,
                builder: (context, child) {
                  return AmbientSoundManager(child: child ?? const SizedBox.shrink());
                },
              );
            },
          ),
        );
      },
    );
  }

  Future<void> _initializeApp() async {
    // Initialize Supabase
    await Supabase.initialize(
      url: AppConfig.supabaseUrl,
      anonKey: AppConfig.supabaseAnonKey,
      debug: false,
    );
    
    // Set system UI overlay style
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
      ),
    );
  }
}

final GoRouter _router = GoRouter(
  initialLocation: '/splash',
  observers: [AnalyticsNavigationObserver()],
  routes: [
    GoRoute(
      path: '/splash',
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/onboarding',
      builder: (context, state) => OnboardingScreen(
        onComplete: () {
          context.go('/feed');
        },
      ),
    ),
    GoRoute(
      path: '/greeting',
      builder: (context, state) => const GreetingScreen(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/signup',
      builder: (context, state) => const SignupScreen(),
    ),
    GoRoute(
      path: '/forgot-password',
      builder: (context, state) => const ForgotPasswordScreen(),
    ),
    GoRoute(
      path: '/profile-setup',
      builder: (context, state) => const ProfileSetupScreen(),
    ),
    GoRoute(
      path: '/feed',
      builder: (context, state) => const FeedScreen(),
    ),
    GoRoute(
      path: '/practice/personalize',
      builder: (context, state) => const PracticePersonalizationScreen(),
    ),
    GoRoute(
      path: '/practice',
      builder: (context, state) {
        // Pass extra data if available
        return PracticeScreen();
      },
    ),
    GoRoute(
      path: '/practice/complete',
      builder: (context, state) => const AfterPracticeModal(),
    ),
    GoRoute(
      path: '/checkin',
      builder: (context, state) => const EmotionalCheckInScreen(),
    ),
    GoRoute(
      path: '/intent',
      builder: (context, state) => const IntentSelectionScreen(),
    ),
    GoRoute(
      path: '/profile',
      builder: (context, state) => const ProfileScreen(),
    ),
    GoRoute(
      path: '/account',
      builder: (context, state) => const UserAccountScreen(),
    ),
    GoRoute(
      path: '/what-to-expect',
      builder: (context, state) => const WhatToExpectScreen(),
    ),
    GoRoute(
      path: '/paywall',
      builder: (context, state) => const PaywallScreen(),
    ),
    GoRoute(
      path: '/notification-settings',
      builder: (context, state) => const NotificationSettingsScreen(),
    ),
  ],
);

