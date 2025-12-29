import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/custom_practice.dart';
import 'package:uuid/uuid.dart';

class CustomPracticesService {
  static const String _practicesKey = 'custom_practices';
  static const String _foldersKey = 'practice_folders';
  final _uuid = const Uuid();

  // Get all practices
  Future<List<CustomPractice>> getPractices() async {
    final prefs = await SharedPreferences.getInstance();
    final practicesJson = prefs.getString(_practicesKey);
    
    if (practicesJson == null) return [];
    
    final List<dynamic> decoded = jsonDecode(practicesJson);
    return decoded.map((json) => CustomPractice.fromJson(json)).toList();
  }

  // Get all folders
  Future<List<PracticeFolder>> getFolders() async {
    final prefs = await SharedPreferences.getInstance();
    final foldersJson = prefs.getString(_foldersKey);
    
    if (foldersJson == null) return [];
    
    final List<dynamic> decoded = jsonDecode(foldersJson);
    return decoded.map((json) => PracticeFolder.fromJson(json)).toList();
  }

  // Create new practice
  Future<CustomPractice> createPractice({
    required String name,
    required String description,
    required String duration,
    required String color,
    String? folderId,
  }) async {
    final practice = CustomPractice(
      id: _uuid.v4(),
      name: name,
      description: description,
      duration: duration,
      color: color,
      folderId: folderId,
      createdAt: DateTime.now(),
    );

    final practices = await getPractices();
    practices.add(practice);
    await _savePractices(practices);

    return practice;
  }

  // Create new folder
  Future<PracticeFolder> createFolder({
    required String name,
    required String color,
    required String icon,
  }) async {
    final folder = PracticeFolder(
      id: _uuid.v4(),
      name: name,
      color: color,
      icon: icon,
      createdAt: DateTime.now(),
    );

    final folders = await getFolders();
    folders.add(folder);
    await _saveFolders(folders);

    return folder;
  }

  // Delete practice
  Future<void> deletePractice(String id) async {
    final practices = await getPractices();
    practices.removeWhere((p) => p.id == id);
    await _savePractices(practices);
  }

  // Delete folder (and move practices to uncategorized)
  Future<void> deleteFolder(String id) async {
    final folders = await getFolders();
    folders.removeWhere((f) => f.id == id);
    await _saveFolders(folders);

    // Move practices to uncategorized
    final practices = await getPractices();
    final updatedPractices = practices.map((p) {
      if (p.folderId == id) {
        return CustomPractice(
          id: p.id,
          name: p.name,
          description: p.description,
          duration: p.duration,
          color: p.color,
          folderId: null,
          createdAt: p.createdAt,
        );
      }
      return p;
    }).toList();
    await _savePractices(updatedPractices);
  }

  // Update practice folder
  Future<void> movePracticeToFolder(String practiceId, String? folderId) async {
    final practices = await getPractices();
    final updatedPractices = practices.map((p) {
      if (p.id == practiceId) {
        return CustomPractice(
          id: p.id,
          name: p.name,
          description: p.description,
          duration: p.duration,
          color: p.color,
          folderId: folderId,
          createdAt: p.createdAt,
        );
      }
      return p;
    }).toList();
    await _savePractices(updatedPractices);
  }

  // Get practices by folder
  Future<List<CustomPractice>> getPracticesByFolder(String? folderId) async {
    final practices = await getPractices();
    return practices.where((p) => p.folderId == folderId).toList();
  }

  // Private: Save practices
  Future<void> _savePractices(List<CustomPractice> practices) async {
    final prefs = await SharedPreferences.getInstance();
    final json = jsonEncode(practices.map((p) => p.toJson()).toList());
    await prefs.setString(_practicesKey, json);
  }

  // Private: Save folders
  Future<void> _saveFolders(List<PracticeFolder> folders) async {
    final prefs = await SharedPreferences.getInstance();
    final json = jsonEncode(folders.map((f) => f.toJson()).toList());
    await prefs.setString(_foldersKey, json);
  }
}
