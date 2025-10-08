import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, decimal, integer, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const todos = pgTable("todos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  text: text("text").notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // 繰り返しタスク設定
  repeatType: varchar("repeat_type", { enum: ["none", "daily", "weekly", "monthly"] }).default("none"),
  repeatDays: integer("repeat_days").array(), // 曜日指定（0-6、日曜日=0）
  repeatDate: integer("repeat_date"), // 月の日付指定（1-31）
  // 位置情報ベースのリマインダー
  location: text("location"), // 場所の名前
  locationLat: decimal("location_lat", { precision: 10, scale: 7 }), // 緯度
  locationLng: decimal("location_lng", { precision: 10, scale: 7 }), // 経度
  locationRadius: integer("location_radius").default(100), // 半径（メートル）
});

export const schedules = pgTable("schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  text: text("text").notNull(),
  date: varchar("date").notNull(),
  time: timestamp("time"),
  completed: boolean("completed").default(false).notNull(),
});

export const sleepRecords = pgTable("sleep_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: varchar("date").notNull(),
  bedtime: timestamp("bedtime").notNull(),
  wakeup: timestamp("wakeup").notNull(),
  duration: integer("duration").notNull(),
});

export const weightRecords = pgTable("weight_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: varchar("date").notNull(),
  weight: decimal("weight", { precision: 5, scale: 2 }).notNull(),
  height: decimal("height", { precision: 5, scale: 2 }),
  bodyFat: decimal("body_fat", { precision: 5, scale: 2 }),
});

export const mealRecords = pgTable("meal_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: varchar("date").notNull(),
  meal: varchar("meal", { enum: ["breakfast", "lunch", "dinner"] }).notNull(),
  food: text("food").notNull(),
  calories: integer("calories").notNull(),
});

export const diaryEntries = pgTable("diary_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: varchar("date").notNull(),
  content: text("content").notNull(),
  mood: varchar("mood"),
  photos: text("photos").array(),
});

export const dailyRoutines = pgTable("daily_routines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: varchar("date").notNull(),
  content: text("content").notNull(),
}, (table) => ({
  uniqueUserDate: unique().on(table.userId, table.date),
}));

export const monthlyGoals = pgTable("monthly_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  month: varchar("month").notNull(), // YYYY-MM形式
  goals: text("goals").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueUserMonth: unique().on(table.userId, table.month),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTodoSchema = createInsertSchema(todos).omit({
  id: true,
}).extend({
  createdAt: z.coerce.date().optional(),
});

export const insertScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
}).extend({
  time: z.coerce.date().optional(),
});

export const insertSleepRecordSchema = createInsertSchema(sleepRecords).omit({
  id: true,
}).extend({
  bedtime: z.coerce.date(),
  wakeup: z.coerce.date(),
});

export const insertWeightRecordSchema = createInsertSchema(weightRecords).omit({
  id: true,
});

export const insertMealRecordSchema = createInsertSchema(mealRecords).omit({
  id: true,
});

export const insertDiaryEntrySchema = createInsertSchema(diaryEntries).omit({
  id: true,
});

export const insertDailyRoutineSchema = createInsertSchema(dailyRoutines).omit({
  id: true,
});

export const insertMonthlyGoalSchema = createInsertSchema(monthlyGoals).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type Todo = typeof todos.$inferSelect;

export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Schedule = typeof schedules.$inferSelect;

export type InsertSleepRecord = z.infer<typeof insertSleepRecordSchema>;
export type SleepRecord = typeof sleepRecords.$inferSelect;

export type InsertWeightRecord = z.infer<typeof insertWeightRecordSchema>;
export type WeightRecord = typeof weightRecords.$inferSelect;

export type InsertMealRecord = z.infer<typeof insertMealRecordSchema>;
export type MealRecord = typeof mealRecords.$inferSelect;

export type InsertDiaryEntry = z.infer<typeof insertDiaryEntrySchema>;
export type DiaryEntry = typeof diaryEntries.$inferSelect;

export type InsertDailyRoutine = z.infer<typeof insertDailyRoutineSchema>;
export type DailyRoutine = typeof dailyRoutines.$inferSelect;

export type InsertMonthlyGoal = z.infer<typeof insertMonthlyGoalSchema>;
export type MonthlyGoal = typeof monthlyGoals.$inferSelect;
