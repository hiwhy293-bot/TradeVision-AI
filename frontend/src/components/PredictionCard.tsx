import React from 'react';
import { Prediction } from '@types/index';
import { formatPrice, getBiasEmoji, getConfidenceColor } from '@utils/formatters';

interface PredictionCardProps {
  prediction: Prediction | null;
  loading?: boolean;
}

const PredictionCard: React.FC<PredictionCardProps> = ({ prediction, loading = false }) => {
  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 bg-dark-border rounded mb-4 w-3/4"></div>
        <div className="space-y-3">
          <div className="h-3 bg-dark-border rounded"></div>
          <div className="h-3 bg-dark-border rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="card text-center">
        <p className="text-gray-400">No prediction available</p>
      </div>
    );
  }

  const biasColor = prediction.bias === 'UP' ? 'text-bullish' : prediction.bias === 'DOWN' ? 'text-bearish' : 'text-neutral';
  const bgColor = prediction.bias === 'UP' ? 'bg-green-900 bg-opacity-20' : prediction.bias === 'DOWN' ? 'bg-red-900 bg-opacity-20' : 'bg-gray-700 bg-opacity-20';

  return (
    <div className={`card ${bgColor}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-400">Next Candle Prediction</p>
          <p className={`text-3xl font-bold ${biasColor}`}>
            {getBiasEmoji(prediction.bias)} {prediction.bias}
          </p>
        </div>
        <div className={`text-right ${getConfidenceColor(prediction.confidence)}`}>
          <p className="text-sm text-gray-400">Confidence</p>
          <p className="text-2xl font-bold">{prediction.confidence}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-dark-border">
        <div>
          <p className="text-xs text-gray-500 uppercase">Current Price</p>
          <p className="text-lg font-semibold text-white">{formatPrice(prediction.currentPrice)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Timeframe</p>
          <p className="text-lg font-semibold text-white">{prediction.timeframe}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dark-border">
        <div>
          <p className="text-xs text-gray-500 uppercase">Bullish Score</p>
          <div className="w-full bg-dark-border rounded-full h-2 mt-1 overflow-hidden">
            <div
              className="bg-bullish h-full"
              style={{ width: `${Math.min((prediction.bullishScore / 100) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm font-medium text-bullish mt-1">{prediction.bullishScore}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Bearish Score</p>
          <div className="w-full bg-dark-border rounded-full h-2 mt-1 overflow-hidden">
            <div
              className="bg-bearish h-full"
              style={{ width: `${Math.min((prediction.bearishScore / 100) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm font-medium text-bearish mt-1">{prediction.bearishScore}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-dark-border">
        <p className="text-sm text-gray-300 leading-relaxed">{prediction.explanation}</p>
      </div>
    </div>
  );
};

export default PredictionCard;
