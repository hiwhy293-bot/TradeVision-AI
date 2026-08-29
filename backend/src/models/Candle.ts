import { Candle } from "../types/market";
import { runQuery, allQuery, getQuery } from "../config/database";
import { v4 as uuidv4 } from "uuid";

export class CandleModel {
  /**
   * Store candle in cache
   */
  async cacheCandle(candle: Candle): Promise<void> {
    const query = `
      INSERT OR REPLACE INTO candle_cache (
        id, pair, timeframe, timestamp, open, high, low, close, volume
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const id = `${candle.pair}_${candle.timeframe}_${candle.timestamp.getTime()}`;

    await runQuery(query, [
      id,
      candle.pair,
      candle.timeframe,
      candle.timestamp.toISOString(),
      candle.open,
      candle.high,
      candle.low,
      candle.close,
      candle.volume,
    ]);
  }

  /**
   * Get cached candles
   */
  async getCandles(pair: string, timeframe: string, limit: number = 100): Promise<Candle[]> {
    const query = `
      SELECT * FROM candle_cache
      WHERE pair = ? AND timeframe = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `;

    const rows = await allQuery(query, [pair, timeframe, limit]);

    return rows
      .reverse()
      .map((row) => ({
        timestamp: new Date(row.timestamp),
        open: row.open,
        high: row.high,
        low: row.low,
        close: row.close,
        volume: row.volume,
        pair: row.pair,
        timeframe: row.timeframe,
      }));
  }

  /**
   * Get latest candle
   */
  async getLatestCandle(pair: string, timeframe: string): Promise<Candle | null> {
    const query = `
      SELECT * FROM candle_cache
      WHERE pair = ? AND timeframe = ?
      ORDER BY timestamp DESC
      LIMIT 1
    `;

    const row = await getQuery(query, [pair, timeframe]);

    if (!row) return null;

    return {
      timestamp: new Date(row.timestamp),
      open: row.open,
      high: row.high,
      low: row.low,
      close: row.close,
      volume: row.volume,
      pair: row.pair,
      timeframe: row.timeframe,
    };
  }
}

export default new CandleModel();
