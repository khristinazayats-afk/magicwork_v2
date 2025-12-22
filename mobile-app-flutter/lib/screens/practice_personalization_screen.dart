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
      // Generate practice content using AI
      final practiceContent = await _aiGenerator.generatePracticeContent(
        emotionalState: _emotionalState ?? 'neutral',
        durationMinutes: _selectedDuration,
        intent: _intent,
      );

      if (practiceContent == null || practiceContent.isEmpty) {
        setState(() {
          _errorMessage = 'Failed to generate practice content. Please try again.';
          _isGenerating = false;
        });
        return;
      }

      // Navigate to practice screen with generated content
      if (mounted) {
        context.push(
          '/practice',
          extra: {
            'practiceContent': practiceContent,
            'emotionalState': _emotionalState,
            'intent': _intent,
            'durationMinutes': _selectedDuration,
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
    );
  }
}
