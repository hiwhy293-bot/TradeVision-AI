/**
 * Volatility Analysis
 */

export interface VolatilityMetrics {
  atr: number;
  level: "low" | "medium" | "high" | "extreme";
  volatilityExpansion: boolean;
  volatilityContraction: boolean;
  medianATR: number;
  volatilityRatio: number; // current ATR / median ATR
}

export function analyzeVolatility(
  highs: number[],
  lows: number[],
  closes: number[],
  currentATR: number,
  historicalATRs: number[]
): VolatilityMetrics {
  const medianATR = calculateMedian(historicalATRs);
  const volatilityRatio = medianATR > 0 ? currentATR / medianATR : 1;

  let level: "low" | "medium" | "high" | "extreme";
  if (volatilityRatio > 2) {
    level = "extreme";
  } else if (volatilityRatio > 1.5) {
    level = "high";
  } else if (volatilityRatio > 0.8) {
    level = "medium";
  } else {
    level = "low";
  }

  // Detect expansion/contraction
  const recentATRs = historicalATRs.slice(-5);
  const volatilityExpansion = currentATR > medianATR * 1.2;
  const volatilityContraction = currentATR < medianATR * 0.8;

  return {
    atr: currentATR,
    level,
    volatilityExpansion,
    volatilityContraction,
    medianATR,
    volatilityRatio,
  };
}

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

export function getVolatilityThreshold(
  volatilityLevel: "low" | "medium" | "high" | "extreme"
): number {
  switch (volatilityLevel) {
    case "low":
      return 10; // Lower threshold for divergence
    case "medium":
      return 15;
    case "high":
      return 20;
    case "extreme":
      return 30; // Higher threshold, stronger signals needed
    default:
      return 15;
  }
}
