import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, decimal, integer } from "drizzle-orm/pg-core";
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTodoSchema = createInsertSchema(todos).omit({
  id: true,
});

export const insertScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
});

export const insertSleepRecordSchema = createInsertSchema(sleepRecords).omit({
  id: true,
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
