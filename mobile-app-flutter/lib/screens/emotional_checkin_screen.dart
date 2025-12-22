import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class EmotionalCheckInScreen extends StatefulWidget {
  const EmotionalCheckInScreen({super.key});

  @override
  State<EmotionalCheckInScreen> createState() => _EmotionalCheckInScreenState();
}

class _EmotionalCheckInScreenState extends State<EmotionalCheckInScreen> {
  String? _selectedEmotionalState;

  final List<Map<String, dynamic>> _emotionalStates = [
    {
      'value': 'calm',
      'label': 'Calm',
      'description': 'Feeling peaceful and centered',
      'color': Colors.blue,
    },
    {
      'value': 'neutral',
      'label': 'Neutral',
      'description': 'Feeling balanced and steady',
      'color': Colors.grey,
    },
    {
      'value': 'slightly_anxious',
      'label': 'Slightly Anxious',
      'description': 'Feeling a bit restless or worried',
      'color': Colors.orange,
    },
    {
      'value': 'anxious',
      'label': 'Anxious',
      'description': 'Feeling stressed or overwhelmed',
      'color': Colors.deepOrange,
    },
    {
      'value': 'very_anxious',
      'label': 'Very Anxious',
      'description': 'Feeling highly stressed or panicked',
      'color': Colors.red,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFCF8F2),
      appBar: AppBar(
        title: const Text(
          'How are you feeling?',
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
                'Take a moment to check in with yourself',
                style: TextStyle(
                  fontSize: 18,
                  fontFamily: 'HankenGrotesk',
                  color: Color(0xFF1e2d2e),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              Expanded(
                child: ListView.builder(
                  itemCount: _emotionalStates.length,
                  itemBuilder: (context, index) {
                    final state = _emotionalStates[index];
                    final isSelected = _selectedEmotionalState == state['value'];
                    
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: InkWell(
                        onTap: () {
                          setState(() {
                            _selectedEmotionalState = state['value'] as String;
                          });
                        },
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? (state['color'] as Color).withValues(alpha: 0.1)
                                : Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isSelected
                                  ? state['color'] as Color
                                  : Colors.grey.shade300,
                              width: isSelected ? 2 : 1,
                            ),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 24,
                                height: 24,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: isSelected
                                      ? state['color'] as Color
                                      : Colors.transparent,
                                  border: Border.all(
                                    color: isSelected
                                        ? state['color'] as Color
                                        : Colors.grey.shade400,
                                    width: 2,
                                  ),
                                ),
                                child: isSelected
                                    ? const Icon(
                                        Icons.check,
                                        size: 16,
                                        color: Colors.white,
                                      )
                                    : null,
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      state['label'] as String,
                                      style: TextStyle(
                                        fontSize: 18,
                                        fontFamily: 'HankenGrotesk',
                                        fontWeight: FontWeight.w600,
                                        color: const Color(0xFF1e2d2e),
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      state['description'] as String,
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontFamily: 'HankenGrotesk',
                                        color: Colors.grey.shade600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _selectedEmotionalState == null
                    ? null
                    : () {
                        context.push(
                          '/intent',
                          extra: {'emotionalState': _selectedEmotionalState},
                        );
                      },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1e2d2e),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  'Continue',
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
