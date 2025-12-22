import 'package:dio/dio.dart';
import 'dart:io';
import 'dart:typed_data';
import '../config/app_config.dart';

class AIVoiceGenerator {
  final Dio _dio = Dio();

  AIVoiceGenerator() {
    _dio.options.baseUrl = AppConfig.openaiBaseUrl;
    _dio.options.headers = {
      'Authorization': 'Bearer ${AppConfig.openaiApiKey}',
    };
  }

  /// Generate speech from text using OpenAI TTS
  /// 
  /// Available voices: alloy, echo, fable, onyx, nova, shimmer
  /// Available formats: mp3, opus, aac, flac
  /// Speed: 0.25 to 4.0 (default 1.0)
  Future<Uint8List?> generateSpeech({
    required String text,
    String voice = 'nova', // Default to 'nova' (warm, clear voice, good for meditation)
    String format = 'mp3',
    double speed = 1.0, // Normal speed
  }) async {
    try {
      // Validate inputs
      if (text.trim().isEmpty) {
        print('Error: Text cannot be empty');
        return null;
      }

      if (speed < 0.25 || speed > 4.0) {
        print('Warning: Speed should be between 0.25 and 4.0, using 1.0');
        speed = 1.0;
      }

      final validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
      if (!validVoices.contains(voice.toLowerCase())) {
        print('Warning: Invalid voice, using nova');
        voice = 'nova';
      }

      final validFormats = ['mp3', 'opus', 'aac', 'flac'];
      if (!validFormats.contains(format.toLowerCase())) {
        print('Warning: Invalid format, using mp3');
        format = 'mp3';
      }

      // Call OpenAI TTS API
      final response = await _dio.post(
        '/audio/speech',
        data: {
          'model': 'tts-1', // Use 'tts-1-hd' for higher quality (6x more expensive)
          'input': text,
          'voice': voice.toLowerCase(),
          'response_format': format.toLowerCase(),
          'speed': speed,
        },
        options: Options(
          responseType: ResponseType.bytes, // Get binary audio data
        ),
      );

      if (response.data != null && response.data is List<int>) {
        return Uint8List.fromList(response.data);
      }

      return null;
    } catch (e) {
      print('Error generating speech: $e');
      return null;
    }
  }

  /// Generate speech and save to file
  Future<String?> generateSpeechToFile({
    required String text,
    required String filePath,
    String voice = 'nova',
    String format = 'mp3',
    double speed = 1.0,
  }) async {
    try {
      final audioData = await generateSpeech(
        text: text,
        voice: voice,
        format: format,
        speed: speed,
      );

      if (audioData == null) {
        return null;
      }

      // Save to file
      final file = File(filePath);
      await file.writeAsBytes(audioData);
      
      return filePath;
    } catch (e) {
      print('Error saving speech to file: $e');
      return null;
    }
  }

  /// Generate speech for meditation script with optimized settings
  Future<Uint8List?> generateMeditationNarration({
    required String script,
    String voice = 'nova', // Warm, clear voice
    double speed = 0.95, // Slightly slower for meditation (calm pacing)
  }) async {
    return generateSpeech(
      text: script,
      voice: voice,
      format: 'mp3',
      speed: speed,
    );
  }

  /// Generate speech with ElevenLabs (premium quality, requires separate API key)
  /// See: https://elevenlabs.io/docs/api-reference/text-to-speech
  Future<Uint8List?> generateSpeechElevenLabs({
    required String text,
    required String apiKey,
    String voiceId = 'default', // ElevenLabs voice ID
    String modelId = 'eleven_monolingual_v1',
    double stability = 0.5,
    double similarityBoost = 0.75,
  }) async {
    try {
      // TODO: Implement ElevenLabs API integration
      // Requires separate API key from ElevenLabs
      // Endpoint: https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
      
      print('ElevenLabs voice generation - TODO: Implement API integration');
      print('Check https://elevenlabs.io/docs for API documentation');
      print('Note: Requires separate ElevenLabs API key');
      
      return null;
    } catch (e) {
      print('Error generating speech with ElevenLabs: $e');
      return null;
    }
  }
}

