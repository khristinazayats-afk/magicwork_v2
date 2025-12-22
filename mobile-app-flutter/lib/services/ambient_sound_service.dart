import 'package:audioplayers/audioplayers.dart';

class AmbientSoundService {
  final AudioPlayer _audioPlayer = AudioPlayer();

  Future<void> playAmbientSound(String soundPath) async {
    try {
      await _audioPlayer.play(DeviceFileSource(soundPath));
      await _audioPlayer.setReleaseMode(ReleaseMode.loop);
    } catch (e) {
      // Handle error
    }
  }

  Future<void> stopAmbientSound() async {
    await _audioPlayer.stop();
  }

  Future<void> setVolume(double volume) async {
    await _audioPlayer.setVolume(volume.clamp(0.0, 1.0));
  }

  void dispose() {
    _audioPlayer.dispose();
  }
}


