export interface EvidenceItem {
  category: "trend" | "momentum" | "priceAction" | "marketStructure" | "supportResistance" | "volatility";
  type: "bullish" | "bearish" | "neutral";
  points: number;
  description: string;
  confidence: number; // 0-100
}

export interface EvidenceReport {
  bullishEvidence: EvidenceItem[];
  bearishEvidence: EvidenceItem[];
  neutralEvidence: EvidenceItem[];
  bullishTotal: number;
  bearishTotal: number;
  decision: "UP" | "DOWN" | "WAIT";
  confidenceScore: number;
  indicatorAgreement: number; // 0-100
}
