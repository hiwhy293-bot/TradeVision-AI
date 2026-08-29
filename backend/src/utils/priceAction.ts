/**
 * Price Action Analysis
 */

export interface CandleAnalysis {
  pattern: string | null;
  bodySize: number;
  upperWick: number;
  lowerWick: number;
  isBullish: boolean;
  bodyPercentage: number; // body size as % of total range
}

export function analyzeCandlePattern(open: number, high: number, low: number, close: number): CandleAnalysis {
  const bodySize = Math.abs(close - open);
  const upperWick = high - Math.max(open, close);
  const lowerWick = Math.min(open, close) - low;
  const totalRange = high - low;
  const isBullish = close > open;

  let pattern: string | null = null;

  // Doji pattern: small body, balanced wicks
  if (bodySize < totalRange * 0.1 && Math.abs(upperWick - lowerWick) < totalRange * 0.1) {
    pattern = "doji";
  }
  // Hammer: small upper wick, large lower wick, bullish
  else if (upperWick < bodySize * 0.5 && lowerWick > bodySize * 2 && isBullish) {
    pattern = "hammer";
  }
  // Hanging man: small upper wick, large lower wick, bearish
  else if (upperWick < bodySize * 0.5 && lowerWick > bodySize * 2 && !isBullish) {
    pattern = "hanging_man";
  }
  // Long upper wick rejection
  else if (upperWick > bodySize * 2 && lowerWick < bodySize * 0.5) {
    pattern = "rejection_high";
  }
  // Long lower wick rejection
  else if (lowerWick > bodySize * 2 && upperWick < bodySize * 0.5) {
    pattern = "rejection_low";
  }

  return {
    pattern,
    bodySize,
    upperWick,
    lowerWick,
    isBullish,
    bodyPercentage: (bodySize / totalRange) * 100,
  };
}

export function detectEngulfingPattern(
  prev: { open: number; high: number; low: number; close: number },
  current: { open: number; high: number; low: number; close: number }
): "bullish" | "bearish" | null {
  // Bullish engulfing: previous bearish, current bullish and engulfs
  if (
    prev.close < prev.open &&
    current.close > current.open &&
    current.low <= prev.low &&
    current.high >= prev.high &&
    current.close > prev.open
  ) {
    return "bullish";
  }
  // Bearish engulfing: previous bullish, current bearish and engulfs
  else if (
    prev.close > prev.open &&
    current.close < current.open &&
    current.low <= prev.low &&
    current.high >= prev.high &&
    current.close < prev.open
  ) {
    return "bearish";
  }
  return null;
}

export function detectBreakout(
  prices: { high: number; low: number }[],
  resistance: number,
  support: number
): "bullish" | "bearish" | null {
  if (prices.length === 0) return null;
  const currentHigh = prices[prices.length - 1].high;
  const currentLow = prices[prices.length - 1].low;
  const previousHigh = prices[prices.length - 2]?.high || currentHigh;
  const previousLow = prices[prices.length - 2]?.low || currentLow;

  // Breakout above resistance
  if (currentHigh > resistance && previousHigh <= resistance) {
    return "bullish";
  }
  // Breakdown below support
  else if (currentLow < support && previousLow >= support) {
    return "bearish";
  }
  return null;
}

export function detectHigherHighsLowerLows(
  highs: number[],
  lows: number[]
): { pattern: "higher_highs" | "higher_lows" | "lower_highs" | "lower_lows" | null; count: number } {
  if (highs.length < 3) return { pattern: null, count: 0 };

  let higherHighs = 0;
  let higherLows = 0;
  let lowerHighs = 0;
  let lowerLows = 0;

  for (let i = 2; i < highs.length; i++) {
    if (highs[i] > highs[i - 1] && highs[i - 1] > highs[i - 2]) higherHighs++;
    if (lows[i] > lows[i - 1] && lows[i - 1] > lows[i - 2]) higherLows++;
    if (highs[i] < highs[i - 1] && highs[i - 1] < highs[i - 2]) lowerHighs++;
    if (lows[i] < lows[i - 1] && lows[i - 1] < lows[i - 2]) lowerLows++;
  }

  if (higherHighs >= 2 && higherLows >= 2) return { pattern: "higher_highs", count: higherHighs };
  if (lowerHighs >= 2 && lowerLows >= 2) return { pattern: "lower_lows", count: lowerLows };
  if (higherHighs >= 2) return { pattern: "higher_highs", count: higherHighs };
  if (lowerHighs >= 2) return { pattern: "lower_highs", count: lowerHighs };

  return { pattern: null, count: 0 };
}

export function detectConsolidation(
  prices: { high: number; low: number; close: number }[],
  windowSize: number = 5
): boolean {
  if (prices.length < windowSize) return false;

  const recentPrices = prices.slice(-windowSize);
  const range = Math.max(...recentPrices.map((p) => p.high)) - Math.min(...recentPrices.map((p) => p.low));
  const avgClose = recentPrices.reduce((sum, p) => sum + p.close, 0) / windowSize;

  // Consolidation if range is small relative to price
  return range < avgClose * 0.01; // Less than 1% range
}
