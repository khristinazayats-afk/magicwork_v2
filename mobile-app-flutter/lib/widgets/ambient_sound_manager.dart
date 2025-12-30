import 'package:flutter/material.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../constants/mood_constants.dart';

class AmbientSoundManager extends StatefulWidget {
  final Widget child;

  const AmbientSoundManager({
    super.key,
    required this.child,
  });

  @override
  State<AmbientSoundManager> createState() => _AmbientSoundManagerState();
}

class _AmbientSoundManagerState extends State<AmbientSoundManager> {
  final AudioPlayer _audioPlayer = AudioPlayer();
  bool _isInitialized = false;
  String? _userMood;
  String? _currentSoundUrl;

  @override
  void initState() {
    super.initState();
    _loadUserMood();
  }

  /// Load user's mood from SharedPreferences and Supabase
  Future<void> _loadUserMood() async {
    try {
      final userId = Supabase.instance.client.auth.currentUser?.id;
      if (userId == null) {
        _setupAmbientPlayer();
        return;
      }

      // Try SharedPreferences first (faster)
      final prefs = await SharedPreferences.getInstance();
      String? mood = prefs.getString('user_mood_$userId');

      // If not in SharedPreferences, try Supabase
      if (mood == null) {
        final response = await Supabase.instance.client
            .from('user_profiles')
            .select('current_mood')
            .eq('user_id', userId)
            .maybeSingle();

        if (response != null && response['current_mood'] != null) {
          mood = response['current_mood'] as String;
          // Cache in SharedPreferences for faster future loads
          await prefs.setString('user_mood_$userId', mood);
        }
      }

      if (mounted) {
        setState(() {
          _userMood = mood;
        });
        print('[AmbientSoundManager] Loaded user mood: $mood');
        _setupAmbientPlayer();
      }
    } catch (e) {
      print('[AmbientSoundManager] Error loading mood: $e');
      _setupAmbientPlayer();
    }
  }

  Future<void> _setupAmbientPlayer() async {
    try {
      await _audioPlayer.setReleaseMode(ReleaseMode.loop);
      await _audioPlayer.setVolume(0.15); // Very subtle background volume
      _isInitialized = true;
      
      // Delay slightly to ensure network stack is fully ready on iOS
      Future.delayed(const Duration(seconds: 1), () {
        if (mounted) _startAmbientSound();
      });
    } catch (e) {
      print('[AmbientSoundManager] Error setting up player: $e');
    }
  }

  /// Select ambient sound based on user's mood or use default rotation
  String _selectAmbientSound() {
    // Prioritize mood-based sound if available
    if (_userMood != null) {
      final soundUrl = MoodConstants.getAmbientSoundForMood(_userMood!);
      if (soundUrl != null) {
        print('[AmbientSoundManager] Using mood-based sound for mood "$_userMood": $soundUrl');
        return soundUrl;
      }
    }

    // Fallback to random sound from available options
    final defaultSounds = MoodConstants.ambientSoundUrls.values.toList();
    final randomSound = (defaultSounds..shuffle()).first;
    print('[AmbientSoundManager] Using default random sound: $randomSound');
    return randomSound;
  }

  void _startAmbientSound() async {
    if (!_isInitialized) return;
    
    // Select sound based on mood or use random
    final soundUrl = _selectAmbientSound();
    
    // Don't restart if already playing the same sound
    if (_currentSoundUrl == soundUrl && _audioPlayer.state == PlayerState.playing) {
      return;
    }
    
    try {
      await _audioPlayer.setSource(UrlSource(soundUrl));
      await _audioPlayer.resume();
      setState(() {
        _currentSoundUrl = soundUrl;
      });
    } catch (e) {
      print('[AmbientSoundManager] Error playing sound ($soundUrl): $e');
      // Retry after delay
      Future.delayed(const Duration(seconds: 5), () {
        if (mounted) _startAmbientSound();
      });
    }
  }

  /// Update mood and switch ambient sound
  Future<void> updateMood(String newMood) async {
    try {
      final userId = Supabase.instance.client.auth.currentUser?.id;
      if (userId != null) {
        // Save to SharedPreferences
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_mood_$userId', newMood);
        
        // Save to Supabase (async, don't wait)
        Supabase.instance.client
            .from('user_profiles')
            .update({
              'current_mood': newMood,
              'mood_updated_at': DateTime.now().toIso8601String(),
            })
            .eq('user_id', userId)
            .then((_) => print('[AmbientSoundManager] Mood saved to Supabase'))
            .catchError((e) => print('[AmbientSoundManager] Error saving mood: $e'));
      }

      setState(() {
        _userMood = newMood;
      });

      print('[AmbientSoundManager] Mood updated to: $newMood');
      
      // Stop current sound and restart with new mood-based sound
      await _audioPlayer.stop();
      _currentSoundUrl = null;
      _startAmbientSound();
    } catch (e) {
      print('[AmbientSoundManager] Error updating mood: $e');
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    
    // Logic to stop ambient noise when in a practice session
    // We wrap this in a try-catch because GoRouterState might not be available 
    // immediately at the root level during certain lifecycle transitions
    try {
      final String currentPath = GoRouterState.of(context).uri.path;
      
      // Stop if we are in the practice screen or emotional check-in (focused parts)
      if (currentPath.startsWith('/practice') || currentPath == '/checkin' || currentPath == '/splash') {
        if (_audioPlayer.state == PlayerState.playing) {
          _audioPlayer.pause();
        }
      } else {
        if (_audioPlayer.state != PlayerState.playing && _isInitialized) {
          _audioPlayer.resume();
        }
      }
    } catch (e) {
      // If GoRouterState is not found, we just keep the current state
      // This prevents the "no GoRouterState above current context" error
    }
  }

  @override
  void dispose() {
    _audioPlayer.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}



