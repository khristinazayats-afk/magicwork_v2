class VibeAnimal {
  final int level;
  final String name;
  final String emoji;
  final int minMinutes;
  final int maxMinutes;
  final int minDays;
  final int maxDays;
  final int minStreak;
  final String benefit;
  final String microcopy;

  VibeAnimal({
    required this.level,
    required this.name,
    required this.emoji,
    required this.minMinutes,
    required this.maxMinutes,
    required this.minDays,
    required this.maxDays,
    required this.minStreak,
    required this.benefit,
    required this.microcopy,
  });
}

class VibeSystem {
  static final List<VibeAnimal> vibes = [
    VibeAnimal(
      level: 1,
      name: 'Sleepy Otter',
      emoji: '🦦',
      minMinutes: 1,
      maxMinutes: 5,
      minDays: 1,
      maxDays: 1,
      minStreak: 0,
      benefit: 'Even tiny pauses reduce nervous system noise',
      microcopy: 'A gentle beginning is still a beginning',
    ),
    VibeAnimal(
      level: 2,
      name: 'Unbothered Tortoise',
      emoji: '🐢',
      minMinutes: 5,
      maxMinutes: 10,
      minDays: 1,
      maxDays: 2,
      minStreak: 0,
      benefit: 'Slow, steady presence calms the vagus nerve',
      microcopy: 'Slow is powerful',
    ),
    VibeAnimal(
      level: 3,
      name: 'Calm Polar Bear',
      emoji: '🐻‍❄️',
      minMinutes: 10,
      maxMinutes: 20,
      minDays: 2,
      maxDays: 3,
      minStreak: 0,
      benefit: 'Your baseline stress response is cooling',
      microcopy: 'You found deep chill in the middle of your week',
    ),
    VibeAnimal(
      level: 4,
      name: 'Chilled Capybara',
      emoji: '🧉',
      minMinutes: 15,
      maxMinutes: 25,
      minDays: 3,
      maxDays: 3,
      minStreak: 0,
      benefit: 'Your body is relaxing into a safe rhythm',
      microcopy: 'Soft ease is settling in',
    ),
    VibeAnimal(
      level: 5,
      name: 'Serene Quokka',
      emoji: '🤗',
      minMinutes: 20,
      maxMinutes: 35,
      minDays: 3,
      maxDays: 4,
      minStreak: 2,
      benefit: 'Tiny joyful pauses improved emotional clarity',
      microcopy: 'Little joys are reshaping your inner world',
    ),
    VibeAnimal(
      level: 6,
      name: 'Resourceful Owl',
      emoji: '🦉',
      minMinutes: 30,
      maxMinutes: 45,
      minDays: 4,
      maxDays: 5,
      minStreak: 0,
      benefit: 'Your breath and mind are finding structure',
      microcopy: 'Clarity comes quietly',
    ),
    VibeAnimal(
      level: 7,
      name: 'Resilient Deer',
      emoji: '🦌',
      minMinutes: 40,
      maxMinutes: 60,
      minDays: 5,
      maxDays: 5,
      minStreak: 3,
      benefit: 'You recover from stress more gracefully',
      microcopy: 'Your calm moves with elegance',
    ),
    VibeAnimal(
      level: 8,
      name: 'Cool Koala',
      emoji: '🐨',
      minMinutes: 55,
      maxMinutes: 75,
      minDays: 5,
      maxDays: 6,
      minStreak: 4,
      benefit: 'Calm is becoming easier to access and sustain',
      microcopy: 'You\'re regulated without even trying',
    ),
    VibeAnimal(
      level: 9,
      name: 'Zenned Panda',
      emoji: '🐼',
      minMinutes: 75,
      maxMinutes: 90,
      minDays: 6,
      maxDays: 6,
      minStreak: 5,
      benefit: 'Your system is entering restorative calm',
      microcopy: 'You\'re living inside a long, soft exhale',
    ),
    VibeAnimal(
      level: 10,
      name: 'Collected Alpaca',
      emoji: '🦙',
      minMinutes: 90,
      maxMinutes: 999,
      minDays: 6,
      maxDays: 7,
      minStreak: 6,
      benefit: 'Your nervous system is regulated and harmonious',
      microcopy: 'You\'ve built something steady inside yourself',
    ),
  ];

  /// Calculate current vibe based on:
  /// - Total practice minutes this week
  /// - Days practiced this week
  /// - Current streak
  static VibeAnimal getCurrentVibe({
    required int totalMinutesThisWeek,
    required int daysActivePracticesThisWeek,
    required int currentStreak,
  }) {
    // Start from the highest level and work down
    for (int i = vibes.length - 1; i >= 0; i--) {
      final vibe = vibes[i];
      
      if (totalMinutesThisWeek >= vibe.minMinutes &&
          totalMinutesThisWeek <= vibe.maxMinutes &&
          daysActivePracticesThisWeek >= vibe.minDays &&
          daysActivePracticesThisWeek <= vibe.maxDays &&
          currentStreak >= vibe.minStreak) {
        return vibe;
      }
    }
    
    // Default to Sleepy Otter if no conditions met
    return vibes[0];
  }

  /// Get all vibes for display in profile
  static List<VibeAnimal> getAllVibes() => vibes;

  /// Get progress percentage to next vibe (0-100)
  static int getProgressToNextVibe({
    required VibeAnimal currentVibe,
    required int totalMinutesThisWeek,
    required int daysActivePracticesThisWeek,
    required int currentStreak,
  }) {
    if (currentVibe.level == vibes.length) {
      return 100; // Already at max
    }

    final nextVibe = vibes[currentVibe.level];
    
    // Calculate progress based on minutes (simplest metric)
    final progress = ((totalMinutesThisWeek - currentVibe.minMinutes) /
            (nextVibe.maxMinutes - currentVibe.minMinutes) * 100)
        .toInt()
        .clamp(0, 100);
    
    return progress;
  }
}
