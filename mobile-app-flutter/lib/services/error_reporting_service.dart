import 'package:sentry_flutter/sentry_flutter.dart';

class ErrorReportingService {
  static Future<void> reportError(dynamic error, StackTrace? stackTrace) async {
    await Sentry.captureException(error, stackTrace: stackTrace);
  }

  static Future<void> reportMessage(String message) async {
    await Sentry.captureMessage(message);
  }
}


