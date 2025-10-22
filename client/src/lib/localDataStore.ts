import type {
  Todo,
  Schedule,
  SleepRecord,
  WeightRecord,
  MealRecord,
  DiaryEntry,
  DailyRoutine,
  MonthlyGoal,
  UserSettings,
  Link,
  InsertTodo,
  InsertSchedule,
  InsertSleepRecord,
  InsertWeightRecord,
  InsertMealRecord,
  InsertDiaryEntry,
  InsertDailyRoutine,
  InsertMonthlyGoal,
  InsertLink,
} from '../types/local';

// Helper function to revive Date objects from JSON
const reviveDates = (key: string, value: any): any => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
    return new Date(value);
  }
  return value;
};

// Helper to generate UUID
const generateId = (): string => {
  return crypto.randomUUID();
};

// Base class for local storage management
class LocalDataStore<T extends { id: string }> {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  getAll(): T[] {
    try {
      const item = window.localStorage.getItem(this.key);
      return item ? JSON.parse(item, reviveDates) : [];
    } catch (error) {
      console.error(`Error reading localStorage key "${this.key}":`, error);
      return [];
    }
  }

  getById(id: string): T | undefined {
    const items = this.getAll();
    return items.find(item => item.id === id);
  }

  create(data: Omit<T, 'id'>): T {
    const items = this.getAll();
    const newItem = { ...data, id: generateId() } as T;
    items.push(newItem);
    this.saveAll(items);
    return newItem;
  }

  update(id: string, data: Partial<T>): T | undefined {
    const items = this.getAll();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return undefined;
    
    items[index] = { ...items[index], ...data };
    this.saveAll(items);
    return items[index];
  }

  delete(id: string): boolean {
    const items = this.getAll();
    const filteredItems = items.filter(item => item.id !== id);
    if (filteredItems.length === items.length) return false;
    
    this.saveAll(filteredItems);
    return true;
  }

  private saveAll(items: T[]): void {
    try {
      window.localStorage.setItem(this.key, JSON.stringify(items));
    } catch (error) {
      console.error(`Error setting localStorage key "${this.key}":`, error);
    }
  }
}

// Specialized store for user settings (single object, not array)
class UserSettingsStore {
  private key = 'userSettings';
  private defaultSettings: UserSettings = {
    darkMode: false,
    themeColor: 'pink',
    pushNotifications: false,
  };

  get(): UserSettings {
    try {
      const item = window.localStorage.getItem(this.key);
      return item ? JSON.parse(item) : this.defaultSettings;
    } catch (error) {
      console.error(`Error reading localStorage key "${this.key}":`, error);
      return this.defaultSettings;
    }
  }

  update(data: Partial<UserSettings>): UserSettings {
    const current = this.get();
    const updated = { ...current, ...data };
    try {
      window.localStorage.setItem(this.key, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error(`Error setting localStorage key "${this.key}":`, error);
      return current;
    }
  }
}

// Export store instances
export const todoStore = new LocalDataStore<Todo>('todos');
export const scheduleStore = new LocalDataStore<Schedule>('schedules');
export const sleepRecordStore = new LocalDataStore<SleepRecord>('sleepRecords');
export const weightRecordStore = new LocalDataStore<WeightRecord>('weightRecords');
export const mealRecordStore = new LocalDataStore<MealRecord>('mealRecords');
export const diaryEntryStore = new LocalDataStore<DiaryEntry>('diaryEntries');
export const dailyRoutineStore = new LocalDataStore<DailyRoutine>('dailyRoutines');
export const monthlyGoalStore = new LocalDataStore<MonthlyGoal>('monthlyGoals');
export const linkStore = new LocalDataStore<Link>('links');
export const userSettingsStore = new UserSettingsStore();

// Export types for convenience
export type {
  Todo,
  Schedule,
  SleepRecord,
  WeightRecord,
  MealRecord,
  DiaryEntry,
  DailyRoutine,
  MonthlyGoal,
  UserSettings,
  Link,
  InsertTodo,
  InsertSchedule,
  InsertSleepRecord,
  InsertWeightRecord,
  InsertMealRecord,
  InsertDiaryEntry,
  InsertDailyRoutine,
  InsertMonthlyGoal,
  InsertLink,
};
