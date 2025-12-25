import 'package:audioplayers/audioplayers.dart';

class TibetanBowlService {
  final AudioPlayer _audioPlayer = AudioPlayer();

  Future<void> strikeBowl() async {
    try {
      await _audioPlayer.play(DeviceFileSource('assets/sounds/tibetan_bowl_strike.wav'));
    } catch (e) {
      // Handle error
    }
  }

  void dispose() {
    _audioPlayer.dispose();
  }
}









