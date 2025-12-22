import 'package:dio/dio.dart';
import '../config/app_config.dart';

class AIVideoGenerator {
  final Dio _dio = Dio();

  AIVideoGenerator() {
    _dio.options.baseUrl = AppConfig.openaiBaseUrl;
    _dio.options.headers = {
      'Authorization': 'Bearer ${AppConfig.openaiApiKey}',
      'Content-Type': 'application/json',
    };
  }

  Future<String?> generateVideo(String prompt) async {
    try {
      // OpenAI Sora 2 was released in September 2025
      // Check if API endpoint is available, try calling it
      try {
        final response = await _dio.post(
          '/videos/generations',
          data: {
            'model': 'sora-2', // OpenAI Sora 2 model
            'prompt': prompt,
            'duration': 'short', // Options: 'short', 'medium', 'long'
            // Add other parameters as needed based on OpenAI API docs
          },
        );

        final videoUrl = response.data['data']?[0]?['url'] as String?;
        if (videoUrl != null) {
          return videoUrl;
        }
      } catch (apiError) {
        // If Sora API is not yet available, fall back to alternative
        print('OpenAI Sora API not available yet, error: $apiError');
        print('Prompt received: $prompt');
        print('Consider using alternative services like Runway Gen-4 or Google Veo 3');
      }
      
      // If OpenAI Sora is not available, return null
      // Could implement fallback to Runway Gen-4 or other services here
      return null;
    } catch (e) {
      print('Error generating video: $e');
      return null;
    }
  }
}

