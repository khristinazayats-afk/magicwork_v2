import 'package:flutter/material.dart';

class AmbientSoundManager extends StatefulWidget {
  final Widget child;

  const AmbientSoundManager({
    super.key,
    required this.child,
  });

  @override
  State<AmbientSoundManager> createState() => _AmbientSoundManagerState();
}

class _AmbientSoundManagerState extends State<AmbientSoundManager> {
  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}


