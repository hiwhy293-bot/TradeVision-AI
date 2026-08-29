import { Prediction, PredictionResult } from "../types/prediction";
import { Candle } from "../types/market";
import { allQuery, runQuery } from "../config/database";
import { v4 as uuidv4 } from "uuid";

export class EvaluationEngine {
  /**
   * Evaluate prediction against actual candle result
   */
  async evaluatePrediction(prediction: Prediction, actualCandle: Candle): Promise<PredictionResult> {
    const actualBias = actualCandle.close > actualCandle.open ? "UP" : "DOWN";
    const correct = prediction.bias === actualBias || prediction.bias === "WAIT";

    const result: PredictionResult = {
      id: uuidv4(),
      predictionId: prediction.id,
      actualBias,
      correct,
      recordedAt: new Date(),
    };

    // Store in database
    await this.storePredictionResult(result);

    return result;
  }

  /**
   * Store prediction result
   */
  private async storePredictionResult(result: PredictionResult): Promise<void> {
    const query = `
      INSERT INTO prediction_results (id, prediction_id, actual_bias, correct, recorded_at)
      VALUES (?, ?, ?, ?, ?)
    `;
    await runQuery(query, [
      result.id,
      result.predictionId,
      result.actualBias,
      result.correct ? 1 : 0,
      result.recordedAt.toISOString(),
    ]);
  }

  /**
   * Get prediction statistics
   */
  async getStatistics(
    pair?: string,
    timeframe?: string
  ): Promise<{
    totalPredictions: number;
    correctPredictions: number;
    incorrectPredictions: number;
    accuracy: number;
    upPredictions: number;
    downPredictions: number;
    upAccuracy: number;
    downAccuracy: number;
    waitPredictions: number;
  }> {
    let query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN p.bias = 'UP' THEN 1 ELSE 0 END) as up_predictions,
        SUM(CASE WHEN p.bias = 'DOWN' THEN 1 ELSE 0 END) as down_predictions,
        SUM(CASE WHEN p.bias = 'WAIT' THEN 1 ELSE 0 END) as wait_predictions,
        SUM(CASE WHEN r.correct = 1 THEN 1 ELSE 0 END) as correct_predictions
      FROM predictions p
      LEFT JOIN prediction_results r ON p.id = r.prediction_id
    `;

    const params: any[] = [];

    if (pair || timeframe) {
      query += " WHERE 1=1";
      if (pair) {
        query += " AND p.pair = ?";
        params.push(pair);
      }
      if (timeframe) {
        query += " AND p.timeframe = ?";
        params.push(timeframe);
      }
    }

    const result = await allQuery(query, params);
    const row = result[0] || {};

    const total = row.total || 0;
    const correct = row.correct_predictions || 0;
    const incorrect = total - correct;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    // Calculate UP/DOWN accuracy separately
    const upAccuracy = await this.calculateBiasAccuracy("UP", pair, timeframe);
    const downAccuracy = await this.calculateBiasAccuracy("DOWN", pair, timeframe);

    return {
      totalPredictions: total,
      correctPredictions: correct,
      incorrectPredictions: incorrect,
      accuracy,
      upPredictions: row.up_predictions || 0,
      downPredictions: row.down_predictions || 0,
      upAccuracy,
      downAccuracy,
      waitPredictions: row.wait_predictions || 0,
    };
  }

  /**
   * Calculate accuracy for specific bias
   */
  private async calculateBiasAccuracy(bias: string, pair?: string, timeframe?: string): Promise<number> {
    let query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN r.correct = 1 THEN 1 ELSE 0 END) as correct
      FROM predictions p
      LEFT JOIN prediction_results r ON p.id = r.prediction_id
      WHERE p.bias = ?
    `;

    const params: any[] = [bias];

    if (pair) {
      query += " AND p.pair = ?";
      params.push(pair);
    }
    if (timeframe) {
      query += " AND p.timeframe = ?";
      params.push(timeframe);
    }

    const result = await allQuery(query, params);
    const row = result[0] || {};

    const total = row.total || 0;
    const correct = row.correct || 0;

    return total > 0 ? Math.round((correct / total) * 100) : 0;
  }

  /**
   * Get accuracy by timeframe
   */
  async getAccuracyByTimeframe(pair?: string): Promise<{ [key: string]: { total: number; accuracy: number } }> {
    let query = `
      SELECT 
        p.timeframe,
        COUNT(*) as total,
        SUM(CASE WHEN r.correct = 1 THEN 1 ELSE 0 END) as correct
      FROM predictions p
      LEFT JOIN prediction_results r ON p.id = r.prediction_id
    `;

    const params: any[] = [];

    if (pair) {
      query += " WHERE p.pair = ?";
      params.push(pair);
    }

    query += " GROUP BY p.timeframe";

    const results = await allQuery(query, params);
    const accuracy: { [key: string]: { total: number; accuracy: number } } = {};

    results.forEach((row) => {
      const total = row.total || 0;
      const correct = row.correct || 0;
      accuracy[row.timeframe] = {
        total,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      };
    });

    return accuracy;
  }

  /**
   * Get accuracy by pair
   */
  async getAccuracyByPair(): Promise<{ [key: string]: { total: number; accuracy: number } }> {
    const query = `
      SELECT 
        p.pair,
        COUNT(*) as total,
        SUM(CASE WHEN r.correct = 1 THEN 1 ELSE 0 END) as correct
      FROM predictions p
      LEFT JOIN prediction_results r ON p.id = r.prediction_id
      GROUP BY p.pair
    `;

    const results = await allQuery(query, []);
    const accuracy: { [key: string]: { total: number; accuracy: number } } = {};

    results.forEach((row) => {
      const total = row.total || 0;
      const correct = row.correct || 0;
      accuracy[row.pair] = {
        total,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      };
    });

    return accuracy;
  }
}

export default new EvaluationEngine();
