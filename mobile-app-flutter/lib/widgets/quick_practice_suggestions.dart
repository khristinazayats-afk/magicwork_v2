import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';

class QuickPracticeSuggestions extends StatefulWidget {
  final Function(Map<String, dynamic>) onStartPractice;
  
  const QuickPracticeSuggestions({
    Key? key,
    required this.onStartPractice,
  }) : super(key: key);

  @override
  State<QuickPracticeSuggestions> createState() => _QuickPracticeSuggestionsState();
}

class _QuickPracticeSuggestionsState extends State<QuickPracticeSuggestions> {
  final supabase = Supabase.instance.client;
  List<Map<String, dynamic>> suggestions = [];
  bool isLoading = true;
  bool isVisible = true;

  @override
  void initState() {
    super.initState();
    _loadSuggestions();
  }

  Future<void> _loadSuggestions() async {
    try {
      final user = supabase.auth.currentUser;
      if (user == null) return;

      // Get API URL from environment or use default
      final apiUrl = const String.fromEnvironment(
        'API_URL',
        defaultValue: 'https://magicwork.vercel.app',
      );

      final response = await http.post(
        Uri.parse('$apiUrl/api/generate-recommendations'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${supabase.auth.currentSession?.accessToken}',
        },
        body: jsonEncode({
          'userId': user.id,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          suggestions = List<Map<String, dynamic>>.from(data['recommendations'] ?? []);
          isLoading = false;
        });
      } else {
        print('Failed to load suggestions: ${response.statusCode}');
        setState(() => isLoading = false);
      }
    } catch (e) {
      print('Error loading suggestions: $e');
      setState(() => isLoading = false);
    }
  }

  String _getTagColor(String tag) {
    final colors = {
      'breathwork': '0xFFE8F5E9',
      'calming': '0xFFE3F2FD',
      'grounding': '0xFFFFF3E0',
      'evening': '0xFFF3E5F5',
      'morning': '0xFFFFF9C4',
      'focus': '0xFFE1F5FE',
      'stress': '0xFFFFEBEE',
      'anxiety': '0xFFF1F8E9',
      'sleep': '0xFFEDE7F6',
    };
    
    return colors[tag.toLowerCase()] ?? '0xFFF5F5F5';
  }

  @override
  Widget build(BuildContext context) {
    if (!isVisible) return const SizedBox.shrink();

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with toggle
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  '✨ Quick Practices',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1e2d2e),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, size: 20),
                  onPressed: () => setState(() => isVisible = false),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          
          // Horizontal scrolling cards
          SizedBox(
            height: 200,
            child: isLoading
                ? const Center(child: CircularProgressIndicator())
                : suggestions.isEmpty
                    ? const Center(
                        child: Padding(
                          padding: EdgeInsets.all(16),
                          child: Text(
                            'Complete a few practices to get personalized suggestions',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: Colors.grey,
                              fontSize: 14,
                            ),
                          ),
                        ),
                      )
                    : ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: suggestions.length,
                        itemBuilder: (context, index) {
                          final suggestion = suggestions[index];
                          return _buildSuggestionCard(suggestion);
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildSuggestionCard(Map<String, dynamic> suggestion) {
    final title = suggestion['title'] ?? 'Quick Practice';
    final duration = suggestion['duration'] ?? 5;
    final tags = List<String>.from(suggestion['tags'] ?? []);
    final reason = suggestion['reason'] ?? '';

    return Container(
      width: 280,
      margin: const EdgeInsets.only(right: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () => widget.onStartPractice(suggestion),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1e2d2e),
                    height: 1.2,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),
                
                // Duration
                Row(
                  children: [
                    const Icon(
                      Icons.access_time,
                      size: 16,
                      color: Colors.grey,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '$duration min',
                      style: const TextStyle(
                        fontSize: 14,
                        color: Colors.grey,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                
                // Tags
                if (tags.isNotEmpty)
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: tags.take(3).map((tag) {
                      return Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Color(int.parse(_getTagColor(tag))),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          tag,
                          style: TextStyle(
                            fontSize: 11,
                            color: Colors.grey.shade700,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                const Spacer(),
                
                // Reason
                if (reason.isNotEmpty) ...[
                  Text(
                    reason,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade600,
                      fontStyle: FontStyle.italic,
                      height: 1.3,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 12),
                ],
                
                // Start button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => widget.onStartPractice(suggestion),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1e2d2e),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      elevation: 0,
                    ),
                    child: const Text(
                      'Start Now',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
