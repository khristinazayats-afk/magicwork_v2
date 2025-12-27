import 'package:dio/dio.dart';
import '../config/app_config.dart';

class AIPracticeGenerator {
  final Dio _dio = Dio();

  AIPracticeGenerator() {
    _dio.options.baseUrl = AppConfig.apiBaseUrl;
    _dio.options.headers = {
      'Content-Type': 'application/json',
    };
  }

  Future<String?> generatePracticeContent({
    required String emotionalState,
    required int durationMinutes,
    String? intent, // User's intent/goal for the practice
  }) async {
    try {
      // Call web API endpoint which uses Hugging Face (primary) or OpenAI (fallback)
      final response = await _dio.post(
        '/generate-practice',
        data: {
          'emotionalState': emotionalState,
          'durationMinutes': durationMinutes,
          'intent': intent,
        },
      );

      final content = response.data['content'] as String?;
      return content;
    } catch (e) {
      print('Error generating practice content: $e');
      return null;
    }
  }
}

