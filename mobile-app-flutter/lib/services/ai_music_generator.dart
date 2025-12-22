import 'package:dio/dio.dart';
// import '../config/app_config.dart'; // Uncomment when adding API keys to AppConfig

class AIMusicGenerator {
  final Dio _dio = Dio();

  AIMusicGenerator() {
    // Base configuration - will be overridden per service
    _dio.options.headers = {
      'Content-Type': 'application/json',
    };
  }

  /// Generate music using Suno API
  /// See: https://suno.com/api or check current Suno documentation
  /// 
  /// Note: Suno API may require authentication and have specific endpoints
  /// Check latest Suno API documentation for current implementation
  Future<String?> generateMusicSuno({
    required String prompt,
    String? style,
    int? duration, // Duration in seconds
    String? title,
    bool instrumental = false,
  }) async {
    try {
      // Check if API key is configured
      // final apiKey = AppConfig.sunoApiKey; // Add to AppConfig when available
      // if (apiKey == null || apiKey.isEmpty) {
      //   print('Suno API key not configured');
      //   return null;
      // }

      // Suno API endpoint structure (check latest docs)
      // Typical endpoint: /v1/generate or /api/generate
      final response = await _dio.post(
        '/v1/generate', // Verify this endpoint with current Suno API docs
        data: {
          'prompt': prompt,
          if (title != null) 'title': title,
          if (style != null) 'style': style,
          if (duration != null) 'duration': duration,
          'instrumental': instrumental,
          'make_instrumental': instrumental,
        },
        options: Options(
          headers: {
            // 'Authorization': 'Bearer $apiKey',
            // Add session cookie or other auth if required by Suno
          },
        ),
      );

      // Suno typically returns a job ID that you poll for completion
      // Check Suno API docs for exact response format
      final songId = response.data['id'] as String?;
      final audioUrl = response.data['audio_url'] as String?;
      
      // If audio URL is returned directly, use it
      if (audioUrl != null) {
        return audioUrl;
      }
      
      // Otherwise, you may need to poll for completion using songId
      if (songId != null) {
        print('Suno generation started, song ID: $songId');
        print('Poll for completion using song ID (implement polling logic)');
        // TODO: Implement polling logic to check when generation is complete
        return songId; // Return ID for polling
      }

      return null;
    } catch (e) {
      print('Error generating music with Suno: $e');
      print('Note: Suno API may require authentication, session cookies, or different endpoint');
      print('Check latest Suno API documentation for current implementation');
      return null;
    }
  }

  /// Poll for Suno generation status
  Future<String?> checkSunoGenerationStatus(String songId) async {
    try {
      final response = await _dio.get(
        '/v1/songs/$songId', // Verify endpoint
      );

      final status = response.data['status'] as String?;
      final audioUrl = response.data['audio_url'] as String?;

      if (status == 'complete' && audioUrl != null) {
        return audioUrl;
      }

      return null; // Still generating or failed
    } catch (e) {
      print('Error checking Suno generation status: $e');
      return null;
    }
  }

  /// Generate music using Beatoven.ai Maestro API
  /// Best for background/meditation music - hassle-free licensing
  /// See: https://www.beatoven.ai/api
  Future<String?> generateMusicBeatoven({
    required String prompt,
    String? genre,
    String? mood,
    int? duration, // Duration in seconds
  }) async {
    try {
      // Beatoven.ai API - good for meditation/background music
      _dio.options.baseUrl = 'https://api.beatoven.ai'; // Verify with latest docs
      
      final response = await _dio.post(
        '/v1/generate', // Verify endpoint with current docs
        data: {
          'prompt': prompt,
          if (genre != null) 'genre': genre,
          if (mood != null) 'mood': mood,
          if (duration != null) 'duration': duration,
        },
        options: Options(
          headers: {
            // 'Authorization': 'Bearer ${AppConfig.beatovenApiKey}', // Add when available
          },
        ),
      );

      final audioUrl = response.data['audio_url'] as String?;
      return audioUrl;
    } catch (e) {
      print('Error generating music with Beatoven: $e');
      return null;
    }
  }

