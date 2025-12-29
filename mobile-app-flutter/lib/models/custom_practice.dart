class CustomPractice {
  final String id;
  final String name;
  final String description;
  final String duration;
  final String color;
  final String? folderId;
  final DateTime createdAt;

  CustomPractice({
    required this.id,
    required this.name,
    required this.description,
    required this.duration,
    required this.color,
    this.folderId,
    required this.createdAt,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'duration': duration,
      'color': color,
      'folderId': folderId,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory CustomPractice.fromJson(Map<String, dynamic> json) {
    return CustomPractice(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      duration: json['duration'],
      color: json['color'],
      folderId: json['folderId'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}

class PracticeFolder {
  final String id;
  final String name;
  final String color;
  final String icon;
  final DateTime createdAt;

  PracticeFolder({
    required this.id,
    required this.name,
    required this.color,
    required this.icon,
    required this.createdAt,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'color': color,
      'icon': icon,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory PracticeFolder.fromJson(Map<String, dynamic> json) {
    return PracticeFolder(
      id: json['id'],
      name: json['name'],
      color: json['color'],
      icon: json['icon'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}
