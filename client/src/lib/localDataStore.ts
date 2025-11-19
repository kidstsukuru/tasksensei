import type {
  Todo,
  Schedule,
  WeightRecord,
  MealRecord,
  DiaryEntry,
  DailyRoutine,
  MonthlyGoal,
  WeeklyGoal,
  UserSettings,
  Link,
  InsertTodo,
  InsertSchedule,
  InsertWeightRecord,
  InsertMealRecord,
  InsertDiaryEntry,
  InsertDailyRoutine,
  InsertMonthlyGoal,
  InsertWeeklyGoal,
  InsertLink,
} from '../types/local';

// Helper function to revive Date objects from JSON
// Supports multiple ISO-8601 formats:
// - YYYY-MM-DDTHH:mm:ss.fffZ (with milliseconds)
// - YYYY-MM-DDTHH:mm:ssZ (without milliseconds)
// - YYYY-MM-DDTHH:mm:ss.fff±HH:mm (with timezone offset)
// - YYYY-MM-DDTHH:mm:ss±HH:mm (timezone offset, no milliseconds)
const reviveDates = (key: string, value: any): any => {
  if (typeof value === 'string') {
    // Check if the string looks like an ISO-8601 date
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})?$/;
    if (iso8601Regex.test(value)) {
      const date = new Date(value);
      // Verify it's a valid date
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
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

// Specialized store for monthly goals with legacy data migration
class MonthlyGoalDataStore extends LocalDataStore<MonthlyGoal> {
  constructor(key: string) {
    super(key);
  }

  // Override getAll to migrate legacy scalar fields to arrays
  getAll(): MonthlyGoal[] {
    const items = super.getAll();
    let needsMigration = false;

    const migratedItems = items.map((item: any) => {
      const migrated: MonthlyGoal = { ...item };
      
      // Migrate weightGoal (scalar) to weightGoals (array)
      if (item.weightGoal && !item.weightGoals) {
        migrated.weightGoals = [item.weightGoal];
        migrated.weightGoalsCompleted = item.weightGoalCompleted ? [item.weightGoalCompleted] : [false];
        delete (migrated as any).weightGoal;
        delete (migrated as any).weightGoalCompleted;
        needsMigration = true;
      }
      
      // Migrate todoGoal (scalar) to todoGoals (array)
      if (item.todoGoal && !item.todoGoals) {
        migrated.todoGoals = [item.todoGoal];
        migrated.todoGoalsCompleted = item.todoGoalCompleted ? [item.todoGoalCompleted] : [false];
        delete (migrated as any).todoGoal;
        delete (migrated as any).todoGoalCompleted;
        needsMigration = true;
      }
      
      // Migrate achievementGoal (scalar) to achievementGoals (array)
      if (item.achievementGoal && !item.achievementGoals) {
        migrated.achievementGoals = [item.achievementGoal];
        migrated.achievementGoalsCompleted = item.achievementGoalCompleted ? [item.achievementGoalCompleted] : [false];
        delete (migrated as any).achievementGoal;
        delete (migrated as any).achievementGoalCompleted;
        needsMigration = true;
      }
      
      // Migrate activityGoal (scalar) to activityGoals (array)
      if (item.activityGoal && !item.activityGoals) {
        migrated.activityGoals = [item.activityGoal];
        migrated.activityGoalsCompleted = item.activityGoalCompleted ? [item.activityGoalCompleted] : [false];
        delete (migrated as any).activityGoal;
        delete (migrated as any).activityGoalCompleted;
        needsMigration = true;
      }
      
      return migrated;
    });

    // If any items were migrated, save the updated data
    if (needsMigration) {
      try {
        window.localStorage.setItem('monthlyGoals', JSON.stringify(migratedItems));
        console.log('Monthly goals migrated from scalar to array format');
      } catch (error) {
        console.error('Error saving migrated monthly goals:', error);
      }
    }

    return migratedItems;
  }
}

// Specialized store for weekly goals with legacy data migration
class WeeklyGoalDataStore extends LocalDataStore<WeeklyGoal> {
  constructor(key: string) {
    super(key);
  }

  // Override getAll to migrate legacy scalar fields to arrays
  getAll(): WeeklyGoal[] {
    const items = super.getAll();
    let needsMigration = false;

    const migratedItems = items.map((item: any) => {
      const migrated: WeeklyGoal = { ...item };
      
      // Migrate weightGoal (scalar) to weightGoals (array)
      if (item.weightGoal && !item.weightGoals) {
        migrated.weightGoals = [item.weightGoal];
        migrated.weightGoalsCompleted = item.weightGoalCompleted ? [item.weightGoalCompleted] : [false];
        delete (migrated as any).weightGoal;
        delete (migrated as any).weightGoalCompleted;
        needsMigration = true;
      }
      
      // Migrate todoGoal (scalar) to todoGoals (array)
      if (item.todoGoal && !item.todoGoals) {
        migrated.todoGoals = [item.todoGoal];
        migrated.todoGoalsCompleted = item.todoGoalCompleted ? [item.todoGoalCompleted] : [false];
        delete (migrated as any).todoGoal;
        delete (migrated as any).todoGoalCompleted;
        needsMigration = true;
      }
      
      // Migrate achievementGoal (scalar) to achievementGoals (array)
      if (item.achievementGoal && !item.achievementGoals) {
        migrated.achievementGoals = [item.achievementGoal];
        migrated.achievementGoalsCompleted = item.achievementGoalCompleted ? [item.achievementGoalCompleted] : [false];
        delete (migrated as any).achievementGoal;
        delete (migrated as any).achievementGoalCompleted;
        needsMigration = true;
      }
      
      // Migrate activityGoal (scalar) to activityGoals (array)
      if (item.activityGoal && !item.activityGoals) {
        migrated.activityGoals = [item.activityGoal];
        migrated.activityGoalsCompleted = item.activityGoalCompleted ? [item.activityGoalCompleted] : [false];
        delete (migrated as any).activityGoal;
        delete (migrated as any).activityGoalCompleted;
        needsMigration = true;
      }
      
      return migrated;
    });

    // If any items were migrated, save the updated data
    if (needsMigration) {
      try {
        window.localStorage.setItem('weeklyGoals', JSON.stringify(migratedItems));
        console.log('Weekly goals migrated from scalar to array format');
      } catch (error) {
        console.error('Error saving migrated weekly goals:', error);
      }
    }

    return migratedItems;
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
export const weightRecordStore = new LocalDataStore<WeightRecord>('weightRecords');
export const mealRecordStore = new LocalDataStore<MealRecord>('mealRecords');
export const diaryEntryStore = new LocalDataStore<DiaryEntry>('diaryEntries');
export const dailyRoutineStore = new LocalDataStore<DailyRoutine>('dailyRoutines');
export const monthlyGoalStore = new MonthlyGoalDataStore('monthlyGoals');
export const weeklyGoalStore = new WeeklyGoalDataStore('weeklyGoals');
export const linkStore = new LocalDataStore<Link>('links');
export const userSettingsStore = new UserSettingsStore();

// Export types for convenience
export type {
  Todo,
  Schedule,
  WeightRecord,
  MealRecord,
  DiaryEntry,
  DailyRoutine,
  MonthlyGoal,
  WeeklyGoal,
  UserSettings,
  Link,
  InsertTodo,
  InsertSchedule,
  InsertWeightRecord,
  InsertMealRecord,
  InsertDiaryEntry,
  InsertDailyRoutine,
  InsertMonthlyGoal,
  InsertWeeklyGoal,
  InsertLink,
};
