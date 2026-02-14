import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
import { useApp } from '../context/AppContext';
import { Goal } from '../../domain/models/types';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.', 'Jul.', 'Ago.', 'Sept.', 'Oct.', 'Nov.', 'Dic.'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom.', 'Lun.', 'Mar.', 'Mié.', 'Jue.', 'Vie.', 'Sáb.'],
  today: "Hoy"
};
LocaleConfig.defaultLocale = 'es';

export const CalendarScreen = () => {
  const { goals } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const getDatesInRange = (startDate: string, endDate: string) => {
    const dateArray = [];
    let currentDate = new Date(startDate);
    const stopDate = new Date(endDate);
    
    currentDate.setHours(0,0,0,0);
    stopDate.setHours(0,0,0,0);

    let safety = 0;
    while (currentDate <= stopDate && safety < 60) {
        dateArray.push(new Date(currentDate).toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
        safety++;
    }
    return dateArray;
  };

  // 1. TRANSFORMADOR DE DATOS AVANZADO, LÓGICA DE COMPLETAR MISIONES DIARIAS Y SEMANALES/MENSUALES
  const markedDates = useMemo(() => {
    const marks: any = {};

    goals.forEach(goal => {
        const startDate = goal.createdAt;
        const endDate = goal.isCompleted && goal.completedAt ? goal.completedAt : goal.deadline;

        let datesToMark: string[] = [];

        if (goal.type === 'daily') {
            datesToMark = [new Date(endDate).toISOString().split('T')[0]];
        } else {
            datesToMark = getDatesInRange(startDate, endDate);
        }

        // LÓGICA DE COLORES
        let dotColor = '#4ABFF4'; //  Azul (Diaria Pendiente)
        
        if (goal.isCompleted) {
            dotColor = '#00F3FF'; // Completada (Cian)
        } else if (goal.penaltyApplied) {
            dotColor = '#FF5555'; // Fallida (Rojo)
        } else if (new Date(goal.deadline) < new Date() && !goal.isCompleted) {
            dotColor = '#FF5555'; // Vencida (Rojo)
        } else if (goal.type !== 'daily') {
            dotColor = '#7928CA'; // Misión Larga En Curso (Violeta)
        }

        // Aplicar puntos a todas las fechas calculadas
        datesToMark.forEach(dateKey => {
            if (!marks[dateKey]) {
                marks[dateKey] = { dots: [] };
            }
            
            // Evitar duplicados visuales (si ya hay un punto del mismo color por otra misión, esta bien, pero limitamos cantidad)
            if (marks[dateKey].dots.length < 5) {
                marks[dateKey].dots.push({ key: goal.id + dateKey, color: dotColor });
            }
        });
    });

    if (marks[selectedDate]) {
      marks[selectedDate].selected = true;
      marks[selectedDate].selectedColor = 'rgba(108, 99, 255, 0.5)';
    } else {
      marks[selectedDate] = { selected: true, selectedColor: 'rgba(108, 99, 255, 0.5)', dots: [] };
    }

    return marks;
  }, [goals, selectedDate]);

  // FILTRADO INTELIGENTE PARA LA LISTA INFERIOR
  const selectedGoals = goals.filter(g => {
    const start = new Date(g.createdAt);
    const end = new Date(g.isCompleted && g.completedAt ? g.completedAt : g.deadline);
    const selected = new Date(selectedDate);
    
    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999); // Final del día
    selected.setHours(12,0,0,0); // Medio día para evitar problemas de zona horaria

    if (g.type === 'daily') {
        const targetDay = new Date(end).toISOString().split('T')[0];
        return targetDay === selectedDate;
    } else {
        return selected >= start && selected <= end;
    }
  });

  const renderGoalItem = ({ item }: { item: Goal }) => {
    const isFailed = !item.isCompleted && (item.penaltyApplied || new Date(item.deadline) < new Date());
    const color = item.isCompleted ? '#00F3FF' : isFailed ? '#FF5555' : item.type !== 'daily' ? '#7928CA' : '#4ABFF4';
    const icon = item.isCompleted ? 'check-circle' : isFailed ? 'skull' : 'clock-outline';

    return (
      <Surface style={[styles.card, { borderLeftColor: color }]}>
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
            <View>
                <Text style={{color: 'white', fontWeight: 'bold'}}>{item.title}</Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={{color: '#888', fontSize: 10, marginRight: 8}}>
                        {item.type.toUpperCase()} 
                    </Text>
                    {item.type !== 'daily' && (
                        <Text style={{color: color, fontSize: 10, fontWeight:'bold'}}>
                            (Día {item.currentCheckIns}/{item.targetCheckIns})
                        </Text>
                    )}
                </View>
            </View>
            <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>
      </Surface>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F2027', '#203A43']} style={styles.background} />
      
      <Text variant="headlineSmall" style={styles.title}>PLANIFICACIÓN TÁCTICA</Text>
      
      {/* CALENDARIO */}
      <View style={styles.calendarWrapper}>
        <Calendar
            theme={{
                backgroundColor: 'transparent',
                calendarBackground: 'transparent',
                textSectionTitleColor: '#b6c1cd',
                selectedDayBackgroundColor: '#00adf5',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#00adf5',
                dayTextColor: '#d9e1e8',
                textDisabledColor: '#2d4150',
                dotColor: '#00adf5',
                selectedDotColor: '#ffffff',
                arrowColor: 'orange',
                monthTextColor: 'white',
                indicatorColor: 'white',
                textDayFontWeight: '300',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '300',
                textDayFontSize: 14,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 14
            }}
            markedDates={markedDates}
            markingType={'multi-dot'}
            onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        />
      </View>

      {/* LISTA DEL DÍA */}
      <View style={styles.listContainer}>
        <Text style={styles.dateLabel}>
            Actividad del {new Date(selectedDate).toLocaleDateString()}
        </Text>
        
        {selectedGoals.length === 0 ? (
            <View style={styles.emptyState}>
                <Text style={{color: '#666', fontStyle: 'italic'}}>Sin operaciones activas este día.</Text>
            </View>
        ) : (
            <FlatList
                data={selectedGoals}
                keyExtractor={item => item.id}
                renderItem={renderGoalItem}
                contentContainerStyle={{paddingBottom: 20}}
            />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 50 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, height: 300 },
  title: { color: 'white', fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  calendarWrapper: { marginHorizontal: 15, borderRadius: 15, backgroundColor: '#1E1E1E', padding: 10, elevation: 5 },
  listContainer: { flex: 1, marginTop: 20, paddingHorizontal: 20 },
  dateLabel: { color: '#4ABFF4', fontSize: 14, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },
  emptyState: { alignItems: 'center', marginTop: 30 },
  card: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 10, marginBottom: 10, borderLeftWidth: 4, elevation: 2 }
});