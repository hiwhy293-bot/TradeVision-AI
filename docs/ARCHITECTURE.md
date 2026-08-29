# TradeVision AI - System Architecture

## Overview

TradeVision AI is a layered system designed to analyze completed candles and predict the likely direction of the next candle before it forms.

```
┌─────────────────────────────────────┐
│      FRONTEND (React/PWA)           │
│  - Dashboard                        │
│  - Charts & Predictions             │
│  - History & Paper Trading          │
└──────────────┬──────────────────────┘
               │ HTTP/WebSocket
┌──────────────▼──────────────────────┐
│     BACKEND (Node.js/Express)       │
│  ┌────────────────────────────────┐ │
│  │   Market Data Layer            │ │
│  │   - Real-time data fetching    │ │
│  │   - Candle detection           │ │
│  │   - Demo mode fallback         │ │
│  └────────────────┬───────────────┘ │
│  ┌────────────────▼───────────────┐ │
│  │ Technical Analysis Engine      │ │
│  │ - Indicators (RSI, MACD, EMA)  │ │
│  │ - Price action analysis        │ │
│  │ - Support/Resistance detection │ │
│  └────────────────┬───────────────┘ │
│  ┌────────────────▼───────────────┐ │
│  │ Evidence Engine                │ │
│  │ - Bullish scoring              │ │
│  │ - Bearish scoring              │ │
│  │ - Confidence calculation       │ │
│  └────────────────┬───────────────┘ │
│  ┌────────────────▼───────────────┐ │
│  │ Predictive AI Engine           │ │
│  │ - Generate UP/DOWN/WAIT bias   │ │
│  │ - Calculate confidence         │ │
│  │ - Timestamp prediction         │ │
│  └────────────────┬───────────────┘ │
│  ┌────────────────▼───────────────┐ │
│  │ Explanation Engine             │ │
│  │ - Generate user explanation    │ │
│  │ - List supporting evidence     │ │
│  │ - Highlight conflicts          │ │
│  └────────────────┬───────────────┘ │
│  ┌────────────────▼───────────────┐ │
│  │ Evaluation Engine              │ │
│  │ - Track prediction accuracy    │ │
│  │ - Store in history             │ │
│  │ - Educational statistics       │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │ Database (SQLite/PostgreSQL)   │ │
│  │ - Predictions                  │ │
│  │ - Historical data              │ │
│  │ - Paper trading records        │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Layer Details

### 1. Market Data Layer (marketDataLayer.ts)

**Responsibilities:**
- Fetch real-time forex data from APIs
- Detect newly completed candles
- Maintain current OHLCV data
- Handle API failures and demo mode

**Data Flow:**
1. Poll or subscribe to forex API
2. Track current candle formation
3. Detect candle close events
4. Trigger analysis pipeline
5. Store historical data

**Supported Sources:**
- Alpha Vantage API
- IQFeed
- Mock/Demo data

### 2. Technical Analysis Engine (technicalAnalysisEngine.ts)

**Calculates:**
- **Trend Indicators:**
  - EMA (5, 10, 20, 50, 200)
  - SMA (50, 200)
  - Higher Highs / Higher Lows (HH/HL)
  - Lower Highs / Lower Lows (LH/LL)

- **Momentum Indicators:**
  - RSI (14 period)
  - MACD (12/26/9)
  - Rate of Change (ROC)
  - Momentum strength

- **Volatility:**
  - ATR (14 period)
  - Bollinger Bands
  - Volatility expansion/contraction

- **Price Action:**
  - Candle patterns (doji, engulfing, pinbar)
  - Support/Resistance zones
  - Breakout detection
  - Consolidation patterns

### 3. Evidence Engine (evidenceEngine.ts)

**Scoring System:**
```
Bullish Evidence:
- Trend alignment: +20
- Momentum (RSI < 70): +15
- Price action: +15
- Market structure: +15
- Support/Resistance: +10
- Volatility conditions: +5
Max: 80 points

Bearish Evidence:
- Same structure with opposing conditions

Neutral/Conflict:
- Mixed signals: weighted based on evidence
```

**Output:**
- Bullish Score (0-80)
- Bearish Score (0-80)
- Neutral/Conflict Score
- Evidence breakdown

### 4. Predictive AI Engine (predictiveAIEngine.ts)

**Decision Logic:**
```typescript
if (bullishScore > bearishScore + 15) {
  bias = "UP";
  confidence = calculateConfidence(bullishScore);
} else if (bearishScore > bullishScore + 15) {
  bias = "DOWN";
  confidence = calculateConfidence(bearishScore);
} else {
  bias = "WAIT";
  confidence = low;
}
```

**Confidence Calculation:**
- Based on score margin (spread between bullish/bearish)
- Adjusted for indicator agreement
- Reduced by conflicting evidence
- Range: 0-100%

### 5. Explanation Engine (explanationEngine.ts)

**Generates:**
1. Prediction statement: "UP", "DOWN", or "WAIT"
2. Supporting evidence list
3. Conflicting evidence list
4. Confidence context
5. Risk disclaimer
6. Conclusion

**Example Output:**
```
Bias: UP
Confidence: 72%

Supporting Evidence:
- Short-term trend is bullish (higher highs/lows)
- RSI at 65 (bullish momentum, not overbought)
- Price holding above support zone
- Moving averages in bullish alignment

Conflicting Evidence:
- Volatility has increased (uncertainty)
- Price approaching resistance zone
- MACD showing divergence

