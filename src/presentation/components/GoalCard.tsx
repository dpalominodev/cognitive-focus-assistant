import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Text, Surface, Button, ProgressBar } from 'react-native-paper';
import { Goal, MoodType } from '../../domain/models/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';

interface Props {
  goal: Goal;
  onCheckIn: (text: string, mood: MoodType) => void;
  onFail: (text: string, mood: MoodType) => void;
  onHardcore: () => void;
  onPress?: () => void;
}

const FAILURE_MOODS: { type: MoodType; emoji: string; label: string }[] = [
  { type: 'tired', emoji: '📱', label: 'Distracción' },
  { type: 'stressed', emoji: '🤯', label: 'Estrés' },
  { type: 'neutral', emoji: '😴', label: 'Pereza' },
  { type: 'tired', emoji: '🛑', label: 'Obstáculo' },
];

const VICTORY_MOODS: { type: MoodType; emoji: string; label: string }[] = [
  { type: 'fire', emoji: '🔥', label: 'Imparable' },
  { type: 'happy', emoji: '😎', label: 'Motivado' },
  { type: 'neutral', emoji: '😐', label: 'Cumplido' },
];

export const GoalCard: React.FC<Props> = ({ goal, onCheckIn, onFail, onHardcore, onPress }) => {
  const { getTimeColor, hasActivityToday } = useApp();
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'success' | 'failure'>('success');
  const [journalText, setJournalText] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType>('fire');
  const [timeLeft, setTimeLeft] = useState('');

  const isDoneToday = hasActivityToday(goal);

  useEffect(() => {
    const tick = () => {
        const now = new Date().getTime();
        const end = new Date(goal.deadline).getTime();
        const diff = end - now;

        if (diff <= 0) {
            setTimeLeft("VENCIDA");
        } else {
            const h = Math.floor((diff / (1000 * 60 * 60)));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`);
        }
    };
    tick();
    const timer = setInterval(tick, 1000); 
    return () => clearInterval(timer);
  }, [goal.deadline]);

  const progress = goal.targetCheckIns > 0 ? goal.currentCheckIns / goal.targetCheckIns : 0;
  const timeStatus = getTimeColor(goal);
  
  const getColors = () => {
    if (goal.penaltyApplied) return ['#222', '#111'];
    if (isDoneToday && !goal.isCompleted) return ['#1E1E1E', '#121212']; 

    switch (timeStatus) {
      case 'blue': return ['#00F3FF', '#0066FF'];
      case 'green': return ['#00B386', '#006644'];
      case 'yellow': return ['#FFD700', '#FF8C00'];
      case 'red': return ['#FF416C', '#FF4B2B'];
      default: return ['#333', '#222'];
    }
  };

  const handleOpenCheckIn = () => { setModalMode('success'); setSelectedMood('fire'); setShowModal(true); };
  const handleOpenFail = () => { setModalMode('failure'); setSelectedMood('tired'); setShowModal(true); };

  const handleSubmit = () => {
    if (modalMode === 'success') onCheckIn(journalText || "¡Misión Cumplida!", selectedMood);
    else onFail(journalText || "No pude completar la misión.", selectedMood);
    setShowModal(false); setJournalText('');
  };

  const currentMoods = modalMode === 'success' ? VICTORY_MOODS : FAILURE_MOODS;
  const isExpired = timeStatus === 'expired' || timeLeft === "VENCIDA";

  return (
    <>
      <View style={styles.cardWrapper}>
        <Surface style={styles.surface} elevation={4}>
            {/* View interno maneja el overflow y borderRadius */}
            <View style={styles.innerContainer}>
                <LinearGradient colors={getColors() as any} style={styles.gradient} start={{x:0, y:0}} end={{x:0, y:1}}>
                <View style={styles.content}>
                    
                    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
                        <View style={styles.row}>
                            <View style={{flex: 1}}>
                                <Text variant="titleMedium" style={{color: isDoneToday ? '#888' : 'white', fontWeight:'bold'}} numberOfLines={1}>
                                    {goal.title}
                                </Text>
                                <View style={{flexDirection:'row', alignItems:'center', marginTop:4}}>
                                    <Text style={{color:'#aaa', fontSize:11, fontWeight:'bold'}}>⏳ {timeLeft}</Text>
                                    {goal.penaltyApplied && <Text style={{color:'#FF5555', fontSize:10, fontWeight:'bold', marginLeft:5}}>FAIL</Text>}
                                </View>
                            </View>

                            <View pointerEvents="auto"> 
                                {!goal.isCompleted && !goal.penaltyApplied ? (
                                    <View style={styles.row}>
                                        {isDoneToday ? (
                                            <View style={styles.doneTodayBadge}>
                                                <Text style={{color:'#aaa', fontSize:10, fontWeight:'bold'}}>HOY: OK</Text>
                                            </View>
                                        ) : (
                                            <>
                                                {!isExpired && (
                                                    <TouchableOpacity onPress={onHardcore} style={[styles.btn, styles.btnHardcore]}>
                                                        <Text style={{fontSize: 16}}>💀</Text>
                                                    </TouchableOpacity>
                                                )}
                                                <TouchableOpacity onPress={handleOpenFail} style={[styles.btn, styles.btnFail]}>
                                                    <Text style={{fontSize: 16, color: '#FF5555'}}>✖️</Text>
                                                </TouchableOpacity>
                                                {!isExpired && (
                                                    <TouchableOpacity onPress={handleOpenCheckIn} style={[styles.btn, styles.btnThunder]}>
                                                        <Text style={{fontSize: 20}}>⚡</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </>
                                        )}
                                    </View>
                                ) : (
                                    goal.isCompleted && <Text style={{fontSize:22}}>🏆</Text>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>

                    {goal.targetCheckIns > 1 && (
                        <View style={{marginTop: 10}}>
                            <Text style={{color:'#aaa', fontSize:10, marginBottom:2}}>
                                Progreso: {goal.currentCheckIns}/{goal.targetCheckIns}
                            </Text>
                            <ProgressBar progress={progress} color={isDoneToday ? "#666" : "white"} style={{height:6, borderRadius:4, backgroundColor:'rgba(255,255,255,0.1)'}} />
                        </View>
                    )}
                </View>
                </LinearGradient>
            </View>
        </Surface>
      </View>

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalBg}>
            <View style={[styles.modalCard, {borderColor: modalMode === 'success' ? '#00F3FF' : '#FF5555'}]}>
                <Text style={[styles.modalTitle, {color: modalMode === 'success' ? '#00F3FF' : '#FF5555'}]}>
                    {modalMode === 'success' ? '¡AVANCE DIARIO!' : 'REPORTE DE FALLO'}
                </Text>
                <Text style={styles.label}>{modalMode === 'success' ? '¿Cómo te sentiste?' : '¿Cuál fue la causa?'}</Text>
                
                <View style={styles.moodRow}>
                    {currentMoods.map((m, index) => (
                        <TouchableOpacity 
                            key={`${m.label}-${index}`} 
                            onPress={() => setSelectedMood(m.type)}
                            style={[
                                styles.moodBtn, 
                                selectedMood === m.type && {
                                    backgroundColor: modalMode === 'success' ? '#00F3FF' : '#FF5555', 
                                    opacity: 1, 
                                    transform: [{scale: 1.1}]
                                }
                            ]}
                        >
                            <Text style={{fontSize:24}}>{m.emoji}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <Text style={{color:'#aaa', textAlign:'center', marginBottom:15, fontSize:12}}>
                    {currentMoods.find(m => m.type === selectedMood)?.label}
                </Text>

                <Text style={styles.label}>Bitácora (Opcional)</Text>
                <TextInput 
                    placeholder={modalMode === 'success' ? "Describe tu avance..." : "Sin excusas, ¿qué pasó?"}
                    placeholderTextColor="#666" style={styles.input} value={journalText} onChangeText={setJournalText} multiline
                />
                
                <View style={styles.row}>
                    <Button onPress={() => setShowModal(false)} textColor="#aaa" style={{flex:1}}>Cancelar</Button>
                    <Button mode="contained" onPress={handleSubmit} buttonColor={modalMode === 'success' ? '#00F3FF' : '#FF5555'} style={{flex:1}}>
                        CONFIRMAR
                    </Button>
                </View>
            </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  cardWrapper: { marginHorizontal: 16, marginVertical: 8 },
  surface: { borderRadius: 16, backgroundColor: 'transparent', elevation: 4 },
  innerContainer: { borderRadius: 16, overflow: 'hidden' },
  gradient: { paddingLeft: 6 }, 
  content: { backgroundColor: '#181818', padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  btn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  btnHardcore: { backgroundColor: '#2a1111', borderWidth: 1, borderColor: '#FF5555' },
  btnFail: { backgroundColor: '#1a1111', borderWidth: 1, borderColor: '#555' },
  btnThunder: { backgroundColor: '#112a2a', borderWidth: 1, borderColor: '#00F3FF', elevation: 4 },
  doneTodayBadge: { padding: 5, borderRadius: 5, backgroundColor: '#222', borderWidth: 1, borderColor: '#444' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#222', padding: 25, borderRadius: 20, borderWidth: 1 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, letterSpacing: 1 },
  label: { color: '#888', marginBottom: 10, fontWeight: 'bold', fontSize: 12 },
  input: { backgroundColor: '#333', color: 'white', padding: 15, borderRadius: 12, marginBottom: 20, minHeight: 60, textAlignVertical: 'top' },
  moodRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 5 },
  moodBtn: { padding: 10, borderRadius: 50, backgroundColor: '#333', opacity: 0.5 },
});