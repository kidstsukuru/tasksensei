export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export interface Schedule {
  id: number;
  text: string;
  date: string;
  time?: Date;
  completed: boolean;
}

export interface SleepRecord {
  id: number;
  date: string;
  bedtime: Date;
  wakeup: Date;
  duration: number;
}

export interface WeightRecord {
  id: number;
  date: string;
  weight: number;
  bodyFat?: number;
}

export interface MealRecord {
  id: number;
  date: string;
  meal: 'breakfast' | 'lunch' | 'dinner';
  food: string;
  calories: number;
}

export interface DiaryEntry {
  id: number;
  date: string;
  content: string;
  mood?: string;
  photos?: string[];
}

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
  pendingBedtime: Date | null;
  pendingWakeupTime: Date | null;
  todos: Todo[];
  schedules: Schedule[];
  sleepRecords: SleepRecord[];
  weightRecords: WeightRecord[];
  mealRecords: MealRecord[];
  diaryEntries: DiaryEntry[];
}
