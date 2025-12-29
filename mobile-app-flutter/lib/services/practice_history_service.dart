import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/practice_session.dart';

class PracticeHistoryService {
  final SupabaseClient _supabase = Supabase.instance.client;

  Future<List<PracticeSession>> getPracticeHistory(String userId) async {
    try {
      final response = await _supabase
          .from('practice_sessions')
          .select()
          .eq('user_id', userId)
          .order('start_time', ascending: false);

      return (response as List)
          .map((json) => PracticeSession.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      return [];
    }
  }

  Future<void> savePracticeSession(PracticeSession session) async {
    try {
      await _supabase.from('practice_sessions').insert(session.toJson());
    } catch (e) {
      // Handle error
    }
  }
}











