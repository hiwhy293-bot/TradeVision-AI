import { create } from 'zustand';
import { Prediction, PaperTrade, MarketData, Candle } from '@types/index';

interface PredictionStore {
  currentPrediction: Prediction | null;
  predictions: Prediction[];
  loading: boolean;
  error: string | null;
  setPrediction: (prediction: Prediction) => void;
  addPrediction: (prediction: Prediction) => void;
  setPredictions: (predictions: Prediction[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePredictionStore = create<PredictionStore>((set) => ({
  currentPrediction: null,
  predictions: [],
  loading: false,
  error: null,
  setPrediction: (prediction) => set({ currentPrediction: prediction }),
  addPrediction: (prediction) => set((state) => ({
    predictions: [prediction, ...state.predictions],
  })),
  setPredictions: (predictions) => set({ predictions }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

interface MarketStore {
  currentPrice: number;
  pair: string;
  timeframe: string;
  marketData: MarketData | null;
  candles: Candle[];
  setPair: (pair: string) => void;
  setTimeframe: (timeframe: string) => void;
  setMarketData: (data: MarketData) => void;
  setCandles: (candles: Candle[]) => void;
}

export const useMarketStore = create<MarketStore>((set) => ({
  currentPrice: 0,
  pair: 'EUR/USD',
  timeframe: '5m',
  marketData: null,
  candles: [],
  setPair: (pair) => set({ pair }),
  setTimeframe: (timeframe) => set({ timeframe }),
  setMarketData: (marketData) => set({ marketData, currentPrice: marketData.price }),
  setCandles: (candles) => set({ candles }),
}));

interface TradeStore {
  trades: PaperTrade[];
  openTrades: PaperTrade[];
  statistics: {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    netProfit: number;
  } | null;
  addTrade: (trade: PaperTrade) => void;
  setTrades: (trades: PaperTrade[]) => void;
  closeTrade: (tradeId: string, trade: PaperTrade) => void;
  setStatistics: (stats: any) => void;
}

export const useTradeStore = create<TradeStore>((set) => ({
  trades: [],
  openTrades: [],
  statistics: null,
  addTrade: (trade) => set((state) => ({
    trades: [trade, ...state.trades],
    openTrades: [trade, ...state.openTrades],
  })),
  setTrades: (trades) => set({
    trades,
    openTrades: trades.filter((t) => t.status === 'open'),
  }),
  closeTrade: (tradeId, trade) => set((state) => ({
    trades: state.trades.map((t) => (t.id === tradeId ? trade : t)),
    openTrades: state.openTrades.filter((t) => t.id !== tradeId),
  })),
  setStatistics: (statistics) => set({ statistics }),
}));
