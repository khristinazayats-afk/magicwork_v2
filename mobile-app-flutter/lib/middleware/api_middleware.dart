import 'package:dio/dio.dart';

class ApiMiddleware {
  final Dio _dio = Dio();

  ApiMiddleware() {
    _setupInterceptors();
  }

  void _setupInterceptors() {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        // Add authentication tokens, headers, etc.
        handler.next(options);
      },
      onError: (error, handler) {
        // Handle errors globally
        handler.next(error);
      },
    ));
  }

  Dio get dio => _dio;
}











