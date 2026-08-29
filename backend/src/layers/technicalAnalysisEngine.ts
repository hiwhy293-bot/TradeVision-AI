import { TechnicalIndicators, Candle } from "../types/market";
import {
  calculateRSI,
  calculateMACD,
  calculateEMA,
  calculateSMA,
  calculateATR,
  calculateRateOfChange,
  calculateBollingerBands,
} from "../utils/indicators";
import { analyzeCandlePattern, detectHigherHighsLowerLows } from "../utils/priceAction";
import { analyzeMarketStructure } from "../utils/marketStructure";

export class TechnicalAnalysisEngine {
  /**
   * Analyze all technical indicators for a set of candles
   */
  analyze(candles: Candle[]): TechnicalIndicators {
    if (candles.length === 0) {
      return this.getDefaultIndicators();
    }

    const closes = candles.map((c) => c.close);
    const highs = candles.map((c) => c.high);
    const lows = candles.map((c) => c.low);
    const opens = candles.map((c) => c.open);

    // Calculate all indicators
    const rsi = calculateRSI(closes, 14);
    const macd = calculateMACD(closes, 12, 26, 9);
    const ema5 = calculateEMA(closes, 5);
    const ema10 = calculateEMA(closes, 10);
    const ema20 = calculateEMA(closes, 20);
    const ema50 = calculateEMA(closes, 50);
    const sma50 = calculateSMA(closes, 50);
    const sma200 = calculateSMA(closes, 200);
    const atr = calculateATR(highs, lows, closes, 14);
    const bollingerBands = calculateBollingerBands(closes, 20, 2);
    const roc = calculateRateOfChange(closes, 12);

    // Determine trend
    let trend: "bullish" | "bearish" | "neutral" = "neutral";
    if (ema5 > ema10 && ema10 > ema20 && closes[closes.length - 1] > sma50) {
      trend = "bullish";
    } else if (ema5 < ema10 && ema10 < ema20 && closes[closes.length - 1] < sma50) {
      trend = "bearish";
    }

    return {
      rsi,
      macd,
      movingAverages: {
        ema5,
        ema10,
        ema20,
        ema50,
        sma50,
        sma200,
      },
      atr,
      bollingerBands,
      roc,
      trend,
    };
  }

  /**
   * Analyze trend from candles
   */
  analyzeTrend(candles: Candle[]): {
    direction: "bullish" | "bearish" | "neutral";
    strength: number; // 0-100
    higherHighs: boolean;
    higherLows: boolean;
    lowerHighs: boolean;
    lowerLows: boolean;
  } {
    if (candles.length < 3) {
      return {
        direction: "neutral",
        strength: 0,
        higherHighs: false,
        higherLows: false,
        lowerHighs: false,
        lowerLows: false,
      };
    }

    const highs = candles.map((c) => c.high);
    const lows = candles.map((c) => c.low);
    const { pattern, count } = detectHigherHighsLowerLows(highs, lows);

    let direction: "bullish" | "bearish" | "neutral" = "neutral";
    let strength = 0;

    if (pattern === "higher_highs") {
      direction = "bullish";
      strength = Math.min(50 + count * 10, 100);
    } else if (pattern === "lower_lows") {
      direction = "bearish";
      strength = Math.min(50 + count * 10, 100);
    }

    return {
      direction,
      strength,
      higherHighs: pattern === "higher_highs",
      higherLows: true, // Simplified
      lowerHighs: pattern === "lower_highs",
      lowerLows: pattern === "lower_lows",
    };
  }

  /**
   * Analyze momentum
   */
  analyzeMomentum(candles: Candle[]): {
    direction: "bullish" | "bearish" | "neutral";
    strength: number; // 0-100
    rsiSignal: "overbought" | "oversold" | "neutral";
    macdSignal: "bullish" | "bearish" | "neutral";
  } {
    if (candles.length === 0) {
      return {
        direction: "neutral",
        strength: 0,
        rsiSignal: "neutral",
        macdSignal: "neutral",
      };
    }

    const closes = candles.map((c) => c.close);
    const rsi = calculateRSI(closes, 14);
    const macd = calculateMACD(closes, 12, 26, 9);

    let direction: "bullish" | "bearish" | "neutral" = "neutral";
    let strength = 0;
    let rsiSignal: "overbought" | "oversold" | "neutral" = "neutral";
    let macdSignal: "bullish" | "bearish" | "neutral" = "neutral";

    // RSI analysis
    if (rsi > 70) {
      rsiSignal = "overbought";
      strength -= 10;
    } else if (rsi < 30) {
      rsiSignal = "oversold";
      strength -= 10;
    } else if (rsi > 50) {
      rsiSignal = "neutral";
      direction = "bullish";
      strength += 10;
    } else if (rsi < 50) {
      rsiSignal = "neutral";
      direction = "bearish";
      strength += 10;
    }

    // MACD analysis
    if (macd.line > macd.signal) {
      macdSignal = "bullish";
      if (direction === "neutral") direction = "bullish";
      strength += 15;
    } else if (macd.line < macd.signal) {
      macdSignal = "bearish";
      if (direction === "neutral") direction = "bearish";
      strength += 15;
    }

    strength = Math.max(0, Math.min(strength, 100));

    return {
      direction,
      strength,
      rsiSignal,
      macdSignal,
    };
  }

  /**
   * Analyze volatility
   */
  analyzeVolatility(candles: Candle[]): {
    level: "low" | "medium" | "high";
    atr: number;
    expanding: boolean;
    contracting: boolean;
  } {
    if (candles.length < 14) {
      return {
        level: "medium",
        atr: 0,
        expanding: false,
        contracting: false,
      };
    }

    const highs = candles.map((c) => c.high);
    const lows = candles.map((c) => c.low);
    const closes = candles.map((c) => c.close);
    const atr = calculateATR(highs, lows, closes, 14);

    // Calculate median ATR
    const atrs: number[] = [];
    for (let i = 14; i < Math.min(candles.length, 30); i++) {
      atrs.push(calculateATR(highs.slice(0, i), lows.slice(0, i), closes.slice(0, i), 14));
    }
    const medianATR = atrs.length > 0 ? atrs.sort((a, b) => a - b)[Math.floor(atrs.length / 2)] : atr;

    let level: "low" | "medium" | "high" = "medium";
    if (atr > medianATR * 1.5) {
      level = "high";
    } else if (atr < medianATR * 0.7) {
      level = "low";
    }

    const expanding = atr > medianATR * 1.2;
    const contracting = atr < medianATR * 0.8;

    return {
      level,
      atr,
      expanding,
      contracting,
    };
  }

  private getDefaultIndicators(): TechnicalIndicators {
    return {
      rsi: 50,
      macd: { line: 0, signal: 0, histogram: 0 },
      movingAverages: {
        ema5: 0,
        ema10: 0,
        ema20: 0,
        ema50: 0,
        sma50: 0,
        sma200: 0,
      },
      atr: 0,
      bollingerBands: { upper: 0, middle: 0, lower: 0 },
      roc: 0,
      trend: "neutral",
    };
  }
}

export default new TechnicalAnalysisEngine();
