import 'package:supabase_flutter/supabase_flutter.dart' as supabase;

class AppUser {
  final String id;
  final String? email;
  final String? name;
  final String? avatarUrl;
  final DateTime? createdAt;
  
  AppUser({
    required this.id,
    this.email,
    this.name,
    this.avatarUrl,
    this.createdAt,
  });
  
  factory AppUser.fromSupabaseUser(supabase.User userData) {
    final metadata = userData.userMetadata ?? {};
    
    return AppUser(
      id: userData.id,
      email: userData.email,
      name: metadata['name'] as String? ?? userData.email?.split('@').first,
      avatarUrl: metadata['avatar_url'] as String?,
      createdAt: userData.createdAt.isNotEmpty
          ? DateTime.parse(userData.createdAt)
          : null,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'avatarUrl': avatarUrl,
      'createdAt': createdAt?.toIso8601String(),
    };
  }
}
