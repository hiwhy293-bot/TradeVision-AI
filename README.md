# TradeVision AI - Next-Candle Predictive Analysis Platform

An AI-powered educational market-analysis platform that analyzes current price action, technical indicators, and market structure to estimate the likely direction of the next candle before it forms.

## 🎯 Core Features

- **Next-Candle Prediction**: UP, DOWN, or WAIT bias with confidence scoring
- **Real-time Analysis**: Automatic candle-by-candle market analysis
- **Evidence Engine**: Multi-factor technical analysis and scoring
- **Interactive Charts**: Live candlestick charts with indicators
- **Prediction History**: Track and evaluate prediction accuracy
- **Paper Trading Mode**: Test predictions with simulated funds
- **Mobile-First UI**: Fully responsive for Android and iOS
- **PWA Support**: Installable on mobile devices

## 📁 Project Structure

```
TradeVision-AI/
├── frontend/                 # React/TypeScript frontend
│   ├── public/
│   │   ├── manifest.json    # PWA manifest
│   │   ├── service-worker.js # Service worker
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── NextCandlePrediction.tsx
│   │   │   ├── Chart.tsx
│   │   │   ├── PredictionHistory.tsx
│   │   │   ├── EvidencePanel.tsx
│   │   │   ├── CountdownTimer.tsx
│   │   │   └── PaperTradingPanel.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── History.tsx
│   │   │   └── PaperTrading.tsx
│   │   ├── hooks/
│   │   │   ├── useMarketData.ts
│   │   │   ├── usePrediction.ts
│   │   │   └── useCandleCountdown.ts
│   │   ├── types/
│   │   │   ├── market.ts
│   │   │   ├── prediction.ts
│   │   │   └── evidence.ts
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   └── mobile.css
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── package.json
│
├── backend/                  # Node.js/Express backend
│   ├── src/
│   │   ├── layers/
│   │   │   ├── marketDataLayer.ts       # Real-time data integration
│   │   │   ├── technicalAnalysisEngine.ts
│   │   │   ├── evidenceEngine.ts
│   │   │   ├── predictiveAIEngine.ts
│   │   │   ├── explanationEngine.ts
│   │   │   └── evaluationEngine.ts
│   │   ├── routes/
│   │   │   ├── prediction.ts
│   │   │   ├── history.ts
│   │   │   ├── marketData.ts
│   │   │   └── paperTrading.ts
│   │   ├── models/
│   │   │   ├── Prediction.ts
│   │   │   ├── PredictionHistory.ts
│   │   │   ├── PaperTrade.ts
│   │   │   └── MarketData.ts
│   │   ├── utils/
│   │   │   ├── indicators.ts
│   │   │   ├── priceAction.ts
│   │   │   ├── marketStructure.ts
│   │   │   └── volatility.ts
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── apiKeys.ts
│   │   │   └── constants.ts
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts
│   │   │   └── validation.ts
│   │   └── app.ts
│   ├── tests/
│   │   ├── evidence.test.ts
│   │   ├── indicators.test.ts
│   │   └── prediction.test.ts
│   └── package.json
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── PREDICTION_LOGIC.md
│   └── DEPLOYMENT.md
│
├── .github/
│   └── workflows/
│       ├── test.yml
│       └── deploy.yml
│
├── docker-compose.yml
├── .env.example
└── LICENSE
```

## 🏗️ Architecture Layers

### 1. Market Data Layer
- Fetches real-time forex data
- Manages multiple data sources
- Handles demo mode fallback
- Detects completed candles

### 2. Technical Analysis Engine
- Calculates RSI, MACD, Moving Averages
- Analyzes price action patterns
- Detects support/resistance
- Computes ATR and volatility

### 3. Evidence Engine
- Scores bullish evidence
- Scores bearish evidence
- Calculates neutral/conflict scores
- Produces weighted scoring

### 4. Predictive AI Engine
- Analyzes all evidence
- Generates UP/DOWN/WAIT bias
- Calculates confidence (0-100%)
- Timestamps prediction

### 5. Explanation Engine
- Converts AI reasoning to user-friendly text
- Lists supporting evidence
- Lists conflicting evidence
- Generates conclusion

### 6. Evaluation Engine
- Compares prediction vs actual result
- Tracks historical accuracy
- Educational statistics

## 🚀 Tech Stack

### Frontend
- React 18+
- TypeScript
- TailwindCSS
- Recharts (charting)
- Zustand (state management)
- PWA APIs

### Backend
- Node.js/Express
- TypeScript
- SQLite/PostgreSQL (predictions history)
- Axios (API calls)
- Jest (testing)

### Data Sources
- Forex API (Alpha Vantage, IQFeed, or mock data)
- Real-time websocket feeds

## 📊 Supported Markets

- EUR/USD, GBP/USD, USD/JPY, USD/CHF
- AUD/USD, USD/CAD, NZD/USD
- EUR/JPY, GBP/JPY

## ⏱️ Supported Timeframes

- 1m, 5m, 15m, 30m, 1H, 4H, 1D

## ⚠️ Risk Warning

**Market predictions are uncertain.** This tool estimates directional bias from available market data and technical evidence. It cannot reliably predict future price movements. Use the platform for education and paper trading only.

## 📝 License

MIT License - See LICENSE file

## 🔗 Links

- [Architecture Documentation](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Prediction Logic](docs/PREDICTION_LOGIC.md)
