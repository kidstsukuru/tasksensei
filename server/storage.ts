import { 
  type User, type InsertUser,
  type Todo, type InsertTodo,
  type Schedule, type InsertSchedule,
  type SleepRecord, type InsertSleepRecord,
  type WeightRecord, type InsertWeightRecord,
  type MealRecord, type InsertMealRecord,
  type DiaryEntry, type InsertDiaryEntry
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Todo methods
  getTodosByUserId(userId: string): Promise<Todo[]>;
  getTodo(id: string): Promise<Todo | undefined>;
  createTodo(todo: InsertTodo): Promise<Todo>;
  updateTodo(id: string, todo: Partial<InsertTodo>): Promise<Todo | undefined>;
  deleteTodo(id: string): Promise<boolean>;
  
  // Schedule methods
  getSchedulesByUserId(userId: string): Promise<Schedule[]>;
  getSchedule(id: string): Promise<Schedule | undefined>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: string, schedule: Partial<InsertSchedule>): Promise<Schedule | undefined>;
  deleteSchedule(id: string): Promise<boolean>;
  
  // Sleep record methods
  getSleepRecordsByUserId(userId: string): Promise<SleepRecord[]>;
  getSleepRecord(id: string): Promise<SleepRecord | undefined>;
  createSleepRecord(sleepRecord: InsertSleepRecord): Promise<SleepRecord>;
  updateSleepRecord(id: string, sleepRecord: Partial<InsertSleepRecord>): Promise<SleepRecord | undefined>;
  deleteSleepRecord(id: string): Promise<boolean>;
  
  // Weight record methods
  getWeightRecordsByUserId(userId: string): Promise<WeightRecord[]>;
  getWeightRecord(id: string): Promise<WeightRecord | undefined>;
  createWeightRecord(weightRecord: InsertWeightRecord): Promise<WeightRecord>;
  updateWeightRecord(id: string, weightRecord: Partial<InsertWeightRecord>): Promise<WeightRecord | undefined>;
  deleteWeightRecord(id: string): Promise<boolean>;
  
  // Meal record methods
  getMealRecordsByUserId(userId: string): Promise<MealRecord[]>;
  getMealRecord(id: string): Promise<MealRecord | undefined>;
  createMealRecord(mealRecord: InsertMealRecord): Promise<MealRecord>;
  updateMealRecord(id: string, mealRecord: Partial<InsertMealRecord>): Promise<MealRecord | undefined>;
  deleteMealRecord(id: string): Promise<boolean>;
  
  // Diary entry methods
  getDiaryEntriesByUserId(userId: string): Promise<DiaryEntry[]>;
  getDiaryEntry(id: string): Promise<DiaryEntry | undefined>;
  createDiaryEntry(diaryEntry: InsertDiaryEntry): Promise<DiaryEntry>;
  updateDiaryEntry(id: string, diaryEntry: Partial<InsertDiaryEntry>): Promise<DiaryEntry | undefined>;
  deleteDiaryEntry(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private todos: Map<string, Todo>;
  private schedules: Map<string, Schedule>;
  private sleepRecords: Map<string, SleepRecord>;
  private weightRecords: Map<string, WeightRecord>;
  private mealRecords: Map<string, MealRecord>;
  private diaryEntries: Map<string, DiaryEntry>;

  constructor() {
    this.users = new Map();
    this.todos = new Map();
    this.schedules = new Map();
    this.sleepRecords = new Map();
    this.weightRecords = new Map();
    this.mealRecords = new Map();
    this.diaryEntries = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Todo methods
  async getTodosByUserId(userId: string): Promise<Todo[]> {
    return Array.from(this.todos.values()).filter(todo => todo.userId === userId);
  }

  async getTodo(id: string): Promise<Todo | undefined> {
    return this.todos.get(id);
  }

  async createTodo(insertTodo: InsertTodo): Promise<Todo> {
    const id = randomUUID();
    const todo: Todo = { 
      ...insertTodo, 
      id,
      completed: insertTodo.completed ?? false,
      createdAt: insertTodo.createdAt ?? new Date()
    };
    this.todos.set(id, todo);
    return todo;
  }

  async updateTodo(id: string, todoUpdate: Partial<InsertTodo>): Promise<Todo | undefined> {
    const existingTodo = this.todos.get(id);
    if (!existingTodo) return undefined;
    
    const updatedTodo: Todo = { ...existingTodo, ...todoUpdate };
    this.todos.set(id, updatedTodo);
    return updatedTodo;
  }

  async deleteTodo(id: string): Promise<boolean> {
    return this.todos.delete(id);
  }

  // Schedule methods
  async getSchedulesByUserId(userId: string): Promise<Schedule[]> {
    return Array.from(this.schedules.values()).filter(schedule => schedule.userId === userId);
  }

  async getSchedule(id: string): Promise<Schedule | undefined> {
    return this.schedules.get(id);
  }

  async createSchedule(insertSchedule: InsertSchedule): Promise<Schedule> {
    const id = randomUUID();
    const schedule: Schedule = { 
      ...insertSchedule, 
      id,
      completed: insertSchedule.completed ?? false,
      time: insertSchedule.time ?? null
    };
    this.schedules.set(id, schedule);
    return schedule;
  }

  async updateSchedule(id: string, scheduleUpdate: Partial<InsertSchedule>): Promise<Schedule | undefined> {
    const existingSchedule = this.schedules.get(id);
    if (!existingSchedule) return undefined;
    
    const updatedSchedule: Schedule = { ...existingSchedule, ...scheduleUpdate };
    this.schedules.set(id, updatedSchedule);
    return updatedSchedule;
  }

  async deleteSchedule(id: string): Promise<boolean> {
    return this.schedules.delete(id);
  }

  // Sleep record methods
  async getSleepRecordsByUserId(userId: string): Promise<SleepRecord[]> {
    return Array.from(this.sleepRecords.values()).filter(record => record.userId === userId);
  }

  async getSleepRecord(id: string): Promise<SleepRecord | undefined> {
    return this.sleepRecords.get(id);
  }

  async createSleepRecord(insertSleepRecord: InsertSleepRecord): Promise<SleepRecord> {
    const id = randomUUID();
    const sleepRecord: SleepRecord = { ...insertSleepRecord, id };
    this.sleepRecords.set(id, sleepRecord);
    return sleepRecord;
  }

  async updateSleepRecord(id: string, sleepRecordUpdate: Partial<InsertSleepRecord>): Promise<SleepRecord | undefined> {
    const existingSleepRecord = this.sleepRecords.get(id);
    if (!existingSleepRecord) return undefined;
    
    const updatedSleepRecord: SleepRecord = { ...existingSleepRecord, ...sleepRecordUpdate };
    this.sleepRecords.set(id, updatedSleepRecord);
    return updatedSleepRecord;
  }

  async deleteSleepRecord(id: string): Promise<boolean> {
    return this.sleepRecords.delete(id);
  }

  // Weight record methods
  async getWeightRecordsByUserId(userId: string): Promise<WeightRecord[]> {
    return Array.from(this.weightRecords.values()).filter(record => record.userId === userId);
  }

  async getWeightRecord(id: string): Promise<WeightRecord | undefined> {
    return this.weightRecords.get(id);
  }

  async createWeightRecord(insertWeightRecord: InsertWeightRecord): Promise<WeightRecord> {
    const id = randomUUID();
    const weightRecord: WeightRecord = { 
      ...insertWeightRecord, 
      id,
      bodyFat: insertWeightRecord.bodyFat ?? null
    };
    this.weightRecords.set(id, weightRecord);
    return weightRecord;
  }

  async updateWeightRecord(id: string, weightRecordUpdate: Partial<InsertWeightRecord>): Promise<WeightRecord | undefined> {
    const existingWeightRecord = this.weightRecords.get(id);
    if (!existingWeightRecord) return undefined;
    
    const updatedWeightRecord: WeightRecord = { ...existingWeightRecord, ...weightRecordUpdate };
    this.weightRecords.set(id, updatedWeightRecord);
    return updatedWeightRecord;
  }

  async deleteWeightRecord(id: string): Promise<boolean> {
    return this.weightRecords.delete(id);
  }

  // Meal record methods
  async getMealRecordsByUserId(userId: string): Promise<MealRecord[]> {
    return Array.from(this.mealRecords.values()).filter(record => record.userId === userId);
  }

  async getMealRecord(id: string): Promise<MealRecord | undefined> {
    return this.mealRecords.get(id);
  }

  async createMealRecord(insertMealRecord: InsertMealRecord): Promise<MealRecord> {
    const id = randomUUID();
    const mealRecord: MealRecord = { ...insertMealRecord, id };
    this.mealRecords.set(id, mealRecord);
    return mealRecord;
  }

  async updateMealRecord(id: string, mealRecordUpdate: Partial<InsertMealRecord>): Promise<MealRecord | undefined> {
    const existingMealRecord = this.mealRecords.get(id);
    if (!existingMealRecord) return undefined;
    
    const updatedMealRecord: MealRecord = { ...existingMealRecord, ...mealRecordUpdate };
    this.mealRecords.set(id, updatedMealRecord);
    return updatedMealRecord;
  }

  async deleteMealRecord(id: string): Promise<boolean> {
    return this.mealRecords.delete(id);
  }

  // Diary entry methods
  async getDiaryEntriesByUserId(userId: string): Promise<DiaryEntry[]> {
    return Array.from(this.diaryEntries.values()).filter(entry => entry.userId === userId);
  }

  async getDiaryEntry(id: string): Promise<DiaryEntry | undefined> {
    return this.diaryEntries.get(id);
  }

  async createDiaryEntry(insertDiaryEntry: InsertDiaryEntry): Promise<DiaryEntry> {
    const id = randomUUID();
    const diaryEntry: DiaryEntry = { 
      ...insertDiaryEntry, 
      id,
      mood: insertDiaryEntry.mood ?? null,
      photos: insertDiaryEntry.photos ?? null
    };
    this.diaryEntries.set(id, diaryEntry);
    return diaryEntry;
  }

  async updateDiaryEntry(id: string, diaryEntryUpdate: Partial<InsertDiaryEntry>): Promise<DiaryEntry | undefined> {
    const existingDiaryEntry = this.diaryEntries.get(id);
    if (!existingDiaryEntry) return undefined;
    
    const updatedDiaryEntry: DiaryEntry = { ...existingDiaryEntry, ...diaryEntryUpdate };
    this.diaryEntries.set(id, updatedDiaryEntry);
    return updatedDiaryEntry;
  }

  async deleteDiaryEntry(id: string): Promise<boolean> {
    return this.diaryEntries.delete(id);
  }
}

export const storage = new MemStorage();
