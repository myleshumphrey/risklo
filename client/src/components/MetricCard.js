import React from 'react';
import './MetricCard.css';

function MetricCard({ title, value, subtitle, icon, trend, onClick, clickable }) {
  // If icon is a string (emoji), render it as-is for backward compatibility
  // Otherwise, render as React component
  const renderIcon = () => {
    if (typeof icon === 'string') {
      return <span className="metric-icon-emoji">{icon}</span>;
    }
    return <span className="metric-icon-svg">{icon}</span>;
  };

  return (
    <div 
      className={`metric-card ${clickable ? 'clickable' : ''}`}
      onClick={onClick}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
    >
      <div className="metric-header">
        {renderIcon()}
        <h3 className="metric-title">{title}</h3>
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-subtitle">{subtitle}</div>
    </div>
  );
}

export default MetricCard;

