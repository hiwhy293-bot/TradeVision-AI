# Prediction Logic Deep Dive

## Evidence Scoring System

### Trend Analysis (0-20 points)

**Bullish Trend Signals:**
- Higher Highs: +5 points
- Higher Lows: +5 points
- EMA 5 > EMA 10 > EMA 20: +5 points
- Price above 200 EMA: +5 points

**Bearish Trend Signals:**
- Lower Highs: +5 points
- Lower Lows: +5 points
- EMA 5 < EMA 10 < EMA 20: +5 points
- Price below 200 EMA: +5 points

### Momentum Analysis (0-15 points)

**Bullish Momentum:**
- RSI > 50 (not overbought): +7 points
- MACD > Signal line: +4 points
- ROC positive: +4 points

**Bearish Momentum:**
- RSI < 50 (not oversold): +7 points
- MACD < Signal line: +4 points
- ROC negative: +4 points

**Overbought/Oversold Adjustments:**
- RSI > 70: -10 points (override bullish)
- RSI < 30: -10 points (override bearish)

### Price Action Analysis (0-15 points)

**Bullish Price Action:**
- Large green candle: +5 points
- Small lower wick: +3 points
- Bullish engulfing: +7 points
- Breakout above resistance: +5 points
- Rejection at support: +5 points
- Consolidation above support: +3 points

**Bearish Price Action:**
- Large red candle: +5 points
- Small upper wick: +3 points
- Bearish engulfing: +7 points
- Breakdown below support: +5 points
- Rejection at resistance: +5 points
- Consolidation below resistance: +3 points

### Market Structure Analysis (0-15 points)

**Bullish Structure:**
- Trend continuation pattern: +8 points
- Support holds: +7 points
- Break above resistance confirmed: +10 points
- Possible reversal avoided: +5 points

**Bearish Structure:**
- Trend continuation pattern: +8 points
- Resistance holds: +7 points
- Break below support confirmed: +10 points
- Possible reversal avoided: +5 points

### Volatility Context (0-5 points, modifies confidence)

**Low Volatility (ATR < median):**
- Confidence boost: +3 points
- Signals more reliable

**High Volatility (ATR > median * 1.5):**
- Confidence penalty: -5 points
- False breakouts more likely
- Spreads wider

**Extreme Volatility (ATR > median * 2):**
- Consider WAIT bias
- Confidence ceiling at 50%

### Support/Resistance Analysis (0-10 points)

**Bullish Signals:**
- Price holding above key support: +7 points
- Multiple bounce confirmations: +3 points
- Distance from resistance (room to run): +5 points

**Bearish Signals:**
- Price holding below key resistance: +7 points
- Multiple rejection confirmations: +3 points
- Distance from support (room to fall): +5 points

## Confidence Calculation

### Score Spread Method

```typescript
function calculateConfidence(
  bullishScore: number,
  bearishScore: number,
  volatility: "low" | "medium" | "high",
  indicatorAgreement: number // 0-100
): number {
  const margin = Math.abs(bullishScore - bearishScore);
  
  let confidence = 0;
  
  // Base confidence from score margin
  if (margin < 5) {
    confidence = 25; // Weak signals
  } else if (margin < 10) {
    confidence = 40; // Moderate signals
  } else if (margin < 20) {
    confidence = 55; // Strong signals
  } else if (margin < 30) {
    confidence = 70; // Very strong signals
  } else {
    confidence = 85; // Extremely strong signals
  }
  
  // Adjust for indicator agreement
  // If many indicators align, increase confidence
  confidence = confidence * (indicatorAgreement / 100);
  
  // Volatility adjustment
  if (volatility === "high") {
    confidence = confidence * 0.7; // Reduce by 30%
  } else if (volatility === "medium") {
    confidence = confidence * 0.85; // Reduce by 15%
  }
  
  // Cap at 90% (never absolutely certain)
  return Math.min(Math.round(confidence), 90);
}
```

### Indicator Agreement Calculation

```typescript
function calculateAgreement(
  indicators: {
    trend: "bull" | "bear" | "neutral";
    momentum: "bull" | "bear" | "neutral";
    priceAction: "bull" | "bear" | "neutral";
    structure: "bull" | "bear" | "neutral";
  },
  targetBias: "UP" | "DOWN"
): number {
  let agreementCount = 0;
  let totalIndicators = 4;
  
  const expectedSignal = targetBias === "UP" ? "bull" : "bear";
  
  if (indicators.trend === expectedSignal) agreementCount++;
  if (indicators.momentum === expectedSignal) agreementCount++;
  if (indicators.priceAction === expectedSignal) agreementCount++;
  if (indicators.structure === expectedSignal) agreementCount++;
  
  // Neutral counts as 50% agreement
  Object.values(indicators).forEach((value) => {
    if (value === "neutral") agreementCount += 0.5;
  });
  
  return (agreementCount / totalIndicators) * 100;
}
```

## Decision Logic

### Bias Determination

