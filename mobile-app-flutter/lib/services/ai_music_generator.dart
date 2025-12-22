import 'package:dio/dio.dart';

class AIMusicGenerator {
  final Dio _dio = Dio();

  AIMusicGenerator() {
    _dio.options.headers = {
      'Content-Type': 'application/json',
    };
  }

  /// Generate ambient/meditation music using Suno API
  /// Note: This assumes a Suno API key is provided in AppConfig
  Future<String?> generateAmbientMusic({
    required String prompt,
    required String emotionalState,
    int duration = 120,
  }) async {
    try {
      // For now, if no Suno key is present, we'll return a high-quality meditation stream URL
      // as a fallback to ensure the user always has music.
      const sunoApiKey = String.fromEnvironment('SUNO_API_KEY', defaultValue: '');
      
      if (sunoApiKey.isEmpty) {
        print('Suno API key not found, using high-quality ambient fallback');
        // Fallback to a high-quality ambient meditation soundscape
        return 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808f30302.mp3'; // Deep Meditation Ambient
      }

      final enhancedPrompt = 'Ambient meditation music, $emotionalState mood, $prompt, peaceful, no vocals, high quality';
      
      final response = await _dio.post(
        'https://api.suno.ai/v1/generate', // Example Suno endpoint
        data: {
          'prompt': enhancedPrompt,
          'make_instrumental': true,
          'duration': duration,
        },
        options: Options(
          headers: {
            'Authorization': 'Bearer $sunoApiKey',
          },
        ),
      );

      return response.data['audio_url'] as String?;
    } catch (e) {
      print('Error generating music: $e');
      // Fallback URL
      return 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808f30302.mp3';
    }
  }
}

