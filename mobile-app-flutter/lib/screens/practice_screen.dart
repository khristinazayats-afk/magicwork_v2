import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/analytics_provider.dart';
import '../providers/auth_provider.dart';

class PracticeScreen extends StatefulWidget {
  const PracticeScreen({super.key});

  @override
  State<PracticeScreen> createState() => _PracticeScreenState();
}

class _PracticeScreenState extends State<PracticeScreen> {
  @override
  void initState() {
    super.initState();
    // Track screen view
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authProvider = context.read<AuthProvider>();
      final analyticsProvider = context.read<AnalyticsProvider>();
      analyticsProvider.trackScreenView(
        'Practice',
        userId: authProvider.user?.id,
      );
    });
  }

  /// Track practice completion - call this when practice session ends
  // ignore: unused_element
  Future<void> _handlePracticeComplete(int durationMinutes) async {
    final authProvider = context.read<AuthProvider>();
    final analyticsProvider = context.read<AnalyticsProvider>();
    final userId = authProvider.user?.id;

    if (userId != null) {
      // Track practice completion
      await analyticsProvider.trackPracticeComplete(
        userId: userId,
        practiceType: 'meditation',
        durationMinutes: durationMinutes,
        properties: {
          'completed_at': DateTime.now().toIso8601String(),
        },
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFCF8F2),
      body: const Center(
        child: Text('Practice Screen - Meditation session will be displayed here'),
      ),
    );
  }
}

