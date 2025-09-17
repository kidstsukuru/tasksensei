import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import {
  insertTodoSchema,
  insertScheduleSchema,
  insertSleepRecordSchema,
  insertWeightRecordSchema,
  insertMealRecordSchema,
  insertDiaryEntrySchema,
  insertUserSchema
} from "@shared/schema";
import { z } from "zod";

// Extend session with user property
declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

// Authentication middleware
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

// Password hashing utilities
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({ username, password: hashedPassword });
      
      // Set session
      req.session.userId = user.id;
      
      res.status(201).json({ 
        user: { id: user.id, username: user.username } 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = insertUserSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check password
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Set session
      req.session.userId = user.id;
      
      res.json({ 
        user: { id: user.id, username: user.username } 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ 
        user: { id: user.id, username: user.username } 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Todo routes (protected)
  app.get("/api/todos", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const todos = await storage.getTodosByUserId(userId);
      res.json(todos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch todos" });
    }
  });

  app.post("/api/todos", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const validatedData = insertTodoSchema.parse({ ...req.body, userId });
      const todo = await storage.createTodo(validatedData);
      res.status(201).json(todo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create todo" });
    }
  });

  app.put("/api/todos/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId!;
      
      // Check if todo belongs to user
      const existingTodo = await storage.getTodo(id);
      if (!existingTodo || existingTodo.userId !== userId) {
        return res.status(404).json({ error: "Todo not found" });
      }
      
      const validatedData = insertTodoSchema.omit({ userId: true }).partial().parse(req.body);
      const updatedTodo = await storage.updateTodo(id, validatedData);
      res.json(updatedTodo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update todo" });
    }
  });

  app.delete("/api/todos/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId!;
      
      // Check if todo belongs to user
      const existingTodo = await storage.getTodo(id);
      if (!existingTodo || existingTodo.userId !== userId) {
        return res.status(404).json({ error: "Todo not found" });
      }
      
      const deleted = await storage.deleteTodo(id);
      if (!deleted) {
        return res.status(404).json({ error: "Todo not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete todo" });
    }
  });

  // Schedule routes (protected)
  app.get("/api/schedules", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const schedules = await storage.getSchedulesByUserId(userId);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch schedules" });
    }
  });

  app.post("/api/schedules", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const validatedData = insertScheduleSchema.parse({ ...req.body, userId });
      const schedule = await storage.createSchedule(validatedData);
      res.status(201).json(schedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create schedule" });
    }
  });

  app.put("/api/schedules/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId!;
      
      // Check if schedule belongs to user
      const existingSchedule = await storage.getSchedule(id);
      if (!existingSchedule || existingSchedule.userId !== userId) {
        return res.status(404).json({ error: "Schedule not found" });
      }
      
      const validatedData = insertScheduleSchema.omit({ userId: true }).partial().parse(req.body);
      const updatedSchedule = await storage.updateSchedule(id, validatedData);
      res.json(updatedSchedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update schedule" });
    }
  });

  app.delete("/api/schedules/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId!;
      
      // Check if schedule belongs to user
      const existingSchedule = await storage.getSchedule(id);
      if (!existingSchedule || existingSchedule.userId !== userId) {
        return res.status(404).json({ error: "Schedule not found" });
      }
      
      const deleted = await storage.deleteSchedule(id);
      if (!deleted) {
        return res.status(404).json({ error: "Schedule not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete schedule" });
    }
  });

  // Sleep record routes (protected)
  app.get("/api/sleep-records", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const sleepRecords = await storage.getSleepRecordsByUserId(userId);
      res.json(sleepRecords);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sleep records" });
    }
  });

  app.post("/api/sleep-records", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const validatedData = insertSleepRecordSchema.parse({ ...req.body, userId });
      const sleepRecord = await storage.createSleepRecord(validatedData);
      res.status(201).json(sleepRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create sleep record" });
    }
  });

  app.put("/api/sleep-records/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId!;
      
      // Check if sleep record belongs to user
      const existingSleepRecord = await storage.getSleepRecord(id);
      if (!existingSleepRecord || existingSleepRecord.userId !== userId) {
        return res.status(404).json({ error: "Sleep record not found" });
      }
      
      const validatedData = insertSleepRecordSchema.omit({ userId: true }).partial().parse(req.body);
      const updatedSleepRecord = await storage.updateSleepRecord(id, validatedData);
      res.json(updatedSleepRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update sleep record" });
    }
  });

  app.delete("/api/sleep-records/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId!;
      
      // Check if sleep record belongs to user
      const existingSleepRecord = await storage.getSleepRecord(id);
      if (!existingSleepRecord || existingSleepRecord.userId !== userId) {
        return res.status(404).json({ error: "Sleep record not found" });
      }
      
      const deleted = await storage.deleteSleepRecord(id);
      if (!deleted) {
        return res.status(404).json({ error: "Sleep record not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete sleep record" });
    }
  });

  // Weight record routes (protected)
  app.get("/api/weight-records", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const weightRecords = await storage.getWeightRecordsByUserId(userId);
      res.json(weightRecords);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weight records" });
    }
  });

  app.post("/api/weight-records", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const validatedData = insertWeightRecordSchema.parse({ ...req.body, userId });
      const weightRecord = await storage.createWeightRecord(validatedData);
      res.status(201).json(weightRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create weight record" });
    }
  });

  app.put("/api/weight-records/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId!;
      
      // Check if weight record belongs to user
      const existingWeightRecord = await storage.getWeightRecord(id);
      if (!existingWeightRecord || existingWeightRecord.userId !== userId) {
        return res.status(404).json({ error: "Weight record not found" });
      }
      
      const validatedData = insertWeightRecordSchema.omit({ userId: true }).partial().parse(req.body);
      const updatedWeightRecord = await storage.updateWeightRecord(id, validatedData);
      res.json(updatedWeightRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update weight record" });
    }
  });

  app.delete("/api/weight-records/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId!;
      
      // Check if weight record belongs to user
      const existingWeightRecord = await storage.getWeightRecord(id);
      if (!existingWeightRecord || existingWeightRecord.userId !== userId) {
        return res.status(404).json({ error: "Weight record not found" });
      }
      
      const deleted = await storage.deleteWeightRecord(id);
      if (!deleted) {
        return res.status(404).json({ error: "Weight record not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete weight record" });
    }
  });

  // Meal record routes (protected)
  app.get("/api/meal-records", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const mealRecords = await storage.getMealRecordsByUserId(userId);
      res.json(mealRecords);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch meal records" });
    }
  });

  app.post("/api/meal-records", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const validatedData = insertMealRecordSchema.parse({ ...req.body, userId });
      const mealRecord = await storage.createMealRecord(validatedData);
      res.status(201).json(mealRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create meal record" });
    }
  });

  app.put("/api/meal-records/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId!;
      
      // Check if meal record belongs to user
      const existingMealRecord = await storage.getMealRecord(id);
      if (!existingMealRecord || existingMealRecord.userId !== userId) {
        return res.status(404).json({ error: "Meal record not found" });
      }
      
      const validatedData = insertMealRecordSchema.omit({ userId: true }).partial().parse(req.body);
      const updatedMealRecord = await storage.updateMealRecord(id, validatedData);
      res.json(updatedMealRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update meal record" });
    }
  });

  app.delete("/api/meal-records/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId!;
      
      // Check if meal record belongs to user
      const existingMealRecord = await storage.getMealRecord(id);
      if (!existingMealRecord || existingMealRecord.userId !== userId) {
        return res.status(404).json({ error: "Meal record not found" });
      }
      
      const deleted = await storage.deleteMealRecord(id);
      if (!deleted) {
        return res.status(404).json({ error: "Meal record not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete meal record" });
    }
  });

  // Diary entry routes (protected)
  app.get("/api/diary-entries", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const diaryEntries = await storage.getDiaryEntriesByUserId(userId);
      res.json(diaryEntries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch diary entries" });
    }
  });

  app.post("/api/diary-entries", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const validatedData = insertDiaryEntrySchema.parse({ ...req.body, userId });
      const diaryEntry = await storage.createDiaryEntry(validatedData);
      res.status(201).json(diaryEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create diary entry" });
    }
  });

  app.put("/api/diary-entries/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId!;
      
      // Check if diary entry belongs to user
      const existingDiaryEntry = await storage.getDiaryEntry(id);
      if (!existingDiaryEntry || existingDiaryEntry.userId !== userId) {
        return res.status(404).json({ error: "Diary entry not found" });
      }
      
      const validatedData = insertDiaryEntrySchema.omit({ userId: true }).partial().parse(req.body);
      const updatedDiaryEntry = await storage.updateDiaryEntry(id, validatedData);
      res.json(updatedDiaryEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update diary entry" });
    }
  });

  app.delete("/api/diary-entries/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId!;
      
      // Check if diary entry belongs to user
      const existingDiaryEntry = await storage.getDiaryEntry(id);
      if (!existingDiaryEntry || existingDiaryEntry.userId !== userId) {
        return res.status(404).json({ error: "Diary entry not found" });
      }
      
      const deleted = await storage.deleteDiaryEntry(id);
      if (!deleted) {
        return res.status(404).json({ error: "Diary entry not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete diary entry" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
