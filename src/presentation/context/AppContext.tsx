import React, { createContext, useState, useEffect, useContext } from 'react';
import { AppState, Alert } from 'react-native'; 
import { Goal, UserStats, GoalType, JournalEntry, MoodType } from '../../domain/models/types';
import { GamificationService } from '../../domain/services/GamificationService';
import { SoundManager } from '../../core/audio/SoundManager';
import { NotificationManager } from '../../core/notifications/NotificationManager';
import { GAME_RULES, STORE_ITEMS } from '../../core/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

const DAILY_PRAISES = ["¡Bien hecho!", "Sigue así.", "Excelente disciplina.", "Un paso más cerca.", "Gran trabajo hoy.", "Constancia pura.", "Así se hace."];
const VICTORY_PRAISES = ["¡Misión completada!", "¡Eres imparable!", "Victoria asegurada.", "Nivel de leyenda.", "¡Objetivo destruido!", "Impresionante."];

interface DamageReport { xpLost: number; titles: string[]; }
export type TimeStatus = 'blue' | 'green' | 'yellow' | 'red' | 'expired';

interface UserSettings {
  sound: boolean;
  notifications: boolean;
  biometricsEnabled: boolean;
}

interface AppContextType {
  userName: string | null;
  login: (name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  goals: Goal[];
  userStats: UserStats;
  loading: boolean;
  addGoal: (title: string, type: GoalType, deadline: Date, category: Goal['category']) => Promise<void>;
  checkInGoal: (id: string, journalEntry: JournalEntry) => Promise<boolean>;
  failGoal: (id: string, journalEntry: JournalEntry) => Promise<void>;
  
  deleteGoal: (id: string) => Promise<void>;
  editGoal: (id: string, newTitle: string) => Promise<void>;

  isPanicMode: boolean;
  togglePanicMode: () => void;
  buyItem: (itemId: string) => Promise<boolean>;
  inventory: string[];
  damageReport: DamageReport | null;
  clearDamageReport: () => void;
  getTimeColor: (goal: Goal) => TimeStatus;
  hasActivityToday: (goal: Goal) => boolean;
  
  settings: UserSettings;
  toggleSetting: (key: keyof UserSettings) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userName, setUserName] = useState<string | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [userStats, setUserStats] = useState<UserStats>(GamificationService.getInitialStats());
  const [inventory, setInventory] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPanicMode, setIsPanicMode] = useState(false);
  const [damageReport, setDamageReport] = useState<DamageReport | null>(null);
  
  const [settings, setSettings] = useState<UserSettings>({
    sound: true, notifications: true, biometricsEnabled: false
  });

  const getKeys = (user: string) => ({
    GOALS: `FQ_GOALS_${user}`,
    STATS: `FQ_STATS_${user}`,
    INV: `FQ_INV_${user}`,
    SETTINGS: `FQ_SETTINGS_${user}`,
  });

  const getTimeColor = (goal: Goal): TimeStatus => {
    if (goal.isCompleted) return 'blue';
    const start = new Date(goal.createdAt).getTime();
    const end = new Date(goal.deadline).getTime();
    const now = new Date().getTime();

    if (now > end) return 'expired';
    const total = end - start;
    const remaining = end - now;
    const percentageLeft = remaining / total;

    if (percentageLeft > 0.75) return 'blue';
    if (percentageLeft > 0.50) return 'green';
    if (percentageLeft > 0.15) return 'yellow';
    return 'red';
  };

  const hasActivityToday = (goal: Goal): boolean => {
    if (!goal.journal || goal.journal.length === 0) return false;
    const lastEntry = goal.journal[goal.journal.length - 1];
    return new Date(lastEntry.date).toDateString() === new Date().toDateString();
  };

  useEffect(() => {
    const init = async () => {
      const storedName = await AsyncStorage.getItem('FQ_LAST_USER');
      if (storedName) {
        await loadUserData(storedName);
      } else {
        setLoading(false);
      }
    };
    init();

    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active' && userName) {
        await checkPunishment(userName); 
      }
    });
    return () => subscription.remove();
  }, [userName]);

  const loadUserData = async (name: string) => {
    const K = getKeys(name);
    try {
        const [g, s, i, set] = await Promise.all([
            AsyncStorage.getItem(K.GOALS),
            AsyncStorage.getItem(K.STATS),
            AsyncStorage.getItem(K.INV),
            AsyncStorage.getItem(K.SETTINGS)
        ]);

        setUserName(name);
        setGoals(g ? JSON.parse(g) : []);
        setUserStats(s ? JSON.parse(s) : GamificationService.getInitialStats());
        setInventory(i ? JSON.parse(i) : []);
        if (set) setSettings(JSON.parse(set));
        
        await checkPunishment(name);
    } catch (e) {
        console.error("Error cargando datos", e);
    } finally {
        setLoading(false);
    }
  };

  const login = async (name: string): Promise<boolean> => {
      const K = getKeys(name);
      const settingsJson = await AsyncStorage.getItem(K.SETTINGS);
      const userSettings: UserSettings = settingsJson ? JSON.parse(settingsJson) : { sound: true, notifications: true, biometricsEnabled: false };

      if (userSettings.biometricsEnabled) {
          const hasHardware = await LocalAuthentication.hasHardwareAsync();
          if (hasHardware) {
              const auth = await LocalAuthentication.authenticateAsync({
                  promptMessage: `Identifícate, Arquitecto ${name}`,
                  fallbackLabel: 'Usar PIN del dispositivo'
              });
              if (!auth.success) {
                  Alert.alert("Acceso Denegado", "Biometría fallida.");
                  return false;
              }
          }
      }

      await AsyncStorage.setItem('FQ_LAST_USER', name);
      await loadUserData(name);
      return true;
  };

  const logout = async () => {
      setUserName(null);
      setGoals([]);
      setUserStats(GamificationService.getInitialStats());
      setInventory([]);
      await AsyncStorage.removeItem('FQ_LAST_USER');
  };

  const checkPunishment = async (currentName: string) => {
    const K = getKeys(currentName);
    const goalsJson = await AsyncStorage.getItem(K.GOALS);
    if (!goalsJson) return;

    let currentGoals: Goal[] = JSON.parse(goalsJson);
    const statsJson = await AsyncStorage.getItem(K.STATS);
    const invJson = await AsyncStorage.getItem(K.INV);
    
    let currentStats = statsJson ? JSON.parse(statsJson) : userStats;
    let currentInv: string[] = invJson ? JSON.parse(invJson) : [];
    
    const now = new Date();
    const missedGoals = currentGoals.filter(g => !g.isCompleted && !g.penaltyApplied && new Date(g.deadline) < now);

    if (missedGoals.length > 0) {
      const shieldIndex = currentInv.indexOf('1');
      const hasShield = shieldIndex !== -1;

      if (hasShield) {
          currentInv.splice(shieldIndex, 1);
          await AsyncStorage.setItem(K.INV, JSON.stringify(currentInv));
          setInventory(currentInv);

          const updatedGoals = currentGoals.map(g => {
            if (missedGoals.find(mg => mg.id === g.id)) {
              return { ...g, penaltyApplied: true, journal: [...g.journal, { date: new Date().toISOString(), text: "Salvado por Escudo", mood: 'neutral' as MoodType }] };
            }
            return g;
          });
          
          await AsyncStorage.setItem(K.GOALS, JSON.stringify(updatedGoals));
          setGoals(updatedGoals);
          Alert.alert("❄️ ESCUDO ACTIVADO", "Tus misiones vencidas fueron salvadas.");
          if (settings.sound) SoundManager.playSound('success'); 
          return; 
      }

      let xpLost = 0;
      const updatedGoals = currentGoals.map(g => {
        if (missedGoals.find(mg => mg.id === g.id)) {
          xpLost += (GAME_RULES?.XP_PENALTY_MISSED_DEADLINE || 50);
          return { ...g, penaltyApplied: true };
        }
        return g;
      });

      const newXp = Math.max(0, currentStats.xp - xpLost);
      const updatedStats = { ...currentStats, xp: newXp };

      await AsyncStorage.setItem(K.GOALS, JSON.stringify(updatedGoals));
      await AsyncStorage.setItem(K.STATS, JSON.stringify(updatedStats));
      
      setGoals(updatedGoals);
      setUserStats(updatedStats);
      setDamageReport({ xpLost, titles: missedGoals.map(g => g.title) });
      if (settings.sound) SoundManager.playSound('failure'); 
    }
  };

  const saveAll = async (newGoals: Goal[], newStats: UserStats, newInv?: string[], newSettings?: UserSettings) => {
    if (!userName) return;
    const K = getKeys(userName);
    
    setGoals(newGoals);
    setUserStats(newStats);
    await AsyncStorage.setItem(K.GOALS, JSON.stringify(newGoals));
    await AsyncStorage.setItem(K.STATS, JSON.stringify(newStats));
    
    if (newInv) {
      setInventory(newInv);
      await AsyncStorage.setItem(K.INV, JSON.stringify(newInv));
    }
    if (newSettings) {
        setSettings(newSettings);
        await AsyncStorage.setItem(K.SETTINGS, JSON.stringify(newSettings));
    }
  };

  const toggleSetting = async (key: keyof UserSettings) => {
      const newSettings = { ...settings, [key]: !settings[key] };
      setSettings(newSettings);
      if (userName) {
          const K = getKeys(userName);
          await AsyncStorage.setItem(K.SETTINGS, JSON.stringify(newSettings));
      }
      
      if (key === 'biometricsEnabled' && newSettings.biometricsEnabled) {
          const compatible = await LocalAuthentication.hasHardwareAsync();
          if (!compatible) {
              Alert.alert("Error", "Tu dispositivo no soporta biometría.");
              const reverted = { ...newSettings, biometricsEnabled: false };
              setSettings(reverted);
              if(userName) await AsyncStorage.setItem(getKeys(userName).SETTINGS, JSON.stringify(reverted));
          }
      }
  };
  
  const addGoal = async (title: string, type: GoalType, deadline: Date, category: Goal['category']) => {
    const createdAt = new Date().toISOString();
    let targetCheckIns = 1;
    if (type === 'weekly') targetCheckIns = 7; 
    if (type === 'monthly') targetCheckIns = 30; 

    const safeId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newGoal: Goal = {
      id: safeId, title, type, deadline: deadline.toISOString(), createdAt,
      targetCheckIns, currentCheckIns: 0, isCompleted: false, isArchived: false,
      streak: 0, lastCheckInDate: null, journal: [], category, penaltyApplied: false
    };

    if (type !== 'daily' && settings.notifications) {
        await NotificationManager.scheduleProgressAlerts(title, createdAt, deadline.toISOString());
    }

    const updatedGoals = [...goals, newGoal];
    await saveAll(updatedGoals, userStats);
    if (settings.sound) SoundManager.playSound('success'); 
  };

  // ELIMINAR Y EDITAR MISIONES
  const deleteGoal = async (id: string) => {
    Alert.alert("¿Eliminar Misión?", "Perderás el historial.", [
        { text: "Cancelar", style: "cancel" },
        { 
            text: "Eliminar", 
            style: "destructive",
            onPress: async () => {
                const newGoals = goals.filter(g => g.id !== id);
                await saveAll(newGoals, userStats);
                if (settings.sound) SoundManager.playSound('complete');
            }
        }
    ]);
  };

  const editGoal = async (id: string, newTitle: string) => {
      const newGoals = goals.map(g => {
          if (g.id === id) return { ...g, title: newTitle };
          return g;
      });
      await saveAll(newGoals, userStats);
  };

  const checkInGoal = async (id: string, journalEntry: JournalEntry): Promise<boolean> => {
    const goalIndex = goals.findIndex(g => g.id === id);
    if (goalIndex === -1) return false;
    const goal = goals[goalIndex];
    if (goal.isCompleted || hasActivityToday(goal)) {
        Alert.alert("🛑 Misión en Enfriamiento", "Ya registraste tu avance hoy.");
        return false;
    }

    const newCurrentCheckIns = goal.currentCheckIns + 1;
    const isCompleted = newCurrentCheckIns >= goal.targetCheckIns;
    let xpGained = isCompleted ? GamificationService.getXPValue(goal.type) : 15;
    
    if (settings.sound) {
        if (isCompleted) {
            SoundManager.playSound('levelUp');
            const praise = VICTORY_PRAISES[Math.floor(Math.random() * VICTORY_PRAISES.length)];
            setTimeout(() => SoundManager.speak(praise), 500); 
        } else {
            SoundManager.playSound('success');
            const praise = DAILY_PRAISES[Math.floor(Math.random() * DAILY_PRAISES.length)];
            setTimeout(() => SoundManager.speak(praise), 300);
        }
    }
    
    if (isPanicMode) { setIsPanicMode(false); xpGained += 50; }

    const potionIndex = inventory.indexOf('4');
    let currentInv = [...inventory];
    
    if (potionIndex !== -1) {
        xpGained *= 2; 
        currentInv.splice(potionIndex, 1);
        Alert.alert("🧪 POCIÓN CONSUMIDA", `¡Has ganado DOBLE XP (${xpGained})!`);
    }

    const updatedGoal = { 
        ...goal, 
        currentCheckIns: newCurrentCheckIns, 
        isCompleted, 
        completedAt: isCompleted ? new Date().toISOString() : undefined,
        lastCheckInDate: new Date().toISOString(),
        journal: [...goal.journal, journalEntry] 
    };
    
    const newGoals = [...goals];
    newGoals[goalIndex] = updatedGoal;
    
    await saveAll(newGoals, GamificationService.calculateProgress(userStats, xpGained), currentInv);
    return isCompleted; 
  };

  const failGoal = async (id: string, journalEntry: JournalEntry): Promise<void> => {
    const goalIndex = goals.findIndex(g => g.id === id);
    if (goalIndex === -1) return;
    const goal = goals[goalIndex];

    if (hasActivityToday(goal)) {
        Alert.alert("Ya registrado", "Ya marcaste esta misión por hoy.");
        return;
    }

    let updatedGoal: Goal;
    let newStats = { ...userStats };

    if (goal.type === 'daily') {
        updatedGoal = { ...goal, penaltyApplied: true, isCompleted: false, journal: [...goal.journal, journalEntry] };
    } else {
        const dailyPenalty = 20;
        const newXp = Math.max(0, userStats.xp - dailyPenalty);
        newStats = { ...userStats, xp: newXp };
        updatedGoal = { ...goal, journal: [...goal.journal, journalEntry] };
        Alert.alert("⚠️ DÍA FALLIDO", `Has perdido ${dailyPenalty} XP.`);
    }

    const newGoals = [...goals];
    newGoals[goalIndex] = updatedGoal;
    await saveAll(newGoals, newStats);
    if (settings.sound) {
        SoundManager.playSound('failure');
        SoundManager.speak("No te rindas.");
    }
  };

  const buyItem = async (itemId: string): Promise<boolean> => {
      const itemData = STORE_ITEMS?.find(i => i.id === itemId);
      const price = itemData ? itemData.price : 100; 
      if (userStats.xp >= price) {
          const newStats = { ...userStats, xp: userStats.xp - price };
          const newInv = [...inventory, itemId];
          await saveAll(goals, newStats, newInv);
          if (settings.sound) SoundManager.playSound('success');
          return true;
      }
      return false;
  };

  const togglePanicMode = () => { 
      setIsPanicMode(!isPanicMode); 
      if (settings.sound) SoundManager.speak(isPanicMode ? "Normalizando." : "Modo Rescate."); 
  };
  const clearDamageReport = () => setDamageReport(null);

  return (
    <AppContext.Provider value={{ 
      userName, login, logout, goals, userStats, loading, addGoal, checkInGoal, failGoal,
      deleteGoal, editGoal, // Exportamos funciones de gestión
      isPanicMode, togglePanicMode, buyItem, inventory, 
      damageReport, clearDamageReport, getTimeColor, hasActivityToday,
      settings, toggleSetting 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp debe usarse dentro de un AppProvider');
  return context;
};