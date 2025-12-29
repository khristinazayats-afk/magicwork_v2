import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../providers/analytics_provider.dart';
import '../providers/auth_provider.dart';

const List<Map<String, String>> PRACTICES = [
  {
    'name': 'Slow Morning',
    'description': 'Start your day with intention and calm presence',
    'duration': '5 min',
    'color': '#E8D5F2',
    'users': '24'
  },
  {
    'name': 'Breathe To Relax',
    'description': 'Simple breathing techniques for immediate calm',
    'duration': '3 min',
    'color': '#C9E8F5',
    'users': '18'
  },
  {
    'name': 'Gentle De-Stress',
    'description': 'Release tension and find your center',
    'duration': '7 min',
    'color': '#D4F5E8',
    'users': '32'
  },
  {
    'name': 'Get in the Flow State',
    'description': 'Focus and creativity practice',
    'duration': '10 min',
    'color': '#FFF4D4',
    'users': '15'
  },
  {
    'name': 'Drift into Sleep',
    'description': 'Relaxation journey for better sleep',
    'duration': '15 min',
    'color': '#F0E8F5',
    'users': '41'
  },
  {
    'name': 'Midday Reset',
    'description': 'Recharge during your workday',
    'duration': '5 min',
    'color': '#E8F5D4',
    'users': '27'
  },
];

class FeedScreen extends StatefulWidget {
  const FeedScreen({super.key});

  @override
  State<FeedScreen> createState() => _FeedScreenState();
}

class _FeedScreenState extends State<FeedScreen> {
  int _practicesCompleted = 0;

  @override
  void initState() {
    super.initState();
    _loadStats();
    // Track screen view
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authProvider = context.read<AuthProvider>();
      final analyticsProvider = context.read<AnalyticsProvider>();
      analyticsProvider.trackScreenView(
        'Feed',
        userId: authProvider.user?.id,
      );
    });
  }

  Future<void> _loadStats() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _practicesCompleted = prefs.getInt('practices_completed') ?? 0;
    });
  }

  void _handleProfileTap() {
    final authProvider = context.read<AuthProvider>();
    final analyticsProvider = context.read<AnalyticsProvider>();
    analyticsProvider.trackAction(
      actionName: 'profile_button_tapped',
      userId: authProvider.user?.id,
      screenName: 'Feed',
    );
    context.go('/profile');
  }

  void _startPractice(String practiceName) {
    final authProvider = context.read<AuthProvider>();
    final analyticsProvider = context.read<AnalyticsProvider>();
    analyticsProvider.trackAction(
      actionName: 'practice_started',
      userId: authProvider.user?.id,
      screenName: 'Feed',
      properties: {'practice': practiceName},
    );
    context.go('/practice');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFCF8F2),
      appBar: AppBar(
        title: const Text(
          'Practices',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Color(0xFF1e2d2e),
          ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(
              Icons.account_circle,
              color: Color(0xFF1e2d2e),
              size: 28,
            ),
            onPressed: _handleProfileTap,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Stats Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 10,
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Your Progress',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF1e2d2e),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    '$_practicesCompleted practices completed',
                    style: const TextStyle(
                      fontSize: 14,
                      color: Color(0xFF1e2d2e),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Available Practices',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1e2d2e),
              ),
            ),
            const SizedBox(height: 12),
            // Practices Grid
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.85,
              ),
              itemCount: PRACTICES.length,
              itemBuilder: (context, index) {
                final practice = PRACTICES[index];
                final colorHex = practice['color']!.replaceFirst('#', '');
                final color = Color(int.parse('FF$colorHex', radix: 16));

                return GestureDetector(
                  onTap: () => _startPractice(practice['name']!),
                  child: Container(
                    decoration: BoxDecoration(
                      color: color,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.05),
                          blurRadius: 8,
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              practice['name']!,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF1e2d2e),
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              practice['description']!,
                              style: const TextStyle(
                                fontSize: 12,
                                color: Color(0xFF1e2d2e),
                                height: 1.4,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // User count badge
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.6),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    Icons.people,
                                    size: 12,
                                    color: const Color(0xFF1e2d2e).withValues(alpha: 0.7),
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    '${practice['users']} meditating',
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: const Color(0xFF1e2d2e).withValues(alpha: 0.7),
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  practice['duration']!,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: Color(0xFF1e2d2e),
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                Icon(
                                  Icons.arrow_forward,
                                  size: 16,
                                  color: const Color(0xFF1e2d2e).withValues(alpha: 0.6),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}


