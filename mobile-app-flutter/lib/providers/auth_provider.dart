import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import '../config/app_config.dart';
import '../models/user_model.dart';

class AuthProvider extends ChangeNotifier {
  final SupabaseClient _supabase = Supabase.instance.client;
  
  AppUser? _user;
  bool _isLoading = false;
  String? _error;
  
  AppUser? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;
  
  AuthProvider() {
    _initAuth();
  }
  
  Future<void> _initAuth() async {
    final currentUser = _supabase.auth.currentUser;
    _user = currentUser != null
        ? AppUser.fromSupabaseUser(currentUser)
        : null;
    notifyListeners();
    
    _supabase.auth.onAuthStateChange.listen((data) {
      final event = data.event;
      if (event == AuthChangeEvent.signedIn && data.session != null) {
        _user = AppUser.fromSupabaseUser(data.session!.user);
      } else if (event == AuthChangeEvent.signedOut) {
        _user = null;
      }
      notifyListeners();
    });
  }
  
  Future<bool> signInWithEmail(String email, String password) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();
      
      final response = await _supabase.auth.signInWithPassword(
        email: email.trim(),
        password: password,
      );
      
      if (response.user != null) {
        _user = AppUser.fromSupabaseUser(response.user!);
        _isLoading = false;
        _error = null;
        notifyListeners();
        return true;
      }
      _error = 'Login failed. Please check your email and password.';
      _isLoading = false;
      notifyListeners();
      return false;
    } on AuthException catch (e) {
      // Handle Supabase-specific auth errors
      String errorMessage = 'Login failed. ';
      if (e.message.contains('Invalid login credentials') || 
          e.message.contains('Invalid credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (e.message.contains('Email not confirmed')) {
        errorMessage = 'Please verify your email address before logging in.';
      } else if (e.message.contains('User not found')) {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else {
        errorMessage += e.message;
      }
      _error = errorMessage;
      _isLoading = false;
      notifyListeners();
      print('Login error: ${e.message}');
      return false;
    } catch (e) {
      String errorMessage = 'Login failed. ';
      final errorStr = e.toString().toLowerCase();
      if (errorStr.contains('network') || 
          errorStr.contains('connection') ||
          errorStr.contains('socketexception') ||
          errorStr.contains('failed host lookup') ||
          errorStr.contains('nodename nor servname provided')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (errorStr.contains('timeout')) {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else {
        errorMessage += 'Please try again.';
      }
      _error = errorMessage;
      _isLoading = false;
      notifyListeners();
      print('Login error: $e');
      return false;
    }
  }
  
  Future<bool> signUpWithEmail(String email, String password, String? name, {Map<String, dynamic>? metadata}) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();
      
      // Validate password strength
      if (password.length < 6) {
        _error = 'Password must be at least 6 characters long.';
        _isLoading = false;
        notifyListeners();
        return false;
      }
      
      print('🔵 Attempting signup with email: ${email.trim()}');
      print('🔵 Supabase URL: ${AppConfig.supabaseUrl}');
      
      // Combine name with provided metadata
      final Map<String, dynamic> combinedData = {};
      if (name != null && name.isNotEmpty) combinedData['name'] = name;
      if (metadata != null) combinedData.addAll(metadata);
      
      final response = await _supabase.auth.signUp(
        email: email.trim(),
        password: password,
        data: combinedData.isNotEmpty ? combinedData : null,
        emailRedirectTo: '${AppConfig.deepLinkScheme}://${AppConfig.authCallbackPath}',
      );
      
      print('🔵 Signup response received');
      print('🔵 User: ${response.user?.id}');
      print('🔵 Session: ${response.session?.accessToken != null ? "Present" : "None"}');
      print('🔵 Email confirmed: ${response.user?.emailConfirmedAt != null}');
      
      // Supabase may return user even if email confirmation is required
      // Check if user was created successfully
      if (response.user != null) {
        _user = AppUser.fromSupabaseUser(response.user!);
        _isLoading = false;
        _error = null;
        notifyListeners();
        
        // Check if email confirmation is required
        if (response.user!.emailConfirmedAt == null && response.session == null) {
          // Email confirmation required - this is still a success, but user needs to confirm
          print('🔵 Email confirmation required');
          return true; // Return true but user will need to confirm email
        }
        
        print('🔵 Signup successful - user logged in');
        return true;
      }
      
      _error = 'Account creation failed. No user was created.';
      _isLoading = false;
      notifyListeners();
      print('❌ Signup failed: No user in response');
      return false;
    } on AuthException catch (e) {
      // Handle Supabase-specific auth errors
      print('❌ AuthException: ${e.message}');
      print('❌ Status code: ${e.statusCode}');
      
      String errorMessage = 'Account creation failed. ';
      if (e.message.contains('User already registered') || 
          e.message.contains('already exists') ||
          e.message.contains('already been registered')) {
        errorMessage = 'An account with this email already exists. Please log in instead.';
      } else if (e.message.contains('Password') || e.message.contains('password')) {
        errorMessage = 'Password does not meet requirements. Please use a stronger password (minimum 6 characters).';
      } else if (e.message.contains('Email') || e.message.contains('email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (e.message.contains('rate limit') || e.message.contains('too many')) {
        errorMessage = 'Too many signup attempts. Please wait a moment and try again.';
      } else if (e.statusCode == '400') {
        errorMessage = 'Invalid signup data. Please check your email and password.';
      } else if (e.statusCode == '422') {
        errorMessage = 'Invalid email or password format. Please check your input.';
      } else {
        errorMessage += e.message;
      }
      _error = errorMessage;
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e, stackTrace) {
      print('❌ Signup exception: $e');
      print('❌ Stack trace: $stackTrace');
      
      String errorMessage = 'Account creation failed. ';
      final errorStr = e.toString().toLowerCase();
      if (errorStr.contains('network') || 
          errorStr.contains('connection') ||
          errorStr.contains('socketexception') ||
          errorStr.contains('failed host lookup') ||
          errorStr.contains('nodename nor servname provided')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (errorStr.contains('timeout') || errorStr.contains('timeoutexception')) {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else {
        errorMessage += 'Please try again.';
      }
      _error = errorMessage;
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
  
  Future<bool> sendPasswordResetEmail(String email) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();
      
      await _supabase.auth.resetPasswordForEmail(
        email.trim(),
        redirectTo: '${AppConfig.deepLinkScheme}://${AppConfig.authCallbackPath}',
      );
      
      _isLoading = false;
      notifyListeners();
      return true;
    } on AuthException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _error = 'Failed to send reset email. Please try again.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
  
  Future<bool> signInWithOAuth(OAuthProvider provider) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();
      
      await _supabase.auth.signInWithOAuth(
        provider,
        redirectTo: '${AppConfig.deepLinkScheme}://${AppConfig.authCallbackPath}',
      );
      
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
  
  Future<void> signOut() async {
    try {
      _isLoading = true;
      notifyListeners();
      
      await _supabase.auth.signOut();
      _user = null;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Google Sign-In
  Future<bool> signInWithGoogle() async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      // Use Supabase's built-in OAuth flow for Google to avoid plugin API changes.
      await _supabase.auth.signInWithOAuth(
        OAuthProvider.google,
        redirectTo: '${AppConfig.deepLinkScheme}://${AppConfig.authCallbackPath}',
      );

      // The onAuthStateChange listener will set _user when the redirect completes.
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = 'Google Sign-In error: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
      print('Google Sign-In error: $e');
      return false;
    }
  }

  // Apple Sign-In
  Future<bool> signInWithApple() async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final credential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
      );

      final response = await _supabase.auth.signInWithIdToken(
        provider: OAuthProvider.apple,
        idToken: credential.identityToken!,
      );

      if (response.user != null) {
        _user = AppUser.fromSupabaseUser(response.user!);
        _isLoading = false;
        _error = null;
        notifyListeners();
        return true;
      }

      _error = 'Apple Sign-In failed';
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _error = 'Apple Sign-In error: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
      print('Apple Sign-In error: $e');
      return false;
    }
  }
}

