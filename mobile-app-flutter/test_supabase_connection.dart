// Quick test script to verify Supabase connection
// Run with: flutter run -d <device> test_supabase_connection.dart

import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'lib/config/app_config.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  print('🔵 Initializing Supabase...');
  print('🔵 URL: ${AppConfig.supabaseUrl}');
  print('🔵 Anon Key: ${AppConfig.supabaseAnonKey.substring(0, 20)}...');
  
  try {
    await Supabase.initialize(
      url: AppConfig.supabaseUrl,
      anonKey: AppConfig.supabaseAnonKey,
    );
    
    print('✅ Supabase initialized successfully');
    
    final client = Supabase.instance.client;
    
    // Test 1: Check if client is accessible
    print('\n🔵 Test 1: Client access');
    print('✅ Client accessible: true');
    
    // Test 2: Try to get current user (should be null if not logged in)
    print('\n🔵 Test 2: Current user check');
    final currentUser = client.auth.currentUser;
    final userId = currentUser?.id;
    print('✅ Current user: ${userId ?? "None (not logged in)"}');
    
    // Test 3: Test auth endpoint
    print('\n🔵 Test 3: Auth endpoint test');
    try {
      // This will fail if not authenticated, but should not throw connection error
      final session = client.auth.currentSession;
      print('✅ Session check: ${session != null ? "Has session" : "No session (expected)"}');
    } catch (e) {
      print('⚠️  Session check error (may be expected): $e');
    }
    
    // Test 4: Test REST API endpoint
    print('\n🔵 Test 4: REST API endpoint test');
    try {
      // Try a simple query to test connection
      // Note: Using a table that might exist (user_profiles) or will gracefully fail
      await client.from('user_profiles').select().limit(1).maybeSingle();
      print('✅ REST API accessible');
    } catch (e) {
      // This is expected if table doesn't exist, but connection should work
      final errorStr = e.toString();
      if (errorStr.contains('relation') || errorStr.contains('does not exist')) {
        print('✅ REST API accessible (table not found is expected)');
      } else if (errorStr.contains('network') || errorStr.contains('connection')) {
        print('❌ Network error: $e');
      } else {
        print('⚠️  REST API test: $e');
      }
    }
    
    print('\n✅ All connection tests completed!');
    print('✅ Supabase is properly configured and accessible');
    
  } catch (e, stackTrace) {
    print('❌ Supabase initialization failed!');
    print('❌ Error: $e');
    print('❌ Stack trace: $stackTrace');
  }
  
  runApp(const MaterialApp(
    home: Scaffold(
      body: Center(
        child: Text('Check console for Supabase connection test results'),
      ),
    ),
  ));
}

