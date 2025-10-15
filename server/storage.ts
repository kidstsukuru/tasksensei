import { 
  type User, type InsertUser,
  type Todo, type InsertTodo,
  type Schedule, type InsertSchedule,
  type SleepRecord, type InsertSleepRecord,
  type WeightRecord, type InsertWeightRecord,
  type MealRecord, type InsertMealRecord,
  type DiaryEntry, type InsertDiaryEntry,
  type DailyRoutine, type InsertDailyRoutine,
  type MonthlyGoal, type InsertMonthlyGoal,
  type UserSettings, type InsertUserSettings,
  type Link, type InsertLink,
  users, todos, schedules, sleepRecords, weightRecords, mealRecords, diaryEntries, dailyRoutines, monthlyGoals, userSettings, links
} from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and } from "drizzle-orm";

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
  updateTodo(id: string, todo: Partial<Omit<InsertTodo, 'id' | 'userId'>>): Promise<Todo | undefined>;
  deleteTodo(id: string): Promise<boolean>;
  
  // Schedule methods
  getSchedulesByUserId(userId: string): Promise<Schedule[]>;
  getSchedule(id: string): Promise<Schedule | undefined>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: string, schedule: Partial<Omit<InsertSchedule, 'id' | 'userId'>>): Promise<Schedule | undefined>;
  deleteSchedule(id: string): Promise<boolean>;
  
  // Sleep record methods
  getSleepRecordsByUserId(userId: string): Promise<SleepRecord[]>;
  getSleepRecord(id: string): Promise<SleepRecord | undefined>;
  createSleepRecord(sleepRecord: InsertSleepRecord): Promise<SleepRecord>;
  updateSleepRecord(id: string, sleepRecord: Partial<Omit<InsertSleepRecord, 'id' | 'userId'>>): Promise<SleepRecord | undefined>;
  deleteSleepRecord(id: string): Promise<boolean>;
  
  // Weight record methods
  getWeightRecordsByUserId(userId: string): Promise<WeightRecord[]>;
  getWeightRecord(id: string): Promise<WeightRecord | undefined>;
  createWeightRecord(weightRecord: InsertWeightRecord): Promise<WeightRecord>;
  updateWeightRecord(id: string, weightRecord: Partial<Omit<InsertWeightRecord, 'id' | 'userId'>>): Promise<WeightRecord | undefined>;
  deleteWeightRecord(id: string): Promise<boolean>;
  
  // Meal record methods
  getMealRecordsByUserId(userId: string): Promise<MealRecord[]>;
  getMealRecord(id: string): Promise<MealRecord | undefined>;
  createMealRecord(mealRecord: InsertMealRecord): Promise<MealRecord>;
  updateMealRecord(id: string, mealRecord: Partial<Omit<InsertMealRecord, 'id' | 'userId'>>): Promise<MealRecord | undefined>;
  deleteMealRecord(id: string): Promise<boolean>;
  
  // Diary entry methods
  getDiaryEntriesByUserId(userId: string): Promise<DiaryEntry[]>;
  getDiaryEntry(id: string): Promise<DiaryEntry | undefined>;
  createDiaryEntry(diaryEntry: InsertDiaryEntry): Promise<DiaryEntry>;
  updateDiaryEntry(id: string, diaryEntry: Partial<Omit<InsertDiaryEntry, 'id' | 'userId'>>): Promise<DiaryEntry | undefined>;
  deleteDiaryEntry(id: string): Promise<boolean>;

  // Daily routine methods
  getDailyRoutinesByUserId(userId: string): Promise<DailyRoutine[]>;
  getDailyRoutineByUserIdAndDate(userId: string, date: string): Promise<DailyRoutine | undefined>;
  createDailyRoutine(dailyRoutine: InsertDailyRoutine): Promise<DailyRoutine>;
  updateDailyRoutine(id: string, dailyRoutine: Partial<Omit<InsertDailyRoutine, 'id' | 'userId'>>): Promise<DailyRoutine | undefined>;
  deleteDailyRoutine(id: string): Promise<boolean>;

  // Monthly goal methods
  getMonthlyGoalsByUserId(userId: string): Promise<MonthlyGoal[]>;
  getMonthlyGoalByUserIdAndMonth(userId: string, month: string): Promise<MonthlyGoal | undefined>;
  createMonthlyGoal(monthlyGoal: InsertMonthlyGoal): Promise<MonthlyGoal>;
  updateMonthlyGoal(id: string, monthlyGoal: Partial<Omit<InsertMonthlyGoal, 'id' | 'userId'>>): Promise<MonthlyGoal | undefined>;
  deleteMonthlyGoal(id: string): Promise<boolean>;

  // User settings methods
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(userId: string, settings: Partial<Omit<InsertUserSettings, 'id' | 'userId'>>): Promise<UserSettings | undefined>;

  // Link methods
  getLinksByUserId(userId: string): Promise<Link[]>;
  getLink(id: string): Promise<Link | undefined>;
  createLink(link: InsertLink): Promise<Link>;
  deleteLink(id: string): Promise<boolean>;

  // Export methods
  getAllUserData(userId: string): Promise<{
    todos: Todo[];
    schedules: Schedule[];
    sleepRecords: SleepRecord[];
    weightRecords: WeightRecord[];
    mealRecords: MealRecord[];
    diaryEntries: DiaryEntry[];
  }>;
}

