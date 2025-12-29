import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
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
        context.go('/feed');
      } else {
        context.go('/greeting');
      }
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



