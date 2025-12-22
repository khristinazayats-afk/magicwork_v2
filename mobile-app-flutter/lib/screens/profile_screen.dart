import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/user_profile_provider.dart';
import '../providers/auth_provider.dart';
import '../providers/analytics_provider.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  @override
  void initState() {
    super.initState();
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


