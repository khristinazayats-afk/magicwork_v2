import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../providers/analytics_provider.dart';
import '../providers/auth_provider.dart';
import '../utils/vibe_system.dart';
import '../models/custom_practice.dart';
import '../services/custom_practices_service.dart';
import '../widgets/quick_practice_suggestions.dart';

const List<Map<String, String>> PRACTICES = [
  {
    'name': 'Slow Morning',
    'description': 'Start your day with intention and calm presence',
    'duration': '5 min',
    'color': '#E8D5F2',
    'users': '24'
  },
  {
    'name': 'Breathe To Relax',
    'description': 'Simple breathing techniques for immediate calm',
    'duration': '3 min',
    'color': '#C9E8F5',
    'users': '18'
  },
  {
    'name': 'Gentle De-Stress',
    'description': 'Release tension and find your center',
    'duration': '7 min',
    'color': '#D4F5E8',
    'users': '32'
  },
  {
    'name': 'Get in the Flow State',
    'description': 'Focus and creativity practice',
    'duration': '10 min',
    'color': '#FFF4D4',
    'users': '15'
  },
  {
    'name': 'Drift into Sleep',
    'description': 'Relaxation journey for better sleep',
    'duration': '15 min',
    'color': '#F0E8F5',
    'users': '41'
  },
  {
    'name': 'Midday Reset',
    'description': 'Recharge during your workday',
    'duration': '5 min',
    'color': '#E8F5D4',
    'users': '27'
  },
];

class FeedScreen extends StatefulWidget {
  const FeedScreen({super.key});

  @override
  State<FeedScreen> createState() => _FeedScreenState();
}

class _FeedScreenState extends State<FeedScreen> {
  int _practicesCompleted = 0;
  int _practiceStreak = 0;
  int _practiceLevel = 1;
  int _totalMinutesThisWeek = 0;
  int _daysActivePracticesThisWeek = 0;
  VibeAnimal _currentVibe = VibeSystem.vibes[0];
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  List<CustomPractice> _customPractices = [];
  List<PracticeFolder> _practiceFolders = [];
  String? _expandedFolderId;
  final CustomPracticesService _practicesService = CustomPracticesService();

