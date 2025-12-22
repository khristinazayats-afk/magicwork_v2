import 'package:flutter/material.dart';

class PracticePersonalizationScreen extends StatelessWidget {
  const PracticePersonalizationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFCF8F2),
      appBar: AppBar(
        title: const Text('Personalize Practice'),
        backgroundColor: Colors.transparent,
      ),
      body: const Center(
        child: Text('Practice Personalization Screen'),
      ),
    );
  }
}

