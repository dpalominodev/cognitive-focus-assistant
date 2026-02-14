import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';

export const DamageModal = () => {
  const { damageReport, clearDamageReport } = useApp();

  if (!damageReport) return null;

  return (
    <Modal visible={true} transparent animationType="slide">
      <View style={styles.overlay}>
        <Surface style={styles.card} elevation={5}>
            <LinearGradient colors={['#2a0000', '#1a0000']} style={styles.gradient}>
                
                <MaterialCommunityIcons name="alert-decagram" size={60} color="#FF5555" style={{marginBottom: 20}} />
                
                <Text style={styles.title}>¡DAÑO CRÍTICO!</Text>
                <Text style={styles.subtitle}>Has descuidado tus responsabilidades.</Text>

                <View style={styles.reportBox}>
                    <Text style={styles.lostXp}>-{damageReport.xpLost} XP</Text>
                    <Text style={{color: '#aaa', marginBottom: 10}}>Penalización aplicada</Text>
                    
                    {damageReport.titles.map((title, index) => (
                        <Text key={index} style={styles.missedGoal}>❌ {title}</Text>
                    ))}
                </View>

                <Button 
                    mode="contained" 
                    onPress={clearDamageReport} 
                    buttonColor="#FF5555" 
                    style={styles.button}
                >
                    ACEPTAR EL GOLPE
                </Button>

            </LinearGradient>
        </Surface>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { width: '100%', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#FF5555' },
  gradient: { padding: 30, alignItems: 'center' },
  title: { color: '#FF5555', fontSize: 28, fontWeight: 'bold', marginBottom: 5, letterSpacing: 2 },
  subtitle: { color: '#ccc', textAlign: 'center', marginBottom: 20 },
  
  reportBox: { backgroundColor: 'rgba(0,0,0,0.5)', padding: 20, borderRadius: 10, width: '100%', alignItems: 'center', marginBottom: 20 },
  lostXp: { color: '#FF5555', fontSize: 40, fontWeight: 'bold' },
  missedGoal: { color: 'white', marginTop: 5, fontWeight: 'bold' },

  button: { width: '100%' }
});