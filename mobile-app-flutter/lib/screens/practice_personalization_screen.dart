import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../services/ai_practice_generator.dart';

class PracticePersonalizationScreen extends StatefulWidget {
  const PracticePersonalizationScreen({super.key});

  @override
  State<PracticePersonalizationScreen> createState() =>
      _PracticePersonalizationScreenState();
}

class _PracticePersonalizationScreenState
    extends State<PracticePersonalizationScreen> {
  final AIPracticeGenerator _aiGenerator = AIPracticeGenerator();
  int _selectedDuration = 10; // Default 10 minutes
  bool _isGenerating = false;
  String? _errorMessage;
  String _selectedLanguage = 'en'; // Default: English
  String _selectedVoice = 'nova'; // Warm, clear voice
  String _selectedPace = 'slow'; // slow, moderate, fast
  bool _includeAmbientSound = true;

  final Map<String, String> _languageOptions = {
    'en': '🇺🇸 English',
    'es': '🇪🇸 Español',
    'fr': '🇫🇷 Français',
    'de': '🇩🇪 Deutsch',
    'pt': '🇵🇹 Português',
    'it': '🇮🇹 Italiano',
    'ja': '🇯🇵 日本語',
    'zh': '🇨🇳 中文',
  };

  final Map<String, String> _voiceOptions = {
    'nova': 'Nova (Warm & Clear)',
    'echo': 'Echo (Deep & Calm)',
    'sage': 'Sage (Soft & Gentle)',
    'shimmer': 'Shimmer (Bright & Uplifting)',
  };

  final List<String> _paceOptions = ['Slow', 'Moderate', 'Fast'];

  // Get emotional state and intent from route extra
  String? get _emotionalState {
    final extra = GoRouterState.of(context).extra;
    if (extra is Map && extra.containsKey('emotionalState')) {
      return extra['emotionalState'] as String?;
    }
    return 'neutral'; // Default fallback
  }

  String? get _intent {
    final extra = GoRouterState.of(context).extra;
    if (extra is Map && extra.containsKey('intent')) {
      return extra['intent'] as String?;
    }
    return null;
  }

  String _getIntentLabel(String? intent) {
    if (intent == null) return '';
    final intentMap = {
      'reduce_stress': 'reduce stress',
      'improve_focus': 'improve focus and concentration',
      'better_sleep': 'prepare for better sleep',
      'boost_energy': 'boost energy mindfully',
      'emotional_balance': 'find emotional balance',
      'self_compassion': 'cultivate self-compassion',
      'manage_pain': 'manage physical discomfort',
      'gratitude': 'cultivate gratitude',
    };
    return intentMap[intent] ?? intent.replaceAll('_', ' ');
  }

  final List<int> _durationOptions = [5, 10, 15, 20, 30];

  Future<void> _generateAndStartPractice() async {
    if (_isGenerating) return;

    setState(() {
      _isGenerating = true;
      _errorMessage = null;
    });

    try {
      // Generate practice content using AI with all customizations
      final practiceContent = await _aiGenerator.generatePracticeContent(
        emotionalState: _emotionalState ?? 'neutral',
        durationMinutes: _selectedDuration,
        intent: _intent,
        language: _selectedLanguage,
        voice: _selectedVoice,
        pace: _selectedPace,
      );

      if (practiceContent == null || practiceContent.isEmpty) {
        setState(() {
          _errorMessage = 'Failed to generate practice content. Please try again.';
          _isGenerating = false;
        });
        return;
      }

      // Navigate to practice screen with generated content and customizations
      if (mounted) {
        context.push(
          '/practice',
          extra: {
            'practiceContent': practiceContent,
            'emotionalState': _emotionalState,
            'intent': _intent,
            'durationMinutes': _selectedDuration,
            'language': _selectedLanguage,
            'voice': _selectedVoice,
            'pace': _selectedPace,
            'ambientSound': _includeAmbientSound,
          },
        );
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error generating practice: ${e.toString()}';
        _isGenerating = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFCF8F2),
      appBar: AppBar(
        title: const Text(
          'Personalize Your Practice',
          style: TextStyle(
            fontFamily: 'HankenGrotesk',
            fontWeight: FontWeight.w600,
          ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
              const Text(
                'Choose your practice duration',
                style: TextStyle(
                  fontSize: 18,
                  fontFamily: 'HankenGrotesk',
                  color: Color(0xFF1e2d2e),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              // Duration selector
              Wrap(
                spacing: 12,
                runSpacing: 12,
                alignment: WrapAlignment.center,
                children: _durationOptions.map((duration) {
                  final isSelected = _selectedDuration == duration;
                  return InkWell(
                    onTap: () {
                      setState(() {
                        _selectedDuration = duration;
                      });
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 16,
                      ),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? const Color(0xFF1e2d2e)
                            : Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected
                              ? const Color(0xFF1e2d2e)
                              : Colors.grey.shade300,
                          width: 2,
                        ),
                      ),
                      child: Text(
                        '$duration min',
                        style: TextStyle(
                          fontSize: 16,
                          fontFamily: 'HankenGrotesk',
                          fontWeight: FontWeight.w600,
                          color: isSelected
                              ? Colors.white
                              : const Color(0xFF1e2d2e),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 32),
              // Language selector
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Language 🌍',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF1e2d2e),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _languageOptions.entries.map((entry) {
                        final isSelected = _selectedLanguage == entry.key;
                        return InkWell(
                          onTap: () {
                            setState(() {
                              _selectedLanguage = entry.key;
                            });
                          },
                          borderRadius: BorderRadius.circular(8),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: isSelected ? const Color(0xFF1e2d2e) : Colors.grey.shade100,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: isSelected ? const Color(0xFF1e2d2e) : Colors.transparent,
                              ),
                            ),
                            child: Text(
                              entry.value,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                                color: isSelected ? Colors.white : const Color(0xFF1e2d2e),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              // Voice selector
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Voice 🎤',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF1e2d2e),
                      ),
                    ),
                    const SizedBox(height: 12),
                    ..._voiceOptions.entries.map((entry) {
                      final isSelected = _selectedVoice == entry.key;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: InkWell(
                          onTap: () {
                            setState(() {
                              _selectedVoice = entry.key;
                            });
                          },
                          borderRadius: BorderRadius.circular(8),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            decoration: BoxDecoration(
                              color: isSelected ? const Color(0xFF1e2d2e) : Colors.grey.shade50,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: isSelected ? const Color(0xFF1e2d2e) : Colors.grey.shade200,
                              ),
                            ),
                            child: Row(
                              children: [
                                Radio<String>(
                                  value: entry.key,
                                  groupValue: _selectedVoice,
                                  onChanged: (value) {
                                    if (value != null) {
                                      setState(() {
                                        _selectedVoice = value;
                                      });
                                    }
                                  },
                                  fillColor: WidgetStateProperty.all(
                                    isSelected ? Colors.white : const Color(0xFF1e2d2e),
                                  ),
                                ),
                                Expanded(
                                  child: Text(
                                    entry.value,
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w500,
                                      color: isSelected ? Colors.white : const Color(0xFF1e2d2e),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              // Pace selector
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Narration Pace ⏱️',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF1e2d2e),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _paceOptions.asMap().entries.map((entry) {
                        final pace = ['slow', 'moderate', 'fast'][entry.key];
                        final isSelected = _selectedPace == pace;
                        return InkWell(
                          onTap: () {
                            setState(() {
                              _selectedPace = pace;
                            });
                          },
                          borderRadius: BorderRadius.circular(8),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: isSelected ? const Color(0xFF1e2d2e) : Colors.grey.shade100,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: isSelected ? const Color(0xFF1e2d2e) : Colors.transparent,
                              ),
                            ),
                            child: Text(
                              entry.value,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                                color: isSelected ? Colors.white : const Color(0xFF1e2d2e),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              // Ambient sound toggle
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Add Ambient Sound 🎵',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF1e2d2e),
                      ),
                    ),
                    Switch(
                      value: _includeAmbientSound,
                      onChanged: (value) {
                        setState(() {
                          _includeAmbientSound = value;
                        });
                      },
                      trackColor: WidgetStateProperty.resolveWith<Color?>(
                        (Set<WidgetState> states) {
                          if (states.contains(WidgetState.selected)) {
                            return const Color(0xFF1e2d2e);
                          }
                          return null;
                        },
                      ),
                      thumbColor: WidgetStateProperty.all<Color>(Colors.white),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              // Info card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.lightbulb_outline,
                          color: Colors.amber.shade700,
                          size: 24,
                        ),
                        const SizedBox(width: 12),
                        const Text(
                          'AI-Powered Practice',
                          style: TextStyle(
                            fontSize: 16,
                            fontFamily: 'HankenGrotesk',
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF1e2d2e),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      _intent != null
                          ? 'Your practice will be personalized based on how you\'re feeling and your intention to ${_getIntentLabel(_intent)}. Our AI will create a guided meditation script tailored specifically for you.'
                          : 'Your practice will be personalized based on how you\'re feeling right now. Our AI will create a guided meditation script tailored to help you find calm and presence.',
                      style: TextStyle(
                        fontSize: 14,
                        fontFamily: 'HankenGrotesk',
                        color: Colors.grey.shade700,
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
              const Spacer(),
              // Error message
              if (_errorMessage != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.red.shade200),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.error_outline, color: Colors.red.shade700),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            _errorMessage!,
                            style: TextStyle(
                              fontSize: 14,
                              fontFamily: 'HankenGrotesk',
                              color: Colors.red.shade700,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              // Generate button
              ElevatedButton(
                onPressed: _isGenerating ? null : _generateAndStartPractice,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1e2d2e),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
                child: _isGenerating
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : const Text(
                        'Generate & Start Practice',
                        style: TextStyle(
                          fontSize: 16,
                          fontFamily: 'HankenGrotesk',
                          fontWeight: FontWeight.w600,
                        ),
                      ),
              ),
            ],
            ),
          ),
        ),
      ),
    );
  }
}
