// Local storage types (without userId and database-specific fields)

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  repeatType?: "none" | "daily" | "weekly" | "monthly" | null;
  repeatDays?: number[] | null;
  repeatDate?: number | null;
  location?: string | null;
  locationLat?: string | null;
  locationLng?: string | null;
  locationRadius?: number | null;
}

export interface Schedule {
  id: string;
  text: string;
  date: string;
  time?: Date | null;
  completed: boolean;
}

export interface WeightRecord {
  id: string;
  date: string;
  weight: number;
  height?: number | null;
  bodyFat?: number | null;
}

export interface MealRecord {
  id: string;
  date: string;
  meal: "breakfast" | "lunch" | "dinner";
  food: string;
  calories: number;
}

export interface DiaryEntry {
  id: string;
  date: string;
  content: string;
  mood?: string | null;
  photos?: string[] | null;
}

export interface DailyRoutine {
  id: string;
  date: string;
  content: string;
}

export interface MonthlyGoal {
  id: string;
  month: string;
  weightGoals?: string[];      // 体重目標リスト
  todoGoals?: string[];         // やるべきことリスト
  achievementGoals?: string[];  // 達成したい目標リスト
  activityGoals?: string[];     // 部活動や仕事などでの目標リスト
  weightGoalsCompleted?: boolean[];      // 体重目標達成状態リスト
  todoGoalsCompleted?: boolean[];         // やるべきこと達成状態リスト
  achievementGoalsCompleted?: boolean[];  // 達成したい目標達成状態リスト
  activityGoalsCompleted?: boolean[];     // 部活動や仕事などでの目標達成状態リスト
  createdAt: Date;
}

export interface UserSettings {
  darkMode: boolean;
  themeColor: string;
  pushNotifications: boolean;
}

export interface Link {
  id: string;
  title: string;
  url: string;
  category?: string | null;
  createdAt: Date;
}

// Insert types (omit id and auto-generated fields)
export type InsertTodo = Omit<Todo, 'id' | 'createdAt'> & { createdAt?: Date };
export type InsertSchedule = Omit<Schedule, 'id'>;
export type InsertWeightRecord = Omit<WeightRecord, 'id'>;
export type InsertMealRecord = Omit<MealRecord, 'id'>;
export type InsertDiaryEntry = Omit<DiaryEntry, 'id'>;
export type InsertDailyRoutine = Omit<DailyRoutine, 'id'>;
export type InsertMonthlyGoal = Omit<MonthlyGoal, 'id' | 'createdAt'> & { createdAt?: Date };
export type InsertLink = Omit<Link, 'id' | 'createdAt'> & { createdAt?: Date };

export interface PomodoroState {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  mode: 'pomodoro' | 'shortBreak' | 'longBreak';
  interval?: NodeJS.Timeout;
}

export interface AppState {
  currentScreen: string;
  todoVisible: boolean;
  pomodoro: PomodoroState;
  todos: Todo[];
  schedules: Schedule[];
  weightRecords: WeightRecord[];
  mealRecords: MealRecord[];
  diaryEntries: DiaryEntry[];
}
