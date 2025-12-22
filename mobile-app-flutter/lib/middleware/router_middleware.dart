import 'package:go_router/go_router.dart';

class RouterMiddleware {
  static bool isAuthenticated(GoRouterState state) {
    // Check authentication status
    // This should check with AuthProvider
    return true; // Placeholder
  }

  static void redirectToLogin(GoRouterState state) {
    // Redirect to login if not authenticated
    state.uri;
  }
}


