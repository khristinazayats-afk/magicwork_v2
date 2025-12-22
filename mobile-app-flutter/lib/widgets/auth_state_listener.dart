import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';

class AuthStateListener extends StatelessWidget {
  final Widget child;

  const AuthStateListener({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        // Handle auth state changes
        final location = GoRouterState.of(context).uri.path;
        if (!authProvider.isAuthenticated && 
            !location.startsWith('/login') &&
            !location.startsWith('/signup') &&
            !location.startsWith('/splash') &&
            !location.startsWith('/greeting')) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            context.go('/login');
          });
        }
        
        return child;
      },
    );
  }
}

