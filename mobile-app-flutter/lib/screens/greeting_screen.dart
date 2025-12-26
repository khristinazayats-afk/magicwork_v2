import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class GreetingScreen extends StatelessWidget {
  const GreetingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFCF8F2),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),
              const Icon(
                Icons.self_improvement,
                size: 80,
                color: Color(0xFF1e2d2e),
              ),
              const SizedBox(height: 32),
              const Text(
                'Welcome to MagicWork',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 28,
                  fontFamily: 'HankenGrotesk',
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1e2d2e),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Personalized mindfulness and meditation for your daily life.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  fontFamily: 'HankenGrotesk',
                  color: Color(0xFF1e2d2e),
                ),
              ),
              const Spacer(),
              ElevatedButton(
                onPressed: () => context.push('/signup'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1e2d2e),
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 56),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: const Text(
                  'Get Started',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () => context.push('/signup?trial=true'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF94d1c4),
                  foregroundColor: const Color(0xFF1e2d2e),
                  minimumSize: const Size(double.infinity, 56),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 2,
                ),
                child: const Text(
                  'Enjoy free calm on us',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () => context.push('/login'),
                style: TextButton.styleFrom(
                  foregroundColor: const Color(0xFF1e2d2e),
                  minimumSize: const Size(double.infinity, 56),
                ),
                child: const Text(
                  'I already have an account',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}
