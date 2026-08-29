# TradeVision AI - API Reference

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently no authentication required for educational version.

## Response Format

All responses follow this format:
```json
{
  "success": true,
  "data": { /* ... */ },
  "error": null,
  "timestamp": "2026-08-29T14:30:00Z"
}
```

## Endpoints

### Predictions

#### GET /prediction/current
Get the current prediction for a specific pair and timeframe.

**Query Parameters:**
- `pair` (required): Currency pair (e.g., "EUR/USD")
- `timeframe` (required): Timeframe (e.g., "5m")

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "pred_12345",
    "timestamp": "2026-08-29T14:30:00Z",
    "pair": "EUR/USD",
    "timeframe": "5m",
    "currentPrice": 1.0950,
    "candleNumber": 1254,
    "bias": "UP",
    "confidence": 72,
    "bullishScore": 45,
    "bearishScore": 20,
    "evidence": {
      "trend": { "bullish": 18, "bearish": 0 },
      "momentum": { "bullish": 9, "bearish": 2 },
      "priceAction": { "bullish": 8, "bearish": 3 },
      "marketStructure": { "bullish": 10, "bearish": 5 },
      "volatility": { "impact": "low" }
    },
    "explanation": "Bullish momentum and market structure...",
    "supportingEvidence": [
      "Short-term trend is bullish",
      "Recent price structure shows higher lows"
    ],
    "conflictingEvidence": [
      "Volatility has increased",
      "Price approaching resistance"
    ]
  }
}
```

#### GET /prediction/history
Get prediction history with optional filtering.

**Query Parameters:**
- `pair` (optional): Filter by pair
- `timeframe` (optional): Filter by timeframe
- `bias` (optional): Filter by bias (UP, DOWN, WAIT)
- `limit` (optional): Number of results (default: 50, max: 500)
- `offset` (optional): Pagination offset (default: 0)
- `from` (optional): Start date (ISO 8601)
- `to` (optional): End date (ISO 8601)

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "predictions": [
      {
        "id": "pred_12345",
        "timestamp": "2026-08-29T14:30:00Z",
        "pair": "EUR/USD",
        "timeframe": "5m",
        "bias": "UP",
        "confidence": 72,
        "actualResult": "UP",
        "correct": true
      }
    ]
  }
}
```

#### GET /prediction/statistics
Get prediction accuracy statistics.

**Query Parameters:**
- `pair` (optional): Filter by pair
- `timeframe` (optional): Filter by timeframe
- `from` (optional): Start date (ISO 8601)
- `to` (optional): End date (ISO 8601)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPredictions": 150,
    "correctPredictions": 89,
    "incorrectPredictions": 41,
    "waitPredictions": 20,
    "accuracy": 68,
    "upPredictions": 75,
    "downPredictions": 55,
    "waitPredictions": 20,
    "upAccuracy": 71,
    "downAccuracy": 65,
    "byTimeframe": {
      "1m": { "total": 30, "accuracy": 70 },
      "5m": { "total": 50, "accuracy": 68 },
      "15m": { "total": 40, "accuracy": 65 },
      "1H": { "total": 30, "accuracy": 72 }
    },
    "byPair": {
      "EUR/USD": { "total": 60, "accuracy": 70 },
      "GBP/USD": { "total": 50, "accuracy": 65 },
      "USD/JPY": { "total": 40, "accuracy": 68 }
    }
  }
}
```

#### POST /prediction/evaluate
Record the actual result of a predicted candle.

**Request Body:**
```json
{
  "predictionId": "pred_12345",
  "actualBias": "UP",
  "actualCandle": {
    "timestamp": "2026-08-29T14:35:00Z",
    "open": 1.0950,
    "high": 1.0965,
    "low": 1.0948,
    "close": 1.0962,
    "volume": 12500
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "resultId": "res_12345",
    "predictionId": "pred_12345",
    "predicted": "UP",
    "actual": "UP",
    "correct": true,
    "confidenceRewardPenalty": 2
  }
}
```

### Market Data

#### GET /market/current
Get current market price for a pair.

**Query Parameters:**
- `pair` (required): Currency pair (e.g., "EUR/USD")

**Response:**
```json
{
  "success": true,
  "data": {
    "pair": "EUR/USD",
    "price": 1.0950,
    "timestamp": "2026-08-29T14:30:00Z",
    "bid": 1.0949,
    "ask": 1.0951,
    "dayHigh": 1.0965,
    "dayLow": 1.0920,
    "dayChange": 0.0020,
    "dayChangePercent": 0.18
  }
}
```

#### GET /market/candles
Get historical candles for a pair.

**Query Parameters:**
- `pair` (required): Currency pair
- `timeframe` (required): Timeframe (1m, 5m, 15m, 30m, 1H, 4H, 1D)
- `limit` (optional): Number of candles (default: 100, max: 500)
- `from` (optional): Start timestamp (ISO 8601)

**Response:**
```json
{
  "success": true,
  "data": {
    "pair": "EUR/USD",
    "timeframe": "5m",
    "candles": [
      {
        "timestamp": "2026-08-29T14:30:00Z",
        "open": 1.0945,
        "high": 1.0965,
        "low": 1.0940,
        "close": 1.0950,
        "volume": 15000
      }
    ]
  }
}
```

#### GET /market/pairs
Get list of supported currency pairs.

**Response:**
```json
{
  "success": true,
  "data": {
    "pairs": [
      "EUR/USD",
      "GBP/USD",
      "USD/JPY",
      "USD/CHF",
      "AUD/USD",
      "USD/CAD",
      "NZD/USD",
      "EUR/JPY",
      "GBP/JPY"
    ]
  }
}
```

#### GET /market/timeframes
Get list of supported timeframes.

**Response:**
```json
{
  "success": true,
  "data": {
    "timeframes": [
      "1m",
      "5m",
      "15m",
      "30m",
      "1H",
      "4H",
      "1D"
    ]
  }
}
```

#### GET /market/status
Get API and data status.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "live",
    "dataSource": "Alpha Vantage API",
    "lastUpdate": "2026-08-29T14:30:00Z",
    "uptime": 99.95,
    "demoMode": false
  }
}
```

