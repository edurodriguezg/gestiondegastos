import type { Express, Request, Response, NextFunction } from "express"
import { createServer } from "http"
import { storage } from "./storage"
import { insertCategorySchema, insertExpenseSchema } from "@shared/schema"

export function registerRoutes(app: Express) {
  const asyncHandler =
    (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) => {
      return Promise.resolve(fn(req, res, next)).catch((error) => {
        console.error("Route error:", error)

        console.error({
          path: req.path,
          method: req.method,
          body: req.body,
          error: {
            name: error.name,
            message: error.message,
            cause: error.cause,
            stack: error.stack,
          },
        })

        if (error.name === "DatabaseError") {
          res.status(400).json({ error: error.message })
        } else {
          res.status(500).json({
            error: "Internal server error",
            message: process.env.NODE_ENV === "development" ? error.message : undefined,
          })
        }
      })
    }

  app.get(
    "/api/categories",
    asyncHandler(async (_req: Request, res: Response) => {
      const categories = await storage.getCategories()
      res.json(categories)
    }),
  )

  app.post(
    "/api/categories",
    asyncHandler(async (req: Request, res: Response) => {
      const result = insertCategorySchema.safeParse(req.body)
      if (!result.success) {
        res.status(400).json({ error: result.error.format() })
        return
      }
      const category = await storage.createCategory(result.data)
      res.json(category)
    }),
  )

  app.delete(
    "/api/categories/:id",
    asyncHandler(async (req: Request, res: Response) => {
      const id = Number.parseInt(req.params.id)
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid category ID" })
        return
      }
      await storage.deleteCategory(id)
      res.status(204).end()
    }),
  )

  app.get(
    "/api/expenses",
    asyncHandler(async (req: Request, res: Response) => {
      const { year, month } = req.query
      if (year && month) {
        const expenses = await storage.getExpensesByMonth(
          Number.parseInt(year as string),
          Number.parseInt(month as string),
        )
        res.json(expenses)
      } else {
        const expenses = await storage.getExpenses()
        res.json(expenses)
      }
    }),
  )

  app.post(
    "/api/expenses",
    asyncHandler(async (req: Request, res: Response) => {
      console.log("Received expense creation request:", req.body)

      const result = insertExpenseSchema.safeParse(req.body)
      if (!result.success) {
        console.error("Validation error:", result.error.format())
        res.status(400).json({ error: result.error.format() })
        return
      }

      const expense = await storage.createExpense(result.data)
      res.json(expense)
    }),
  )

  return createServer(app)
}

