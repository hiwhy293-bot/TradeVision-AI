import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase } from "./config/database";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
initializeDatabase().then(() => {
  console.log("Database initialized");
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    data: { status: "operational", timestamp: new Date().toISOString() },
  });
});

// API routes will be added here
// app.use("/api/prediction", predictionRoutes);
// app.use("/api/market", marketRoutes);
// app.use("/api/paper-trade", paperTradeRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({
    success: false,
    data: null,
    error: { code: "INTERNAL_ERROR", message: "An internal server error occurred" },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`TradeVision AI Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
