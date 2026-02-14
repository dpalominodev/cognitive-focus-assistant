import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, AppState, TouchableOpacity, Alert, Vibration } from 'react-native';
import { Text, Surface, Button, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { SoundManager } from '../../core/audio/SoundManager';
import { useApp } from '../context/AppContext';

interface Props {
  goalTitle: string;
  onComplete: () => void;
  onCancel: () => void;
}

const FOCUS_DURATION = 25 * 60; 

export const FocusScreen: React.FC<Props> = ({ goalTitle, onComplete, onCancel }) => {
  const appState = useRef(AppState.currentState);
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
  const [isActive, setIsActive] = useState(true);
  const [status, setStatus] = useState<'focus' | 'failed' | 'success'>('focus');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. DETECTOR DE SALIDA DE APP
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/active/) && 
        nextAppState.match(/inactive|background/)
      ) {
        // LÓGICA, SE CASTIGA AL PLAYER CADA QUE SALE DEL APP
        handleDistraction();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // 2. EL TEMPORIZADOR
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSuccess();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  // LOGICA DE FRACASO (DISTRACCIÓN)
  const handleDistraction = () => {
    setIsActive(false);
    setStatus('failed');
    if (timerRef.current) clearInterval(timerRef.current);
    Vibration.vibrate([0, 500, 200, 500]);
    SoundManager.playSound('failure');
  };

  // LOGICA DE ÉXITO
  const handleSuccess = () => {
    setIsActive(false);
    setStatus('success');
    if (timerRef.current) clearInterval(timerRef.current);
    Vibration.vibrate(1000);
    SoundManager.playSound('levelUp');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleGiveUp = () => {
    Alert.alert(
      "¿RENDIRSE?", 
      "Si te rindes ahora, no ganarás XP y la misión contará como fallida.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sí, me rindo", style: "destructive", onPress: onCancel }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* FONDO DINÁMICO SEGÚN ESTADO */}
      <LinearGradient 
        colors={
            status === 'focus' ? ['#0F2027', '#203A43'] :
            status === 'failed' ? ['#4a0000', '#200000'] :
            ['#004d40', '#00251a']
        } 
        style={styles.background} 
      />

      <Surface style={styles.card} elevation={5}>
        
        {/* ENCABEZADO */}
        <Text style={styles.modeLabel}>
            {status === 'focus' ? "MODO HIPERFOCO ACTIVO" : 
             status === 'failed' ? "CONCENTRACIÓN ROTA" : "SESIÓN COMPLETADA"}
        </Text>
        
        <Text variant="headlineMedium" style={styles.goalTitle}>{goalTitle}</Text>

        {/* CONTENIDO CENTRAL */}
        <View style={styles.timerContainer}>
            {status === 'focus' && (
                <View style={styles.circle}>
                    <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                    <Text style={styles.subTimer}>No salgas de la app</Text>
                </View>
            )}

            {status === 'failed' && (
                <View style={{alignItems: 'center'}}>
                    <MaterialCommunityIcons name="skull" size={80} color="#FF5555" />
                    <Text style={[styles.timerText, {color: '#FF5555', fontSize: 30}]}>FALLASTE</Text>
                    <Text style={{color: '#aaa', textAlign: 'center', marginTop: 10}}>
                        Saliste de la aplicación y rompiste el flujo. Intenta de nuevo.
                    </Text>
                    <Button mode="contained" onPress={onCancel} style={styles.failBtn} buttonColor="#FF5555">
                        ACEPTAR DERROTA
                    </Button>
                </View>
            )}

            {status === 'success' && (
                <View style={{alignItems: 'center'}}>
                    <MaterialCommunityIcons name="trophy" size={80} color="#FFD700" />
                    <Text style={[styles.timerText, {color: '#FFD700', fontSize: 30}]}>¡VICTORIA!</Text>
                    <Text style={{color: '#aaa', textAlign: 'center', marginTop: 10}}>
                        Has dominado tu mente. Reclama tu recompensa.
                    </Text>
                    <Button mode="contained" onPress={onComplete} style={styles.successBtn} buttonColor="#00C851">
                        RECLAMAR XP
                    </Button>
                </View>
            )}
        </View>
      </Surface>

      {/* BOTÓN DE RENDICIÓN (Solo visible durante foco) */}
      {status === 'focus' && (
          <TouchableOpacity onPress={handleGiveUp} style={styles.giveUpBtn}>
              <Text style={{color: '#666', fontSize: 12}}>Rendirse (Sin penalización extra)</Text>
          </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  card: { 
      width: '90%', 
      padding: 30, 
      borderRadius: 20, 
      backgroundColor: '#1E1E1E', 
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#333'
  },
  modeLabel: { color: '#00F3FF', fontWeight: 'bold', letterSpacing: 2, fontSize: 10, marginBottom: 10 },
  goalTitle: { color: 'white', fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  timerContainer: { alignItems: 'center', justifyContent: 'center', minHeight: 200 },
  
  circle: {
      width: 200, height: 200, borderRadius: 100, borderWidth: 4, borderColor: '#00F3FF',
      justifyContent: 'center', alignItems: 'center', shadowColor: '#00F3FF', shadowOpacity: 0.5, shadowRadius: 20, elevation: 10
  },
  timerText: { color: 'white', fontSize: 48, fontWeight: 'bold', fontVariant: ['tabular-nums'] },
  subTimer: { color: '#00F3FF', marginTop: 5, fontSize: 12 },

  failBtn: { marginTop: 30, width: '100%' },
  successBtn: { marginTop: 30, width: '100%' },
  giveUpBtn: { position: 'absolute', bottom: 50, padding: 10 }
});