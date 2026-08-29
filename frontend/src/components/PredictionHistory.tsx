import React from 'react';
import { Prediction } from '@types/index';
import { formatDateTime } from '@utils/formatters';

interface PredictionHistoryProps {
  predictions: Prediction[];
  loading?: boolean;
}

const PredictionHistory: React.FC<PredictionHistoryProps> = ({ predictions, loading = false }) => {
  if (loading) {
    return (
      <div className="card">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-dark-border rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <div className="card text-center">
        <p className="text-gray-400">No predictions yet</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 text-white">Prediction History</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-border">
              <th className="text-left px-3 py-2 text-gray-400 font-medium">Time</th>
              <th className="text-left px-3 py-2 text-gray-400 font-medium">Pair</th>
              <th className="text-left px-3 py-2 text-gray-400 font-medium">TF</th>
              <th className="text-center px-3 py-2 text-gray-400 font-medium">Bias</th>
              <th className="text-center px-3 py-2 text-gray-400 font-medium">Conf.</th>
              <th className="text-right px-3 py-2 text-gray-400 font-medium">Price</th>
            </tr>
          </thead>
          <tbody>
            {predictions.slice(0, 10).map((pred) => (
              <tr key={pred.id} className="border-b border-dark-border hover:bg-dark-bg transition-colors">
                <td className="px-3 py-3 text-gray-300 text-xs">{formatDateTime(new Date(pred.timestamp))}</td>
                <td className="px-3 py-3 font-medium text-white">{pred.pair}</td>
                <td className="px-3 py-3 text-gray-300">{pred.timeframe}</td>
                <td className="px-3 py-3 text-center">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                      pred.bias === 'UP'
                        ? 'bg-green-900 text-bullish'
                        : pred.bias === 'DOWN'
                        ? 'bg-red-900 text-bearish'
                        : 'bg-gray-700 text-neutral'
                    }`}
                  >
                    {pred.bias}
                  </span>
                </td>
                <td className={`px-3 py-3 text-center font-medium ${
                  pred.confidence >= 70
                    ? 'text-bullish'
                    : pred.confidence >= 50
                    ? 'text-yellow-400'
                    : 'text-gray-400'
                }`}>
                  {pred.confidence}%
                </td>
                <td className="px-3 py-3 text-right text-gray-300 font-mono">{pred.currentPrice.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PredictionHistory;
