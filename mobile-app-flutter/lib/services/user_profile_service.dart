import 'package:supabase_flutter/supabase_flutter.dart';
import 'dart:io';

class UserProfileService {
  final SupabaseClient _supabase = Supabase.instance.client;

  /// Get user profile
  Future<Map<String, dynamic>?> getProfile(String userId) async {
    try {
      final response = await _supabase
          .from('user_profiles')
          .select()
          .eq('user_id', userId)
          .single();

      return response as Map<String, dynamic>?;
    } catch (e) {
      print('Error getting profile: $e');
      return null;
    }
  }

  /// Create or update user profile
  Future<bool> upsertProfile({
    required String userId,
    String? username,
    String? displayName,
    String? firstName,
    String? lastName,
    String? bio,
    String? avatarUrl,
    String? preferredLanguage,
    String? timezone,
    Map<String, dynamic>? notificationPreferences,
    Map<String, dynamic>? privacySettings,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      await _supabase.from('user_profiles').upsert({
        'user_id': userId,
        if (username != null) 'username': username,
        if (displayName != null) 'display_name': displayName,
        if (firstName != null) 'first_name': firstName,
        if (lastName != null) 'last_name': lastName,
        if (bio != null) 'bio': bio,
        if (avatarUrl != null) 'avatar_url': avatarUrl,
        if (preferredLanguage != null) 'preferred_language': preferredLanguage,
        if (timezone != null) 'timezone': timezone,
        if (notificationPreferences != null) 'notification_preferences': notificationPreferences,
        if (privacySettings != null) 'privacy_settings': privacySettings,
        if (metadata != null) 'metadata': metadata,
        'updated_at': DateTime.now().toIso8601String(),
      });

      return true;
    } catch (e) {
      print('Error upserting profile: $e');
      return false;
    }
  }

  /// Update username
  Future<bool> updateUsername(String userId, String username) async {
    try {
      await _supabase
          .from('user_profiles')
          .update({'username': username})
          .eq('user_id', userId);

      return true;
    } catch (e) {
      print('Error updating username: $e');
      return false;
    }
  }

  /// Update display name
  Future<bool> updateDisplayName(String userId, String displayName) async {
    try {
      await _supabase
          .from('user_profiles')
          .update({'display_name': displayName})
          .eq('user_id', userId);

      return true;
    } catch (e) {
      print('Error updating display name: $e');
      return false;
    }
  }

  /// Update bio
  Future<bool> updateBio(String userId, String bio) async {
    try {
      await _supabase
          .from('user_profiles')
          .update({'bio': bio})
          .eq('user_id', userId);

      return true;
    } catch (e) {
      print('Error updating bio: $e');
      return false;
    }
  }

  /// Upload avatar image
  Future<String?> uploadAvatar(String userId, File imageFile) async {
    try {
      final fileName = 'avatars/$userId/${DateTime.now().millisecondsSinceEpoch}.jpg';
      
      await _supabase.storage
          .from('avatars')
          .upload(fileName, imageFile);

      final url = _supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

      // Update profile with avatar URL
      await _supabase
          .from('user_profiles')
          .update({'avatar_url': url})
          .eq('user_id', userId);

      return url;
    } catch (e) {
      print('Error uploading avatar: $e');
      return null;
    }
  }

  /// Mark onboarding as completed
  Future<bool> completeOnboarding(String userId, Map<String, dynamic>? onboardingData) async {
    try {
      await _supabase
          .from('user_profiles')
          .update({
            'onboarding_completed': true,
            'onboarding_data': onboardingData,
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('user_id', userId);

      return true;
    } catch (e) {
      print('Error completing onboarding: $e');
      return false;
    }
  }

  /// Save user's mood selection (for ambient sound personalization)
  Future<bool> saveMood(String userId, String moodId) async {
    try {
      await _supabase
          .from('user_profiles')
          .update({
            'current_mood': moodId,
            'mood_updated_at': DateTime.now().toIso8601String(),
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('user_id', userId);

      return true;
    } catch (e) {
      print('Error saving mood: $e');
      return false;
    }
  }

  /// Get user's current mood
  Future<String?> getMood(String userId) async {
    try {
      final response = await _supabase
          .from('user_profiles')
          .select('current_mood')
          .eq('user_id', userId)
          .single();

      return response['current_mood'] as String?;
    } catch (e) {
      print('Error getting mood: $e');
      return null;
    }
  }

  /// Mark profile setup as completed
  Future<bool> completeProfileSetup(String userId) async {
    try {
      await _supabase
          .from('user_profiles')
          .update({
            'profile_setup_completed': true,
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('user_id', userId);

      return true;
    } catch (e) {
      print('Error completing profile setup: $e');
      return false;
    }
  }

  /// Update last active timestamp
  Future<void> updateLastActive(String userId) async {
    try {
      await _supabase
          .from('user_profiles')
          .update({'last_active_at': DateTime.now().toIso8601String()})
          .eq('user_id', userId);
    } catch (e) {
      print('Error updating last active: $e');
    }
  }

  /// Update last login timestamp
  Future<void> updateLastLogin(String userId) async {
    try {
      await _supabase
          .from('user_profiles')
          .update({'last_login_at': DateTime.now().toIso8601String()})
          .eq('user_id', userId);
    } catch (e) {
      print('Error updating last login: $e');
    }
  }

  /// Check if username is available
  Future<bool> isUsernameAvailable(String username) async {
    try {
      final response = await _supabase
          .from('user_profiles')
          .select('id')
          .eq('username', username)
          .limit(1);

      return (response as List).isEmpty;
    } catch (e) {
      print('Error checking username availability: $e');
      return false;
    }
  }
}

