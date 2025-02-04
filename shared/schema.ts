import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  date: timestamp("date").notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
});

// Modify the expense schema to properly handle amount validation
export const insertExpenseSchema = createInsertSchema(expenses)
  .extend({
    amount: z.number().or(z.string().regex(/^\d+\.?\d*$/).transform(Number))
      .refine((val) => !isNaN(val) && val > 0, {
        message: "Amount must be a positive number",
      }),
  })
  .pick({
    amount: true,
    description: true,
    categoryId: true,
    date: true,
  });

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;