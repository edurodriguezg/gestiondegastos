import { eq, gte, lte, and } from "drizzle-orm"
import { db } from "./db"
import { categories, expenses } from "@shared/schema"
import type { InsertCategory, InsertExpense } from "@shared/schema"
import { dollarsToCents, centsToDollars } from "@shared/schema"

class DatabaseError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
  ) {
    super(message)
    this.name = "DatabaseError"
  }
}

export class DatabaseStorage {
  async getCategories() {
    try {
      return await db.select().from(categories)
    } catch (error) {
      console.error("Error in getCategories:", error)
      throw new DatabaseError("Failed to fetch categories", error)
    }
  }

  async createCategory(insertCategory: InsertCategory) {
    try {
      const [category] = await db.insert(categories).values(insertCategory).returning()
      return category
    } catch (error) {
      console.error("Error in createCategory:", error)
      if (error instanceof Error && error.message.includes("unique constraint")) {
        throw new DatabaseError("Category name already exists")
      }
      throw new DatabaseError("Failed to create category", error)
    }
  }

  async deleteCategory(id: number) {
    try {
      const [expense] = await db.select().from(expenses).where(eq(expenses.categoryId, id)).limit(1)

      if (expense) {
        throw new DatabaseError("Cannot delete category that has expenses")
      }

      await db.delete(categories).where(eq(categories.id, id))
    } catch (error) {
      console.error("Error in deleteCategory:", error)
      throw error instanceof DatabaseError ? error : new DatabaseError("Failed to delete category", error)
    }
  }

  async getExpenses() {
    try {
      const result = await db.select().from(expenses)
      return result.map((expense) => ({
        ...expense,
        amount: centsToDollars(expense.amount),
      }))
    } catch (error) {
      console.error("Error in getExpenses:", error)
      throw new DatabaseError("Failed to fetch expenses", error)
    }
  }

  async createExpense(insertExpense: InsertExpense) {
    try {
      console.log("Creating expense with data:", insertExpense)

      const [category] = await db.select().from(categories).where(eq(categories.id, insertExpense.categoryId))

      if (!category) {
        throw new DatabaseError("Category not found")
      }

      const [expense] = await db
        .insert(expenses)
        .values({
          ...insertExpense,
          amount: dollarsToCents(insertExpense.amount),
        })
        .returning()

      console.log("Created expense:", expense)

      return {
        ...expense,
        amount: centsToDollars(expense.amount),
      }
    } catch (error) {
      console.error("Error in createExpense:", error)
      throw new DatabaseError("Failed to create expense", error)
    }
  }

  async getExpensesByMonth(year: number, month: number) {
    try {
      const startDate = new Date(year, month - 1, 1) // Note: month is 0-indexed in Date constructor
      const endDate = new Date(year, month, 0, 23, 59, 59, 999)

      const results = await db
        .select()
        .from(expenses)
        .where(and(gte(expenses.date, startDate), lte(expenses.date, endDate)))

      return results.map((expense) => ({
        ...expense,
        amount: centsToDollars(expense.amount),
      }))
    } catch (error) {
      console.error("Error in getExpensesByMonth:", error)
      throw new DatabaseError("Failed to fetch expenses for the specified month", error)
    }
  }
}

export const storage = new DatabaseStorage()

