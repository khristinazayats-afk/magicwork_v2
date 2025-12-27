import 'package:dio/dio.dart';
import '../config/app_config.dart';

class AIMusicGenerator {
  final Dio _dio = Dio();

  AIMusicGenerator() {
    _dio.options.baseUrl = AppConfig.apiBaseUrl;
    _dio.options.headers = {
      'Content-Type': 'application/json',
    };
  }

  /// Generate ambient/meditation music using web API (Hugging Face primary, CDN fallback)
  Future<String?> generateAmbientMusic({
    String type = 'soft-rain',
    String? emotionalState,
    String? spaceName,
  }) async {
    try {
      // Call web API endpoint which uses Hugging Face (primary) or CDN (fallback)
      final response = await _dio.post(
        '/generate-ambient',
        data: {
          'type': type,
          'emotionalState': emotionalState,
          'spaceName': spaceName,
        },
      );

      final audioUrl = response.data['audioUrl'] as String?;
      return audioUrl;
    } catch (e) {
      print('Error generating ambient music: $e');
      // Fallback URL
      return 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808f30302.mp3';
    }
  }
}

