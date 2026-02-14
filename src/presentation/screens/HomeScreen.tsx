import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, FAB, Button, Portal, Modal, TextInput, SegmentedButtons, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useApp } from '../context/AppContext';
import { GoalCard } from '../components/GoalCard';
import { GoalDetailModal } from '../components/GoalDetailModal';
import { Goal, GoalType } from '../../domain/models/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StoreModal } from '../components/StoreModal';
import { DamageModal } from '../components/DamageModal';
import { FocusScreen } from './FocusScreen';
import LottieView from 'lottie-react-native';

export const HomeScreen = () => {
  const { goals, userStats, checkInGoal, failGoal, addGoal, isPanicMode, togglePanicMode } = useApp();
  const confettiRef = useRef<LottieView>(null);

  const [visible, setVisible] = useState(false);
  const [storeVisible, setStoreVisible] = useState(false);
  const [hardcoreGoalId, setHardcoreGoalId] = useState<string | null>(null);

  // ESTADOS PARA DETALLE
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  // FORMULARIO CREACIÓN
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<GoalType>('daily');
  const [newCategory, setNewCategory] = useState<Goal['category']>('work');
  const [deadline, setDeadline] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const dailyGoals = goals.filter(g => g.type === 'daily' && !g.isCompleted && !g.penaltyApplied);
  const strategicGoals = goals.filter(g => (g.type === 'weekly' || g.type === 'monthly') && !g.isCompleted && !g.penaltyApplied);
  const displayedDailyGoals = isPanicMode ? dailyGoals.slice(0, 1) : dailyGoals;

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await addGoal(newTitle, newType, deadline, newCategory);
    setVisible(false);
    resetForm();
  };

  const resetForm = () => {
      setNewTitle('');
      setNewType('daily');
      setNewCategory('work');
      setDeadline(new Date());
  };

  const triggerConfetti = () => {
    if (confettiRef.current) {
      confettiRef.current.reset();
      confettiRef.current.play(0);
    }
  };

  const openDetail = (goal: Goal) => {
      setSelectedGoal(goal);
      setDetailVisible(true);
  };

  if (hardcoreGoalId) {
    const goal = goals.find(g => g.id === hardcoreGoalId);
    return (
      <FocusScreen 
        goalTitle={goal?.title || "Misión"}
        onComplete={async () => {
           await checkInGoal(hardcoreGoalId, {
               date: new Date().toISOString(), 
               text: "Completado en MODO HIPERFOCO 💀", 
               mood: 'fire'
           });
           setHardcoreGoalId(null);
           setTimeout(() => triggerConfetti(), 500); 
        }}
        onCancel={() => setHardcoreGoalId(null)}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#121212' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* HEADER */}
        <LinearGradient colors={['#6C63FF', '#4a43b8']} style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text variant="headlineMedium" style={{color: 'white', fontWeight: 'bold'}}>Nivel {userStats.level}</Text>
              <Text style={{color: '#E0E0E0', fontSize: 12}}>Arquitecto de Vida</Text>
            </View>
            <TouchableOpacity onPress={() => setStoreVisible(true)} style={styles.storeBtnContainer}>
                <LinearGradient colors={['#FFD700', '#FF8C00']} style={styles.storeBtn} start={{x:0, y:0}} end={{x:1, y:1}}>
                    <MaterialCommunityIcons name="cart-outline" size={18} color="#000" style={{marginRight: 6}} />
                    <Text style={{color: '#000', fontWeight: 'bold', fontSize: 14}}>{userStats.xp} XP</Text>
                </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {isPanicMode && (
          <LinearGradient colors={['#FF416C', '#FF4B2B']} style={styles.panicBanner}>
            <Text style={{color: 'white', fontWeight: 'bold', textAlign: 'center'}}>🚨 MODO RESCATE ACTIVADO</Text>
          </LinearGradient>
        )}

        {/* ESTRATÉGICAS */}
        {!isPanicMode && strategicGoals.length > 0 && (
            <View style={{marginTop: 25}}>
                <Text style={styles.sectionTitle}>🗺️ SEGUIMIENTO ESTRATÉGICO</Text>
                <Text style={styles.subTitle}>Registra tu avance diario para ganar XP.</Text>
                {strategicGoals.map(goal => (
                    <GoalCard 
                        key={goal.id} 
                        goal={goal} 
                        onPress={() => openDetail(goal)}
                        onCheckIn={async (text, mood) => {
                            const success = await checkInGoal(goal.id, {date: new Date().toISOString(), text, mood});
                            if (success) triggerConfetti();
                        }}
                        onFail={async (text, mood) => {
                            await failGoal(goal.id, {date: new Date().toISOString(), text, mood});
                        }}
                        onHardcore={() => setHardcoreGoalId(goal.id)} 
                    />
                ))}
            </View>
        )}

        {/* TÁCTICAS */}
        <View style={{marginTop: 20}}>
          <Text style={styles.sectionTitle}>⚔️ MISIONES DEL DÍA</Text>
          {displayedDailyGoals.length === 0 ? (
            <Text style={{color: '#555', textAlign: 'center', marginTop: 40, fontStyle: 'italic'}}>
               {isPanicMode ? "Zona despejada." : "Todo en orden, Comandante."}
            </Text>
          ) : (
            displayedDailyGoals.map(goal => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                onPress={() => openDetail(goal)}
                onCheckIn={async (text, mood) => {
                  const success = await checkInGoal(goal.id, {date: new Date().toISOString(), text, mood});
                  if (success) triggerConfetti();
                }}
                onFail={async (text, mood) => {
                    await failGoal(goal.id, {date: new Date().toISOString(), text, mood});
                }}
                onHardcore={() => setHardcoreGoalId(goal.id)} 
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* FABs */}
      <FAB icon="plus" style={styles.fab} onPress={() => setVisible(true)} color="white" />
      <FAB icon={isPanicMode ? "meditation" : "alert-octagon"} style={[styles.fabPanic, {backgroundColor: isPanicMode ? '#4CAF50' : '#FF5555'}]} onPress={togglePanicMode} color="white" small />

      {/* MODAL CREAR ORDEN */}
      <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modal}>
          <Text variant="headlineSmall" style={{color: 'white', fontWeight: 'bold', marginBottom: 20, textAlign:'center'}}>NUEVA MISIÓN</Text>
          
          <TextInput 
            label="Título de la misión" 
            value={newTitle} 
            onChangeText={setNewTitle} 
            style={styles.input} 
            textColor="white" 
            theme={{colors:{primary:'#6C63FF'}}} 
          />

          <Text style={styles.label}>TIPO DE MISIÓN:</Text>
          <SegmentedButtons
            value={newType}
            onValueChange={val => setNewType(val as GoalType)}
            buttons={[
              { value: 'daily', label: 'Diaria' },
              { value: 'weekly', label: 'Semanal' },
              { value: 'monthly', label: 'Mensual' },
            ]}
            style={{marginBottom: 20}}
            theme={{colors: {secondaryContainer: '#6C63FF', onSecondaryContainer: 'white', onSurface: '#888', outline: '#444'}}}
          />

          {/* NUEVO: SELECTOR DE CATEGORÍA */}
          <Text style={styles.label}>CATEGORÍA (RPG):</Text>
          <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20}}>
             {['work', 'health', 'learning', 'mindset'].map((cat) => (
                 <Chip 
                    key={cat} 
                    selected={newCategory === cat} 
                    onPress={() => setNewCategory(cat as any)}
                    showSelectedOverlay
                    style={{backgroundColor: newCategory === cat ? '#6C63FF' : '#333'}}
                    textStyle={{color: 'white'}}
                 >
                    {cat === 'work' ? '💼 Trabajo' : cat === 'health' ? '❤️ Salud' : cat === 'learning' ? '📚 Estudio' : '🧠 Mentalidad'}
                 </Chip>
             ))}
          </View>

          <Button mode="outlined" onPress={() => setShowPicker(true)} textColor="white" style={{borderColor: '#555', marginBottom: 25}}>
            Vencimiento: {deadline.toLocaleDateString()} {deadline.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </Button>

          {showPicker && (
            <DateTimePicker 
                value={deadline} 
                mode="datetime" 
                display="default" 
                onChange={(e, d) => { setShowPicker(false); if(d) setDeadline(d); }} 
            />
          )}

          <Button mode="contained" onPress={handleCreate} buttonColor="#6C63FF" style={{paddingVertical: 5}}>
            CONFIRMAR ORDEN
          </Button>
        </Modal>
      </Portal>

      <StoreModal visible={storeVisible} onClose={() => setStoreVisible(false)} />
      <DamageModal />
      <GoalDetailModal visible={detailVisible} goal={selectedGoal} onClose={() => setDetailVisible(false)} />
      
      <View style={styles.lottieContainer} pointerEvents="none">
        <LottieView ref={confettiRef} source={require('../../../assets/confetti.json')} autoPlay={false} loop={false} style={styles.lottie} resizeMode="cover" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { padding: 25, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storeBtnContainer: { elevation: 5, borderRadius: 20 },
  storeBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  panicBanner: { padding: 10, margin: 15, borderRadius: 10 },
  sectionTitle: { color: '#888', fontWeight: 'bold', marginLeft: 20, marginBottom: 5, fontSize: 12, letterSpacing: 1 },
  subTitle: { color: '#666', marginLeft: 20, marginBottom: 10, fontSize: 10, fontStyle: 'italic' },
  fab: { position: 'absolute', margin: 20, right: 0, bottom: 0, backgroundColor: '#6C63FF', borderRadius: 50 },
  fabPanic: { position: 'absolute', margin: 20, left: 0, bottom: 0 },
  modal: { backgroundColor: '#1E1E1E', padding: 25, margin: 20, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  input: { backgroundColor: '#2C2C2C', marginBottom: 20 },
  label: {color:'#aaa', marginBottom:10, fontSize:12, fontWeight:'bold'},
  lottieContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 },
  lottie: { width: '100%', height: '100%' }
});