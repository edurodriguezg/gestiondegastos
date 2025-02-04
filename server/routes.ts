import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertCategorySchema, insertExpenseSchema } from "@shared/schema";

export function registerRoutes(app: Express) {
  app.get("/api/categories", async (_req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.post("/api/categories", async (req, res) => {
    const result = insertCategorySchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }
    const category = await storage.createCategory(result.data);
    res.json(category);
  });

  app.get("/api/expenses", async (req, res) => {
    const { year, month } = req.query;
    if (year && month) {
      const expenses = await storage.getExpensesByMonth(
        parseInt(year as string),
        parseInt(month as string)
      );
      res.json(expenses);
    } else {
      const expenses = await storage.getExpenses();
      res.json(expenses);
    }
  });

  app.post("/api/expenses", async (req, res) => {
    const result = insertExpenseSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }
    const expense = await storage.createExpense(result.data);
    res.json(expense);
  });

  return createServer(app);
}
