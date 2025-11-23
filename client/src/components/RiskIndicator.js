import React from 'react';
import './RiskIndicator.css';

function RiskIndicator({ level, color, message }) {
  const levelLabels = {
    low: 'Low Risk',
    moderate: 'Moderate Risk',
    high: 'High Risk',
  };

  return (
    <div className="risk-indicator" style={{ '--risk-color': color }}>
      <div className="risk-badge">
        <span className="risk-dot"></span>
        <span className="risk-label">{levelLabels[level] || level}</span>
      </div>
    </div>
  );
}

export default RiskIndicator;