```typescript
function determineBias(
  bullishScore: number,
  bearishScore: number,
  threshold: number = 15
): "UP" | "DOWN" | "WAIT" {
  const difference = bullishScore - bearishScore;
  
  if (difference > threshold) {
    return "UP";
  } else if (difference < -threshold) {
    return "DOWN";
  } else {
    return "WAIT";
  }
}
```

**Threshold Logic:**
- Default threshold: 15 points
- High volatility: increase to 20
- Low volatility: decrease to 10
- This prevents false signals when evidence is marginal

### WAIT Bias Conditions

The system generates a WAIT bias when:

1. **Conflicting Evidence**
   - Bullish and bearish scores within 15 points
   - Indicators disagreeing (< 60% agreement)
   - Mixed price action signals

2. **High Uncertainty**
   - Volatility > 2x median ATR
   - Multiple gaps or limit moves
   - News/event-driven spikes

3. **Consolidation**
   - Small price ranges
   - Volume declining
   - Range-bound price action

4. **Weak Signals**
   - All scores < 30 points
   - Few indicator confirmations
   - Price near equilibrium

## Example Prediction Walkthrough

### Scenario: EUR/USD on 5-minute chart

**Market State at Candle Close (14:05 UTC):**
- Current price: 1.0950
- Current candle: Small green body, small wicks
- Previous candle: Small red
- Volume: Below average
- Recent trend: Higher lows for 3 candles, but new highs lacking

**Technical Analysis Results:**

Trend Analysis:
- Higher Lows: ✓ (3 candles)
- Higher Highs: ✗ (prices stuck at 1.0960 resistance)
- EMA 5 > EMA 10: ✓
- EMA 10 > EMA 20: ✓
- Price > 200 EMA: ✓ (much higher)
**Bullish Score: +18**

Momentum Analysis:
- RSI: 55 (neutral, no overbought warning) ✓
- MACD: Just crossed above signal line ✓
- ROC: Positive but weak
**Bullish Score: +9**

Price Action Analysis:
- Current candle: Small green (mildly bullish) → +2
- Pattern: No strong pattern (weak consolidation) → +1
- Breakout/rejection: None → 0
**Bullish Score: +3**

Market Structure Analysis:
- Trend continuation: Attempting to continue up
- Support: Holding at 1.0940 ✓ → +7
- Resistance: 1.0960 is active resistance → -3
**Bullish Score: +4**

Volatility Analysis:
- ATR (14): 0.0025
- Median ATR (20 bars): 0.0027
- Status: Low volatility ✓
**Confidence Boost: +0 (neutral)**

Support/Resistance Analysis:
- Support at 1.0940: Holding strongly → +7
- Resistance at 1.0960: 2 rejections → -5
- Room to run downside: -3
**Bullish Score: -1**

**Total Bullish Score: 18 + 9 + 3 + 4 + 0 - 1 = 33**
**Total Bearish Score: 8 (all counterpoints)**

**Difference: 33 - 8 = 25 (exceeds 15-point threshold)**

**Bias: UP ✓**

**Confidence Calculation:**
- Score margin: 25 points → Base 70%
- Indicator agreement: 3/4 indicators bullish (75%) → 70 * 0.75 = 52.5%
- Volatility adjustment: Low volatility → 52.5 * 1.0 = 52.5%
- Final confidence: 53%

**Output:**
```
Bias: UP
Confidence: 53%

Supporting Evidence:
- Three candles with higher lows (trend continuation)
- Moving averages in bullish alignment (EMA 5 > 10 > 20)
- RSI at neutral 55 (bullish momentum, no overbought)
- MACD just crossed above signal line (bullish crossover)
- Price holding above support at 1.0940

Conflicting Evidence:
- New highs not confirmed (stuck at 1.0960)
- Resistance at 1.0960 has rejected price twice
- Current candle shows weak conviction (small body)
- Volume below average (weak confirmation)
- Consolidation pattern suggests indecision

Conclusion:
Evidence leans bullish with higher lows and positive momentum,
but weak new highs and resistance proximity create uncertainty.
The next candle will likely test 1.0960 resistance.
Fail here would invalidate the bullish bias.
```

## Prediction Accuracy Context

### Understanding "Correct" Predictions

**UP Prediction is Correct if:**
- Candle closes higher than open (any green candle)
- Even if small wick is lower
- Magnitude doesn't matter

**DOWN Prediction is Correct if:**
- Candle closes lower than open (any red candle)
- Even if small wick is higher
- Magnitude doesn't matter

**WAIT Prediction is Always "Correct"**
- WAIT is a non-prediction
- Used when evidence is conflicting
- Used to avoid false signals

### Confidence vs Accuracy

**Important: Confidence ≠ Accuracy %**

A 75% confidence prediction does NOT mean:
- The candle has 75% chance to go that direction
- Historical success rate is 75%
- You should bet 75% of your bankroll

A 75% confidence prediction DOES mean:
- The technical evidence is relatively strong and aligned
- Multiple indicators support the bias
- There's less conflicting evidence
- The prediction is more informed than random

**Example:**
- Prediction with 85% confidence that was wrong
- Prediction with 35% confidence that was right
- Both are valid predictions
- Confidence measures evidence quality, not outcome certainty
