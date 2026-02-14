import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

// Frases aleatorias para mantener la novedad (Dopamina variable)
const PRAISES_SMALL = [
  "¡Bien hecho!",
  "Sigue así.",
  "Esa es la actitud.",
  "Uno menos.",
  "Excelente.",
  "¡Eso!",
  "Tic. Tac. Hecho."
];

const PRAISES_MEDIUM = [
  "¡Eres una máquina, Socio!",
  "¡Nadie te para hoy!",
  "¡Estás en racha, mantén el ritmo!",
  "¡Disciplina pura, me encanta!",
  "¡Así se construye un imperio!",
  "¡Tu yo del futuro te lo agradece!",
  "¡Brutal! Seguimos avanzando."
];

const PRAISES_EPIC = [
  "¡VAMOOOOOOOOS! ¡Lo has logrado!",
  "¡Eres una leyenda absoluta!",
  "¡Nivel de Dios activado! ¡Estoy orgulloso de ti!",
  "¡Victoria impecable! Tómate un segundo para disfrutarlo.",
  "Estoy muy orgulloso de ti, amigo."
];

export class CompanionService {
  
  // Configuración de la voz
  static async speak(text: string) {
    // Detenemos si ya está hablando para no solapar voces
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      await Speech.stop();
    }

    Speech.speak(text, {
      language: 'es-ES', // Español
      pitch: 1.0,        // Tono normal
      rate: 1.0,         // Velocidad normal
    });
  }

  static async celebrate(intensity: 'small' | 'medium' | 'epic') {
    let phrase = "";
    
    switch (intensity) {
      case 'small':
        phrase = PRAISES_SMALL[Math.floor(Math.random() * PRAISES_SMALL.length)];
        break;
      case 'medium':
        phrase = PRAISES_MEDIUM[Math.floor(Math.random() * PRAISES_MEDIUM.length)];
        break;
      case 'epic':
        phrase = PRAISES_EPIC[Math.floor(Math.random() * PRAISES_EPIC.length)];
        break;
    }

    await this.speak(phrase);
  }

  static async encourage() {
    const MOTIVATION = [
      "Vamos, tú puedes con esto.",
      "Solo son cinco minutos, empieza ya.",
      "El dolor de la disciplina es mejor que el del arrepentimiento.",
      "No lo pienses, solo hazlo."
    ];
    const phrase = MOTIVATION[Math.floor(Math.random() * MOTIVATION.length)];
    await this.speak(phrase);
  }
}