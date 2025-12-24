import React from 'react';
import './InsightsPanel.css';

function InsightsPanel({ insights }) {
  if (!insights || insights.length === 0) return null;
  return (
    <div className="insights-panel">
      <h4>Insights</h4>
      <ul>
        {insights.map((text, idx) => (
          <li key={idx}>{text}</li>
        ))}
      </ul>
    </div>
  );
}

export default InsightsPanel;

