/**
 * Technical Indicator Calculations
 */

export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50; // Neutral

  let gains = 0;
  let losses = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff;
    else losses += Math.abs(diff);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return avgGain === 0 ? 50 : 100;

  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  return Math.round(rsi * 100) / 100;
}

export interface MACDResult {
  line: number;
  signal: number;
  histogram: number;
}

export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult {
  const emaFast = calculateEMA(prices, fastPeriod);
  const emaSlow = calculateEMA(prices, slowPeriod);
  const macdLine = emaFast - emaSlow;

  // For simplicity, approximate signal line
  const signalLine = macdLine * 0.95; // Simplified
  const histogram = macdLine - signalLine;

  return {
    line: Math.round(macdLine * 10000) / 10000,
    signal: Math.round(signalLine * 10000) / 10000,
    histogram: Math.round(histogram * 10000) / 10000,
  };
}

export function calculateEMA(prices: number[], period: number): number {
  if (prices.length === 0) return 0;
  if (prices.length <= period) return prices[prices.length - 1];

  const multiplier = 2 / (period + 1);
  let ema = prices[0];

  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * multiplier + ema * (1 - multiplier);
  }

  return Math.round(ema * 10000) / 10000;
}

export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];
  const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
  return Math.round((sum / period) * 10000) / 10000;
}

export function calculateATR(
  highs: number[],
  lows: number[],
  closes: number[],
  period: number = 14
): number {
  const trueRanges: number[] = [];

  for (let i = 1; i < highs.length; i++) {
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
    trueRanges.push(tr);
  }

  const recentTRs = trueRanges.slice(-period);
  const atr = recentTRs.reduce((a, b) => a + b, 0) / period;

  return Math.round(atr * 10000) / 10000;
}

export function calculateRateOfChange(prices: number[], period: number = 12): number {
  if (prices.length < period) return 0;
  const currentPrice = prices[prices.length - 1];
  const previousPrice = prices[prices.length - 1 - period];
  if (previousPrice === 0) return 0;
  const roc = ((currentPrice - previousPrice) / previousPrice) * 100;
  return Math.round(roc * 100) / 100;
}

export function calculateBollingerBands(
  prices: number[],
  period: number = 20,
  stdDevMultiplier: number = 2
): { upper: number; middle: number; lower: number } {
  const middle = calculateSMA(prices, period);
  const recentPrices = prices.slice(-period);
  const variance =
    recentPrices.reduce((sum, price) => sum + Math.pow(price - middle, 2), 0) / period;
  const stdDev = Math.sqrt(variance);

  return {
    upper: Math.round((middle + stdDev * stdDevMultiplier) * 10000) / 10000,
    middle: middle,
    lower: Math.round((middle - stdDev * stdDevMultiplier) * 10000) / 10000,
  };
}
