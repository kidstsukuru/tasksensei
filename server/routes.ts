import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertTodoSchema,
  insertScheduleSchema,
  insertSleepRecordSchema,
  insertWeightRecordSchema,
  insertMealRecordSchema,
  insertDiaryEntrySchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Todo routes
  app.get("/api/todos", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const todos = await storage.getTodosByUserId(userId);
      res.json(todos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch todos" });
    }
  });

  app.post("/api/todos", async (req, res) => {
    try {
      const validatedData = insertTodoSchema.parse(req.body);
      const todo = await storage.createTodo(validatedData);
      res.status(201).json(todo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create todo" });
    }
  });

  app.put("/api/todos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertTodoSchema.partial().parse(req.body);
      const updatedTodo = await storage.updateTodo(id, validatedData);
      if (!updatedTodo) {
        return res.status(404).json({ error: "Todo not found" });
      }
      res.json(updatedTodo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update todo" });
    }
  });

  app.delete("/api/todos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTodo(id);
      if (!deleted) {
        return res.status(404).json({ error: "Todo not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete todo" });
    }
  });

  // Schedule routes
  app.get("/api/schedules", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const schedules = await storage.getSchedulesByUserId(userId);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch schedules" });
    }
  });

  app.post("/api/schedules", async (req, res) => {
    try {
      const validatedData = insertScheduleSchema.parse(req.body);
      const schedule = await storage.createSchedule(validatedData);
      res.status(201).json(schedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create schedule" });
    }
  });

  app.put("/api/schedules/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertScheduleSchema.partial().parse(req.body);
      const updatedSchedule = await storage.updateSchedule(id, validatedData);
      if (!updatedSchedule) {
        return res.status(404).json({ error: "Schedule not found" });
      }
      res.json(updatedSchedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update schedule" });
    }
  });

  app.delete("/api/schedules/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSchedule(id);
      if (!deleted) {
        return res.status(404).json({ error: "Schedule not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete schedule" });
    }
  });

  // Sleep record routes
  app.get("/api/sleep-records", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const sleepRecords = await storage.getSleepRecordsByUserId(userId);
      res.json(sleepRecords);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sleep records" });
    }
  });

  app.post("/api/sleep-records", async (req, res) => {
    try {
      const validatedData = insertSleepRecordSchema.parse(req.body);
      const sleepRecord = await storage.createSleepRecord(validatedData);
      res.status(201).json(sleepRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create sleep record" });
    }
  });

  app.put("/api/sleep-records/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertSleepRecordSchema.partial().parse(req.body);
      const updatedSleepRecord = await storage.updateSleepRecord(id, validatedData);
      if (!updatedSleepRecord) {
        return res.status(404).json({ error: "Sleep record not found" });
      }
      res.json(updatedSleepRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update sleep record" });
    }
  });

  app.delete("/api/sleep-records/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSleepRecord(id);
      if (!deleted) {
        return res.status(404).json({ error: "Sleep record not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete sleep record" });
    }
  });

  // Weight record routes
  app.get("/api/weight-records", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const weightRecords = await storage.getWeightRecordsByUserId(userId);
      res.json(weightRecords);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weight records" });
    }
  });

  app.post("/api/weight-records", async (req, res) => {
    try {
      const validatedData = insertWeightRecordSchema.parse(req.body);
      const weightRecord = await storage.createWeightRecord(validatedData);
      res.status(201).json(weightRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create weight record" });
    }
  });

  app.put("/api/weight-records/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertWeightRecordSchema.partial().parse(req.body);
      const updatedWeightRecord = await storage.updateWeightRecord(id, validatedData);
      if (!updatedWeightRecord) {
        return res.status(404).json({ error: "Weight record not found" });
      }
      res.json(updatedWeightRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update weight record" });
    }
  });

  app.delete("/api/weight-records/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteWeightRecord(id);
      if (!deleted) {
        return res.status(404).json({ error: "Weight record not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete weight record" });
    }
  });

  // Meal record routes
  app.get("/api/meal-records", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const mealRecords = await storage.getMealRecordsByUserId(userId);
      res.json(mealRecords);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch meal records" });
    }
  });

  app.post("/api/meal-records", async (req, res) => {
    try {
      const validatedData = insertMealRecordSchema.parse(req.body);
      const mealRecord = await storage.createMealRecord(validatedData);
      res.status(201).json(mealRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create meal record" });
    }
  });

  app.put("/api/meal-records/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertMealRecordSchema.partial().parse(req.body);
      const updatedMealRecord = await storage.updateMealRecord(id, validatedData);
      if (!updatedMealRecord) {
        return res.status(404).json({ error: "Meal record not found" });
      }
      res.json(updatedMealRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update meal record" });
    }
  });

  app.delete("/api/meal-records/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteMealRecord(id);
      if (!deleted) {
        return res.status(404).json({ error: "Meal record not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete meal record" });
    }
  });

  // Diary entry routes
  app.get("/api/diary-entries", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const diaryEntries = await storage.getDiaryEntriesByUserId(userId);
      res.json(diaryEntries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch diary entries" });
    }
  });

  app.post("/api/diary-entries", async (req, res) => {
    try {
      const validatedData = insertDiaryEntrySchema.parse(req.body);
      const diaryEntry = await storage.createDiaryEntry(validatedData);
      res.status(201).json(diaryEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create diary entry" });
    }
  });

  app.put("/api/diary-entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertDiaryEntrySchema.partial().parse(req.body);
      const updatedDiaryEntry = await storage.updateDiaryEntry(id, validatedData);
      if (!updatedDiaryEntry) {
        return res.status(404).json({ error: "Diary entry not found" });
      }
      res.json(updatedDiaryEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update diary entry" });
    }
  });

  app.delete("/api/diary-entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
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
