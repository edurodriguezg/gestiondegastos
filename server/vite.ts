import { createServer as createViteServer } from "vite"
import type { ViteDevServer } from "vite"
import type { Express } from "express"
import type { Server } from "http"
import path from "path"
import fs from "fs"
import express from "express" // Import express

export async function setupVite(app: Express, server: Server): Promise<ViteDevServer> {
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: {
        server: server,
      },
    },
    appType: "custom",
  })

  app.use(vite.middlewares)

  return vite
}

export function serveStatic(app: Express) {
  const clientDistPath = path.resolve(__dirname, "../../client/dist")

  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath))
    app.get("*", (req, res) => {
      res.sendFile(path.join(clientDistPath, "index.html"))
    })
  } else {
    console.error("Client dist folder not found. Make sure to build the client first.")
  }
}