Conclusion:
Current evidence favors upward movement for the next candle.
However, resistance and elevated volatility reduce certainty.
```

### 6. Evaluation Engine (evaluationEngine.ts)

**Tracks:**
- Prediction (UP/DOWN/WAIT)
- Confidence level
- Actual candle result
- Correctness (match or miss)
- Historical accuracy % by timeframe
- Historical accuracy % by pair

**Statistics:**
- Total predictions
- Correct predictions
- Incorrect predictions
- WAIT decisions
- Accuracy by timeframe
- Accuracy by pair
- Win/Loss ratio

## Data Models

### Candle
```typescript
interface Candle {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timeframe: string; // "1m", "5m", etc.
  pair: string; // "EUR/USD", etc.
}
```

### Prediction
```typescript
interface Prediction {
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
}

interface EvidenceBreakdown {
  trend: { bullish: number; bearish: number };
  momentum: { bullish: number; bearish: number };
  priceAction: { bullish: number; bearish: number };
  marketStructure: { bullish: number; bearish: number };
  volatility: { impact: "high" | "medium" | "low" };
}
```

### PredictionResult
```typescript
interface PredictionResult {
  predictionId: string;
  actualBias: "UP" | "DOWN" | "WAIT";
  correct: boolean;
  actualCandle: Candle;
  recordedAt: Date;
}
```

## Workflow

### Candle-by-Candle Analysis

1. **New Candle Close Detected** (marketDataLayer)
   - Timestamp: T0
   - Candle #1254 closed
   - Trigger analysis for next candle

2. **Technical Analysis** (technicalAnalysisEngine)
   - Calculate all indicators
   - Analyze price action
   - Detect support/resistance
   - Duration: ~100ms

3. **Evidence Scoring** (evidenceEngine)
   - Score bullish evidence
   - Score bearish evidence
   - Duration: ~50ms

4. **Prediction Generation** (predictiveAIEngine)
   - Compare scores
   - Generate bias (UP/DOWN/WAIT)
   - Calculate confidence
   - Duration: ~50ms

5. **Explanation** (explanationEngine)
   - Generate user-friendly text
   - List evidence
   - Duration: ~30ms

6. **Store Prediction** (database)
   - Save to prediction table
   - Timestamp: T0 + 230ms

7. **Display to User** (frontend)
   - Show next-candle bias
   - Show confidence
   - Show countdown for next candle
   - Show evidence panel
   - Show explanation

8. **Monitor Next Candle Formation**
   - Countdown timer
   - Display "Analyzing..."

9. **Next Candle Closes**
   - Timestamp: T0 + candle duration
   - Detect candle close
   - Record actual result
   - Compare with prediction
   - Evaluate accuracy
   - Return to step 1

## Important Design Principles

### 1. No False Certainty
- Never claim the prediction will happen
- Confidence is about evidence strength, not outcome probability
- Always include risk disclaimer

### 2. Multiple Evidence Categories
- No single indicator drives the prediction
- All evidence combined via scoring system
- Conflicting evidence reduces confidence
- WAIT bias when evidence is weak/mixed

### 3. Educational Focus
- Track accuracy for learning
- Paper trading with virtual funds
- Never execute real trades
- History for pattern recognition

### 4. Transparent Reasoning
- Every prediction includes explanation
- List supporting evidence
- List conflicting evidence
- User can understand why the prediction was made

### 5. Graceful Degradation
- Demo mode when API fails
- Historical accuracy only for reference
- Data timestamps for audit trail
- Error logging and recovery

## Database Schema

### predictions table
```sql
CREATE TABLE predictions (
  id TEXT PRIMARY KEY,
  timestamp DATETIME,
  pair TEXT,
  timeframe TEXT,
  current_price REAL,
  candle_number INTEGER,
  bias TEXT, -- 'UP', 'DOWN', 'WAIT'
  confidence INTEGER,
  bullish_score INTEGER,
  bearish_score INTEGER,
  evidence_json TEXT,
  explanation TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### prediction_results table
```sql
CREATE TABLE prediction_results (
  id TEXT PRIMARY KEY,
  prediction_id TEXT FOREIGN KEY,
  actual_bias TEXT,
  correct BOOLEAN,
  actual_candle_json TEXT,
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### paper_trades table
```sql
CREATE TABLE paper_trades (
  id TEXT PRIMARY KEY,
  prediction_id TEXT,
  entry_price REAL,
  entry_time DATETIME,
  exit_price REAL,
  exit_time DATETIME,
  profit_loss REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Predictions
- `GET /api/prediction/current` - Get current prediction
- `GET /api/prediction/history` - Get prediction history
- `POST /api/prediction/evaluate` - Record actual result

### Market Data
- `GET /api/market/current` - Get current price
- `GET /api/market/candles` - Get historical candles
- `GET /api/market/pairs` - Supported currency pairs
- `GET /api/market/timeframes` - Supported timeframes

### Paper Trading
- `POST /api/paper-trade/enter` - Enter paper trade
- `POST /api/paper-trade/exit` - Exit paper trade
- `GET /api/paper-trade/trades` - Get paper trade history
- `GET /api/paper-trade/stats` - Get trading statistics

## Performance Targets

- Candle detection: < 1 second after close
- Full analysis: < 300ms
- Prediction display: < 1 second after candle close
- Chart update: < 500ms
- Historical queries: < 2 seconds
- Mobile load time: < 3 seconds
