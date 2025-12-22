import 'package:dio/dio.dart';
import '../config/app_config.dart';

class AIImageGenerator {
  final Dio _dio = Dio();

  AIImageGenerator() {
    _dio.options.baseUrl = AppConfig.openaiBaseUrl;
    _dio.options.headers = {
      'Authorization': 'Bearer ${AppConfig.openaiApiKey}',
      'Content-Type': 'application/json',
    };
  }

  Future<String?> generateImage(String prompt) async {
    try {
      // Enhance prompt for meditation/mindfulness context if not already specific
      final enhancedPrompt = prompt.toLowerCase().contains('meditation') ||
              prompt.toLowerCase().contains('mindful') ||
              prompt.toLowerCase().contains('calm')
          ? prompt
          : '$prompt, meditation, mindfulness, peaceful, serene, calming atmosphere';

      // Call OpenAI Images API - Using GPT-Image-1.5 (latest, released Dec 16, 2025)
      // Falls back to dall-e-3 if GPT-Image-1.5 not available
      String? imageUrl;
      
      try {
        // Try GPT-Image-1.5 first (latest model)
        final response = await _dio.post(
          '/images/generations',
          data: {
            'model': 'gpt-image-1.5', // Latest image model (Dec 16, 2025)
            'prompt': enhancedPrompt,
            'n': 1, // Generate 1 image
            'size': '1024x1024', // Standard size
            'quality': 'standard', // 'standard' or 'hd'
            'style': 'natural', // 'vivid' or 'natural'
          },
        );
        imageUrl = response.data['data']?[0]?['url'] as String?;
      } catch (e) {
        // Fallback to DALL-E 3 if GPT-Image-1.5 not available
        print('GPT-Image-1.5 not available, falling back to DALL-E 3: $e');
        final response = await _dio.post(
          '/images/generations',
          data: {
            'model': 'dall-e-3',
            'prompt': enhancedPrompt,
            'n': 1,
            'size': '1024x1024',
            'quality': 'standard',
            'style': 'natural',
          },
        );
        imageUrl = response.data['data']?[0]?['url'] as String?;
      }

      return imageUrl;
    } catch (e) {
      print('Error generating image: $e');
      return null;
    }
  }
}

