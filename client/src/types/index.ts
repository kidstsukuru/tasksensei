// Import types from shared schema to ensure consistency between frontend and backend
import type {
  Todo,
  Schedule,
  SleepRecord,
  WeightRecord,
  MealRecord,
  DiaryEntry,
  DailyRoutine,
  InsertTodo,
  InsertSchedule,
  InsertSleepRecord,
  InsertWeightRecord,
  InsertMealRecord,
  InsertDiaryEntry,
  InsertDailyRoutine
} from '@shared/schema';

// Re-export for other components
export type {
  Todo,
  Schedule,
  SleepRecord,
  WeightRecord,
  MealRecord,
  DiaryEntry,
  DailyRoutine,
  InsertTodo,
  InsertSchedule,
  InsertSleepRecord,
  InsertWeightRecord,
  InsertMealRecord,
  InsertDiaryEntry,
  InsertDailyRoutine
};

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
