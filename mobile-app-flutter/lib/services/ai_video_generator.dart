import 'package:dio/dio.dart';
import '../config/app_config.dart';

class AIVideoGenerator {
  final Dio _dio = Dio();

  AIVideoGenerator() {
    _dio.options.baseUrl = AppConfig.apiBaseUrl;
    _dio.options.headers = {
      'Content-Type': 'application/json',
    };
  }

  Future<String?> generateVideo({
    String? emotionalState,
    String? intent,
    String? spaceName,
    String stage = 'start',
  }) async {
    try {
      // Call web API endpoint which uses Hugging Face (primary) or OpenAI (fallback)
      final response = await _dio.post(
        '/generate-video',
        data: {
          'emotionalState': emotionalState,
          'intent': intent,
          'spaceName': spaceName,
          'stage': stage,
        },
      );

      final videoUrl = response.data['videoUrl'] as String?;
      return videoUrl;
    } catch (e) {
      print('Error generating video: $e');
      return null;
    }
  }
}

