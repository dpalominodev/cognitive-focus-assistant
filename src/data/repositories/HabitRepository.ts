import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, IHabitRepository } from '../../domain/models/types';
import { STORAGE_KEYS } from '../../core/constants';

export class HabitRepository implements IHabitRepository {
  
  async getAll(): Promise<Habit[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.HABITS);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Error crítico leyendo hábitos:', error);
      throw new Error('No se pudieron cargar tus hábitos. Intenta reiniciar.');
    }
  }

  // 2. Obtener un hábito por ID
  async getById(id: string): Promise<Habit | null> {
    try {
      const allHabits = await this.getAll();
      const found = allHabits.find(h => h.id === id);
      return found || null;
    } catch (error) {
      console.error(`Error buscando hábito ${id}:`, error);
      return null;
    }
  }

  // 3. Crear nuevo hábito 
  async create(habit: Habit): Promise<void> {
    return this.save(habit);
  }

  // 4. Actualizar hábito
  async update(habit: Habit): Promise<void> {
    return this.save(habit);
  }

  // 5. Eliminar hábito
  async delete(id: string): Promise<void> {
    try {
      const currentHabits = await this.getAll();
      const filteredHabits = currentHabits.filter(h => h.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(filteredHabits));
    } catch (e) {
      console.error('Error eliminando hábito:', e);
      throw new Error('No se pudo eliminar el hábito.');
    }
  }

  async save(habit: Habit): Promise<void> {
    try {
      const currentHabits = await this.getAll();
      
      const index = currentHabits.findIndex(h => h.id === habit.id);
      
      if (index >= 0) {
        // Actualizar existente
        currentHabits[index] = habit;
      } else {
        // Crear nuevo
        currentHabits.push(habit);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(currentHabits));
    } catch (e) {
      console.error('Error guardando hábito:', e);
      throw new Error('Fallo al guardar. Tus datos están seguros, pero esta acción falló.');
    }
  }
}