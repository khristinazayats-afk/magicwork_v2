import 'package:flutter/material.dart';

class UserAccountScreen extends StatelessWidget {
  const UserAccountScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFCF8F2),
      appBar: AppBar(
        title: const Text('Account Settings'),
        backgroundColor: Colors.transparent,
      ),
      body: const Center(
        child: Text('User Account Screen'),
      ),
    );
  }
}


