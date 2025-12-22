import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:audioplayers/audioplayers.dart';
import '../providers/analytics_provider.dart';
import '../providers/auth_provider.dart';
import '../services/ai_voice_generator.dart';
import '../services/ai_music_generator.dart';

class PracticeScreen extends StatefulWidget {
  const PracticeScreen({super.key});

  @override
  State<PracticeScreen> createState() => _PracticeScreenState();
}

class _PracticeScreenState extends State<PracticeScreen> {
  final AIVoiceGenerator _voiceGenerator = AIVoiceGenerator();
  final AIMusicGenerator _musicGenerator = AIMusicGenerator();
  final AudioPlayer _voicePlayer = AudioPlayer();
  final AudioPlayer _musicPlayer = AudioPlayer();
  
  String? _practiceContent;
  String? _emotionalState;
  String? _intent;
  int _durationMinutes = 10;
  int _remainingSeconds = 0;
  bool _isLoadingAudio = false;
  bool _isLoadingMusic = false;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _setupAudio();
    _loadPracticeData();
    _startTimer();
    
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

  void _setupAudio() {
    // Set music volume lower than voice
    _musicPlayer.setVolume(0.3);
    _voicePlayer.setVolume(1.0);
    
    // Loop music
    _musicPlayer.setReleaseMode(ReleaseMode.loop);
  }

  void _loadPracticeData() {
    // Access route extra data
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final location = GoRouterState.of(context);
      final extra = location.extra;
      
      if (extra is Map && mounted) {
          setState(() {
            _practiceContent = extra['practiceContent'] as String?;
            _emotionalState = extra['emotionalState'] as String?;
            _intent = extra['intent'] as String?;
            _durationMinutes = extra['durationMinutes'] as int? ?? 10;
            _remainingSeconds = _durationMinutes * 60;
          });
        
        // Generate audio narration and music
        if (_practiceContent != null && _practiceContent!.isNotEmpty) {
          _generateAudioNarration();
          _generateBackgroundMusic();
        }
      }
    });
  }

  Future<void> _generateAudioNarration() async {
    if (_practiceContent == null || _practiceContent!.isEmpty) return;

    setState(() {
      _isLoadingAudio = true;
    });

    try {
      // Generate speech from practice content
      final audioData = await _voiceGenerator.generateMeditationNarration(
        script: _practiceContent!,
        voice: 'nova', // Warm, clear voice for meditation
        speed: 0.95, // Slightly slower for calm pacing
      );

      if (audioData != null && mounted) {
        // Play voice
        await _voicePlayer.play(BytesSource(audioData));
        setState(() {
          _isLoadingAudio = false;
        });
      } else {
        setState(() {
          _isLoadingAudio = false;
        });
      }
    } catch (e) {
      print('Error generating audio: $e');
      setState(() {
        _isLoadingAudio = false;
      });
    }
  }

  Future<void> _generateBackgroundMusic() async {
    setState(() {
      _isLoadingMusic = true;
    });

    try {
      final musicUrl = await _musicGenerator.generateAmbientMusic(
        prompt: _intent ?? 'peaceful meditation',
        emotionalState: _emotionalState ?? 'neutral',
        duration: _durationMinutes * 60,
      );

      if (musicUrl != null && mounted) {
        await _musicPlayer.play(UrlSource(musicUrl));
        setState(() {
          _isLoadingMusic = false;
        });
      } else {
        setState(() {
          _isLoadingMusic = false;
        });
      }
    } catch (e) {
      print('Error generating music: $e');
      setState(() {
        _isLoadingMusic = false;
      });
    }
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted && _remainingSeconds > 0) {
        setState(() {
          _remainingSeconds--;
        });
      } else {
        _completePractice();
      }
    });
  }

  Future<void> _completePractice() async {
    _timer?.cancel();
    _voicePlayer.stop();
    _musicPlayer.stop();
    
    final authProvider = context.read<AuthProvider>();
    final analyticsProvider = context.read<AnalyticsProvider>();
    final userId = authProvider.user?.id;

    if (userId != null) {
      await analyticsProvider.trackPracticeComplete(
        userId: userId,
        practiceType: 'meditation',
        durationMinutes: _durationMinutes,
        properties: {
          'completed_at': DateTime.now().toIso8601String(),
          'emotional_state': _emotionalState ?? 'unknown',
          'intent': _intent ?? 'none',
        },
      );
    }

    if (mounted) {
      context.go('/practice/complete');
    }
  }

  String _formatTime(int seconds) {
    final mins = seconds ~/ 60;
    final secs = seconds % 60;
    return '${mins.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
  }

  @override
  void dispose() {
    _timer?.cancel();
    _voicePlayer.dispose();
    _musicPlayer.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFCF8F2),
      body: SafeArea(
        child: Column(
          children: [
            // Header with timer
            Container(
              padding: const EdgeInsets.all(20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () {
                      _voicePlayer.stop();
                      _musicPlayer.stop();
                      context.go('/feed');
                    },
                  ),
                  Column(
                    children: [
                      Text(
                        _formatTime(_remainingSeconds),
                        style: const TextStyle(
                          fontSize: 32,
                          fontFamily: 'HankenGrotesk',
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1e2d2e),
                        ),
                      ),
                      Text(
                        'remaining',
                        style: TextStyle(
                          fontSize: 12,
                          fontFamily: 'HankenGrotesk',
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(width: 48), // Balance close button
                ],
              ),
            ),
            // Practice content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (_isLoadingAudio || _isLoadingMusic)
                      Center(
                        child: Padding(
                          padding: const EdgeInsets.all(32.0),
                          child: Column(
                            children: [
                              const CircularProgressIndicator(),
                              const SizedBox(height: 16),
                              Text(
                                _isLoadingAudio ? 'Generating audio narration...' : 'Generating background music...',
                                style: const TextStyle(
                                  fontFamily: 'HankenGrotesk',
                                  color: Color(0xFF1e2d2e),
                                ),
                              ),
                            ],
                          ),
                        ),
                      )
                    else if (_practiceContent != null)
                      Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.05),
                              blurRadius: 10,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Text(
                          _practiceContent!,
                          style: const TextStyle(
                            fontSize: 18,
                            fontFamily: 'HankenGrotesk',
                            height: 1.6,
                            color: Color(0xFF1e2d2e),
                          ),
                        ),
                      )
                    else
                      const Center(
                        child: Padding(
                          padding: EdgeInsets.all(32.0),
                          child: Text(
                            'Loading practice content...',
                            style: TextStyle(
                              fontFamily: 'HankenGrotesk',
                              color: Color(0xFF1e2d2e),
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
            // Bottom controls
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 10,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  ElevatedButton.icon(
                    onPressed: _completePractice,
                    icon: const Icon(Icons.check),
                    label: const Text('Complete Practice'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1e2d2e),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 16,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

