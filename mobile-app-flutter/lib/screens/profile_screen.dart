import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../providers/user_profile_provider.dart';
import '../providers/auth_provider.dart';
import '../providers/analytics_provider.dart';
import '../utils/vibe_system.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  int _totalMinutesThisWeek = 0;
  int _daysActivePracticesThisWeek = 0;
  int _practiceStreak = 0;
  int _practicesCompleted = 0;
  VibeAnimal _currentVibe = VibeSystem.vibes[0];
  
  @override
  void initState() {
    super.initState();
    _loadStats();
    // Load profile and track screen view
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authProvider = context.read<AuthProvider>();
      final profileProvider = context.read<UserProfileProvider>();
      final analyticsProvider = context.read<AnalyticsProvider>();
      
      final userId = authProvider.user?.id;
      if (userId != null) {
        profileProvider.loadProfile(userId);
        analyticsProvider.trackScreenView(
          'Profile',
          userId: userId,
        );
      }
    });
  }

  Future<void> _loadStats() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _practicesCompleted = prefs.getInt('practices_completed') ?? 0;
      _practiceStreak = prefs.getInt('practice_streak') ?? 0;
      _totalMinutesThisWeek = prefs.getInt('minutes_this_week') ?? 45;
      _daysActivePracticesThisWeek = prefs.getInt('days_active_this_week') ?? 3;
      
      _currentVibe = VibeSystem.getCurrentVibe(
        totalMinutesThisWeek: _totalMinutesThisWeek,
        daysActivePracticesThisWeek: _daysActivePracticesThisWeek,
        currentStreak: _practiceStreak,
      );
    });
  }

  Widget _buildStatColumn(String label, String value, String emoji) {
    return Column(
      children: [
        Text(
          emoji,
          style: const TextStyle(fontSize: 20),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Color(0xFF1e2d2e),
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            color: Colors.grey.shade600,
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final profileProvider = context.watch<UserProfileProvider>();
    final user = authProvider.user;
    final profile = profileProvider.profile;

    return Scaffold(
      backgroundColor: const Color(0xFFFCF8F2),
      appBar: AppBar(
        title: const Text('Profile'),
        backgroundColor: Colors.transparent,
      ),
      body: profileProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Profile Header
                if (profile != null || user != null) ...[
                  Center(
                    child: Column(
                      children: [
                        CircleAvatar(
                          radius: 50,
                          backgroundColor: const Color(0xFF172223),
                          backgroundImage: profile?['avatar_url'] != null
                              ? NetworkImage(profile!['avatar_url'] as String)
                              : null,
                          child: profile?['avatar_url'] == null
                              ? Text(
                                  (profile?['display_name'] as String? ?? 
                                   profile?['username'] as String? ?? 
                                   user?.email?.substring(0, 1).toUpperCase() ?? 
                                   'U'),
                                  style: const TextStyle(
                                    fontSize: 32,
                                    color: Colors.white,
                                  ),
                                )
                              : null,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          profile?['display_name'] as String? ?? 
                          profile?['username'] as String? ?? 
                          user?.email ?? 
                          'User',
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF172223),
                          ),
                        ),
                        if (profile?['username'] != null)
                          Text(
                            '@${profile!['username']}',
                            style: const TextStyle(
                              fontSize: 16,
                              color: Colors.grey,
                            ),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  
                  // Your Vibe Animal Section
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
                        Text(
                          'Your Vibe This Week',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey.shade600,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            Text(
                              _currentVibe.emoji,
                              style: const TextStyle(fontSize: 56),
                            ),
                            const SizedBox(width: 20),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _currentVibe.name,
                                    style: const TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF1e2d2e),
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    _currentVibe.microcopy,
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: Colors.grey.shade600,
                                      fontStyle: FontStyle.italic,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    _currentVibe.benefit,
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey.shade700,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        // Stats row
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _buildStatColumn('Minutes', '$_totalMinutesThisWeek', '⏱️'),
                            _buildStatColumn('Days', '$_daysActivePracticesThisWeek/7', '📅'),
                            _buildStatColumn('Streak', '$_practiceStreak', '🔥'),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  // All Vibes Progress
                  Text(
                    'Vibe Journey',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ...VibeSystem.getAllVibes().map((vibe) {
                    final isUnlocked = vibe.level <= _currentVibe.level;
                    final isCurrent = vibe.level == _currentVibe.level;
                    
                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: isCurrent 
                            ? const Color(0xFFF5F0E8)
                            : isUnlocked 
                                ? Colors.white
                                : Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(12),
                        border: isCurrent 
                            ? Border.all(color: const Color(0xFF1e2d2e), width: 2)
                            : null,
                        boxShadow: isUnlocked ? [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.05),
                            blurRadius: 8,
                          ),
                        ] : null,
                      ),
                      child: Row(
                        children: [
                          Text(
                            vibe.emoji,
                            style: TextStyle(
                              fontSize: 32,
                              color: isUnlocked 
                                  ? null 
                                  : Colors.grey.shade400,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Text(
                                      vibe.name,
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: isCurrent 
                                            ? FontWeight.bold 
                                            : FontWeight.w600,
                                        color: isUnlocked 
                                            ? const Color(0xFF1e2d2e)
                                            : Colors.grey.shade500,
                                      ),
                                    ),
                                    if (isCurrent) ...[
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 8,
                                          vertical: 2,
                                        ),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF1e2d2e),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: const Text(
                                          'Current',
                                          style: TextStyle(
                                            fontSize: 10,
                                            color: Colors.white,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  isUnlocked ? vibe.microcopy : '??? Locked',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: isUnlocked 
                                        ? Colors.grey.shade600
                                        : Colors.grey.shade400,
                                    fontStyle: FontStyle.italic,
                                  ),
                                ),
                                if (isUnlocked) ...[
                                  const SizedBox(height: 4),
                                  Text(
                                    '${vibe.minMinutes}-${vibe.maxMinutes} min • ${vibe.minDays}-${vibe.maxDays} days',
                                    style: TextStyle(
                                      fontSize: 10,
                                      color: Colors.grey.shade500,
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                          if (isUnlocked)
                            Icon(
                              isCurrent ? Icons.stars : Icons.check_circle,
                              color: isCurrent 
                                  ? Colors.amber
                                  : Colors.green,
                              size: 24,
                            )
                          else
                            Icon(
                              Icons.lock,
                              color: Colors.grey.shade400,
                              size: 20,
                            ),
                        ],
                      ),
                    );
                  }).toList(),
                  const SizedBox(height: 32),
                  
                  if (profile?['bio'] != null) ...[
                    Text(
                      'Bio',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      profile!['bio'] as String,
                      style: const TextStyle(fontSize: 16),
                    ),
                    const SizedBox(height: 24),
                  ],
                ],
                // Menu Items
                ListTile(
                  title: const Text('Account Settings'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    context.read<AnalyticsProvider>().trackAction(
                      actionName: 'account_settings_tapped',
                      userId: user?.id,
                      screenName: 'Profile',
                    );
                    context.push('/account');
                  },
                ),
                const Divider(),
                ListTile(
                  title: const Text('Practice History'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    context.read<AnalyticsProvider>().trackAction(
                      actionName: 'practice_history_tapped',
                      userId: user?.id,
                      screenName: 'Profile',
                    );
                    // Navigate to practice history
                  },
                ),
              ],
            ),
    );
  }
}


