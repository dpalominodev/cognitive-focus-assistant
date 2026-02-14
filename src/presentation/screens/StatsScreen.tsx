import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Surface, ProgressBar, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProgressChart, ContributionGraph } from 'react-native-chart-kit';
import { useApp } from '../context/AppContext';
import { Goal } from '../../domain/models/types';
import { GoalDetailModal } from '../components/GoalDetailModal';

const SCREEN_WIDTH = Dimensions.get('window').width;

const COLORS = {
    work: '#00F3FF',    // Cian
    health: '#00C851',  // Verde
    learning: '#FFD700',// Oro
    mindset: '#FF416C'  // Rojo/Rosa
};

export const StatsScreen = () => {
  const { userStats, goals } = useApp();
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  
  // ESTADO DE FILTRO: 'completed' | 'failed' | 'streak' | null (null = ver todo)
  const [filterMode, setFilterMode] = useState<'completed' | 'failed' | 'streak' | null>(null);

  // 1. CÁLCULO DE XP
  const xpForNextLevel = userStats.level * 1000; 
  const xpProgress = Math.min(Math.max(userStats.xp / xpForNextLevel, 0), 1);

  // 2. RADAR / BALANCE DE VIDA
  const statsByCategory = useMemo(() => {
      const counts = { work: 0, health: 0, learning: 0, mindset: 0 };
      let total = 0;
      goals.forEach(g => {
          if (g.category && counts[g.category] !== undefined) {
              counts[g.category] += g.currentCheckIns;
              total += g.currentCheckIns;
          }
      });
      
      if (total === 0) return { labels: [], data: [] };

      return {
          labels: ["Trabajo", "Salud", "Estudio", "Mentalidad"], 
          data: [
              counts.work / total,
              counts.health / total,
              counts.learning / total,
              counts.mindset / total
          ]
      };
  }, [goals]);

  // 3. LÓGICA DE CONSTANCIA
  const heatmapData = useMemo(() => {
      const data: { date: string; count: number }[] = [];
      const map = new Map<string, number>();
      goals.forEach(goal => {
          goal.journal.forEach(entry => {
              const dateKey = new Date(entry.date).toISOString().split('T')[0];
              map.set(dateKey, (map.get(dateKey) || 0) + 1);
          });
      });
      map.forEach((count, date) => data.push({ date, count }));
      return data;
  }, [goals]);

  const today = new Date();
  
  // LÓGICA DE FILTRADO PARA LA LISTA INFERIOR
  const getFilteredList = () => {
      let list = [];
      if (filterMode === 'completed') {
          list = goals.filter(g => g.isCompleted);
      } else if (filterMode === 'failed') {
          list = goals.filter(g => g.penaltyApplied);
      } else {
          list = goals.filter(g => g.isCompleted || g.penaltyApplied);
      }
      return list.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const filteredGoals = getFilteredList();

  const openDetail = (goal: Goal) => {
      setSelectedGoal(goal);
      setDetailVisible(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        
        {/* HEADER DE NIVEL */}
        <Surface style={styles.headerCard} elevation={4}>
            <LinearGradient colors={['#6C63FF', '#4a43b8']} style={styles.gradient}>
                <View style={styles.levelRow}>
                    <View>
                        <Text style={styles.levelLabel}>NIVEL ACTUAL</Text>
                        <Text style={styles.levelNumber}>{userStats.level}</Text>
                    </View>
                    <MaterialCommunityIcons name="trophy-variant" size={50} color="#FFD700" />
                </View>
                <View style={{marginTop: 15}}>
                    <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:5}}>
                        <Text style={{color:'white', fontSize:10, fontWeight:'bold'}}>XP: {userStats.xp} / {xpForNextLevel}</Text>
                        <Text style={{color:'white', fontSize:10, fontWeight:'bold'}}>{Math.floor(xpProgress * 100)}%</Text>
                    </View>
                    <ProgressBar progress={xpProgress} color="#00F3FF" style={{height: 10, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.3)'}} />
                </View>
            </LinearGradient>
        </Surface>

        {/* GRÁFICO BALANCE CON LEYENDA MANUAL */}
        <Text style={styles.sectionTitle}>BALANCE DE VIDA (RPG)</Text>
        <Surface style={styles.chartCard}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
                {/* GRÁFICO SIN LEYENDA AUTOMÁTICA */}
                <ProgressChart
                    data={statsByCategory}
                    width={SCREEN_WIDTH * 0.5} 
                    height={160}
                    strokeWidth={12}
                    radius={25}
                    chartConfig={{
                        backgroundGradientFrom: "#1E1E1E",
                        backgroundGradientTo: "#1E1E1E",
                        color: (opacity = 1, index) => {
                            const colors = [COLORS.work, COLORS.health, COLORS.learning, COLORS.mindset];
                            return `rgba(0, 243, 255, ${opacity})`; 
                        },
                        labelColor: () => `rgba(0,0,0,0)`
                    }}
                    hideLegend={true}
                />
                
                {/* LEYENDA MANUAL BIEN ALINEADA */}
                <View style={{marginLeft: 10, flex: 1}}>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, {backgroundColor: COLORS.work}]} />
                        <Text style={styles.legendText}>Trabajo (Cian)</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, {backgroundColor: COLORS.health}]} />
                        <Text style={styles.legendText}>Salud (Verde)</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, {backgroundColor: COLORS.learning}]} />
                        <Text style={styles.legendText}>Estudio (Amarillo)</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, {backgroundColor: COLORS.mindset}]} />
                        <Text style={styles.legendText}>Mentalidad (Rojo)</Text>
                    </View>
                </View>
            </View>
            <Text style={{color:'#666', fontSize:10, fontStyle:'italic', textAlign:'center', marginTop:5}}>
                Basado en el total de Check-ins realizados
            </Text>
        </Surface>

        {/* HEATMAP */}
        <Text style={styles.sectionTitle}>CONSTANCIA OPERATIVA</Text>
        <Surface style={styles.heatmapCard}>
             <ContributionGraph
                values={heatmapData}
                endDate={today}
                numDays={95}
                width={SCREEN_WIDTH - 40}
                height={200}
                chartConfig={{
                    backgroundColor: "#1E1E1E",
                    backgroundGradientFrom: "#1E1E1E",
                    backgroundGradientTo: "#1E1E1E",
                    color: (opacity = 1) => `rgba(0, 200, 81, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                tooltipDataAttrs={() => ({})}
            />
            <View style={{padding: 10, alignItems: 'center'}}>
                <Text style={{color: '#aaa', fontSize: 10, textAlign:'center'}}>
                    Mapa de calor global. Cada cuadro representa un día en el que hiciste al menos un avance (Check-in).
                </Text>
            </View>
        </Surface>

        {/* METRICAS INTERACTIVAS (AHORA FILTRAN) */}
        <View style={styles.metricsGrid}>
            
            <TouchableOpacity onPress={() => setFilterMode(null)} activeOpacity={0.7}>
                 <Surface style={[styles.metricCard, filterMode === null && styles.activeMetric]}>
                    <MaterialCommunityIcons name="fire" size={24} color="#FFD700" />
                    <Text style={styles.metricVal}>{userStats.currentStreak || 0}</Text>
                    <Text style={styles.metricLabel}>Racha</Text>
                </Surface>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setFilterMode('completed')} activeOpacity={0.7}>
                <Surface style={[styles.metricCard, filterMode === 'completed' && styles.activeMetric]}>
                    <MaterialCommunityIcons name="check-circle-outline" size={24} color="#00F3FF" />
                    <Text style={styles.metricVal}>{goals.filter(g => g.isCompleted).length}</Text>
                    <Text style={styles.metricLabel}>Completadas</Text>
                </Surface>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setFilterMode('failed')} activeOpacity={0.7}>
                <Surface style={[styles.metricCard, filterMode === 'failed' && styles.activeMetric]}>
                    <MaterialCommunityIcons name="skull-outline" size={24} color="#FF5555" />
                    <Text style={styles.metricVal}>{goals.filter(g => g.penaltyApplied).length}</Text>
                    <Text style={styles.metricLabel}>Fallos</Text>
                </Surface>
            </TouchableOpacity>

        </View>

        {/* LISTA DINÁMICA (SEGÚN FILTRO) */}
        <Text style={styles.sectionTitle}>
            {filterMode === 'completed' ? 'ARCHIVO DE VICTORIAS' : 
             filterMode === 'failed' ? 'CEMENTERIO DE MISIONES' : 
             'HISTORIAL GENERAL'}
        </Text>
        
        <View style={{paddingHorizontal: 16}}>
            {filteredGoals.length === 0 ? (
                <View style={{padding: 20, alignItems: 'center'}}>
                    <Text style={{color: '#666', fontStyle: 'italic'}}>No hay registros en esta categoría.</Text>
                </View>
            ) : (
                filteredGoals.map(goal => (
                    <TouchableOpacity key={goal.id} onPress={() => openDetail(goal)}>
                        <Surface style={styles.historyItem}>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <MaterialCommunityIcons 
                                    name={goal.isCompleted ? "check-circle" : "skull"} 
                                    size={24} 
                                    color={goal.isCompleted ? "#00F3FF" : "#FF5555"} 
                                />
                                <View style={{marginLeft: 15, flex: 1}}>
                                    <Text style={{color: 'white', fontWeight: 'bold'}}>{goal.title}</Text>
                                    <View style={{flexDirection:'row'}}>
                                        <Text style={{color: '#888', fontSize: 10, marginRight: 10}}>
                                            {new Date(goal.createdAt).toLocaleDateString()}
                                        </Text>
                                        <Text style={{color: COLORS[goal.category] || '#fff', fontSize: 10, fontWeight:'bold'}}>
                                            {goal.category?.toUpperCase() || 'GENERAL'}
                                        </Text>
                                    </View>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color="#666" />
                            </View>
                        </Surface>
                    </TouchableOpacity>
                ))
            )}
        </View>

      </ScrollView>

      {/* MODAL DE DETALLE */}
      <GoalDetailModal 
        visible={detailVisible} 
        goal={selectedGoal} 
        onClose={() => setDetailVisible(false)} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 50 },
  headerCard: { margin: 20, borderRadius: 20, overflow: 'hidden', elevation: 5 },
  gradient: { padding: 25 },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 'bold', letterSpacing: 2 },
  levelNumber: { color: 'white', fontSize: 48, fontWeight: '900' },
  
  sectionTitle: { color: '#6C63FF', marginLeft: 25, marginTop: 20, marginBottom: 10, fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
  
  chartCard: { marginHorizontal: 20, backgroundColor: '#1E1E1E', borderRadius: 15, padding: 15, elevation: 2 },
  heatmapCard: { marginHorizontal: 10, backgroundColor: '#1E1E1E', borderRadius: 15, padding: 5, elevation: 2, overflow: 'hidden' },

  metricsGrid: { flexDirection: 'row', justifyContent: 'space-around', margin: 20, marginTop: 30 },
  metricCard: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 15, alignItems: 'center', minWidth: 90, elevation: 3, borderWidth: 1, borderColor: 'transparent' },
  activeMetric: { borderColor: '#6C63FF', backgroundColor: '#2a2a3d' }, // Estilo activo
  
  metricVal: { color: 'white', fontSize: 20, fontWeight: 'bold', marginTop: 5 },
  metricLabel: { color: '#666', fontSize: 10, marginTop: 2 },
  
  historyItem: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendText: { color: '#ccc', fontSize: 12 }
});