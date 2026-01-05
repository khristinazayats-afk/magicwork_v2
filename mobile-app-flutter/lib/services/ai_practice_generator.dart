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
    String language = 'en', // Language code
    String voice = 'nova', // Voice style
    String pace = 'slow', // Narration pace
  }) async {
    try {
      // Call web API endpoint which uses Hugging Face (primary) or OpenAI (fallback)
      final response = await _dio.post(
        '/generate-practice',
        data: {
          'emotionalState': emotionalState,
          'durationMinutes': durationMinutes,
          'intent': intent,
          'language': language,
          'voice': voice,
          'pace': pace,
        },
        options: Options(
          sendTimeout: const Duration(seconds: 45),
          receiveTimeout: const Duration(seconds: 45),
        ),
      );

      if (response.statusCode == 200) {
        final content = response.data['content'] as String?;
        if (content != null && content.isNotEmpty) {
          print('✓ Practice content generated successfully');
          return content;
        }
      }
      
      print('⚠ Unexpected response from server: ${response.statusCode}');
      return null;
    } on DioException catch (dioError) {
      if (dioError.type == DioExceptionType.connectionTimeout) {
        print('✗ Connection timeout - server took too long to respond');
      } else if (dioError.type == DioExceptionType.receiveTimeout) {
        print('✗ Receive timeout - response took too long');
      } else if (dioError.response != null) {
        print('✗ Server error ${dioError.response?.statusCode}: ${dioError.response?.data}');
      } else {
        print('✗ Error generating practice content: ${dioError.message}');
      }
      return null;
    } catch (e) {
      print('✗ Unexpected error generating practice content: $e');
      return null;
    }
  }
}

