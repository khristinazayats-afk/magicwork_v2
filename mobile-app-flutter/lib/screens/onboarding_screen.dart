import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/mood_constants.dart';

/// Onboarding screen for capturing user's mood and intentions
/// Matches the web app's OnboardingModal functionality
class OnboardingScreen extends StatefulWidget {
  final VoidCallback? onComplete;

  const OnboardingScreen({
    super.key,
    this.onComplete,
  });

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  int _currentStep = 0;
  String? _selectedMood;
  List<String> _selectedIntentions = [];
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black.withValues(alpha: 0.5),
      body: Center(
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(32),
          ),
          child: _isLoading
              ? const Padding(
                  padding: EdgeInsets.all(48.0),
                  child: CircularProgressIndicator(),
                )
              : _currentStep == 0
                  ? _buildMoodStep()
                  : _buildIntentionStep(),
        ),
      ),
    );
  }

  Widget _buildMoodStep() {
    return Padding(
      padding: const EdgeInsets.all(32.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'How are you feeling today?',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1e2d2e),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'This helps us personalize your meditation experience',
            style: TextStyle(
              fontSize: 16,
              color: const Color(0xFF1e2d2e).withValues(alpha: 0.6),
            ),
          ),
          const SizedBox(height: 32),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 1.2,
            ),
            itemCount: MoodConstants.moods.length,
            itemBuilder: (context, index) {
              final mood = MoodConstants.moods[index];
              final moodId = mood['id'] as String;
              final isSelected = _selectedMood == moodId;

              return GestureDetector(
                onTap: () => _selectMood(moodId),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? const Color(0xFF1e2d2e).withValues(alpha: 0.05)
                        : Colors.transparent,
                    border: Border.all(
                      color: isSelected
                          ? const Color(0xFF1e2d2e)
                          : const Color(0xFF1e2d2e).withValues(alpha: 0.1),
                      width: 2,
                    ),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        mood['emoji'] as String,
                        style: const TextStyle(fontSize: 36),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        mood['label'] as String,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1e2d2e),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildIntentionStep() {
    return Padding(
      padding: const EdgeInsets.all(32.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'What brings you here?',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1e2d2e),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Select one or more intentions (optional)',
            style: TextStyle(
              fontSize: 16,
              color: const Color(0xFF1e2d2e).withValues(alpha: 0.6),
            ),
          ),
          const SizedBox(height: 32),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: MoodConstants.intentions.map((intention) {
              final intentionId = intention['id'] as String;
              final isSelected = _selectedIntentions.contains(intentionId);

              return GestureDetector(
                onTap: () => _toggleIntention(intentionId),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? const Color(0xFF1e2d2e)
                        : Colors.transparent,
                    border: Border.all(
                      color: const Color(0xFF1e2d2e).withValues(alpha: 0.3),
                      width: 2,
                    ),
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        intention['icon'] as String,
                        style: const TextStyle(fontSize: 16),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        intention['label'] as String,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: isSelected
                              ? Colors.white
                              : const Color(0xFF1e2d2e),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _selectedIntentions.isEmpty ? null : _completeOnboarding,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1e2d2e),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                disabledBackgroundColor: const Color(0xFF1e2d2e).withValues(alpha: 0.3),
              ),
              child: const Text(
                'Complete',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Center(
            child: TextButton(
              onPressed: _completeOnboarding,
              child: Text(
                'Skip for now',
                style: TextStyle(
                  fontSize: 14,
                  color: const Color(0xFF1e2d2e).withValues(alpha: 0.6),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _selectMood(String moodId) {
    setState(() {
      _selectedMood = moodId;
    });

    // Auto-advance to next step after short delay
    Future.delayed(const Duration(milliseconds: 400), () {
      if (mounted) {
        setState(() {
          _currentStep = 1;
        });
      }
    });
  }

  void _toggleIntention(String intentionId) {
    setState(() {
      if (_selectedIntentions.contains(intentionId)) {
        _selectedIntentions.remove(intentionId);
      } else {
        _selectedIntentions.add(intentionId);
      }
    });
  }

  Future<void> _completeOnboarding() async {
    if (_selectedMood == null) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final userId = Supabase.instance.client.auth.currentUser?.id;
      if (userId != null) {
        // Save to SharedPreferences
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_mood_$userId', _selectedMood!);
        await prefs.setStringList('user_intentions_$userId', _selectedIntentions);
        await prefs.setBool('onboarded_$userId', true);

        // Save to Supabase
        await Supabase.instance.client.from('user_profiles').upsert({
          'user_id': userId,
          'current_mood': _selectedMood,
          'onboarding_completed': true,
          'onboarding_data': {
            'mood': _selectedMood,
            'intentions': _selectedIntentions,
            'timestamp': DateTime.now().toIso8601String(),
          },
          'updated_at': DateTime.now().toIso8601String(),
        });

        print('[OnboardingScreen] Onboarding complete: mood=$_selectedMood, intentions=$_selectedIntentions');
        
        // Note: Ambient sound will automatically update on next app launch
        // when AmbientSoundManager loads the mood from SharedPreferences
      }

      if (mounted) {
        widget.onComplete?.call();
        Navigator.of(context).pop();
      }
    } catch (e) {
      print('[OnboardingScreen] Error completing onboarding: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error saving preferences: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }
}
