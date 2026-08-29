import React, { useEffect, useState } from 'react';
import { formatCountdown } from '@utils/formatters';

interface CandleCountdownProps {
  timeframe: string;
  onComplete?: () => void;
}

const CandleCountdown: React.FC<CandleCountdownProps> = ({ timeframe, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const timeframeMs: { [key: string]: number } = {
      '1m': 60,
      '5m': 5 * 60,
      '15m': 15 * 60,
      '30m': 30 * 60,
      '1H': 60 * 60,
      '4H': 4 * 60 * 60,
      '1D': 24 * 60 * 60,
    };

    const duration = timeframeMs[timeframe] || 60;
    const now = new Date();
    const nextCandleTime = new Date(now.getTime() + duration * 1000);

    const timer = setInterval(() => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((nextCandleTime.getTime() - now.getTime()) / 1000));
      setTimeLeft(diff);

      if (diff === 0) {
        onComplete?.();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeframe, onComplete]);

  return (
    <div className="card text-center">
      <p className="text-gray-400 text-sm mb-2">Next Candle in</p>
      <p className="text-4xl font-bold text-bullish font-mono">{formatCountdown(timeLeft)}</p>
    </div>
  );
};

export default CandleCountdown;
