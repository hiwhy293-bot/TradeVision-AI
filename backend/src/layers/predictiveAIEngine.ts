import { Prediction } from "../types/prediction";
import { EvidenceReport } from "../types/evidence";
import { EVIDENCE_THRESHOLDS } from "../config/constants";
import { v4 as uuidv4 } from "uuid";

export class PredictiveAIEngine {
  /**
   * Generate prediction based on evidence report
   */
  generatePrediction(
    pair: string,
    timeframe: string,
    currentPrice: number,
    candleNumber: number,
    evidenceReport: EvidenceReport,
    dataStatus: string = "live"
  ): Prediction {
    const id = uuidv4();
    const timestamp = new Date();

    // Extract evidence breakdown
    const evidence = {
      trend: { bullish: 0, bearish: 0 },
      momentum: { bullish: 0, bearish: 0 },
      priceAction: { bullish: 0, bearish: 0 },
      marketStructure: { bullish: 0, bearish: 0 },
      supportResistance: { bullish: 0, bearish: 0 },
      volatility: { impact: "medium" as "low" | "medium" | "high" },
    };

    // Categorize evidence
    evidenceReport.bullishEvidence.forEach((item) => {
      const category = item.category as keyof typeof evidence;
      if (category !== "volatility") {
        (evidence[category] as any).bullish += item.points;
      }
    });

    evidenceReport.bearishEvidence.forEach((item) => {
      const category = item.category as keyof typeof evidence;
      if (category !== "volatility") {
        (evidence[category] as any).bearish += item.points;
      }
    });

    // Get supporting and conflicting evidence descriptions
    const bias = evidenceReport.decision;
    const supportingEvidence: string[] = [];
    const conflictingEvidence: string[] = [];

    if (bias === "UP") {
      evidenceReport.bullishEvidence.forEach((item) => {
        supportingEvidence.push(item.description);
      });
      evidenceReport.bearishEvidence.forEach((item) => {
        conflictingEvidence.push(item.description);
      });
    } else if (bias === "DOWN") {
      evidenceReport.bearishEvidence.forEach((item) => {
        supportingEvidence.push(item.description);
      });
      evidenceReport.bullishEvidence.forEach((item) => {
        conflictingEvidence.push(item.description);
      });
    }

    // Generate explanation
    const explanation = this.generateExplanation(
      bias,
      evidenceReport.confidenceScore,
      evidenceReport.bullishTotal,
      evidenceReport.bearishTotal
    );

    return {
      id,
      timestamp,
      pair,
      timeframe,
      currentPrice,
      candleNumber,
      bias,
      confidence: evidenceReport.confidenceScore,
      bullishScore: evidenceReport.bullishTotal,
      bearishScore: evidenceReport.bearishTotal,
      evidence,
      explanation,
      supportingEvidence,
      conflictingEvidence,
      dataStatus,
    };
  }

  private generateExplanation(
    bias: "UP" | "DOWN" | "WAIT",
    confidence: number,
    bullishScore: number,
    bearishScore: number
  ): string {
    switch (bias) {
      case "UP":
        return `Current evidence favors an upward next-candle bias with ${confidence}% confidence. 
        Bullish evidence (${bullishScore} points) outweighs bearish evidence (${bearishScore} points). 
        However, always consider the conflicting signals and manage risk accordingly.`;
      case "DOWN":
        return `Current evidence favors a downward next-candle bias with ${confidence}% confidence. 
        Bearish evidence (${bearishScore} points) outweighs bullish evidence (${bullishScore} points). 
        However, always consider the conflicting signals and manage risk accordingly.`;
      case "WAIT":
        return `Evidence is conflicting or insufficient (Bullish: ${bullishScore}, Bearish: ${bearishScore}). 
        The model recommends waiting for clearer signals before making a prediction. 
        Consider waiting for the next candle to gather more data.`;
      default:
        return "Unable to generate prediction at this time.";
    }
  }
}

export default new PredictiveAIEngine();
