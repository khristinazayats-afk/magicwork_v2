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

      // Create prompt for meditation practice generation
      final prompt = '''Create a $durationMinutes-minute guided meditation practice script for someone who is feeling $emotionalState.

Guidelines:
- Target approximately $totalWords words total ($wordsPerMinute words per minute)
- Use ${isAnxious ? 'gentle, reassuring, and more detailed guidance' : 'minimal, space-giving language'}
- Focus on breathwork, body awareness, and present-moment attention
- Include specific instructions for physical sensations and breath awareness
- Adapt the language and pacing to help someone move from $emotionalState toward a calmer state
- Include natural pauses and moments of silence in your instructions
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

