import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

const SOUND_FILES = {
  success: require('../../../assets/sounds/success.mp3'),
  complete: require('../../../assets/sounds/complete.mp3'),
  levelUp: require('../../../assets/sounds/levelup.mp3'),
  failure: require('../../../assets/sounds/failure.mp3'),
};

export class SoundManager {
  static async playSound(type: 'success' | 'complete' | 'levelUp' | 'failure') {
    try {
      // Configuración de Audio para iOS
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Cargar desde recurso local
      const { sound } = await Audio.Sound.createAsync(
        SOUND_FILES[type],
        { shouldPlay: true }
      );
      
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          await sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Error crítico de audio:', error);
    }
  }

  static speak(text: string) {
    Speech.stop();
    Speech.speak(text, {
      language: 'es-MX',
      pitch: 1.0, 
      rate: 0.9, 
    });
  }
}