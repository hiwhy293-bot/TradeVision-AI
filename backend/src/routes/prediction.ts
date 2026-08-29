import express, { Router, Request, Response } from "express";
import PredictionModel from "../models/Prediction";
import MarketDataLayer from "../layers/marketDataLayer";
import TechnicalAnalysisEngine from "../layers/technicalAnalysisEngine";
import EvidenceEngine from "../layers/evidenceEngine";
import PredictiveAIEngine from "../layers/predictiveAIEngine";
import ExplanationEngine from "../layers/explanationEngine";
import EvaluationEngine from "../layers/evaluationEngine";
import { SUPPORTED_PAIRS, SUPPORTED_TIMEFRAMES } from "../config/constants";

const router: Router = express.Router();

/**
 * GET /api/prediction/current
 * Get current prediction
 */
router.get("/current", async (req: Request, res: Response) => {
  try {
    const { pair, timeframe } = req.query;

    if (!pair || !timeframe) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "INVALID_PARAMS", message: "pair and timeframe are required" },
      });
    }

    // Fetch latest prediction
    const prediction = await PredictionModel.getLatest(pair as string, timeframe as string);

    if (!prediction) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: "PREDICTION_NOT_FOUND", message: "No prediction found for this pair and timeframe" },
      });
    }

    const explanation = ExplanationEngine.generateDetailedExplanation(prediction);

    res.json({
      success: true,
      data: { ...prediction, explanation },
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
 * GET /api/prediction/history
 * Get prediction history
 */
router.get("/history", async (req: Request, res: Response) => {
  try {
    const { pair, timeframe, bias, limit = "50", offset = "0" } = req.query;

    const { predictions, total } = await PredictionModel.getHistory(
      pair as string | undefined,
      timeframe as string | undefined,
      bias as string | undefined,
      parseInt(limit as string) || 50,
      parseInt(offset as string) || 0
    );

    res.json({
      success: true,
      data: {
        total,
        predictions,
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
 * GET /api/prediction/statistics
 * Get prediction statistics
 */
router.get("/statistics", async (req: Request, res: Response) => {
  try {
    const { pair, timeframe } = req.query;

    const stats = await EvaluationEngine.getStatistics(
      pair as string | undefined,
      timeframe as string | undefined
    );

    const byTimeframe = await EvaluationEngine.getAccuracyByTimeframe(pair as string | undefined);
    const byPair = await EvaluationEngine.getAccuracyByPair();

    res.json({
      success: true,
      data: {
        ...stats,
        byTimeframe,
        byPair,
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
 * POST /api/prediction/generate
 * Generate new prediction
 */
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { pair, timeframe } = req.body;

    if (!pair || !timeframe) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "INVALID_PARAMS", message: "pair and timeframe are required" },
      });
    }

    if (!SUPPORTED_PAIRS.includes(pair)) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "INVALID_PAIR", message: `${pair} is not supported` },
      });
    }

    if (!SUPPORTED_TIMEFRAMES.includes(timeframe)) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "INVALID_TIMEFRAME", message: `${timeframe} is not supported` },
      });
    }

    // Fetch candles
    const candles = await MarketDataLayer.fetchCandles(pair, timeframe, 100);
    if (candles.length < 20) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "INSUFFICIENT_DATA", message: "Not enough candle data for analysis" },
      });
    }

    // Run technical analysis
    const indicators = TechnicalAnalysisEngine.analyze(candles);
    const trendAnalysis = TechnicalAnalysisEngine.analyzeTrend(candles);
    const momentumAnalysis = TechnicalAnalysisEngine.analyzeMomentum(candles);
    const volatilityAnalysis = TechnicalAnalysisEngine.analyzeVolatility(candles);

    // Generate evidence
    const evidenceReport = EvidenceEngine.generateEvidenceReport(
      indicators,
      trendAnalysis,
      momentumAnalysis,
      { isBullish: candles[candles.length - 1].close > candles[candles.length - 1].open },
      { trend: trendAnalysis.direction },
      volatilityAnalysis
    );

    // Generate prediction
    const prediction = PredictiveAIEngine.generatePrediction(
      pair,
      timeframe,
      candles[candles.length - 1].close,
      candles.length,
      evidenceReport,
      "live"
    );

    // Store prediction
    await PredictionModel.create(prediction);

    const explanation = ExplanationEngine.generateDetailedExplanation(prediction);

    res.json({
      success: true,
      data: { ...prediction, explanation },
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
 * POST /api/prediction/evaluate
 * Evaluate a prediction
 */
router.post("/evaluate", async (req: Request, res: Response) => {
  try {
    const { predictionId, actualBias, actualCandle } = req.body;

    if (!predictionId || !actualBias) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "INVALID_PARAMS", message: "predictionId and actualBias are required" },
      });
    }

    const prediction = await PredictionModel.getById(predictionId);
    if (!prediction) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: "PREDICTION_NOT_FOUND", message: "Prediction not found" },
      });
    }

    const result = await EvaluationEngine.evaluatePrediction(prediction, actualCandle);

    res.json({
      success: true,
      data: result,
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
