export interface EvidenceBreakdown {
  trend: { bullish: number; bearish: number };
  momentum: { bullish: number; bearish: number };
  priceAction: { bullish: number; bearish: number };
  marketStructure: { bullish: number; bearish: number };
  supportResistance: { bullish: number; bearish: number };
  volatility: { impact: "high" | "medium" | "low" };
}

export interface Prediction {
  id: string;
  timestamp: Date;
  pair: string;
  timeframe: string;
  currentPrice: number;
  candleNumber: number;
  bias: "UP" | "DOWN" | "WAIT";
  confidence: number; // 0-100
  bullishScore: number;
  bearishScore: number;
  evidence: EvidenceBreakdown;
  explanation: string;
  supportingEvidence: string[];
  conflictingEvidence: string[];
  dataStatus: string; // "live" or "demo"
}

export interface PredictionResult {
  id: string;
  predictionId: string;
  actualBias: "UP" | "DOWN" | string;
  correct: boolean;
  recordedAt: Date;
}

export interface PredictionStatistics {
  totalPredictions: number;
  correctPredictions: number;
  incorrectPredictions: number;
  waitPredictions: number;
  accuracy: number; // percentage
  upPredictions: number;
  downPredictions: number;
  upAccuracy: number;
  downAccuracy: number;
  byTimeframe: { [key: string]: { total: number; accuracy: number } };
  byPair: { [key: string]: { total: number; accuracy: number } };
}
