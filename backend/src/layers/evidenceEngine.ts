import { EvidenceReport, EvidenceItem } from "../types/evidence";
import { TechnicalIndicators, VolatilityAnalysis, Candle } from "../types/market";
import { EVIDENCE_THRESHOLDS } from "../config/constants";

export class EvidenceEngine {
  /**
   * Score all evidence and generate a report
   */
  generateEvidenceReport(
    indicators: TechnicalIndicators,
    trendAnalysis: any,
    momentumAnalysis: any,
    priceActionAnalysis: any,
    marketStructure: any,
    volatilityAnalysis: VolatilityAnalysis
  ): EvidenceReport {
    const bullishEvidence: EvidenceItem[] = [];
    const bearishEvidence: EvidenceItem[] = [];
    const neutralEvidence: EvidenceItem[] = [];

    // Trend evidence (0-20 points)
    this.scoreTrendEvidence(trendAnalysis, bullishEvidence, bearishEvidence);

    // Momentum evidence (0-15 points)
    this.scoreMomentumEvidence(momentumAnalysis, bullishEvidence, bearishEvidence);

    // Price action evidence (0-15 points)
    this.scorePriceActionEvidence(priceActionAnalysis, bullishEvidence, bearishEvidence);

    // Market structure evidence (0-15 points)
    this.scoreMarketStructureEvidence(marketStructure, bullishEvidence, bearishEvidence);

    // Support/Resistance evidence (0-10 points)
    this.scoreSupportResistanceEvidence(indicators, bullishEvidence, bearishEvidence);

    // Calculate totals
    const bullishTotal = bullishEvidence.reduce((sum, e) => sum + e.points, 0);
    const bearishTotal = bearishEvidence.reduce((sum, e) => sum + e.points, 0);

    // Determine decision
    const difference = bullishTotal - bearishTotal;
    const threshold = EVIDENCE_THRESHOLDS.BIAS_THRESHOLD;

    let decision: "UP" | "DOWN" | "WAIT";
    if (Math.abs(difference) < threshold) {
      decision = "WAIT";
    } else if (difference > 0) {
      decision = "UP";
    } else {
      decision = "DOWN";
    }

    // Calculate indicator agreement
    const indicatorAgreement = this.calculateIndicatorAgreement(bullishEvidence, bearishEvidence, decision);

    // Calculate confidence score
    const confidenceScore = this.calculateConfidence(
      bullishTotal,
      bearishTotal,
      indicatorAgreement,
      volatilityAnalysis.level
    );

    return {
      bullishEvidence,
      bearishEvidence,
      neutralEvidence,
      bullishTotal,
      bearishTotal,
      decision,
      confidenceScore,
      indicatorAgreement,
    };
  }

  private scoreTrendEvidence(
    trendAnalysis: any,
    bullishEvidence: EvidenceItem[],
    bearishEvidence: EvidenceItem[]
  ): void {
    if (trendAnalysis.direction === "bullish") {
      if (trendAnalysis.higherHighs) {
        bullishEvidence.push({
          category: "trend",
          type: "bullish",
          points: 5,
          description: "Higher Highs detected",
          confidence: 80,
        });
      }
      if (trendAnalysis.higherLows) {
        bullishEvidence.push({
          category: "trend",
          type: "bullish",
          points: 5,
          description: "Higher Lows detected",
          confidence: 80,
        });
      }
      bullishEvidence.push({
        category: "trend",
        type: "bullish",
        points: trendAnalysis.strength / 5,
        description: `Bullish trend with ${trendAnalysis.strength}% strength`,
        confidence: trendAnalysis.strength,
      });
    } else if (trendAnalysis.direction === "bearish") {
      if (trendAnalysis.lowerHighs) {
        bearishEvidence.push({
          category: "trend",
          type: "bearish",
          points: 5,
          description: "Lower Highs detected",
          confidence: 80,
        });
      }
      if (trendAnalysis.lowerLows) {
        bearishEvidence.push({
          category: "trend",
          type: "bearish",
          points: 5,
          description: "Lower Lows detected",
          confidence: 80,
        });
      }
      bearishEvidence.push({
        category: "trend",
        type: "bearish",
        points: trendAnalysis.strength / 5,
        description: `Bearish trend with ${trendAnalysis.strength}% strength`,
        confidence: trendAnalysis.strength,
      });
    }
  }

  private scoreMomentumEvidence(
    momentumAnalysis: any,
    bullishEvidence: EvidenceItem[],
    bearishEvidence: EvidenceItem[]
  ): void {
    // RSI signals
    if (momentumAnalysis.rsiSignal === "overbought") {
      bearishEvidence.push({
        category: "momentum",
        type: "bearish",
        points: 5,
        description: "RSI overbought (> 70)",
        confidence: 60,
      });
    } else if (momentumAnalysis.rsiSignal === "oversold") {
      bullishEvidence.push({
        category: "momentum",
        type: "bullish",
        points: 5,
        description: "RSI oversold (< 30)",
        confidence: 60,
      });
    } else if (momentumAnalysis.direction === "bullish") {
      bullishEvidence.push({
        category: "momentum",
        type: "bullish",
        points: 7,
        description: "Bullish momentum detected",
        confidence: 75,
      });
    } else if (momentumAnalysis.direction === "bearish") {
      bearishEvidence.push({
        category: "momentum",
        type: "bearish",
        points: 7,
        description: "Bearish momentum detected",
        confidence: 75,
      });
    }

    // MACD signals
    if (momentumAnalysis.macdSignal === "bullish") {
      bullishEvidence.push({
        category: "momentum",
        type: "bullish",
        points: 4,
        description: "MACD above signal line",
        confidence: 70,
      });
    } else if (momentumAnalysis.macdSignal === "bearish") {
      bearishEvidence.push({
        category: "momentum",
        type: "bearish",
        points: 4,
        description: "MACD below signal line",
        confidence: 70,
      });
    }
  }

