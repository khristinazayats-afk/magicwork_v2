import 'package:supabase_flutter/supabase_flutter.dart';

class ProgressTrackingService {
  final SupabaseClient _supabase = Supabase.instance.client;

  Future<void> trackProgress(String userId, Map<String, dynamic> progressData) async {
    try {
      await _supabase.from('user_progress').upsert({
        'user_id': userId,
        ...progressData,
        'updated_at': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      // Handle error
    }
  }

  Future<Map<String, dynamic>?> getProgress(String userId) async {
    try {
      final response = await _supabase
          .from('user_progress')
          .select()
          .eq('user_id', userId)
          .single();

      return response as Map<String, dynamic>?;
    } catch (e) {
      return null;
    }
  }
}









