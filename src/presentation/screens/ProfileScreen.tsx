import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Surface, Avatar, Button, Switch, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { STORE_ITEMS } from '../../core/constants';

export const ProfileScreen = () => {
  const { userName, userStats, inventory, logout, togglePanicMode, isPanicMode, settings, toggleSetting } = useApp();

  const getRank = () => {
    if (userStats.level >= 50) return { title: "SEÑOR DEL TIEMPO", color: "#FFD700", icon: "crown" };
    if (userStats.level >= 30) return { title: "MAESTRO DE FOCO", color: "#00F3FF", icon: "sword-cross" };
    if (userStats.level >= 10) return { title: "VETERANO", color: "#C0C0C0", icon: "shield-star" };
    if (userStats.level >= 5) return { title: "APRENDIZ", color: "#CD7F32", icon: "school" };
    return { title: "NOVATO", color: "#888", icon: "leaf" };
  };

  const rank = getRank();
  const getInventoryCount = (id: string) => inventory.filter(i => i === id).length;

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro? Tu guardia terminará.", [
        { text: "Cancelar", style: "cancel" },
        { text: "Salir", onPress: logout, style: "destructive" }
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        
        {/* HEADER */}
        <Surface style={styles.headerCard} elevation={4}>
            <LinearGradient colors={['#1E1E1E', '#121212']} style={styles.gradient}>
                <View style={styles.avatarContainer}>
                    <LinearGradient colors={[rank.color, 'transparent']} style={styles.avatarBorder}>
                        <Avatar.Text size={80} label={userName?.substring(0, 2).toUpperCase() || "US"} style={{backgroundColor: '#333'}} />
                    </LinearGradient>
                    <View style={styles.rankBadge}>
                        <MaterialCommunityIcons name={rank.icon as any} size={16} color="black" />
                    </View>
                </View>
                
                <Text variant="headlineSmall" style={{color: 'white', fontWeight: 'bold', marginTop: 10}}>{userName}</Text>
                <Text style={{color: rank.color, fontWeight: 'bold', letterSpacing: 2, fontSize: 12}}>{rank.title}</Text>
                
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{userStats.level}</Text>
                        <Text style={styles.statLabel}>Nivel</Text>
                    </View>
                    <View style={styles.verticalLine} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{userStats.xp}</Text>
                        <Text style={styles.statLabel}>XP Actual</Text>
                    </View>
                    <View style={styles.verticalLine} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{Math.floor(userStats.totalFocusTime / 60)}h</Text>
                        <Text style={styles.statLabel}>Foco Total</Text>
                    </View>
                </View>
            </LinearGradient>
        </Surface>

        {/* INVENTARIO */}
        <Text style={styles.sectionTitle}>MOCHILA TÁCTICA</Text>
        <View style={styles.inventoryGrid}>
            {STORE_ITEMS.map(item => {
                const count = getInventoryCount(item.id);
                return (
                    <Surface key={item.id} style={[styles.invItem, { opacity: count > 0 ? 1 : 0.3 }]}>
                        <MaterialCommunityIcons name={item.icon as any} size={24} color={count > 0 ? "#00F3FF" : "#555"} />
                        <Text style={styles.invCount}>x{count}</Text>
                        <Text style={styles.invName} numberOfLines={1}>{item.name}</Text>
                    </Surface>
                );
            })}
        </View>

        {/* CONFIGURACIÓN */}
        <Text style={styles.sectionTitle}>SISTEMA DE SEGURIDAD</Text>
        <Surface style={styles.settingsCard}>
            
            <View style={styles.settingRow}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <MaterialCommunityIcons name="fingerprint" size={24} color={settings.biometricsEnabled ? "#00F3FF" : "#aaa"} />
                    <View style={{marginLeft: 15}}>
                        <Text style={styles.settingText}>Acceso Biométrico</Text>
                        <Text style={{color:'#666', fontSize:10}}>Protege tus metas privadas</Text>
                    </View>
                </View>
                <Switch value={settings.biometricsEnabled} onValueChange={() => toggleSetting('biometricsEnabled')} color="#00F3FF" />
            </View>

            <Divider style={{backgroundColor: '#333'}} />

            <View style={styles.settingRow}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <MaterialCommunityIcons name="bell-outline" size={24} color="#aaa" />
                    <Text style={styles.settingText}>Notificaciones de Combate</Text>
                </View>
                <Switch value={settings.notifications} onValueChange={() => toggleSetting('notifications')} color="#6C63FF" />
            </View>
            
            <Divider style={{backgroundColor: '#333'}} />
            
            <View style={styles.settingRow}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <MaterialCommunityIcons name="volume-high" size={24} color="#aaa" />
                    <Text style={styles.settingText}>Voz de Asistente</Text>
                </View>
                <Switch value={settings.sound} onValueChange={() => toggleSetting('sound')} color="#6C63FF" />
            </View>
             <Divider style={{backgroundColor: '#333'}} />

            <TouchableOpacity style={styles.settingRow} onPress={togglePanicMode}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <MaterialCommunityIcons name={isPanicMode ? "toggle-switch" : "toggle-switch-off"} size={24} color={isPanicMode ? "#00C851" : "#aaa"} />
                    <Text style={styles.settingText}>Simular Modo Pánico</Text>
                </View>
            </TouchableOpacity>
        </Surface>

        <Button 
            mode="outlined" 
            onPress={handleLogout} 
            icon="logout" 
            textColor="#FF5555" 
            style={{marginTop: 30, marginBottom: 30, borderColor: '#FF5555', marginHorizontal: 20}}
        >
            ABANDONAR BASE
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 50 },
  headerCard: { margin: 20, borderRadius: 20, overflow: 'hidden', elevation: 5 },
  gradient: { padding: 25, alignItems: 'center' },
  avatarContainer: { position: 'relative' },
  avatarBorder: { padding: 3, borderRadius: 50 },
  rankBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#FFD700', borderRadius: 10, padding: 4 },
  
  statsRow: { flexDirection: 'row', marginTop: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 15, padding: 15, width: '100%', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  statLabel: { color: '#888', fontSize: 10, marginTop: 2 },
  verticalLine: { width: 1, backgroundColor: '#444' },

  sectionTitle: { color: '#6C63FF', marginLeft: 25, marginTop: 20, marginBottom: 10, fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
  
  inventoryGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 10 },
  invItem: { width: '30%', backgroundColor: '#1E1E1E', padding: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center', aspectRatio: 1 },
  invCount: { color: 'white', fontWeight: 'bold', marginTop: 5 },
  invName: { color: '#888', fontSize: 9, marginTop: 2, textAlign: 'center' },

  settingsCard: { marginHorizontal: 20, backgroundColor: '#1E1E1E', borderRadius: 15 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
  settingText: { color: 'white', marginLeft: 15, fontWeight: '500' },
});