// Database storage using DrizzleORM and PostgreSQL
export class DbStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
    
    // Log successful database connection
    console.log("✅ Database connection established successfully");
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Todo methods
  async getTodosByUserId(userId: string): Promise<Todo[]> {
    return await this.db.select().from(todos).where(eq(todos.userId, userId));
  }

  async getTodo(id: string): Promise<Todo | undefined> {
    const result = await this.db.select().from(todos).where(eq(todos.id, id));
    return result[0];
  }

  async createTodo(insertTodo: InsertTodo): Promise<Todo> {
    const result = await this.db.insert(todos).values(insertTodo).returning();
    return result[0];
  }

  async updateTodo(id: string, todoUpdate: Partial<Omit<InsertTodo, 'id' | 'userId'>>): Promise<Todo | undefined> {
    const result = await this.db.update(todos).set(todoUpdate).where(eq(todos.id, id)).returning();
    return result[0];
  }

  async deleteTodo(id: string): Promise<boolean> {
    const result = await this.db.delete(todos).where(eq(todos.id, id)).returning({ id: todos.id });
    return result.length > 0;
  }

  // Schedule methods
  async getSchedulesByUserId(userId: string): Promise<Schedule[]> {
    return await this.db.select().from(schedules).where(eq(schedules.userId, userId));
  }

  async getSchedule(id: string): Promise<Schedule | undefined> {
    const result = await this.db.select().from(schedules).where(eq(schedules.id, id));
    return result[0];
  }

  async createSchedule(insertSchedule: InsertSchedule): Promise<Schedule> {
    const result = await this.db.insert(schedules).values(insertSchedule).returning();
    return result[0];
  }

  async updateSchedule(id: string, scheduleUpdate: Partial<Omit<InsertSchedule, 'id' | 'userId'>>): Promise<Schedule | undefined> {
    const result = await this.db.update(schedules).set(scheduleUpdate).where(eq(schedules.id, id)).returning();
    return result[0];
  }

  async deleteSchedule(id: string): Promise<boolean> {
    const result = await this.db.delete(schedules).where(eq(schedules.id, id)).returning({ id: schedules.id });
    return result.length > 0;
  }

  // Sleep record methods
  async getSleepRecordsByUserId(userId: string): Promise<SleepRecord[]> {
    return await this.db.select().from(sleepRecords).where(eq(sleepRecords.userId, userId));
  }

  async getSleepRecord(id: string): Promise<SleepRecord | undefined> {
    const result = await this.db.select().from(sleepRecords).where(eq(sleepRecords.id, id));
    return result[0];
  }

  async createSleepRecord(insertSleepRecord: InsertSleepRecord): Promise<SleepRecord> {
    const result = await this.db.insert(sleepRecords).values(insertSleepRecord).returning();
    return result[0];
  }

  async updateSleepRecord(id: string, sleepRecordUpdate: Partial<Omit<InsertSleepRecord, 'id' | 'userId'>>): Promise<SleepRecord | undefined> {
    const result = await this.db.update(sleepRecords).set(sleepRecordUpdate).where(eq(sleepRecords.id, id)).returning();
    return result[0];
  }

  async deleteSleepRecord(id: string): Promise<boolean> {
    const result = await this.db.delete(sleepRecords).where(eq(sleepRecords.id, id)).returning({ id: sleepRecords.id });
    return result.length > 0;
  }

  // Weight record methods
  async getWeightRecordsByUserId(userId: string): Promise<WeightRecord[]> {
    return await this.db.select().from(weightRecords).where(eq(weightRecords.userId, userId));
  }

  async getWeightRecord(id: string): Promise<WeightRecord | undefined> {
    const result = await this.db.select().from(weightRecords).where(eq(weightRecords.id, id));
    return result[0];
  }

  async createWeightRecord(insertWeightRecord: InsertWeightRecord): Promise<WeightRecord> {
    const result = await this.db.insert(weightRecords).values(insertWeightRecord).returning();
    return result[0];
  }

  async updateWeightRecord(id: string, weightRecordUpdate: Partial<Omit<InsertWeightRecord, 'id' | 'userId'>>): Promise<WeightRecord | undefined> {
    const result = await this.db.update(weightRecords).set(weightRecordUpdate).where(eq(weightRecords.id, id)).returning();
    return result[0];
  }

  async deleteWeightRecord(id: string): Promise<boolean> {
    const result = await this.db.delete(weightRecords).where(eq(weightRecords.id, id)).returning({ id: weightRecords.id });
    return result.length > 0;
  }

  // Meal record methods
  async getMealRecordsByUserId(userId: string): Promise<MealRecord[]> {
    return await this.db.select().from(mealRecords).where(eq(mealRecords.userId, userId));
  }

  async getMealRecord(id: string): Promise<MealRecord | undefined> {
    const result = await this.db.select().from(mealRecords).where(eq(mealRecords.id, id));
    return result[0];
  }

  async createMealRecord(insertMealRecord: InsertMealRecord): Promise<MealRecord> {
    const result = await this.db.insert(mealRecords).values(insertMealRecord).returning();
    return result[0];
  }

  async updateMealRecord(id: string, mealRecordUpdate: Partial<Omit<InsertMealRecord, 'id' | 'userId'>>): Promise<MealRecord | undefined> {
    const result = await this.db.update(mealRecords).set(mealRecordUpdate).where(eq(mealRecords.id, id)).returning();
    return result[0];
  }

  async deleteMealRecord(id: string): Promise<boolean> {
    const result = await this.db.delete(mealRecords).where(eq(mealRecords.id, id)).returning({ id: mealRecords.id });
    return result.length > 0;
  }

  // Diary entry methods
  async getDiaryEntriesByUserId(userId: string): Promise<DiaryEntry[]> {
    return await this.db.select().from(diaryEntries).where(eq(diaryEntries.userId, userId));
  }

  async getDiaryEntry(id: string): Promise<DiaryEntry | undefined> {
    const result = await this.db.select().from(diaryEntries).where(eq(diaryEntries.id, id));
    return result[0];
  }

  async createDiaryEntry(insertDiaryEntry: InsertDiaryEntry): Promise<DiaryEntry> {
    const result = await this.db.insert(diaryEntries).values(insertDiaryEntry).returning();
    return result[0];
  }

  async updateDiaryEntry(id: string, diaryEntryUpdate: Partial<Omit<InsertDiaryEntry, 'id' | 'userId'>>): Promise<DiaryEntry | undefined> {
    const result = await this.db.update(diaryEntries).set(diaryEntryUpdate).where(eq(diaryEntries.id, id)).returning();
    return result[0];
  }

  async deleteDiaryEntry(id: string): Promise<boolean> {
    const result = await this.db.delete(diaryEntries).where(eq(diaryEntries.id, id)).returning({ id: diaryEntries.id });
    return result.length > 0;
  }

  // Daily routine methods
  async getDailyRoutinesByUserId(userId: string): Promise<DailyRoutine[]> {
    return await this.db.select().from(dailyRoutines).where(eq(dailyRoutines.userId, userId));
  }

  async getDailyRoutineByUserIdAndDate(userId: string, date: string): Promise<DailyRoutine | undefined> {
    const result = await this.db.select().from(dailyRoutines).where(
      and(
        eq(dailyRoutines.userId, userId),
        eq(dailyRoutines.date, date)
      )
    );
    return result[0];
  }

  async createDailyRoutine(insertDailyRoutine: InsertDailyRoutine): Promise<DailyRoutine> {
    const result = await this.db.insert(dailyRoutines).values(insertDailyRoutine).returning();
    return result[0];
  }

  async updateDailyRoutine(id: string, dailyRoutineUpdate: Partial<Omit<InsertDailyRoutine, 'id' | 'userId'>>): Promise<DailyRoutine | undefined> {
    const result = await this.db.update(dailyRoutines).set(dailyRoutineUpdate).where(eq(dailyRoutines.id, id)).returning();
    return result[0];
  }

  async deleteDailyRoutine(id: string): Promise<boolean> {
    const result = await this.db.delete(dailyRoutines).where(eq(dailyRoutines.id, id)).returning({ id: dailyRoutines.id });
    return result.length > 0;
  }

  // Monthly goal methods
  async getMonthlyGoalsByUserId(userId: string): Promise<MonthlyGoal[]> {
    return await this.db.select().from(monthlyGoals).where(eq(monthlyGoals.userId, userId));
  }

  async getMonthlyGoalByUserIdAndMonth(userId: string, month: string): Promise<MonthlyGoal | undefined> {
    const result = await this.db.select().from(monthlyGoals).where(
      and(
        eq(monthlyGoals.userId, userId),
        eq(monthlyGoals.month, month)
      )
    );
    return result[0];
  }

  async createMonthlyGoal(insertMonthlyGoal: InsertMonthlyGoal): Promise<MonthlyGoal> {
    const result = await this.db.insert(monthlyGoals).values(insertMonthlyGoal).returning();
    return result[0];
  }

  async updateMonthlyGoal(id: string, monthlyGoalUpdate: Partial<Omit<InsertMonthlyGoal, 'id' | 'userId'>>): Promise<MonthlyGoal | undefined> {
    const result = await this.db.update(monthlyGoals).set(monthlyGoalUpdate).where(eq(monthlyGoals.id, id)).returning();
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteMonthlyGoal(id: string): Promise<boolean> {
    const result = await this.db.delete(monthlyGoals).where(eq(monthlyGoals.id, id)).returning({ id: monthlyGoals.id });
    return result.length > 0;
  }

  // User settings methods
  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const result = await this.db.select().from(userSettings).where(eq(userSettings.userId, userId));
    return result[0];
  }

  async createUserSettings(insertUserSettings: InsertUserSettings): Promise<UserSettings> {
    const result = await this.db.insert(userSettings).values(insertUserSettings).returning();
    return result[0];
  }

  async updateUserSettings(userId: string, settingsUpdate: Partial<Omit<InsertUserSettings, 'id' | 'userId'>>): Promise<UserSettings | undefined> {
    const result = await this.db.update(userSettings)
      .set({ ...settingsUpdate, updatedAt: new Date() })
      .where(eq(userSettings.userId, userId))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }

  // Link methods
  async getLinksByUserId(userId: string): Promise<Link[]> {
    return await this.db.select().from(links).where(eq(links.userId, userId));
  }

  async getLink(id: string): Promise<Link | undefined> {
    const result = await this.db.select().from(links).where(eq(links.id, id));
    return result[0];
  }

  async createLink(insertLink: InsertLink): Promise<Link> {
    const result = await this.db.insert(links).values(insertLink).returning();
    return result[0];
  }

  async deleteLink(id: string): Promise<boolean> {
    const result = await this.db.delete(links).where(eq(links.id, id)).returning({ id: links.id });
    return result.length > 0;
  }

  // Export methods
  async getAllUserData(userId: string): Promise<{
    todos: Todo[];
    schedules: Schedule[];
    sleepRecords: SleepRecord[];
    weightRecords: WeightRecord[];
    mealRecords: MealRecord[];
    diaryEntries: DiaryEntry[];
  }> {
    const [
      userTodos,
      userSchedules,
      userSleepRecords,
      userWeightRecords,
      userMealRecords,
      userDiaryEntries
    ] = await Promise.all([
      this.getTodosByUserId(userId),
      this.getSchedulesByUserId(userId),
      this.getSleepRecordsByUserId(userId),
      this.getWeightRecordsByUserId(userId),
      this.getMealRecordsByUserId(userId),
      this.getDiaryEntriesByUserId(userId)
    ]);

    return {
      todos: userTodos,
      schedules: userSchedules,
      sleepRecords: userSleepRecords,
      weightRecords: userWeightRecords,
      mealRecords: userMealRecords,
      diaryEntries: userDiaryEntries
    };
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private todos: Map<string, Todo>;
  private schedules: Map<string, Schedule>;
  private sleepRecords: Map<string, SleepRecord>;
  private weightRecords: Map<string, WeightRecord>;
  private mealRecords: Map<string, MealRecord>;
  private diaryEntries: Map<string, DiaryEntry>;
  private dailyRoutines: Map<string, DailyRoutine>;
  private monthlyGoals: Map<string, MonthlyGoal>;
  private userSettingsMap: Map<string, UserSettings>;
  private links: Map<string, Link>;

  constructor() {
    this.users = new Map();
    this.todos = new Map();
    this.schedules = new Map();
    this.sleepRecords = new Map();
    this.weightRecords = new Map();
    this.mealRecords = new Map();
    this.diaryEntries = new Map();
    this.dailyRoutines = new Map();
    this.monthlyGoals = new Map();
    this.userSettingsMap = new Map();
    this.links = new Map();
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
      createdAt: insertTodo.createdAt ?? new Date(),
      repeatType: insertTodo.repeatType ?? null,
      repeatDays: insertTodo.repeatDays ?? null,
      repeatDate: insertTodo.repeatDate ?? null,
      location: insertTodo.location ?? null,
      locationLat: insertTodo.locationLat ?? null,
      locationLng: insertTodo.locationLng ?? null,
      locationRadius: insertTodo.locationRadius ?? null
    };
    this.todos.set(id, todo);
    return todo;
  }

  async updateTodo(id: string, todoUpdate: Partial<Omit<InsertTodo, 'id' | 'userId'>>): Promise<Todo | undefined> {
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

  async updateSchedule(id: string, scheduleUpdate: Partial<Omit<InsertSchedule, 'id' | 'userId'>>): Promise<Schedule | undefined> {
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

  async updateSleepRecord(id: string, sleepRecordUpdate: Partial<Omit<InsertSleepRecord, 'id' | 'userId'>>): Promise<SleepRecord | undefined> {
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
      height: insertWeightRecord.height ?? null,
      bodyFat: insertWeightRecord.bodyFat ?? null
    };
    this.weightRecords.set(id, weightRecord);
    return weightRecord;
  }

  async updateWeightRecord(id: string, weightRecordUpdate: Partial<Omit<InsertWeightRecord, 'id' | 'userId'>>): Promise<WeightRecord | undefined> {
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

  async updateMealRecord(id: string, mealRecordUpdate: Partial<Omit<InsertMealRecord, 'id' | 'userId'>>): Promise<MealRecord | undefined> {
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

  async updateDiaryEntry(id: string, diaryEntryUpdate: Partial<Omit<InsertDiaryEntry, 'id' | 'userId'>>): Promise<DiaryEntry | undefined> {
    const existingDiaryEntry = this.diaryEntries.get(id);
    if (!existingDiaryEntry) return undefined;
    
    const updatedDiaryEntry: DiaryEntry = { ...existingDiaryEntry, ...diaryEntryUpdate };
    this.diaryEntries.set(id, updatedDiaryEntry);
    return updatedDiaryEntry;
  }

  async deleteDiaryEntry(id: string): Promise<boolean> {
    return this.diaryEntries.delete(id);
  }

  // Daily routine methods
  async getDailyRoutinesByUserId(userId: string): Promise<DailyRoutine[]> {
    return Array.from(this.dailyRoutines.values()).filter(routine => routine.userId === userId);
  }

  async getDailyRoutineByUserIdAndDate(userId: string, date: string): Promise<DailyRoutine | undefined> {
    return Array.from(this.dailyRoutines.values()).find(
      routine => routine.userId === userId && routine.date === date
    );
  }

  async createDailyRoutine(insertDailyRoutine: InsertDailyRoutine): Promise<DailyRoutine> {
    const id = randomUUID();
    const dailyRoutine: DailyRoutine = { ...insertDailyRoutine, id };
    this.dailyRoutines.set(id, dailyRoutine);
    return dailyRoutine;
  }

  async updateDailyRoutine(id: string, dailyRoutineUpdate: Partial<Omit<InsertDailyRoutine, 'id' | 'userId'>>): Promise<DailyRoutine | undefined> {
    const existingDailyRoutine = this.dailyRoutines.get(id);
    if (!existingDailyRoutine) return undefined;
    
    const updatedDailyRoutine: DailyRoutine = { ...existingDailyRoutine, ...dailyRoutineUpdate };
    this.dailyRoutines.set(id, updatedDailyRoutine);
    return updatedDailyRoutine;
  }

  async deleteDailyRoutine(id: string): Promise<boolean> {
    return this.dailyRoutines.delete(id);
  }

  // Monthly goal methods
  async getMonthlyGoalsByUserId(userId: string): Promise<MonthlyGoal[]> {
    return Array.from(this.monthlyGoals.values()).filter(goal => goal.userId === userId);
  }

  async getMonthlyGoalByUserIdAndMonth(userId: string, month: string): Promise<MonthlyGoal | undefined> {
    return Array.from(this.monthlyGoals.values()).find(
      goal => goal.userId === userId && goal.month === month
    );
  }

  async createMonthlyGoal(insertMonthlyGoal: InsertMonthlyGoal): Promise<MonthlyGoal> {
    const id = randomUUID();
    const monthlyGoal: MonthlyGoal = { 
      ...insertMonthlyGoal, 
      id,
      createdAt: new Date()
    };
    this.monthlyGoals.set(id, monthlyGoal);
    return monthlyGoal;
  }

  async updateMonthlyGoal(id: string, monthlyGoalUpdate: Partial<Omit<InsertMonthlyGoal, 'id' | 'userId'>>): Promise<MonthlyGoal | undefined> {
    const existingMonthlyGoal = this.monthlyGoals.get(id);
    if (!existingMonthlyGoal) return undefined;
    
    const updatedMonthlyGoal: MonthlyGoal = { ...existingMonthlyGoal, ...monthlyGoalUpdate };
    this.monthlyGoals.set(id, updatedMonthlyGoal);
    return updatedMonthlyGoal;
  }

  async deleteMonthlyGoal(id: string): Promise<boolean> {
    return this.monthlyGoals.delete(id);
  }

  // User settings methods
  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    return Array.from(this.userSettingsMap.values()).find(
      settings => settings.userId === userId
    );
  }

  async createUserSettings(insertUserSettings: InsertUserSettings): Promise<UserSettings> {
    const id = randomUUID();
    const settings: UserSettings = {
      ...insertUserSettings,
      id,
      darkMode: insertUserSettings.darkMode ?? false,
      themeColor: insertUserSettings.themeColor ?? 'pink',
      pushNotifications: insertUserSettings.pushNotifications ?? false,
      updatedAt: new Date()
    };
    this.userSettingsMap.set(id, settings);
    return settings;
  }

  async updateUserSettings(userId: string, settingsUpdate: Partial<Omit<InsertUserSettings, 'id' | 'userId'>>): Promise<UserSettings | undefined> {
    const existingSettings = await this.getUserSettings(userId);
    if (!existingSettings) return undefined;
    
    const updatedSettings: UserSettings = {
      ...existingSettings,
      ...settingsUpdate,
      updatedAt: new Date()
    };
    this.userSettingsMap.set(existingSettings.id, updatedSettings);
    return updatedSettings;
  }

  // Link methods
  async getLinksByUserId(userId: string): Promise<Link[]> {
    return Array.from(this.links.values()).filter(
      link => link.userId === userId
    );
  }

  async getLink(id: string): Promise<Link | undefined> {
    return this.links.get(id);
  }

  async createLink(insertLink: InsertLink): Promise<Link> {
    const id = randomUUID();
    const link: Link = {
      ...insertLink,
      id,
      category: insertLink.category ?? null,
      createdAt: new Date()
    };
    this.links.set(id, link);
    return link;
  }

  async deleteLink(id: string): Promise<boolean> {
    return this.links.delete(id);
  }

  // Export methods
  async getAllUserData(userId: string): Promise<{
    todos: Todo[];
    schedules: Schedule[];
    sleepRecords: SleepRecord[];
    weightRecords: WeightRecord[];
    mealRecords: MealRecord[];
    diaryEntries: DiaryEntry[];
  }> {
    return {
      todos: await this.getTodosByUserId(userId),
      schedules: await this.getSchedulesByUserId(userId),
      sleepRecords: await this.getSleepRecordsByUserId(userId),
      weightRecords: await this.getWeightRecordsByUserId(userId),
      mealRecords: await this.getMealRecordsByUserId(userId),
      diaryEntries: await this.getDiaryEntriesByUserId(userId)
    };
  }
}

export const storage = new DbStorage();
