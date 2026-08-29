import express, { Router, Request, Response } from "express";
import MarketDataLayer from "../layers/marketDataLayer";
import { SUPPORTED_PAIRS, SUPPORTED_TIMEFRAMES } from "../config/constants";

const router: Router = express.Router();

/**
 * GET /api/market/current
 * Get current market price for a pair
 */
router.get("/current", async (req: Request, res: Response) => {
  try {
    const { pair } = req.query;

    if (!pair || typeof pair !== "string") {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "INVALID_PAIR", message: "pair parameter is required" },
      });
    }

    if (!SUPPORTED_PAIRS.includes(pair)) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "INVALID_PAIR", message: `${pair} is not supported` },
      });
    }

    const currentPrice = await MarketDataLayer.fetchCandle(pair, "1m");

    if (!currentPrice) {
      return res.status(500).json({
        success: false,
        data: null,
        error: { code: "API_ERROR", message: "Failed to fetch current price" },
      });
    }

    res.json({
      success: true,
      data: {
        pair,
        price: currentPrice.close,
        timestamp: currentPrice.timestamp,
        bid: currentPrice.close - 0.0001,
        ask: currentPrice.close + 0.0001,
        dayHigh: currentPrice.high,
        dayLow: currentPrice.low,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "INTERNAL_ERROR", message: "Internal server error" },
    });
  }
});

/**
 * GET /api/market/candles
 * Get historical candles
 */
router.get("/candles", async (req: Request, res: Response) => {
  try {
    const { pair, timeframe, limit = "100" } = req.query;

    if (!pair || !timeframe) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "INVALID_PARAMS", message: "pair and timeframe are required" },
      });
    }

    if (!SUPPORTED_PAIRS.includes(pair as string)) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "INVALID_PAIR", message: `${pair} is not supported` },
      });
    }

    if (!SUPPORTED_TIMEFRAMES.includes(timeframe as string)) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "INVALID_TIMEFRAME", message: `${timeframe} is not supported` },
      });
    }

    const limitNum = Math.min(parseInt(limit as string) || 100, 500);
    const candles = await MarketDataLayer.fetchCandles(pair as string, timeframe as string, limitNum);

    res.json({
      success: true,
      data: {
        pair,
        timeframe,
        candles,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "INTERNAL_ERROR", message: "Internal server error" },
    });
  }
});

/**
 * GET /api/market/pairs
 * Get supported currency pairs
 */
router.get("/pairs", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: { pairs: SUPPORTED_PAIRS },
  });
});

/**
 * GET /api/market/timeframes
 * Get supported timeframes
 */
router.get("/timeframes", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: { timeframes: SUPPORTED_TIMEFRAMES },
  });
});

/**
 * GET /api/market/status
 * Get API status
 */
router.get("/status", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: "operational",
      dataSource: process.env.FOREX_API_PROVIDER || "demo",
      timestamp: new Date().toISOString(),
      demoMode: process.env.USE_DEMO_DATA === "true",
    },
  });
});

export default router;
