export const STORAGE_KEYS = {
  GOALS: 'FOCUS_QUEST_GOALS',
  USER_STATS: 'FOCUS_QUEST_STATS',
  INVENTORY: 'FOCUS_QUEST_INVENTORY',
  THEME: 'FOCUS_QUEST_THEME',
  HABITS: 'cfa_habits_v1',
};

// REGLAS DE GAMIFICACIÓN
export const GAME_RULES = {
  LEVEL_BASE: 450,             // XP necesaria para nivel 1
  LEVEL_MULTIPLIER: 1.2,       // Dificultad incremental
  
  // Recompensas
  XP_DAILY_CHECK: 50,          // XP por misión diaria
  XP_WEEKLY_COMPLETE: 150,     // XP por misión semanal
  XP_MONTHLY_COMPLETE: 500,    // XP por misión mensual
  
  // Castigos
  XP_PENALTY_MISSED_DEADLINE: 50,
};

export const STORE_ITEMS = [
  { id: 'freeze', name: 'Congelar Racha', price: 200, icon: 'snowflake' },
  { id: 'potion', name: 'Poción de Foco', price: 150, icon: 'bottle-tonic' },
];

export const API_TIMEOUT = 15000;