class PracticeSession {
  final String id;
  final String userId;
  final String practiceType;
  final int durationMinutes;
  final DateTime startTime;
  final DateTime? endTime;
  final Map<String, dynamic>? metadata;
  
  PracticeSession({
    required this.id,
    required this.userId,
    required this.practiceType,
    required this.durationMinutes,
    required this.startTime,
    this.endTime,
    this.metadata,
  });
  
  factory PracticeSession.fromJson(Map<String, dynamic> json) {
    return PracticeSession(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      practiceType: json['practice_type'] as String,
      durationMinutes: json['duration_minutes'] as int,
      startTime: DateTime.parse(json['start_time'] as String),
      endTime: json['end_time'] != null 
          ? DateTime.parse(json['end_time'] as String)
          : null,
      metadata: json['metadata'] as Map<String, dynamic>?,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'practice_type': practiceType,
      'duration_minutes': durationMinutes,
      'start_time': startTime.toIso8601String(),
      'end_time': endTime?.toIso8601String(),
      'metadata': metadata,
    };
  }
}
