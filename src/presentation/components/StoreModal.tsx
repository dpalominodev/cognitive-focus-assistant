import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Modal, Text, Surface, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
    visible: boolean;
    onClose: () => void;
}

// DEFINICIÓN DE ITEMS
const ITEMS_DATA = [
    { id: '1', name: 'Congelar Racha', price: 200, icon: 'snowflake', desc: 'Protege tu XP si fallas una misión (Auto-uso).' },
    { id: '4', name: 'Poción de Foco', price: 150, icon: 'bottle-tonic', desc: 'Doble XP en tu próximo Check-in.' },
    // Coleccionables (aún sin lógica visual, pero se pueden comprar, más adelante se harán los canjeables)
    { id: '2', name: 'Tema Matrix', price: 500, icon: 'code-tags', desc: 'Desbloquea estilo visual hacker.' },
];

export const StoreModal: React.FC<Props> = ({ visible, onClose }) => {
    const { userStats, buyItem, inventory } = useApp();

    const handleBuy = async (item: typeof ITEMS_DATA[0]) => {
        // Verificar existencia
        const count = inventory.filter(id => id === item.id).length;
        if (count >= 3) {
            Alert.alert("Inventario Lleno", "Ya tienes suficientes de este item.");
            return;
        }

        const success = await buyItem(item.id);
        if (success) {
            Alert.alert("¡Compra Exitosa!", `Has adquirido: ${item.name}. Revisa tu saldo.`);
        } else {
            Alert.alert("Saldo Insuficiente", `Necesitas ${item.price} XP. ¡Completa más misiones!`);
        }
    };

    return (
        <Modal visible={visible} onDismiss={onClose} contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text variant="headlineSmall" style={{color: 'white', fontWeight: 'bold'}}>Mercado Negro</Text>
                    <Text style={{color: '#FFD700', fontWeight: 'bold'}}>Saldo: {userStats.xp} XP</Text>
                </View>
                <IconButton icon="close" iconColor="white" onPress={onClose} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {ITEMS_DATA.map((item) => {
                    const count = inventory.filter(id => id === item.id).length;
                    return (
                        <Surface key={item.id} style={styles.card}>
                            <LinearGradient colors={['#2A2A2A', '#1E1E1E']} style={styles.cardGradient}>
                                <View style={styles.iconBox}>
                                    <MaterialCommunityIcons name={item.icon as any} size={30} color="#00F3FF" />
                                </View>
                                <View style={{flex: 1, paddingHorizontal: 15}}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemDesc}>{item.desc}</Text>
                                    {count > 0 && <Text style={{color:'#00C851', fontSize:10, fontWeight:'bold'}}>EN POSESIÓN: {count}</Text>}
                                </View>
                                <TouchableOpacity onPress={() => handleBuy(item)} style={styles.buyBtn}>
                                    <Text style={{color: 'black', fontWeight: 'bold'}}>{item.price} XP</Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        </Surface>
                    );
                })}
            </ScrollView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { backgroundColor: '#121212', margin: 15, borderRadius: 25, height: '70%', overflow: 'hidden' },
    header: { padding: 20, backgroundColor: '#1E1E1E', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    scroll: { padding: 15 },
    card: { marginBottom: 15, borderRadius: 16, overflow: 'hidden', elevation: 2 },
    cardGradient: { flexDirection: 'row', alignItems: 'center', padding: 15 },
    iconBox: { width: 50, height: 50, borderRadius: 15, backgroundColor: 'rgba(0,243,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    itemName: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    itemDesc: { color: '#888', fontSize: 12, marginBottom: 2 },
    buyBtn: { backgroundColor: '#FFD700', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }
});