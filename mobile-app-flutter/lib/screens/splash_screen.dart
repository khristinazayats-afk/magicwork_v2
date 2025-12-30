import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../providers/auth_provider.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigateToNext();
  }

  Future<void> _navigateToNext() async {
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      final authProvider = context.read<AuthProvider>();
      if (authProvider.isAuthenticated) {
        // Check if user has completed onboarding
        final hasCompletedOnboarding = await _checkOnboardingStatus();
        if (hasCompletedOnboarding) {
          context.go('/feed');
        } else {
          context.go('/onboarding');
        }
      } else {
        context.go('/greeting');
      }
    }
  }

  /// Check if user has completed onboarding
  Future<bool> _checkOnboardingStatus() async {
    try {
      final userId = Supabase.instance.client.auth.currentUser?.id;
      if (userId == null) return false;
      
      // Check SharedPreferences first (faster)
      final prefs = await SharedPreferences.getInstance();
      final onboarded = prefs.getBool('onboarded_$userId');
      if (onboarded != null) return onboarded;
      
      // Fallback to Supabase if not in SharedPreferences
      final response = await Supabase.instance.client
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('user_id', userId)
          .maybeSingle();
      
      if (response != null && response['onboarding_completed'] == true) {
        // Cache in SharedPreferences for next time
        await prefs.setBool('onboarded_$userId', true);
        return true;
      }
      
      return false;
    } catch (e) {
      print('[SplashScreen] Error checking onboarding status: $e');
      return false; // Show onboarding on error to be safe
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFCF8F2),
      body: Center(
        child: Image.asset(
          'assets/logos/magicwork-bw.png',
          width: 200,
          height: 200,
          color: const Color(0xFF1e2d2e),
          errorBuilder: (context, error, stackTrace) {
            return const Icon(Icons.self_improvement, size: 120, color: Color(0xFF172223));
          },
        ),
      ),
    );
  }
}



