/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

import apiRouter from "./api/portfolio-audit";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  app.use(apiRouter);

  // Serve static assets or mount Vite dev middleware
  // Determine if we are running in production: either NODE_ENV is set to production, or we are running the compiled CJS bundle, or we are not in a local development process.
  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.argv[1]?.includes("server.cjs") ||
    !process.argv[1]?.includes("server.ts");

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Portfolio Auditor Backend successfully booted on port ${PORT}`);
    });
  }

  return app;
}

// Export the Express app for serverless environments like Vercel
const appPromise = startServer();
export default async function (req: any, res: any) {
  const app = await appPromise;
  return app(req, res);
}
