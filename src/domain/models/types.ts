export type GoalType = 'daily' | 'weekly' | 'monthly';
export type MoodType = 'fire' | 'happy' | 'neutral' | 'tired' | 'stressed';

export interface JournalEntry {
  date: string;
  text: string;
  mood: MoodType;
}

export interface Goal {
  id: string;
  title: string;
  type: GoalType;
  
  // Lógica de Tiempo
  deadline: string;
  createdAt: string;
  
  // Lógica de Frecuencia
  targetCheckIns: number; 
  currentCheckIns: number;
  
  // Estado de la misión
  isCompleted: boolean;
  isArchived: boolean;
  streak: number;
  
  // Historial
  lastCheckInDate: string | null;
  journal: JournalEntry[];
  
  category: 'health' | 'work' | 'learning' | 'mindset';
  
  penaltyApplied?: boolean;

  completedAt?: string;
}

export interface UserStats {
  level: number;
  xp: number;
  totalFocusTime: number;

  currentStreak: number; // Racha de días seguidos usando la app
  longestStreak: number; // Récord histórico
  lastActiveDate?: string; // Para calcular la racha
  
  // Métricas avanzadas
  dailyGoalsCompleted: number;
  weeklyGoalsCompleted: number;
  monthlyGoalsCompleted: number;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly';
  targetCount: number; 
  currentCount: number;
  streak: number;
  completedDates: string[];
  createdAt: number;
  updatedAt: number;
}

export interface IHabitRepository {
  getAll(): Promise<Habit[]>;
  getById(id: string): Promise<Habit | null>;
  create(habit: Habit): Promise<void>;
  update(habit: Habit): Promise<void>;
  delete(id: string): Promise<void>;
}