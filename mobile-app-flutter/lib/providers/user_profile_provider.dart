import 'package:flutter/foundation.dart';
import '../services/user_profile_service.dart';

class UserProfileProvider extends ChangeNotifier {
  final UserProfileService _profileService = UserProfileService();
  Map<String, dynamic>? _profile;
  bool _isLoading = false;
  String? _error;

  Map<String, dynamic>? get profile => _profile;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasProfile => _profile != null;

  /// Load user profile
  Future<void> loadProfile(String userId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _profile = await _profileService.getProfile(userId);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Update profile
  Future<bool> updateProfile({
    required String userId,
    String? username,
    String? displayName,
    String? firstName,
    String? lastName,
    String? bio,
    String? avatarUrl,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final success = await _profileService.upsertProfile(
        userId: userId,
        username: username,
        displayName: displayName,
        firstName: firstName,
        lastName: lastName,
        bio: bio,
        avatarUrl: avatarUrl,
      );

      if (success) {
        await loadProfile(userId); // Reload profile
      }

      _isLoading = false;
      notifyListeners();
      return success;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Check username availability
  Future<bool> checkUsernameAvailable(String username) async {
    try {
      return await _profileService.isUsernameAvailable(username);
    } catch (e) {
      return false;
    }
  }

  /// Complete onboarding
  Future<bool> completeOnboarding(String userId, Map<String, dynamic>? onboardingData) async {
    try {
      return await _profileService.completeOnboarding(userId, onboardingData);
    } catch (e) {
      return false;
    }
  }

  /// Complete profile setup
  Future<bool> completeProfileSetup(String userId) async {
    try {
      return await _profileService.completeProfileSetup(userId);
    } catch (e) {
      return false;
    }
  }
}

