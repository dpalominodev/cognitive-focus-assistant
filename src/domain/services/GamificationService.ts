import { UserStats, GoalType } from '../models/types';
import { GAME_RULES } from '../../core/constants';

export class GamificationService {
  
  static calculateProgress(currentStats: UserStats, xpGained: number): UserStats {
    let newXp = currentStats.xp + xpGained;
    let newLevel = currentStats.level;
    
    // Obtenemos el tope del nivel actual
    let xpCeiling = this.getXPForLevel(newLevel);

    // Lógica para subir de nivel
    let safety = 0;
    while (newXp >= xpCeiling && safety < 50) {
      newLevel++;
      xpCeiling = this.getXPForLevel(newLevel);
      safety++;
    }
    return { ...currentStats, level: newLevel, xp: newXp };
  }

  // XP necesaria para COMPLETAR el nivel "level" y pasar al siguiente
  static getXPForLevel(level: number): number {
    const base = GAME_RULES?.LEVEL_BASE || 450;
    const multiplier = GAME_RULES?.LEVEL_MULTIPLIER || 1.2;
    
    let totalXpNeeded = 0;
    for (let i = 1; i <= level; i++) {
        totalXpNeeded += Math.floor(base * Math.pow(multiplier, i - 1));
    }
    return totalXpNeeded;
  }
  
  // XP que da cada misión
  static getXPValue(type: GoalType): number {
    switch (type) {
      case 'weekly': return GAME_RULES?.XP_WEEKLY_COMPLETE || 150;
      case 'monthly': return GAME_RULES?.XP_MONTHLY_COMPLETE || 500;
      case 'daily': default: return GAME_RULES?.XP_DAILY_CHECK || 50;
    }
  }

  static getInitialStats(): UserStats {
    return {
      level: 1,
      xp: 0,
      totalFocusTime: 0,
      currentStreak: 0,
      longestStreak: 0,
      dailyGoalsCompleted: 0,
      weeklyGoalsCompleted: 0,
      monthlyGoalsCompleted: 0,
    };
  }
}