  /// Generate music using Google Lyria RealTime via Gemini API
  /// Uses same OpenAI API key structure if using Gemini API
  /// See: https://ai.google.dev/gemini-api/docs/music-generation
  Future<String?> generateMusicGoogleLyria({
    required String prompt,
    int? duration,
  }) async {
    try {
      // Google Lyria RealTime via Gemini API
      _dio.options.baseUrl = 'https://generativelanguage.googleapis.com'; // Verify
      
      // Note: May require Google API key instead of OpenAI key
      final response = await _dio.post(
        '/v1beta/models/lyria:generateMusic', // Verify endpoint
        data: {
          'prompt': prompt,
          if (duration != null) 'duration': duration,
        },
        options: Options(
          headers: {
            // 'Authorization': 'Bearer ${AppConfig.googleApiKey}', // Requires Google API key
            'Content-Type': 'application/json',
          },
        ),
      );

      final audioUrl = response.data['audio_url'] as String?;
      return audioUrl;
    } catch (e) {
      print('Error generating music with Google Lyria: $e');
      print('Note: Requires Google API key (different from OpenAI key)');
      return null;
    }
  }

  /// Generate music using AI MusicAPI (integrates multiple providers)
  /// See: https://aimusicapi.ai
  Future<String?> generateMusicAIMusicAPI({
    required String prompt,
    String? style,
    int? duration,
    bool instrumental = false,
  }) async {
    try {
      _dio.options.baseUrl = 'https://api.aimusicapi.ai'; // Verify with latest docs
      
      final response = await _dio.post(
        '/v1/generate', // Verify endpoint
        data: {
          'prompt': prompt,
          if (style != null) 'style': style,
          if (duration != null) 'duration': duration,
          'instrumental': instrumental,
        },
        options: Options(
          headers: {
            // 'Authorization': 'Bearer ${AppConfig.aiMusicApiKey}', // Add when available
          },
        ),
      );

      final audioUrl = response.data['audio_url'] as String?;
      return audioUrl;
    } catch (e) {
      print('Error generating music with AI MusicAPI: $e');
      return null;
    }
  }

  /// Generate music using Fal.ai (uses Beatoven model)
  /// See: https://fal.ai/models/beatoven/music-generation/api
  Future<String?> generateMusicFalAI({
    required String prompt,
    int? duration,
    String? style,
  }) async {
    try {
      _dio.options.baseUrl = 'https://fal.run'; // Verify
      
      final response = await _dio.post(
        '/fal-ai/beatoven/music-generation', // Verify endpoint
        data: {
          'prompt': prompt,
          if (duration != null) 'duration': duration,
          if (style != null) 'style': style,
        },
        options: Options(
          headers: {
            // 'Authorization': 'Key ${AppConfig.falApiKey}', // Add when available
          },
        ),
      );

      final audioUrl = response.data['audio_url'] as String?;
      return audioUrl;
    } catch (e) {
      print('Error generating music with Fal.ai: $e');
      return null;
    }
  }

  /// Generate music using Udio API (requires Udio API key)
  /// See: Check Udio API documentation
  Future<String?> generateMusicUdio({
    required String prompt,
    String? style,
    int? duration,
  }) async {
    try {
      // TODO: Implement Udio API integration
      // Udio API endpoint and authentication may vary
      // Check current Udio API documentation
      
      print('Udio music generation - TODO: Implement API integration');
      print('Prompt: $prompt');
      
      return null;
    } catch (e) {
      print('Error generating music with Udio: $e');
      return null;
    }
  }

  /// Generate ambient/meditation music
  /// Uses Suno API with meditation-optimized settings
  Future<String?> generateAmbientMusic({
    required String prompt,
    required String emotionalState,
    int duration = 120, // Default 2 minutes for meditation
  }) async {
    try {
      final enhancedPrompt = '$prompt, $emotionalState meditation, ambient, peaceful, calming, instrumental';
      
      return generateMusicSuno(
        prompt: enhancedPrompt,
        style: 'ambient',
        duration: duration,
        instrumental: true, // Meditation music typically instrumental
      );
    } catch (e) {
      print('Error generating ambient music: $e');
      return null;
    }
  }
}
