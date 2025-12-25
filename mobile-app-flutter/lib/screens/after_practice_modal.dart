import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class AfterPracticeModal extends StatelessWidget {
  const AfterPracticeModal({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFCF8F2),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('Practice Complete!'),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go('/feed'),
              child: const Text('Continue'),
            ),
          ],
        ),
      ),
    );
  }
}