  private scorePriceActionEvidence(
    priceActionAnalysis: any,
    bullishEvidence: EvidenceItem[],
    bearishEvidence: EvidenceItem[]
  ): void {
    if (!priceActionAnalysis) return;

    if (priceActionAnalysis.isBullish) {
      bullishEvidence.push({
        category: "priceAction",
        type: "bullish",
        points: 3,
        description: "Green candle",
        confidence: 50,
      });
    } else {
      bearishEvidence.push({
        category: "priceAction",
        type: "bearish",
        points: 3,
        description: "Red candle",
        confidence: 50,
      });
    }

    // Candle patterns
    if (priceActionAnalysis.pattern === "hammer") {
      bullishEvidence.push({
        category: "priceAction",
        type: "bullish",
        points: 7,
        description: "Hammer pattern detected",
        confidence: 75,
      });
    } else if (priceActionAnalysis.pattern === "hanging_man") {
      bearishEvidence.push({
        category: "priceAction",
        type: "bearish",
        points: 7,
        description: "Hanging Man pattern detected",
        confidence: 75,
      });
    }
  }

  private scoreMarketStructureEvidence(
    marketStructure: any,
    bullishEvidence: EvidenceItem[],
    bearishEvidence: EvidenceItem[]
  ): void {
    if (!marketStructure) return;

    if (marketStructure.trend === "uptrend") {
      bullishEvidence.push({
        category: "marketStructure",
        type: "bullish",
        points: 8,
        description: "Uptrend identified",
        confidence: 80,
      });
    } else if (marketStructure.trend === "downtrend") {
      bearishEvidence.push({
        category: "marketStructure",
        type: "bearish",
        points: 8,
        description: "Downtrend identified",
        confidence: 80,
      });
    }

    if (marketStructure.breakOfStructure) {
      if (marketStructure.trend === "uptrend") {
        bearishEvidence.push({
          category: "marketStructure",
          type: "bearish",
          points: 5,
          description: "Break of uptrend structure",
          confidence: 70,
        });
      } else {
        bullishEvidence.push({
          category: "marketStructure",
          type: "bullish",
          points: 5,
          description: "Break of downtrend structure",
          confidence: 70,
        });
      }
    }
  }

  private scoreSupportResistanceEvidence(
    indicators: any,
    bullishEvidence: EvidenceItem[],
    bearishEvidence: EvidenceItem[]
  ): void {
    if (!indicators.bollingerBands) return;

    // Price near lower band = support hold
    if (indicators.rsi < 50) {
      bullishEvidence.push({
        category: "supportResistance",
        type: "bullish",
        points: 5,
        description: "Price at support zone",
        confidence: 65,
      });
    }
    // Price near upper band = resistance rejection
    else if (indicators.rsi > 50) {
      bearishEvidence.push({
        category: "supportResistance",
        type: "bearish",
        points: 5,
        description: "Price at resistance zone",
        confidence: 65,
      });
    }
  }

  private calculateIndicatorAgreement(
    bullishEvidence: EvidenceItem[],
    bearishEvidence: EvidenceItem[],
    decision: "UP" | "DOWN" | "WAIT"
  ): number {
    if (decision === "WAIT") return 50;

    const targetType = decision === "UP" ? "bullish" : "bearish";
    const targetEvidence = decision === "UP" ? bullishEvidence : bearishEvidence;
    const oppositeEvidence = decision === "UP" ? bearishEvidence : bullishEvidence;

    const agreementCount = targetEvidence.length;
    const opposingCount = oppositeEvidence.length;
    const total = agreementCount + opposingCount;

    if (total === 0) return 50;

    return Math.round((agreementCount / total) * 100);
  }

  private calculateConfidence(
    bullishScore: number,
    bearishScore: number,
    indicatorAgreement: number,
    volatilityLevel: "low" | "medium" | "high" | "extreme"
  ): number {
    const margin = Math.abs(bullishScore - bearishScore);

    let confidence = 0;

    // Base confidence from score margin
    if (margin < 5) {
      confidence = 25;
    } else if (margin < 10) {
      confidence = 40;
    } else if (margin < 20) {
      confidence = 55;
    } else if (margin < 30) {
      confidence = 70;
    } else {
      confidence = 85;
    }

    // Adjust for indicator agreement
    confidence = confidence * (indicatorAgreement / 100);

    // Volatility adjustment
    switch (volatilityLevel) {
      case "high":
        confidence = confidence * 0.7;
        break;
      case "extreme":
        confidence = confidence * 0.5;
        break;
      case "medium":
        confidence = confidence * 0.85;
        break;
      default:
        // low - no adjustment
        break;
    }

    // Cap at 90% (never 100% certain)
    confidence = Math.min(Math.round(confidence), 90);
    // Floor at 20%
    confidence = Math.max(confidence, 20);

    return confidence;
  }
}

export default new EvidenceEngine();
