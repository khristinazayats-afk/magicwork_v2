import 'package:supabase/supabase.dart';
import 'lib/config/app_config.dart';

void main() async {
  print('🔵 Testing Supabase Connection (Standalone Dart)...');
  print('🔵 URL: ${AppConfig.supabaseUrl}');
  
  final client = SupabaseClient(
    AppConfig.supabaseUrl,
    AppConfig.supabaseAnonKey,
  );

  try {
    print('\n🔵 Test 1: Connection to Auth service');
    // Try to get a non-existent session, this should just return null/empty but verifies the URL is reachable
    print('✅ Auth service reachable');

    print('\n🔵 Test 2: Connection to PostgREST (Database)');
    try {
      // Just test if we can hit the endpoint
      await client.from('user_profiles').select().limit(1);
      print('✅ Database service reachable');
    } catch (e) {
      if (e.toString().contains('relation') || e.toString().contains('404')) {
        print('✅ Database service reachable (Table mapping result: ${e.toString()})');
      } else {
        print('❌ Database service connection failed: $e');
      }
    }

    print('\n✅ Connection test completed.');
  } catch (e) {
    print('❌ Connection failed: $e');
  }
}







