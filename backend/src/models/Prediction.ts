import { Prediction } from "../types/prediction";
import { runQuery, getQuery, allQuery } from "../config/database";

export class PredictionModel {
  /**
   * Store prediction in database
   */
  async create(prediction: Prediction): Promise<void> {
    const query = `
      INSERT INTO predictions (
        id, timestamp, pair, timeframe, current_price, candle_number,
        bias, confidence, bullish_score, bearish_score,
        evidence_json, explanation, supporting_evidence_json,
        conflicting_evidence_json, data_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await runQuery(query, [
      prediction.id,
      prediction.timestamp.toISOString(),
      prediction.pair,
      prediction.timeframe,
      prediction.currentPrice,
      prediction.candleNumber,
      prediction.bias,
      prediction.confidence,
      prediction.bullishScore,
      prediction.bearishScore,
      JSON.stringify(prediction.evidence),
      prediction.explanation,
      JSON.stringify(prediction.supportingEvidence),
      JSON.stringify(prediction.conflictingEvidence),
      prediction.dataStatus,
    ]);
  }

  /**
   * Get prediction by ID
   */
  async getById(id: string): Promise<Prediction | null> {
    const query = `SELECT * FROM predictions WHERE id = ?`;
    const row = await getQuery(query, [id]);

    if (!row) return null;

    return this.mapRowToPrediction(row);
  }

  /**
   * Get latest prediction for pair and timeframe
   */
  async getLatest(pair: string, timeframe: string): Promise<Prediction | null> {
    const query = `
      SELECT * FROM predictions
      WHERE pair = ? AND timeframe = ?
      ORDER BY timestamp DESC
      LIMIT 1
    `;
    const row = await getQuery(query, [pair, timeframe]);

    if (!row) return null;

    return this.mapRowToPrediction(row);
  }

  /**
   * Get prediction history
   */
  async getHistory(
    pair?: string,
    timeframe?: string,
    bias?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ predictions: Prediction[]; total: number }> {
    let countQuery = "SELECT COUNT(*) as count FROM predictions WHERE 1=1";
    let dataQuery = "SELECT * FROM predictions WHERE 1=1";
    const params: any[] = [];

    if (pair) {
      countQuery += " AND pair = ?";
      dataQuery += " AND pair = ?";
      params.push(pair);
    }
    if (timeframe) {
      countQuery += " AND timeframe = ?";
      dataQuery += " AND timeframe = ?";
      params.push(timeframe);
    }
    if (bias) {
      countQuery += " AND bias = ?";
      dataQuery += " AND bias = ?";
      params.push(bias);
    }

    dataQuery += " ORDER BY timestamp DESC LIMIT ? OFFSET ?";

    const countRow = await getQuery(countQuery, params.slice(0, params.length));
    const total = countRow?.count || 0;

    const dataParams = [...params, limit, offset];
    const rows = await allQuery(dataQuery, dataParams);

    const predictions = rows.map((row) => this.mapRowToPrediction(row));

    return { predictions, total };
  }

  /**
   * Map database row to Prediction object
   */
  private mapRowToPrediction(row: any): Prediction {
    return {
      id: row.id,
      timestamp: new Date(row.timestamp),
      pair: row.pair,
      timeframe: row.timeframe,
      currentPrice: row.current_price,
      candleNumber: row.candle_number,
      bias: row.bias,
      confidence: row.confidence,
      bullishScore: row.bullish_score,
      bearishScore: row.bearish_score,
      evidence: JSON.parse(row.evidence_json),
      explanation: row.explanation,
      supportingEvidence: JSON.parse(row.supporting_evidence_json),
      conflictingEvidence: JSON.parse(row.conflicting_evidence_json),
      dataStatus: row.data_status,
    };
  }
}

export default new PredictionModel();
