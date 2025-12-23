import 'package:flutter/material.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:go_router/go_router.dart';

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

  // High-quality meditation music tracks (randomized)
  final List<String> _ambientSounds = [
    'https://cdn.pixabay.com/audio/2022/05/27/audio_1808f30302.mp3', // Deep Meditation Ambient
    'https://cdn.pixabay.com/audio/2023/05/30/audio_3fe4a09837.mp3', // Relaxing Meditation
    'https://cdn.pixabay.com/audio/2023/06/11/audio_527cc9d8bd.mp3', // Spiritual Healing Zen
    'https://cdn.pixabay.com/audio/2022/08/02/audio_884b904727.mp3', // Tibeten Bowls Meditation
  ];

  @override
  void initState() {
    super.initState();
    _setupAmbientPlayer();
  }

  Future<void> _setupAmbientPlayer() async {
    await _audioPlayer.setReleaseMode(ReleaseMode.loop);
    await _audioPlayer.setVolume(0.15); // Very subtle background volume
    _isInitialized = true;
    _startAmbientSound();
  }

  void _startAmbientSound() {
    if (!_isInitialized) return;
    
    // Pick a random sound
    final randomSound = (_ambientSounds..shuffle()).first;
    _audioPlayer.play(UrlSource(randomSound));
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    
    // Logic to stop ambient noise when in a practice session
    final String currentPath = GoRouterState.of(context).uri.path;
    
    // Stop if we are in the practice screen or emotional check-in (focused parts)
    // selection screens (feed, intent, personalize) should have the noise
    if (currentPath.startsWith('/practice') || currentPath == '/checkin') {
      _audioPlayer.pause();
    } else {
      if (_audioPlayer.state != PlayerState.playing) {
        _audioPlayer.resume();
      }
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



