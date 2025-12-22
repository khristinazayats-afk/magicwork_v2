import 'package:dio/dio.dart';
import '../config/app_config.dart';

class AIPracticeGenerator {
  final Dio _dio = Dio();

  AIPracticeGenerator() {
    _dio.options.baseUrl = AppConfig.openaiBaseUrl;
    _dio.options.headers = {
      'Authorization': 'Bearer ${AppConfig.openaiApiKey}',
      'Content-Type': 'application/json',
    };
  }

  Future<String?> generatePracticeContent({
    required String emotionalState,
    required int durationMinutes,
    String? intent, // User's intent/goal for the practice
  }) async {
    try {
      // Determine pacing based on emotional state
      // Higher emotional states (more anxious) get slower, more guided pacing
      const emotionalScale = ['calm', 'neutral', 'slightly_anxious', 'anxious', 'very_anxious'];
      final emotionalIndex = emotionalScale.indexOf(emotionalState.toLowerCase());
      final isAnxious = emotionalIndex >= 2; // anxious or very anxious
      
      // Pacing: 120 words/min for guided (anxious), 60 words/min for calm
      final wordsPerMinute = isAnxious ? 120 : 60;
      final totalWords = (wordsPerMinute * durationMinutes).floor();

      // Build intent-specific guidance
      String intentGuidance = '';
      if (intent != null && intent.isNotEmpty) {
        final intentLower = intent.toLowerCase();
        if (intentLower.contains('stress') || intentLower.contains('anxiety')) {
          intentGuidance = 'Focus on stress relief and anxiety reduction. Include techniques for releasing tension and finding calm.';
        } else if (intentLower.contains('focus') || intentLower.contains('concentration')) {
          intentGuidance = 'Focus on improving concentration and mental clarity. Include techniques for sustaining attention and reducing distractions.';
        } else if (intentLower.contains('sleep') || intentLower.contains('rest')) {
          intentGuidance = 'Focus on relaxation and sleep preparation. Use slower pacing, body relaxation, and imagery that promotes rest.';
        } else if (intentLower.contains('energy') || intentLower.contains('wake')) {
          intentGuidance = 'Focus on energizing and awakening. Include techniques that promote alertness and vitality while maintaining mindfulness.';
        } else if (intentLower.contains('emotion') || intentLower.contains('feeling')) {
          intentGuidance = 'Focus on emotional regulation and awareness. Include techniques for observing and working with emotions compassionately.';
        } else if (intentLower.contains('pain') || intentLower.contains('discomfort')) {
          intentGuidance = 'Focus on working with physical sensations and discomfort. Include body scanning and gentle awareness techniques.';
        } else if (intentLower.contains('gratitude') || intentLower.contains('appreciation')) {
          intentGuidance = 'Focus on cultivating gratitude and appreciation. Include reflection on positive aspects and feelings of thankfulness.';
        } else if (intentLower.contains('self-compassion') || intentLower.contains('kindness')) {
          intentGuidance = 'Focus on self-compassion and self-kindness. Include loving-kindness practices and gentle self-acceptance.';
        } else {
          intentGuidance = 'Adapt the practice to support the user\'s intent: $intent.';
        }
      }

      // Create prompt for meditation practice generation
      final prompt = '''Create a $durationMinutes-minute guided meditation practice script for someone who is feeling $emotionalState${intent != null ? ' and wants to $intent' : ''}.

Guidelines:
- Target approximately $totalWords words total ($wordsPerMinute words per minute)
- Use ${isAnxious ? 'gentle, reassuring, and more detailed guidance' : 'minimal, space-giving language'}
- Focus on breathwork, body awareness, and present-moment attention
- Include specific instructions for physical sensations and breath awareness
- Adapt the language and pacing to help someone move from $emotionalState toward a calmer state
${intentGuidance.isNotEmpty ? '- $intentGuidance\n' : ''}- Include natural pauses and moments of silence in your instructions
- Structure: Opening (2 min), Main practice (${durationMinutes - 4} min), Closing (2 min)
- Make it feel supportive, non-judgmental, and accessible

Return only the meditation script content, without any additional formatting or explanation.''';

      // Call OpenAI Chat Completions API directly
      final response = await _dio.post(
        '/chat/completions',
        data: {
          'model': 'gpt-5.2', // Latest model (released Dec 11, 2025) - use 'gpt-4o-mini' for cost-effective option
          'messages': [
            {
              'role': 'system',
              'content': 'You are an expert meditation teacher who creates personalized, accessible, and supportive guided meditation scripts. Your scripts are warm, clear, and help people find calm and presence.'
            },
            {
              'role': 'user',
              'content': prompt
            }
          ],
          'temperature': 0.7, // Balance between creativity and consistency
          'max_tokens': (totalWords * 1.5).floor(), // Allow some buffer
        },
      );

      final content = response.data['choices']?[0]?['message']?['content'] as String?;
      return content;
    } catch (e) {
      print('Error generating practice content: $e');
      return null;
    }
  }
}

