import 'package:dio/dio.dart';
import '../config/app_config.dart';

class AIImageGenerator {
  final Dio _dio = Dio();

  AIImageGenerator() {
    _dio.options.baseUrl = AppConfig.apiBaseUrl;
    _dio.options.headers = {
      'Content-Type': 'application/json',
    };
  }

  Future<String?> generateImage(String prompt) async {
    try {
      // Call web API endpoint which uses Hugging Face (primary) or OpenAI (fallback)
      final response = await _dio.post(
        '/generate-image',
        data: {
          'prompt': prompt,
        },
      );

      final imageUrl = response.data['imageUrl'] as String?;
      return imageUrl;
    } catch (e) {
      print('Error generating image: $e');
      return null;
    }
  }
}

