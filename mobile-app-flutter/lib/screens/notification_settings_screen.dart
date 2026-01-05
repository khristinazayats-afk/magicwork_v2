import 'package:flutter/material.dart';
import '../services/fcm_service.dart';

class NotificationSettingsScreen extends StatefulWidget {
  const NotificationSettingsScreen({Key? key}) : super(key: key);

  @override
  State<NotificationSettingsScreen> createState() =>
      _NotificationSettingsScreenState();
}

class _NotificationSettingsScreenState
    extends State<NotificationSettingsScreen> {
  final PushNotificationService _fcmService = PushNotificationService();
  bool _meditationReminders = true;
  bool _appUpdates = false;
  bool _communityActivity = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notification Settings'),
        centerTitle: true,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const SizedBox(height: 16),
          const Text(
            'Manage Notifications',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 24),
          _buildNotificationOption(
            title: 'Meditation Reminders',
            subtitle: 'Daily practice reminders at your preferred time',
            value: _meditationReminders,
            onChanged: (value) async {
              setState(() => _meditationReminders = value);
              if (value) {
                await _fcmService
                    .subscribeToTopic('meditation_reminders');
              } else {
                await _fcmService
                    .unsubscribeFromTopic('meditation_reminders');
              }
            },
          ),
          const SizedBox(height: 16),
          _buildNotificationOption(
            title: 'App Updates',
            subtitle: 'Important updates and new features',
            value: _appUpdates,
            onChanged: (value) async {
              setState(() => _appUpdates = value);
              if (value) {
                await _fcmService.subscribeToTopic('app_updates');
              } else {
                await _fcmService.unsubscribeFromTopic('app_updates');
              }
            },
          ),
          const SizedBox(height: 16),
          _buildNotificationOption(
            title: 'Community Activity',
            subtitle: 'Notifications from your meditation community',
            value: _communityActivity,
            onChanged: (value) async {
              setState(() => _communityActivity = value);
              if (value) {
                await _fcmService.subscribeToTopic('community_activity');
              } else {
                await _fcmService
                    .unsubscribeFromTopic('community_activity');
              }
            },
          ),
          const SizedBox(height: 32),
          const Divider(),
          const SizedBox(height: 16),
          const Text(
            'Reminder Schedule',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          _buildTimePickerTile(
            title: 'Morning Reminder',
            time: '08:00 AM',
            onTap: () => _selectReminderTime(context, 'morning'),
          ),
          const SizedBox(height: 12),
          _buildTimePickerTile(
            title: 'Evening Reminder',
            time: '08:00 PM',
            onTap: () => _selectReminderTime(context, 'evening'),
          ),
          const SizedBox(height: 32),
          const Divider(),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Notification settings saved'),
                  duration: Duration(seconds: 2),
                ),
              );
            },
            child: const Text('Save Settings'),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationOption({
    required String title,
    required String subtitle,
    required bool value,
    required Function(bool) onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey.withOpacity(0.2)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Switch(
            value: value,
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }

  Widget _buildTimePickerTile({
    required String title,
    required String time,
    required VoidCallback onTap,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey.withOpacity(0.2)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          InkWell(
            onTap: onTap,
            child: Text(
              time,
              style: const TextStyle(
                fontSize: 16,
                color: Colors.blue,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _selectReminderTime(
    BuildContext context,
    String type,
  ) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
    );

    if (picked != null) {
      // Schedule reminder at selected time
      final scheduledTime = DateTime.now().copyWith(
        hour: picked.hour,
        minute: picked.minute,
        second: 0,
      );

      await _fcmService.scheduleMeditationReminder(
        title: 'Time for meditation',
        body: 'Start your daily practice',
        scheduledTime: scheduledTime,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              '${type.capitalize()} reminder set for ${picked.format(context)}',
            ),
            duration: const Duration(seconds: 2),
          ),
        );
      }
    }
  }
}

extension StringExtension on String {
  String capitalize() {
    return '${this[0].toUpperCase()}${substring(1)}';
  }
}
