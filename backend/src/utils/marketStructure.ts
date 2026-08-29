/**
 * Market Structure Analysis
 */

export interface StructureAnalysis {
  highestHigh: number;
  lowestLow: number;
  trend: "uptrend" | "downtrend" | "sideways";
  breakOfStructure: boolean;
  supportZones: number[];
  resistanceZones: number[];
}

export function analyzeMarketStructure(
  highs: number[],
  lows: number[],
  closes: number[]
): StructureAnalysis {
  if (highs.length === 0 || lows.length === 0) {
    return {
      highestHigh: 0,
      lowestLow: 0,
      trend: "sideways",
      breakOfStructure: false,
      supportZones: [],
      resistanceZones: [],
    };
  }

  const highestHigh = Math.max(...highs);
  const lowestLow = Math.min(...lows);
  const currentHigh = highs[highs.length - 1];
  const currentLow = lows[lows.length - 1];
  const currentClose = closes[closes.length - 1];

  // Determine trend
  let trend: "uptrend" | "downtrend" | "sideways" = "sideways";
  let higherHighs = 0;
  let higherLows = 0;
  let lowerHighs = 0;
  let lowerLows = 0;

  for (let i = 1; i < Math.min(highs.length, 5); i++) {
    if (highs[i] > highs[i - 1]) higherHighs++;
    if (lows[i] > lows[i - 1]) higherLows++;
    if (highs[i] < highs[i - 1]) lowerHighs++;
    if (lows[i] < lows[i - 1]) lowerLows++;
  }

  if (higherHighs >= 2 && higherLows >= 2) trend = "uptrend";
  else if (lowerHighs >= 2 && lowerLows >= 2) trend = "downtrend";

  // Detect break of structure
  let breakOfStructure = false;
  if (trend === "uptrend" && currentLow < Math.min(...lows.slice(-5))) {
    breakOfStructure = true;
  } else if (trend === "downtrend" && currentHigh > Math.max(...highs.slice(-5))) {
    breakOfStructure = true;
  }

  // Identify support and resistance zones
  const supportZones = identifyPivotPoints(lows, "support");
  const resistanceZones = identifyPivotPoints(highs, "resistance");

  return {
    highestHigh,
    lowestLow,
    trend,
    breakOfStructure,
    supportZones,
    resistanceZones,
  };
}

export function identifyPivotPoints(
  values: number[],
  type: "support" | "resistance"
): number[] {
  if (values.length < 3) return [];

  const pivots: number[] = [];
  const recentValues = values.slice(-10);

  for (let i = 1; i < recentValues.length - 1; i++) {
    if (type === "support" && recentValues[i] < recentValues[i - 1] && recentValues[i] < recentValues[i + 1]) {
      pivots.push(recentValues[i]);
    } else if (
      type === "resistance" &&
      recentValues[i] > recentValues[i - 1] &&
      recentValues[i] > recentValues[i + 1]
    ) {
      pivots.push(recentValues[i]);
    }
  }

  // Return unique values sorted
  return [...new Set(pivots)].sort((a, b) => (type === "support" ? b - a : a - b));
}

export function findNearestSupport(currentPrice: number, supports: number[]): number | null {
  const belowSupports = supports.filter((s) => s < currentPrice);
  if (belowSupports.length === 0) return null;
  return belowSupports.reduce((a, b) => (Math.abs(b - currentPrice) < Math.abs(a - currentPrice) ? b : a));
}

export function findNearestResistance(currentPrice: number, resistances: number[]): number | null {
  const aboveResistances = resistances.filter((r) => r > currentPrice);
  if (aboveResistances.length === 0) return null;
  return aboveResistances.reduce((a, b) => (Math.abs(b - currentPrice) < Math.abs(a - currentPrice) ? b : a));
}
