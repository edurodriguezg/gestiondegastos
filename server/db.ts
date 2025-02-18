import { Pool, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"
import * as schema from "@shared/schema"
import ws from "ws"

// Required for Neon serverless
neonConfig.webSocketConstructor = ws

if (!process.env.DATABASE_POSTGRES_URL) {
  throw new Error("DATABASE_POSTGRES_URL must be set. Did you forget to provision a database?")
}

// Create the connection pool with retry logic
const createPool = () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_POSTGRES_URL,
    connectionTimeoutMillis: 5000,
    max: 1, // Adjust based on Vercel's serverless function limits
  })

  // Add error handler
  pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err)
  })

  return pool
}

const pool = createPool()

// Create the database instance
export const db = drizzle(pool, { schema })

// Add a health check function
export async function checkDatabaseConnection() {
  try {
    const client = await pool.connect()
    try {
      await client.query("SELECT 1")
      return true
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Database connection error:", error)
    return false
  }
}

// Add a function to handle graceful shutdown
export async function closeDatabase() {
  try {
    await pool.end()
  } catch (error) {
    console.error("Error closing database connection:", error)
  }
}

