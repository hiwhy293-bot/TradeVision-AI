import axios from "axios";
import { Candle, MarketData } from "../types/market";
import { SUPPORTED_PAIRS, SUPPORTED_TIMEFRAMES, TIMEFRAME_MILLISECONDS, DEMO_MODE_ENABLED } from "../config/constants";

interface RawCandleData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class MarketDataLayer {
  private currentCandles: Map<string, Candle> = new Map();
  private candleHistory: Map<string, Candle[]> = new Map();
  private lastCandleTimestamp: Map<string, Date> = new Map();

  constructor() {
    if (DEMO_MODE_ENABLED) {
      console.log("Market Data Layer initialized in DEMO MODE");
    } else {
      console.log("Market Data Layer initialized");
    }
  }

  /**
   * Detect if a new candle has closed and return it
   */
  async detectNewCandle(pair: string, timeframe: string): Promise<Candle | null> {
    const key = `${pair}_${timeframe}`;
    const currentCandle = await this.fetchCandle(pair, timeframe);

    if (!currentCandle) return null;

    const lastTimestamp = this.lastCandleTimestamp.get(key);

    // Check if this is a new candle
    if (lastTimestamp && currentCandle.timestamp > lastTimestamp) {
      this.lastCandleTimestamp.set(key, currentCandle.timestamp);
      return currentCandle; // New candle detected
    }

    if (!lastTimestamp) {
      this.lastCandleTimestamp.set(key, currentCandle.timestamp);
    }

    return null; // Same candle
  }

  /**
   * Fetch current candle data
   */
  async fetchCandle(pair: string, timeframe: string): Promise<Candle | null> {
    if (!this.validateInput(pair, timeframe)) {
      console.error(`Invalid pair or timeframe: ${pair} ${timeframe}`);
      return null;
    }

    try {
      if (DEMO_MODE_ENABLED) {
        return this.generateDemoCandle(pair, timeframe);
      }

      // In production, fetch from real API
      return await this.fetchFromAPI(pair, timeframe);
    } catch (error) {
      console.error(`Error fetching candle: ${error}`);
      // Fallback to demo data
      return this.generateDemoCandle(pair, timeframe);
    }
  }

  /**
   * Fetch historical candles
   */
  async fetchCandles(pair: string, timeframe: string, limit: number = 100): Promise<Candle[]> {
    if (!this.validateInput(pair, timeframe)) {
      return [];
    }

    try {
      if (DEMO_MODE_ENABLED) {
        return this.generateDemoCandles(pair, timeframe, limit);
      }

      return await this.fetchFromAPI(pair, timeframe, limit);
    } catch (error) {
      console.error(`Error fetching candles: ${error}`);
      return this.generateDemoCandles(pair, timeframe, limit);
    }
  }

  /**
   * Fetch from real API (Alpha Vantage, etc.)
   */
  private async fetchFromAPI(pair: string, timeframe: string, limit: number = 100): Promise<Candle[]> {
    const apiKey = process.env.FOREX_API_KEY;
    if (!apiKey) {
      throw new Error("API key not configured");
    }

    // Alpha Vantage endpoint example
    const url = `${process.env.FOREX_API_BASE_URL}/query`;
    const params = {
      function: timeframe === "1D" ? "FX_DAILY" : "FX_INTRADAY",
      from_symbol: pair.split("/")[0],
      to_symbol: pair.split("/")[1],
      interval: this.mapTimeframe(timeframe),
      apikey: apiKey,
      outputsize: "full",
    };

    const response = await axios.get(url, { params });
    return this.parseAPIResponse(response.data, pair, timeframe);
  }

