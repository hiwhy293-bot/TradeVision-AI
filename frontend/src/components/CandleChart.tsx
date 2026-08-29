import React from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Candle } from '@types/index';

interface CandleChartProps {
  candles: Candle[];
  pair: string;
  timeframe: string;
  height?: number;
}

const CandleChart: React.FC<CandleChartProps> = ({ candles, pair, timeframe, height = 300 }) => {
  if (candles.length === 0) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height }}>
        <p className="text-gray-500">No candle data available</p>
      </div>
    );
  }

  const chartData = candles.map((candle, index) => ({
    timestamp: new Date(candle.timestamp).getTime(),
    close: candle.close,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    volume: candle.volume,
  }));

  const minPrice = Math.min(...chartData.map((d) => d.low)) * 0.999;
  const maxPrice = Math.max(...chartData.map((d) => d.high)) * 1.001;

  return (
    <div className="w-full card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{pair} - {timeframe}</h3>
        <p className="text-sm text-gray-400">{candles.length} candles</p>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="timestamp"
            stroke="#64748b"
            tick={{ fill: '#94a3b8' }}
            tickFormatter={(value) => new Date(value).toLocaleTimeString()}
          />
          <YAxis
            stroke="#64748b"
            domain={[minPrice, maxPrice]}
            tick={{ fill: '#94a3b8' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
            }}
            labelFormatter={(value) => new Date(value).toLocaleString()}
            formatter={(value: number) => [value.toFixed(4), '']}
          />
          <Area
            type="monotone"
            dataKey="close"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorClose)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CandleChart;
