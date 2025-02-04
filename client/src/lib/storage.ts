import localforage from "localforage";
import { type Expense, type Category } from "@shared/schema";

const expenseStore = localforage.createInstance({
  name: "expenses",
});

const categoryStore = localforage.createInstance({
  name: "categories",
});

export async function syncExpenses(expenses: Expense[]) {
  await expenseStore.setItem("expenses", expenses);
}

export async function syncCategories(categories: Category[]) {
  await categoryStore.setItem("categories", categories);
}

export async function getLocalExpenses(): Promise<Expense[]> {
  return (await expenseStore.getItem("expenses")) || [];
}

export async function getLocalCategories(): Promise<Category[]> {
  return (await categoryStore.getItem("categories")) || [];
}
