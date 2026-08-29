import { Prediction } from "../types/prediction";

export class ExplanationEngine {
  /**
   * Generate detailed user-friendly explanation
   */
  generateDetailedExplanation(prediction: Prediction): {
    title: string;
    biasStatement: string;
    confidenceStatement: string;
    supportingEvidence: string[];
    conflictingEvidence: string[];
    conclusion: string;
    disclaimer: string;
  } {
    const biasEmoji = prediction.bias === "UP" ? "📈" : prediction.bias === "DOWN" ? "📉" : "⏸️";
    const trendWord =
      prediction.bias === "UP" ? "upward" : prediction.bias === "DOWN" ? "downward" : "no clear";

    return {
      title: `Next Candle Prediction: ${biasEmoji} ${prediction.bias}`,
      biasStatement: `The AI model estimates a ${trendWord} bias for the next ${prediction.timeframe} candle on ${prediction.pair}.`,
      confidenceStatement: `Confidence Level: ${prediction.confidence}% - Based on the strength and alignment of technical evidence.`,
      supportingEvidence: prediction.supportingEvidence,
      conflictingEvidence: prediction.conflictingEvidence,
      conclusion: this.generateConclusion(prediction),
      disclaimer: this.generateDisclaimer(),
    };
  }

  private generateConclusion(prediction: Prediction): string {
    if (prediction.bias === "UP") {
      return `Evidence leans bullish, but remember that markets can reverse unexpectedly. 
      The prediction is based on current technical conditions and should not be treated as financial advice. 
      Always use stop losses and proper risk management.`;
    } else if (prediction.bias === "DOWN") {
      return `Evidence leans bearish, but remember that markets can reverse unexpectedly. 
      The prediction is based on current technical conditions and should not be treated as financial advice. 
      Always use stop losses and proper risk management.`;
    } else {
      return `Conflicting signals prevent a clear bias. The model recommends waiting for additional confirmation 
      before entering a position. More data from the next candle may provide clearer signals.`;
    }
  }

  private generateDisclaimer(): string {
    return `⚠️ RISK DISCLAIMER: This prediction is an educational estimate only. 
    Market predictions are inherently uncertain and can be wrong. 
    Past performance does not guarantee future results. 
    Never risk money you cannot afford to lose. 
    Use this tool for learning and paper trading only, not for real trading decisions.`;
  }

  /**
   * Generate brief explanation
   */
  generateBriefExplanation(prediction: Prediction): string {
    const emoji = prediction.bias === "UP" ? "📈" : prediction.bias === "DOWN" ? "📉" : "⏸️";
    return `${emoji} ${prediction.bias} (${prediction.confidence}% confidence) - ${prediction.explanation}`;
  }

  /**
   * Format evidence for display
   */
  formatEvidence(prediction: Prediction): {
    supporting: Array<{ text: string; strength: string }>;
    conflicting: Array<{ text: string; strength: string }>;
  } {
    return {
      supporting: prediction.supportingEvidence.map((e) => ({
        text: e,
        strength: "supporting",
      })),
      conflicting: prediction.conflictingEvidence.map((e) => ({
        text: e,
        strength: "conflicting",
      })),
    };
  }
}

export default new ExplanationEngine();
