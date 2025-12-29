import 'package:audioplayers/audioplayers.dart';

class AudioOrchestrationService {
  final AudioPlayer _audioPlayer = AudioPlayer();

  Future<void> playSound(String path) async {
    try {
      await _audioPlayer.play(DeviceFileSource(path));
    } catch (e) {
      // Handle error
    }
  }

  Future<void> stopSound() async {
    await _audioPlayer.stop();
  }

  Future<void> pauseSound() async {
    await _audioPlayer.pause();
  }

  void dispose() {
    _audioPlayer.dispose();
  }
}











