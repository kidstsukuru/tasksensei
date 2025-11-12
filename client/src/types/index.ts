// Import types from shared schema to ensure consistency between frontend and backend
import type {
  Todo,
  Schedule,
  WeightRecord,
  MealRecord,
  DiaryEntry,
  DailyRoutine,
  MonthlyGoal,
  Link,
  InsertTodo,
  InsertSchedule,
  InsertWeightRecord,
  InsertMealRecord,
  InsertDiaryEntry,
  InsertDailyRoutine,
  InsertMonthlyGoal,
  InsertLink
} from '@shared/schema';

// Re-export for other components
export type {
  Todo,
  Schedule,
  WeightRecord,
  MealRecord,
  DiaryEntry,
  DailyRoutine,
  MonthlyGoal,
  Link,
  InsertTodo,
  InsertSchedule,
  InsertWeightRecord,
  InsertMealRecord,
  InsertDiaryEntry,
  InsertDailyRoutine,
  InsertMonthlyGoal,
  InsertLink
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
  todos: Todo[];
  schedules: Schedule[];
  weightRecords: WeightRecord[];
  mealRecords: MealRecord[];
  diaryEntries: DiaryEntry[];
}
