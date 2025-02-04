import { expenses, categories, type Category, type InsertCategory, type Expense, type InsertExpense } from "@shared/schema";
import { db } from "./db";
import { eq, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Expenses
  getExpenses(): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  getExpensesByMonth(year: number, month: number): Promise<Expense[]>;
}

export class DatabaseStorage implements IStorage {
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async getExpenses(): Promise<Expense[]> {
    return db.select().from(expenses);
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const [expense] = await db
      .insert(expenses)
      .values(insertExpense)
      .returning();
    return expense;
  }

  async getExpensesByMonth(year: number, month: number): Promise<Expense[]> {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    return db
      .select()
      .from(expenses)
      .where((eb) => 
        eb.and(
          gte(eb.date, startDate),
          lte(eb.date, endDate)
        )
      );
  }
}

export const storage = new DatabaseStorage();