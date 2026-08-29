import express, { Router, Request, Response } from "express";
import PaperTradeModel from "../models/PaperTrade";

const router: Router = express.Router();

/**
 * POST /api/paper-trade/enter
 * Enter a paper trade
 */
router.post("/enter", async (req: Request, res: Response) => {
  try {
    const { predictionId, pair, direction, quantity, entryPrice, stopLoss, takeProfit } = req.body;

    if (!predictionId || !pair || !direction || !quantity || !entryPrice || !stopLoss || !takeProfit) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "INVALID_PARAMS", message: "All fields are required" },
      });
    }

    const trade = await PaperTradeModel.create({
      predictionId,
      pair,
      direction,
      quantity,
      entryPrice,
      entryTime: new Date(),
      stopLoss,
      takeProfit,
    });

    res.status(201).json({
      success: true,
      data: trade,
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
 * POST /api/paper-trade/exit
 * Exit a paper trade
 */
router.post("/exit", async (req: Request, res: Response) => {
  try {
    const { tradeId, exitPrice, exitReason } = req.body;

    if (!tradeId || !exitPrice || !exitReason) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "INVALID_PARAMS", message: "All fields are required" },
      });
    }

    const trade = await PaperTradeModel.close(tradeId, exitPrice, exitReason);

    if (!trade) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: "TRADE_NOT_FOUND", message: "Trade not found" },
      });
    }

    res.json({
      success: true,
      data: trade,
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
 * GET /api/paper-trade/trades
 * Get paper trades
 */
router.get("/trades", async (req: Request, res: Response) => {
  try {
    const { status, pair, limit = "50", offset = "0" } = req.query;

    const { trades, total } = await PaperTradeModel.getAll(
      status as string | undefined,
      pair as string | undefined,
      parseInt(limit as string) || 50,
      parseInt(offset as string) || 0
    );

    res.json({
      success: true,
      data: {
        total,
        trades,
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
 * GET /api/paper-trade/stats
 * Get trading statistics
 */
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const { pair } = req.query;

    const stats = await PaperTradeModel.getStatistics(pair as string | undefined);

    res.json({
      success: true,
      data: stats,
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

export default router;
