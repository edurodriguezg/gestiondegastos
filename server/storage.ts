import { expenses, categories, type Category, type InsertCategory, type Expense, type InsertExpense } from "@shared/schema";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Expenses
  getExpenses(): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  getExpensesByMonth(year: number, month: number): Promise<Expense[]>;
}

export class MemStorage implements IStorage {
  private categories: Map<number, Category>;
  private expenses: Map<number, Expense>;
  private categoryId: number;
  private expenseId: number;

  constructor() {
    this.categories = new Map();
    this.expenses = new Map();
    this.categoryId = 1;
    this.expenseId = 1;

    // Add default categories
    const defaultCategories = ["Food", "Transportation", "Healthcare", "Utilities", "Other"];
    defaultCategories.forEach(name => this.createCategory({ name }));
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  async getExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values());
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = this.expenseId++;
    const expense = { ...insertExpense, id };
    this.expenses.set(id, expense);
    return expense;
  }

  async getExpensesByMonth(year: number, month: number): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === year && expenseDate.getMonth() === month;
    });
  }
}

export const storage = new MemStorage();
