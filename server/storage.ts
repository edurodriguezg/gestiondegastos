import { eq, gte, lte, and } from "drizzle-orm"
import { db } from "./db"
import { categories, expenses } from "@shared/schema"
import type { InsertCategory, InsertExpense } from "@shared/schema"

export class DatabaseStorage {
  async getCategories() {
    try {
      return await db.select().from(categories)
    } catch (error) {
      console.error("Error in getCategories:", error)
      throw new Error("Failed to fetch categories")
    }
  }

  async createCategory(insertCategory: InsertCategory) {
    try {
      const [category] = await db.insert(categories).values(insertCategory).returning()
      return category
    } catch (error) {
      console.error("Error in createCategory:", error)
      throw new Error("Failed to create category")
    }
  }

  async deleteCategory(id: number) {
    try {
      // First check if category has expenses
      const [expense] = await db.select().from(expenses).where(eq(expenses.categoryId, id)).limit(1)

      if (expense) {
        throw new Error("Cannot delete category that has expenses")
      }

      await db.delete(categories).where(eq(categories.id, id))
    } catch (error) {
      console.error("Error in deleteCategory:", error)
      throw error // Re-throw to maintain the original error message
    }
  }

  async getExpenses() {
    try {
      return await db.select().from(expenses)
    } catch (error) {
      console.error("Error in getExpenses:", error)
      throw new Error("Failed to fetch expenses")
    }
  }

  async createExpense(insertExpense: InsertExpense) {
    try {
      // Convert amount to cents if it's in dollars
      const amountInCents = Math.round(insertExpense.amount * 100)

      const [expense] = await db
        .insert(expenses)
        .values({
          ...insertExpense,
          amount: amountInCents,
        })
        .returning()

      return {
        ...expense,
        amount: expense.amount / 100, // Convert back to dollars for the response
      }
    } catch (error) {
      console.error("Error in createExpense:", error)
      throw new Error("Failed to create expense")
    }
  }

  async getExpensesByMonth(year: number, month: number) {
    try {
      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999)

      const results = await db
        .select()
        .from(expenses)
        .where(and(gte(expenses.date, startDate), lte(expenses.date, endDate)))

      // Convert amounts from cents to dollars
      return results.map((expense) => ({
        ...expense,
        amount: expense.amount / 100,
      }))
    } catch (error) {
      console.error("Error in getExpensesByMonth:", error)
      throw new Error("Failed to fetch expenses for the specified month")
    }
  }
}

export const storage = new DatabaseStorage()

