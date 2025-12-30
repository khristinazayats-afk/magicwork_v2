/// Mood-based ambient sound mapping
/// Maps user emotional states to appropriate ambient soundscapes
class MoodConstants {
  /// Map mood IDs to ambient sound types
  /// This matches the web app's mood-to-ambient-sound mapping
  static const Map<String, String> moodToAmbientSound = {
    'calm': 'gentle-waves',
    'stressed': 'soft-rain',
    'energized': 'white-noise',
    'tired': 'temple-bells',
    'focused': 'forest-birds',
    'anxious': 'soft-rain',
  };

  /// Available mood options for user selection
  static const List<Map<String, dynamic>> moods = [
    {'id': 'calm', 'label': 'Calm', 'emoji': '😌'},
    {'id': 'stressed', 'label': 'Stressed', 'emoji': '😰'},
    {'id': 'energized', 'label': 'Energized', 'emoji': '⚡'},
    {'id': 'tired', 'label': 'Tired', 'emoji': '😴'},
    {'id': 'focused', 'label': 'Focused', 'emoji': '🎯'},
    {'id': 'anxious', 'label': 'Anxious', 'emoji': '😟'},
  ];

  /// Available intentions for user selection
  static const List<Map<String, dynamic>> intentions = [
    {'id': 'reduce-stress', 'label': 'Reduce Stress', 'icon': '🌬️'},
    {'id': 'improve-focus', 'label': 'Improve Focus', 'icon': '🧠'},
    {'id': 'better-sleep', 'label': 'Better Sleep', 'icon': '😴'},
    {'id': 'self-love', 'label': 'Self Love', 'icon': '💖'},
    {'id': 'grounding', 'label': 'Grounding', 'icon': '🌍'},
    {'id': 'gratitude', 'label': 'Gratitude', 'icon': '🙏'},
  ];

  /// Map ambient sound types to Pixabay CDN URLs
  /// This provides high-quality meditation soundscapes
  static const Map<String, String> ambientSoundUrls = {
    'soft-rain': 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808f30302.mp3', // Deep Meditation
    'gentle-waves': 'https://cdn.pixabay.com/audio/2023/05/30/audio_3fe4a09837.mp3', // Relaxing
    'forest-birds': 'https://cdn.pixabay.com/audio/2023/06/11/audio_527cc9d8bd.mp3', // Spiritual Healing
    'temple-bells': 'https://cdn.pixabay.com/audio/2022/08/02/audio_884b904727.mp3', // Tibetan Bowls
    'white-noise': 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808f30302.mp3', // Deep Meditation (fallback)
    'breathing-space': 'https://cdn.pixabay.com/audio/2023/06/11/audio_527cc9d8bd.mp3', // Spiritual Healing (fallback)
  };

  /// Get ambient sound URL for a given mood
  static String? getAmbientSoundForMood(String moodId) {
    final soundType = moodToAmbientSound[moodId];
    if (soundType == null) return null;
    return ambientSoundUrls[soundType];
  }

  /// Get mood emoji by mood ID
  static String getMoodEmoji(String moodId) {
    final mood = moods.firstWhere(
      (m) => m['id'] == moodId,
      orElse: () => {'emoji': '😌'},
    );
    return mood['emoji'] as String;
  }

  /// Get mood label by mood ID
  static String getMoodLabel(String moodId) {
    final mood = moods.firstWhere(
      (m) => m['id'] == moodId,
      orElse: () => {'label': 'Calm'},
    );
    return mood['label'] as String;
  }
}
