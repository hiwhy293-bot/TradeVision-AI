import axios from 'axios';
import { Prediction, MarketData, Candle, PaperTrade } from '@types/index';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const marketAPI = {
  getCurrentPrice: (pair: string) => 
    api.get<{ success: boolean; data: MarketData }>('/market/current', { params: { pair } }),
  
  getCandles: (pair: string, timeframe: string, limit = 100) =>
    api.get<{ success: boolean; data: { candles: Candle[] } }>('/market/candles', {
      params: { pair, timeframe, limit },
    }),
  
  getPairs: () => 
    api.get<{ success: boolean; data: { pairs: string[] } }>('/market/pairs'),
  
  getTimeframes: () =>
    api.get<{ success: boolean; data: { timeframes: string[] } }>('/market/timeframes'),
  
  getStatus: () =>
    api.get<{ success: boolean; data: any }>('/market/status'),
};

export const predictionAPI = {
  getCurrentPrediction: (pair: string, timeframe: string) =>
    api.get<{ success: boolean; data: Prediction }>('/prediction/current', {
      params: { pair, timeframe },
    }),
  
  getHistory: (pair?: string, timeframe?: string, bias?: string, limit = 50, offset = 0) =>
    api.get<{ success: boolean; data: { predictions: Prediction[]; total: number } }>(
      '/prediction/history',
      { params: { pair, timeframe, bias, limit, offset } }
    ),
  
  getStatistics: (pair?: string, timeframe?: string) =>
    api.get<{ success: boolean; data: any }>('/prediction/statistics', {
      params: { pair, timeframe },
    }),
  
  generatePrediction: (pair: string, timeframe: string) =>
    api.post<{ success: boolean; data: Prediction }>('/prediction/generate', {
      pair,
      timeframe,
    }),
  
  evaluatePrediction: (predictionId: string, actualBias: string, actualCandle: Candle) =>
    api.post<{ success: boolean; data: any }>('/prediction/evaluate', {
      predictionId,
      actualBias,
      actualCandle,
    }),
};

export const paperTradeAPI = {
  enterTrade: (data: any) =>
    api.post<{ success: boolean; data: PaperTrade }>('/paper-trade/enter', data),
  
  exitTrade: (data: any) =>
    api.post<{ success: boolean; data: PaperTrade }>('/paper-trade/exit', data),
  
  getTrades: (status?: string, pair?: string, limit = 50, offset = 0) =>
    api.get<{ success: boolean; data: { trades: PaperTrade[]; total: number } }>(
      '/paper-trade/trades',
      { params: { status, pair, limit, offset } }
    ),
  
  getStatistics: (pair?: string) =>
    api.get<{ success: boolean; data: any }>('/paper-trade/stats', { params: { pair } }),
};
