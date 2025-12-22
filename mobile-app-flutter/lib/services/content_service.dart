import 'package:dio/dio.dart';
import '../config/app_config.dart';

class ContentService {
  final Dio _dio = Dio();

  ContentService() {
    _dio.options.baseUrl = AppConfig.apiBaseUrl;
  }

  Future<List<Map<String, dynamic>>> getContentAssets(String space) async {
    try {
      final response = await _dio.get(
        '/content-assets',
        queryParameters: {'space': space},
      );
      return List<Map<String, dynamic>>.from(response.data);
    } catch (e) {
      return [];
    }
  }

  Future<Map<String, dynamic>?> getContentSet(String id) async {
    try {
      final response = await _dio.get('/content-sets/$id');
      return response.data as Map<String, dynamic>;
    } catch (e) {
      return null;
    }
  }
}