  @override
  void initState() {
    super.initState();
    _loadStats();
    _loadCustomPractices();
    // Track screen view
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authProvider = context.read<AuthProvider>();
      final analyticsProvider = context.read<AnalyticsProvider>();
      analyticsProvider.trackScreenView(
        'Feed',
        userId: authProvider.user?.id,
      );
    });
  }

  Future<void> _loadCustomPractices() async {
    final practices = await _practicesService.getPractices();
    final folders = await _practicesService.getFolders();
    setState(() {
      _customPractices = practices;
      _practiceFolders = folders;
    });
  }

  Future<void> _loadStats() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _practicesCompleted = prefs.getInt('practices_completed') ?? 0;
      // Calculate level: Every 10 practices = 1 level
      _practiceLevel = (_practicesCompleted ~/ 10) + 1;
      // Get streak from preferences
      _practiceStreak = prefs.getInt('practice_streak') ?? 0;
      // Get this week's stats
      _totalMinutesThisWeek = prefs.getInt('minutes_this_week') ?? 45;
      _daysActivePracticesThisWeek = prefs.getInt('days_active_this_week') ?? 3;
      
      // Calculate current vibe
      _currentVibe = VibeSystem.getCurrentVibe(
        totalMinutesThisWeek: _totalMinutesThisWeek,
        daysActivePracticesThisWeek: _daysActivePracticesThisWeek,
        currentStreak: _practiceStreak,
      );
    });
  }

  void _handleProfileTap() {
    final authProvider = context.read<AuthProvider>();
    final analyticsProvider = context.read<AnalyticsProvider>();
    analyticsProvider.trackAction(
      actionName: 'profile_button_tapped',
      userId: authProvider.user?.id,
      screenName: 'Feed',
    );
    context.go('/profile');
  }

  void _startPractice(String practiceName) {
    final authProvider = context.read<AuthProvider>();
    final analyticsProvider = context.read<AnalyticsProvider>();
    analyticsProvider.trackAction(
      actionName: 'practice_started',
      userId: authProvider.user?.id,
      screenName: 'Feed',
      properties: {'practice': practiceName},
    );
    context.go('/practice');
  }

  Widget _buildPracticeCard(CustomPractice practice) {
    final colorHex = practice.color.replaceFirst('#', '');
    final color = Color(int.parse('FF$colorHex', radix: 16));
    
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            practice.name,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1e2d2e),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            practice.description,
            style: TextStyle(
              fontSize: 11,
              color: const Color(0xFF1e2d2e).withValues(alpha: 0.7),
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                practice.duration,
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF1e2d2e),
                ),
              ),
              InkWell(
                onTap: () {
                  _startPractice(practice.name);
                  Navigator.pop(context);
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.5),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    'Start',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1e2d2e),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showCreatePracticeDialog() {
    final nameController = TextEditingController();
    final descController = TextEditingController();
    String selectedColor = '#E8D5F2';
    String selectedDuration = '5 min';
    String? selectedFolder;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Create Custom Practice'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(
                  labelText: 'Practice Name',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: descController,
                decoration: const InputDecoration(
                  labelText: 'Description',
                  border: OutlineInputBorder(),
                ),
                maxLines: 2,
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: selectedDuration,
                decoration: const InputDecoration(
                  labelText: 'Duration',
                  border: OutlineInputBorder(),
                ),
                items: ['1 min', '5 min', '10 min', '15 min', '20 min', '30 min']
                    .map((d) => DropdownMenuItem(value: d, child: Text(d)))
                    .toList(),
                onChanged: (value) => selectedDuration = value!,
              ),
              const SizedBox(height: 16),
              if (_practiceFolders.isNotEmpty)
                DropdownButtonFormField<String?>(
                  value: selectedFolder,
                  decoration: const InputDecoration(
                    labelText: 'Folder (Optional)',
                    border: OutlineInputBorder(),
                  ),
                  items: [
                    const DropdownMenuItem(value: null, child: Text('No Folder')),
                    ..._practiceFolders.map((f) => DropdownMenuItem(
                          value: f.id,
                          child: Text('${f.icon} ${f.name}'),
                        )),
                  ],
                  onChanged: (value) => selectedFolder = value,
                ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (nameController.text.isNotEmpty) {
                await _practicesService.createPractice(
                  name: nameController.text,
                  description: descController.text,
                  duration: selectedDuration,
                  color: selectedColor,
                  folderId: selectedFolder,
                );
                await _loadCustomPractices();
                if (context.mounted) Navigator.pop(context);
              }
            },
            child: const Text('Create'),
          ),
        ],
      ),
    );
  }

  void _showCreateFolderDialog() {
    final nameController = TextEditingController();
    String selectedColor = '#E8D5F2';
    String selectedIcon = '📁';

    final icons = ['📁', '🌙', '☀️', '🌟', '💼', '🏠', '🧘', '🎯', '💚', '🌸'];

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Create Folder'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: const InputDecoration(
                labelText: 'Folder Name',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            const Text('Choose Icon:', style: TextStyle(fontSize: 14)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: icons.map((icon) {
                return InkWell(
                  onTap: () => selectedIcon = icon,
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey.shade300),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(icon, style: const TextStyle(fontSize: 24)),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (nameController.text.isNotEmpty) {
                await _practicesService.createFolder(
                  name: nameController.text,
                  color: selectedColor,
                  icon: selectedIcon,
                );
                await _loadCustomPractices();
                if (context.mounted) Navigator.pop(context);
              }
            },
            child: const Text('Create'),
          ),
        ],
      ),
    );
  }

  Widget _buildStatColumn(String label, String value, String emoji) {
    return Column(
      children: [
        Text(
          emoji,
          style: const TextStyle(fontSize: 24),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Color(0xFF1e2d2e),
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: Colors.grey.shade600,
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final user = authProvider.user;
    
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: const Color(0xFFFCF8F2),
      appBar: AppBar(
        title: const Text(
          'Practices',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Color(0xFF1e2d2e),
          ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(
            Icons.menu,
            color: Color(0xFF1e2d2e),
            size: 28,
          ),
          onPressed: () {
            _scaffoldKey.currentState?.openDrawer();
          },
        ),
        actions: [
          IconButton(
            icon: const Icon(
              Icons.account_circle,
              color: Color(0xFF1e2d2e),
              size: 28,
            ),
            onPressed: _handleProfileTap,
          ),
        ],
      ),
      drawer: Drawer(
        backgroundColor: const Color(0xFFFCF8F2),
        child: SafeArea(
          child: Column(
            children: [
              // Profile Section
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: const BorderRadius.only(
                    bottomLeft: Radius.circular(20),
                    bottomRight: Radius.circular(20),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 10,
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // User avatar and name
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 40,
                          backgroundColor: const Color(0xFF172223),
                          child: Text(
                            (user?.email?.substring(0, 1).toUpperCase() ?? 'U'),
                            style: const TextStyle(
                              fontSize: 28,
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                user?.email?.split('@')[0] ?? 'Meditator',
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF1e2d2e),
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                user?.email ?? 'user@example.com',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    // Your Vibe Section
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF5F5F5),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Your Vibe This Week',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey.shade600,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Text(
                                _currentVibe.emoji,
                                style: const TextStyle(fontSize: 32),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      _currentVibe.name,
                                      style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF1e2d2e),
                                      ),
                                    ),
                                    Text(
                                      _currentVibe.microcopy,
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: Colors.grey.shade600,
                                        fontStyle: FontStyle.italic,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    // Practice stats
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildStatColumn('Level', _practiceLevel.toString(), '⭐'),
                        _buildStatColumn('Streak', '$_practiceStreak days', '🔥'),
                        _buildStatColumn('Total', '$_practicesCompleted', '🧘'),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              // Custom Practices Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'My Custom Practices',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: const Color(0xFF1e2d2e),
                      ),
                    ),
                    Row(
                      children: [
                        // Add folder button
                        InkWell(
                          onTap: () => _showCreateFolderDialog(),
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            child: Icon(
                              Icons.create_new_folder,
                              size: 20,
                              color: Colors.grey.shade600,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        // Add practice button
                        InkWell(
                          onTap: () => _showCreatePracticeDialog(),
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            child: Icon(
                              Icons.add_circle_outline,
                              size: 20,
                              color: Colors.grey.shade600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  children: [
                    // Quick Practice Suggestions
                    QuickPracticeSuggestions(
                      onStartPractice: (suggestion) {
                        // Navigate to practice flow with suggestion
                        context.push('/practice', extra: {
                          'intent': suggestion['intent'] ?? 'reduce_stress',
                          'duration': suggestion['duration'] ?? 5,
                          'emotionalState': suggestion['emotionalState'] ?? 'calm',
                        });
                      },
                    ),
                    
                    // Uncategorized practices
                    ..._customPractices.where((p) => p.folderId == null).map((practice) {
                      return _buildPracticeCard(practice);
                    }),
                    
                    // Folders
                    ..._practiceFolders.map((folder) {
                      final isExpanded = _expandedFolderId == folder.id;
                      final folderPractices = _customPractices.where((p) => p.folderId == folder.id).toList();
                      
                      return Column(
                        children: [
                          // Folder header
                          InkWell(
                            onTap: () {
                              setState(() {
                                _expandedFolderId = isExpanded ? null : folder.id;
                              });
                            },
                            child: Container(
                              margin: const EdgeInsets.only(bottom: 8),
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Color(int.parse('FF${folder.color.replaceFirst('#', '')}', radix: 16)),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                children: [
                                  Text(
                                    folder.icon,
                                    style: const TextStyle(fontSize: 20),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      folder.name,
                                      style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF1e2d2e),
                                      ),
                                    ),
                                  ),
                                  Text(
                                    '${folderPractices.length}',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey.shade600,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Icon(
                                    isExpanded ? Icons.expand_less : Icons.expand_more,
                                    color: Colors.grey.shade600,
                                  ),
                                ],
                              ),
                            ),
                          ),
                          
                          // Folder practices (when expanded)
                          if (isExpanded)
                            ...folderPractices.map((practice) {
                              return Padding(
                                padding: const EdgeInsets.only(left: 16),
                                child: _buildPracticeCard(practice),
                              );
                            }),
                        ],
                      );
                    }),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              // Action buttons
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  children: [
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.pop(context);
                          context.go('/profile');
                        },
                        icon: const Icon(Icons.person),
                        label: const Text('Full Profile'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF1e2d2e),
                          foregroundColor: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.pop(context);
                          final authProvider = context.read<AuthProvider>();
                          authProvider.signOut();
                          context.go('/greeting');
                        },
                        icon: const Icon(Icons.logout),
                        label: const Text('Sign Out'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red.shade400,
                          foregroundColor: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Stats Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 10,
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Your Progress',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF1e2d2e),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildStatColumn('Level', _practiceLevel.toString(), '⭐'),
                      _buildStatColumn('Streak', '$_practiceStreak days', '🔥'),
                      _buildStatColumn('Total', '$_practicesCompleted', '🧘'),
                    ],
                  ),
                  const SizedBox(height: 12),
                  // Progress bar
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: LinearProgressIndicator(
                      value: (_practicesCompleted % 10) / 10,
                      minHeight: 8,
                      backgroundColor: Colors.grey.shade200,
                      valueColor: AlwaysStoppedAnimation(
                        _practiceLevel > 5 ? Colors.amber : const Color(0xFF1e2d2e),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${(_practicesCompleted % 10)} / 10 to next level',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Available Practices',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1e2d2e),
              ),
            ),
            const SizedBox(height: 12),
            // Practices Grid
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              addAutomaticKeepAlives: false,
              addRepaintBoundaries: true,
              cacheExtent: 800,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.85,
              ),
              itemCount: PRACTICES.length,
              itemBuilder: (context, index) {
                final practice = PRACTICES[index];
                final colorHex = practice['color']!.replaceFirst('#', '');
                final color = Color(int.parse('FF$colorHex', radix: 16));

                return RepaintBoundary(
                  child: GestureDetector(
                  onTap: () => _startPractice(practice['name']!),
                  child: Container(
                    decoration: BoxDecoration(
                      color: color,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.05),
                          blurRadius: 8,
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              practice['name']!,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF1e2d2e),
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              practice['description']!,
                              style: const TextStyle(
                                fontSize: 12,
                                color: Color(0xFF1e2d2e),
                                height: 1.4,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // User count badge
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.6),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    Icons.people,
                                    size: 12,
                                    color: const Color(0xFF1e2d2e).withValues(alpha: 0.7),
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    '${practice['users']} meditating',
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: const Color(0xFF1e2d2e).withValues(alpha: 0.7),
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  practice['duration']!,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: Color(0xFF1e2d2e),
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                Icon(
                                  Icons.arrow_forward,
                                  size: 16,
                                  color: const Color(0xFF1e2d2e).withValues(alpha: 0.6),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}


