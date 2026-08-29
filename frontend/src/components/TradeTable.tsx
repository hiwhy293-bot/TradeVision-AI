import React from 'react';
import { PaperTrade } from '@types/index';
import { formatDateTime } from '@utils/formatters';

interface TradeTableProps {
  trades: PaperTrade[];
  onCloseClick?: (trade: PaperTrade) => void;
  loading?: boolean;
}

const TradeTable: React.FC<TradeTableProps> = ({ trades, onCloseClick, loading = false }) => {
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

  if (trades.length === 0) {
    return (
      <div className="card text-center">
        <p className="text-gray-400">No trades</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 text-white">Paper Trades</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-border">
              <th className="text-left px-3 py-2 text-gray-400 font-medium">Pair</th>
              <th className="text-center px-3 py-2 text-gray-400 font-medium">Dir.</th>
              <th className="text-right px-3 py-2 text-gray-400 font-medium">Entry</th>
              <th className="text-right px-3 py-2 text-gray-400 font-medium">Current</th>
              <th className="text-right px-3 py-2 text-gray-400 font-medium">P&L</th>
              <th className="text-center px-3 py-2 text-gray-400 font-medium">Status</th>
              <th className="text-center px-3 py-2 text-gray-400 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id} className="border-b border-dark-border hover:bg-dark-bg transition-colors">
                <td className="px-3 py-3 font-medium text-white">{trade.pair}</td>
                <td className={`px-3 py-3 text-center font-bold ${
                  trade.direction === 'LONG' ? 'text-bullish' : 'text-bearish'
                }`}>
                  {trade.direction}
                </td>
                <td className="px-3 py-3 text-right text-gray-300 font-mono">{trade.entryPrice.toFixed(4)}</td>
                <td className="px-3 py-3 text-right text-gray-300 font-mono">-</td>
                <td className={`px-3 py-3 text-right font-bold ${
                  trade.profitLoss === undefined ? 'text-gray-400' : trade.profitLoss >= 0 ? 'text-bullish' : 'text-bearish'
                }`}>
                  {trade.profitLoss !== undefined ? (trade.profitLoss >= 0 ? '+' : '') + trade.profitLoss.toFixed(2) : '-'}
                </td>
                <td className="px-3 py-3 text-center">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    trade.status === 'open'
                      ? 'bg-yellow-900 text-yellow-300'
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    {trade.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-3 py-3 text-center">
                  {trade.status === 'open' && (
                    <button
                      onClick={() => onCloseClick?.(trade)}
                      className="text-xs px-2 py-1 bg-bearish hover:bg-red-600 text-white rounded transition-colors"
                    >
                      Close
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradeTable;
