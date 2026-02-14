import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Modal } from 'react-native';
import { Text, Surface, IconButton, TextInput, Button, Divider } from 'react-native-paper';
import { Goal } from '../../domain/models/types';
import { useApp } from '../context/AppContext';

interface Props {
    visible: boolean;
    goal: Goal | null;
    onClose: () => void;
}

export const GoalDetailModal: React.FC<Props> = ({ visible, goal, onClose }) => {
    const { deleteGoal, editGoal } = useApp();
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');

    useEffect(() => {
        if (visible && goal) {
            setEditTitle(goal.title);
            setIsEditing(false);
        }
    }, [visible, goal]);

    const handleSaveEdit = () => {
        if (editTitle.trim() && goal) {
            editGoal(goal.id, editTitle);
            setIsEditing(false);
        }
    };

    const handleDelete = () => {
        if (goal) {
            deleteGoal(goal.id);
            onClose();
        }
    };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
    };

    const renderContent = () => {
        if (!goal) return null;

        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text variant="titleMedium" style={{color: '#888', letterSpacing: 1}}>EXPEDIENTE #{goal.id.slice(-4)}</Text>
                    <IconButton icon="close" iconColor="white" onPress={onClose} />
                </View>

                <ScrollView contentContainerStyle={styles.scroll}>
                    <View style={styles.titleSection}>
                        {isEditing ? (
                            <View style={{flexDirection:'row', alignItems:'center'}}>
                                <TextInput 
                                    value={editTitle} 
                                    onChangeText={setEditTitle} 
                                    style={{flex:1, backgroundColor:'#222', color:'white'}} 
                                    textColor="white"
                                    autoFocus
                                />
                                <IconButton icon="check" iconColor="#00F3FF" onPress={handleSaveEdit} />
                            </View>
                        ) : (
                            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                                <Text variant="headlineSmall" style={styles.goalTitle}>{goal.title}</Text>
                                <IconButton icon="pencil" iconColor="#666" onPress={() => setIsEditing(true)} />
                            </View>
                        )}
                        
                        <View style={styles.badges}>
                            <Surface style={[styles.badge, {backgroundColor: '#333'}]}>
                                <Text style={{color:'white', fontSize:10}}>{goal.type.toUpperCase()}</Text>
                            </Surface>
                            <Surface style={[styles.badge, {backgroundColor: goal.isCompleted ? '#00F3FF' : goal.penaltyApplied ? '#FF5555' : '#4ABFF4'}]}>
                                <Text style={{color:'black', fontSize:10, fontWeight:'bold'}}>
                                    {goal.isCompleted ? 'COMPLETADO' : goal.penaltyApplied ? 'FALLIDO' : 'EN PROGRESO'}
                                </Text>
                            </Surface>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Text style={styles.statVal}>{goal.currentCheckIns}/{goal.targetCheckIns}</Text>
                            <Text style={styles.statLabel}>Progreso</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={styles.statVal}>{goal.journal.length}</Text>
                            <Text style={styles.statLabel}>Registros</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={[styles.statVal, {fontSize: 14, marginTop: 4}]}>{new Date(goal.deadline).toLocaleDateString()}</Text>
                            <Text style={styles.statLabel}>Deadline</Text>
                        </View>
                    </View>

                    <Divider style={{backgroundColor: '#333', marginVertical: 20}} />

                    <Text style={styles.sectionTitle}>📜 BITÁCORA DE GUERRA</Text>
                    
                    {goal.journal.length === 0 ? (
                        <Text style={{color:'#666', fontStyle:'italic', textAlign:'center', marginTop:20}}>
                            Sin registros de actividad.
                        </Text>
                    ) : (
                        goal.journal.map((entry, index) => (
                            <Surface key={index} style={styles.logEntry}>
                                <View style={styles.logHeader}>
                                    <View style={{flexDirection:'row', alignItems:'center'}}>
                                        <Text style={{fontSize:16, marginRight:8}}>
                                            {entry.mood === 'fire' ? '🔥' : entry.mood === 'tired' ? '🥱' : entry.mood === 'happy' ? '😎' : '😐'}
                                        </Text>
                                        <Text style={{color:'#aaa', fontSize:12}}>{formatDate(entry.date)}</Text>
                                    </View>
                                </View>
                                <Text style={styles.logText}>{entry.text}</Text>
                            </Surface>
                        ))
                    )}

                    <View style={{height: 50}} />
                    
                    <Button 
                        mode="outlined" 
                        onPress={handleDelete} 
                        textColor="#FF5555" 
                        style={{borderColor: '#FF5555', marginBottom: 50}}
                        icon="trash-can-outline"
                    >
                        ELIMINAR MISIÓN
                    </Button>
                </ScrollView>
            </View>
        );
    };

    return (
        <Modal visible={visible} onRequestClose={onClose} animationType="slide" presentationStyle="pageSheet">
            {renderContent()}
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#222' },
    scroll: { padding: 20 },
    titleSection: { marginBottom: 20 },
    goalTitle: { color: 'white', fontWeight: 'bold', flex: 1 },
    badges: { flexDirection: 'row', marginTop: 10, gap: 10 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#1E1E1E', padding: 15, borderRadius: 12 },
    stat: { alignItems: 'center' },
    statVal: { color: 'white', fontWeight: 'bold', fontSize: 18 },
    statLabel: { color: '#666', fontSize: 10 },
    sectionTitle: { color: '#6C63FF', fontWeight: 'bold', letterSpacing: 1, marginBottom: 15 },
    logEntry: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 10, marginBottom: 10 },
    logHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    logText: { color: '#ddd', fontSize: 14, lineHeight: 20 }
});