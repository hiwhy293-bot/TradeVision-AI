export interface Candle {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timeframe: string; // "1m", "5m", "15m", "30m", "1H", "4H", "1D"
  pair: string; // "EUR/USD", etc.
}

export interface MarketData {
  pair: string;
  timeframe: string;
  currentPrice: number;
  bid: number;
  ask: number;
  timestamp: Date;
  dayHigh: number;
  dayLow: number;
  dayChange: number;
  dayChangePercent: number;
  previousCandle: Candle;
  currentCandle: Candle;
}

export interface TechnicalIndicators {
  rsi: number; // 0-100
  macd: {
    line: number;
    signal: number;
    histogram: number;
  };
  movingAverages: {
    ema5: number;
    ema10: number;
    ema20: number;
    ema50: number;
    sma50: number;
    sma200: number;
  };
  atr: number; // Average True Range
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  roc: number; // Rate of Change
  trend: "bullish" | "bearish" | "neutral";
}

export interface PriceActionAnalysis {
  candlePattern: string | null; // "doji", "engulfing", "pinbar", etc.
  bodySize: number;
  upperWick: number;
  lowerWick: number;
  isBullish: boolean; // close > open
  support: number | null;
  resistance: number | null;
  breakout: boolean;
  breakdown: boolean;
  consolidation: boolean;
}

export interface MarketStructure {
  highestHigh: number;
  lowestLow: number;
  trend: "uptrend" | "downtrend" | "sideways";
  breakOfStructure: boolean;
  possibleReversal: boolean;
  supportZones: number[];
  resistanceZones: number[];
}

export interface VolatilityAnalysis {
  atr: number;
  level: "low" | "medium" | "high";
  volatilityExpansion: boolean;
  volatilityContraction: boolean;
}
