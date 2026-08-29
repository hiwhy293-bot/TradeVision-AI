export interface Candle {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timeframe: string;
  pair: string;
}

export interface Prediction {
  id: string;
  timestamp: Date;
  pair: string;
  timeframe: string;
  currentPrice: number;
  candleNumber: number;
  bias: 'UP' | 'DOWN' | 'WAIT';
  confidence: number;
  bullishScore: number;
  bearishScore: number;
  evidence: EvidenceBreakdown;
  explanation: string;
  supportingEvidence: string[];
  conflictingEvidence: string[];
  dataStatus: string;
}

export interface EvidenceBreakdown {
  trend: { bullish: number; bearish: number };
  momentum: { bullish: number; bearish: number };
  priceAction: { bullish: number; bearish: number };
  marketStructure: { bullish: number; bearish: number };
  supportResistance: { bullish: number; bearish: number };
  volatility: { impact: 'high' | 'medium' | 'low' };
}

export interface PaperTrade {
  id: string;
  predictionId: string;
  pair: string;
  direction: 'LONG' | 'SHORT';
  quantity: number;
  entryPrice: number;
  entryTime: Date;
  exitPrice?: number;
  exitTime?: Date;
  stopLoss: number;
  takeProfit: number;
  profitLoss?: number;
  status: 'open' | 'closed';
  exitReason?: string;
}

export interface MarketData {
  pair: string;
  price: number;
  timestamp: Date;
  bid: number;
  ask: number;
  dayHigh: number;
  dayLow: number;
  dayChange: number;
  dayChangePercent: number;
}