### Paper Trading

#### POST /paper-trade/enter
Enter a paper trade based on a prediction.

**Request Body:**
```json
{
  "predictionId": "pred_12345",
  "pair": "EUR/USD",
  "direction": "LONG",
  "quantity": 100000,
  "entryPrice": 1.0950,
  "stopLoss": 1.0940,
  "takeProfit": 1.0970
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tradeId": "trade_12345",
    "predictionId": "pred_12345",
    "pair": "EUR/USD",
    "direction": "LONG",
    "quantity": 100000,
    "entryPrice": 1.0950,
    "entryTime": "2026-08-29T14:30:00Z",
    "status": "open",
    "stopLoss": 1.0940,
    "takeProfit": 1.0970,
    "unrealizedPnL": 0
  }
}
```

#### POST /paper-trade/exit
Exit a paper trade.

**Request Body:**
```json
{
  "tradeId": "trade_12345",
  "exitPrice": 1.0962,
  "exitReason": "take_profit"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tradeId": "trade_12345",
    "entryPrice": 1.0950,
    "exitPrice": 1.0962,
    "entryTime": "2026-08-29T14:30:00Z",
    "exitTime": "2026-08-29T14:35:00Z",
    "quantity": 100000,
    "direction": "LONG",
    "pips": 12,
    "profitLoss": 120,
    "returnPercent": 0.11,
    "exitReason": "take_profit"
  }
}
```

#### GET /paper-trade/trades
Get paper trading history.

**Query Parameters:**
- `status` (optional): Filter by status (open, closed)
- `pair` (optional): Filter by pair
- `limit` (optional): Number of results
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 45,
    "trades": [
      {
        "tradeId": "trade_12345",
        "pair": "EUR/USD",
        "direction": "LONG",
        "entryPrice": 1.0950,
        "exitPrice": 1.0962,
        "profitLoss": 120,
        "status": "closed"
      }
    ]
  }
}
```

#### GET /paper-trade/stats
Get paper trading statistics.

**Query Parameters:**
- `pair` (optional): Filter by pair
- `from` (optional): Start date
- `to` (optional): End date

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTrades": 45,
    "openTrades": 2,
    "closedTrades": 43,
    "winningTrades": 28,
    "losingTrades": 15,
    "winRate": 65,
    "totalProfit": 2450,
    "totalLoss": -980,
    "netProfit": 1470,
    "returnPercent": 14.7,
    "maxWin": 450,
    "maxLoss": -150,
    "avgWin": 87,
    "avgLoss": -65,
    "profitFactor": 2.5,
    "byPair": {
      "EUR/USD": { "trades": 20, "profit": 500 },
      "GBP/USD": { "trades": 15, "profit": 620 },
      "USD/JPY": { "trades": 10, "profit": 350 }
    }
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_PAIR",
    "message": "EUR/USD is not a supported pair"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "PREDICTION_NOT_FOUND",
    "message": "Prediction pred_12345 not found"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An internal server error occurred"
  }
}
```

## Rate Limiting

- 100 requests per minute per IP
- Returns 429 Too Many Requests when exceeded

## WebSocket Endpoints

### ws://localhost:3000/ws/predictions
Real-time prediction updates.

**Subscribe:**
```json
{
  "action": "subscribe",
  "pair": "EUR/USD",
  "timeframe": "5m"
}
```

**Update Message:**
```json
{
  "type": "prediction_update",
  "data": {
    "id": "pred_12345",
    "bias": "UP",
    "confidence": 72
  }
}
```