  /**
   * Parse API response and return candles
   */
  private parseAPIResponse(data: any, pair: string, timeframe: string): Candle[] {
    const candles: Candle[] = [];
    const timeSeries = data[`Time Series FX (${this.mapTimeframe(timeframe)})`];

    if (!timeSeries) {
      return candles;
    }

    Object.entries(timeSeries).forEach(([timestamp, values]: [string, any]) => {
      candles.push({
        timestamp: new Date(timestamp),
        open: parseFloat(values["1. open"]),
        high: parseFloat(values["2. high"]),
        low: parseFloat(values["3. low"]),
        close: parseFloat(values["4. close"]),
        volume: 0, // Forex doesn't have volume
        pair,
        timeframe,
      });
    });

    return candles.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Generate demo candle data
   */
  private generateDemoCandle(pair: string, timeframe: string): Candle {
    const basePrice = this.getBasePriceForPair(pair);
    const volatility = Math.random() * 0.01; // 1% max volatility
    const direction = Math.random() > 0.5 ? 1 : -1;

    const open = basePrice + (Math.random() - 0.5) * volatility * basePrice;
    const close = open + direction * Math.random() * volatility * basePrice;
    const high = Math.max(open, close) + Math.random() * volatility * basePrice * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * basePrice * 0.5;

    return {
      timestamp: new Date(),
      open: Math.round(open * 10000) / 10000,
      high: Math.round(high * 10000) / 10000,
      low: Math.round(low * 10000) / 10000,
      close: Math.round(close * 10000) / 10000,
      volume: Math.floor(Math.random() * 50000) + 10000,
      pair,
      timeframe,
    };
  }

  /**
   * Generate demo candle history
   */
  private generateDemoCandles(pair: string, timeframe: string, limit: number): Candle[] {
    const candles: Candle[] = [];
    let basePrice = this.getBasePriceForPair(pair);
    const now = new Date();
    const candleDuration = TIMEFRAME_MILLISECONDS[timeframe] || 60000;

    for (let i = limit; i > 0; i--) {
      const volatility = Math.random() * 0.01;
      const direction = Math.random() > 0.5 ? 1 : -1;

      const open = basePrice + (Math.random() - 0.5) * volatility * basePrice;
      const close = open + direction * Math.random() * volatility * basePrice;
      const high = Math.max(open, close) + Math.random() * volatility * basePrice * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * basePrice * 0.5;

      candles.push({
        timestamp: new Date(now.getTime() - i * candleDuration),
        open: Math.round(open * 10000) / 10000,
        high: Math.round(high * 10000) / 10000,
        low: Math.round(low * 10000) / 10000,
        close: Math.round(close * 10000) / 10000,
        volume: Math.floor(Math.random() * 50000) + 10000,
        pair,
        timeframe,
      });

      basePrice = close; // Next candle starts near this close
    }

    return candles;
  }

  /**
   * Get current market data for a pair
   */
  async getMarketData(pair: string, timeframe: string): Promise<MarketData | null> {
    const currentCandle = await this.fetchCandle(pair, timeframe);
    const candles = await this.fetchCandles(pair, timeframe, 2);

    if (!currentCandle || candles.length === 0) {
      return null;
    }

    const previousCandle = candles[candles.length - 2] || currentCandle;

    return {
      pair,
      timeframe,
      currentPrice: currentCandle.close,
      bid: currentCandle.close - 0.0001,
      ask: currentCandle.close + 0.0001,
      timestamp: currentCandle.timestamp,
      dayHigh: currentCandle.high,
      dayLow: currentCandle.low,
      dayChange: currentCandle.close - previousCandle.close,
      dayChangePercent: ((currentCandle.close - previousCandle.close) / previousCandle.close) * 100,
      previousCandle,
      currentCandle,
    };
  }

  /**
   * Validate pair and timeframe
   */
  private validateInput(pair: string, timeframe: string): boolean {
    return SUPPORTED_PAIRS.includes(pair) && SUPPORTED_TIMEFRAMES.includes(timeframe);
  }

  /**
   * Map timeframe to API format
   */
  private mapTimeframe(timeframe: string): string {
    const mapping: { [key: string]: string } = {
      "1m": "1min",
      "5m": "5min",
      "15m": "15min",
      "30m": "30min",
      "1H": "60min",
      "4H": "240min",
      "1D": "daily",
    };
    return mapping[timeframe] || "5min";
  }

  /**
   * Get base price for demo data generation
   */
  private getBasePriceForPair(pair: string): number {
    const prices: { [key: string]: number } = {
      "EUR/USD": 1.095,
      "GBP/USD": 1.27,
      "USD/JPY": 145.5,
      "USD/CHF": 0.92,
      "AUD/USD": 0.67,
      "USD/CAD": 1.36,
      "NZD/USD": 0.61,
      "EUR/JPY": 159.5,
      "GBP/JPY": 185.2,
    };
    return prices[pair] || 1.0;
  }
}

export default new MarketDataLayer();
