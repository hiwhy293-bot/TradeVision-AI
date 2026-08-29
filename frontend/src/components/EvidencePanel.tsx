import React from 'react';
import { Prediction } from '@types/index';

interface EvidencePanelProps {
  prediction: Prediction | null;
}

const EvidencePanel: React.FC<EvidencePanelProps> = ({ prediction }) => {
  if (!prediction) {
    return (
      <div className="card text-center">
        <p className="text-gray-400">No evidence to display</p>
      </div>
    );
  }

  const { evidence, supportingEvidence, conflictingEvidence } = prediction;

  return (
    <div className="space-y-4">
      {/* Evidence Breakdown */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-white">Evidence Breakdown</h3>
        <div className="space-y-3">
          {Object.entries(evidence).map(([category, values]) => {
            if (typeof values !== 'object' || values === null) return null;
            if ('impact' in values) return null; // Skip volatility for now

            const bullish = (values as any).bullish || 0;
            const bearish = (values as any).bearish || 0;
            const total = bullish + bearish;

            return (
              <div key={category}>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium text-gray-300 capitalize">{category}</p>
                  <span className="text-xs text-gray-400">{total} points</span>
                </div>
                <div className="flex gap-1 h-2 bg-dark-border rounded-full overflow-hidden">
                  <div
                    className="bg-bullish"
                    style={{ width: total > 0 ? `${(bullish / total) * 100}%` : '0%' }}
                  ></div>
                  <div
                    className="bg-bearish"
                    style={{ width: total > 0 ? `${(bearish / total) * 100}%` : '0%' }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Supporting Evidence */}
      {supportingEvidence.length > 0 && (
        <div className="card border border-green-900 bg-green-900 bg-opacity-10">
          <h4 className="text-sm font-semibold text-bullish mb-3 uppercase">✓ Supporting Evidence</h4>
          <ul className="space-y-2">
            {supportingEvidence.map((evidence, idx) => (
              <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-bullish mt-1">+</span>
                <span>{evidence}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Conflicting Evidence */}
      {conflictingEvidence.length > 0 && (
        <div className="card border border-red-900 bg-red-900 bg-opacity-10">
          <h4 className="text-sm font-semibold text-bearish mb-3 uppercase">⚠ Conflicting Evidence</h4>
          <ul className="space-y-2">
            {conflictingEvidence.map((evidence, idx) => (
              <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-bearish mt-1">-</span>
                <span>{evidence}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EvidencePanel;
