export const formatPrice = (price: number, decimals = 4): string => {
  return price.toFixed(decimals);
};

export const formatPercent = (value: number, decimals = 2): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

export const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 70) return 'text-bullish';
  if (confidence >= 50) return 'text-yellow-400';
  return 'text-gray-400';
};

export const getBiasColor = (bias: 'UP' | 'DOWN' | 'WAIT'): string => {
  switch (bias) {
    case 'UP':
      return 'text-bullish';
    case 'DOWN':
      return 'text-bearish';
    case 'WAIT':
      return 'text-neutral';
  }
};

export const getBiasEmoji = (bias: 'UP' | 'DOWN' | 'WAIT'): string => {
  switch (bias) {
    case 'UP':
      return '📈';
    case 'DOWN':
      return '📉';
    case 'WAIT':
      return '⏸️';
  }
};

export const calculateCandleCountdown = (timeframe: string): number => {
  const timeframeMs: { [key: string]: number } = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '30m': 30 * 60 * 1000,
    '1H': 60 * 60 * 1000,
    '4H': 4 * 60 * 60 * 1000,
    '1D': 24 * 60 * 60 * 1000,
  };
  return timeframeMs[timeframe] || 60000;
};

export const formatCountdown = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
