import 'package:flutter/material.dart';

class EmotionalCheckInScreen extends StatelessWidget {
  const EmotionalCheckInScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFCF8F2),
      appBar: AppBar(
        title: const Text('Emotional Check-In'),
        backgroundColor: Colors.transparent,
      ),
      body: const Center(
        child: Text('Emotional Check-In Screen'),
      ),
    );
  }
}


