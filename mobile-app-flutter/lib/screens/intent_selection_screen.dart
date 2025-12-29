import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class IntentSelectionScreen extends StatefulWidget {
  const IntentSelectionScreen({super.key});

  @override
  State<IntentSelectionScreen> createState() => _IntentSelectionScreenState();
}

class _IntentSelectionScreenState extends State<IntentSelectionScreen> {
  String? _selectedIntent;

  final List<Map<String, dynamic>> _intents = [
    {
      'value': 'reduce_stress',
      'label': 'Reduce Stress',
      'description': 'Find calm and release tension',
      'icon': Icons.wb_sunny_outlined,
      'color': Colors.blue,
    },
    {
      'value': 'improve_focus',
      'label': 'Improve Focus',
      'description': 'Enhance concentration and clarity',
      'icon': Icons.center_focus_strong,
      'color': Colors.purple,
    },
    {
      'value': 'better_sleep',
      'label': 'Better Sleep',
      'description': 'Relax and prepare for rest',
      'icon': Icons.bedtime_outlined,
      'color': Colors.indigo,
    },
    {
      'value': 'boost_energy',
      'label': 'Boost Energy',
      'description': 'Awaken and energize mindfully',
      'icon': Icons.bolt_outlined,
      'color': Colors.amber,
    },
    {
      'value': 'emotional_balance',
      'label': 'Emotional Balance',
      'description': 'Regulate and understand emotions',
      'icon': Icons.favorite_outline,
      'color': Colors.pink,
    },
    {
      'value': 'self_compassion',
      'label': 'Self-Compassion',
      'description': 'Cultivate kindness toward yourself',
      'icon': Icons.spa_outlined,
      'color': Colors.teal,
    },
    {
      'value': 'manage_pain',
      'label': 'Manage Discomfort',
      'description': 'Work with physical sensations',
      'icon': Icons.healing_outlined,
      'color': Colors.orange,
    },
    {
      'value': 'gratitude',
      'label': 'Cultivate Gratitude',
      'description': 'Appreciate and find thankfulness',
      'icon': Icons.celebration_outlined,
      'color': Colors.green,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFCF8F2),
      appBar: AppBar(
        title: const Text(
          'What\'s your intention?',
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
                'What would you like to focus on today?',
                style: TextStyle(
                  fontSize: 18,
                  fontFamily: 'HankenGrotesk',
                  color: Color(0xFF1e2d2e),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              Expanded(
                child: GridView.builder(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 1.1,
                  ),
                  itemCount: _intents.length,
                  itemBuilder: (context, index) {
                    final intent = _intents[index];
                    final isSelected = _selectedIntent == intent['value'];
                    
                    return InkWell(
                      onTap: () {
                        setState(() {
                          _selectedIntent = intent['value'] as String;
                        });
                      },
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? (intent['color'] as Color).withValues(alpha: 0.1)
                              : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isSelected
                                ? intent['color'] as Color
                                : Colors.grey.shade300,
                            width: isSelected ? 2 : 1,
                          ),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              intent['icon'] as IconData,
                              size: 32,
                              color: isSelected
                                  ? intent['color'] as Color
                                  : Colors.grey.shade600,
                            ),
                            const SizedBox(height: 12),
                            Text(
                              intent['label'] as String,
                              style: TextStyle(
                                fontSize: 14,
                                fontFamily: 'HankenGrotesk',
                                fontWeight: FontWeight.w600,
                                color: const Color(0xFF1e2d2e),
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              intent['description'] as String,
                              style: TextStyle(
                                fontSize: 11,
                                fontFamily: 'HankenGrotesk',
                                color: Colors.grey.shade600,
                              ),
                              textAlign: TextAlign.center,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _selectedIntent == null
                    ? null
                    : () {
                        // Get emotional state from previous screen
                        final extra = GoRouterState.of(context).extra;
                        final emotionalState = extra is Map 
                            ? extra['emotionalState'] as String?
                            : 'neutral';
                        
                        context.push(
                          '/practice/personalize',
                          extra: {
                            'emotionalState': emotionalState,
                            'intent': _selectedIntent,
                          },
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










