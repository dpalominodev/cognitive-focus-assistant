import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import { Text, TextInput, Button, Surface, HelperText } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { SoundManager } from '../../core/audio/SoundManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LoginScreen = () => {
  const { login } = useApp();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProtected, setIsProtected] = useState(false);

  // LÓGICA DE USUARIOS ACTIVOS Y NUEVOS
  useEffect(() => {
    const checkUserStatus = async () => {
        if (!name.trim()) {
            setIsProtected(false);
            return;
        }
        const settingsKey = `FQ_SETTINGS_${name.trim()}`;
        const storedSettings = await AsyncStorage.getItem(settingsKey);
        if (storedSettings) {
            const parsed = JSON.parse(storedSettings);
            setIsProtected(parsed.biometricsEnabled === true);
        } else {
            setIsProtected(false);
        }
    };
    const timer = setTimeout(checkUserStatus, 500);
    return () => clearTimeout(timer);
  }, [name]);

  const handleLogin = async () => {
    if (!name.trim()) {
        Alert.alert("Identificación Requerida", "Por favor ingresa tu nombre clave.");
        return;
    }
    
    setIsSubmitting(true);
    SoundManager.playSound('success'); 
    
    const delay = isProtected ? 100 : 1000;

    setTimeout(async () => {
        const success = await login(name.trim());
        if (success) {
            SoundManager.speak(`Bienvenido, Arquitecto ${name}.`);
        } else {
            setIsSubmitting(false);
            if (isProtected) {
                SoundManager.playSound('failure');
            }
        }
    }, delay);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
            <LinearGradient colors={['#000000', '#1a0b2e']} style={styles.background} />
            
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
                
                <View style={styles.iconContainer}>
                    <View style={styles.glow} />
                    <MaterialCommunityIcons 
                        name={isProtected ? "fingerprint" : "shield-lock"} 
                        size={80} 
                        color={isProtected ? "#00F3FF" : "#6C63FF"} 
                    />
                </View>

                <Text variant="displayMedium" style={styles.title}>FOCUS<Text style={{color:'#6C63FF'}}>QUEST</Text></Text>
                <Text style={styles.subtitle}>PROTOCOLO DE SEGURIDAD</Text>

                <Surface style={styles.card} elevation={4}>
                    <Text style={styles.label}>CREDENCIALES DE ACCESO</Text>
                    <TextInput 
                        placeholder="Nombre Clave / Alias" 
                        placeholderTextColor="#666"
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                        textColor="white"
                        theme={{ colors: { primary: '#6C63FF' } }} 
                        selectionColor="#6C63FF"
                        cursorColor="#6C63FF"
                        underlineColor="transparent"
                        autoCapitalize="words"
                        right={isProtected ? <TextInput.Icon icon="lock" color="#00F3FF" /> : null}
                    />
                    
                    {/* Feedback visual inmediato */}
                    {isProtected && (
                        <HelperText type="info" visible={true} style={{color: '#00F3FF', marginBottom: 10}}>
                            <MaterialCommunityIcons name="shield-check" /> Cuenta protegida biométricamente
                        </HelperText>
                    )}
                    
                    <Button 
                        mode="contained" 
                        onPress={handleLogin} 
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        style={[styles.button, isProtected && { backgroundColor: '#00F3FF' }]}
                        buttonColor={isProtected ? "#00F3FF" : "#6C63FF"}
                        textColor={isProtected ? "black" : "white"}
                        contentStyle={{height: 50}}
                    >
                        {isSubmitting ? "VERIFICANDO..." : isProtected ? "ACCEDER CON HUELLA" : "INICIAR / CREAR"}
                    </Button>
                </Surface>

                <Text style={styles.footer}>DATOS ENCRIPTADOS LOCALMENTE</Text>
            </KeyboardAvoidingView>
        </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  iconContainer: { marginBottom: 20, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: '#6C63FF', opacity: 0.2 },
  title: { fontWeight: '900', color: 'white', letterSpacing: 2, textAlign: 'center' },
  subtitle: { color: '#aaa', letterSpacing: 5, fontSize: 10, marginBottom: 50, marginTop: 5 },
  card: { width: '100%', backgroundColor: '#1E1E1E', padding: 25, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  label: { color: '#6C63FF', fontSize: 10, fontWeight: 'bold', marginBottom: 10, letterSpacing: 1 },
  input: { backgroundColor: '#121212', marginBottom: 10, height: 55, fontSize: 16, borderRadius: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  button: { borderRadius: 10 },
  footer: { position: 'absolute', bottom: 40, color: '#333', fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }
});