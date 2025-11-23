import React from 'react';
import './Dashboard.css';
import MetricCard from './MetricCard';
import RiskIndicator from './RiskIndicator';

function Dashboard({ metrics }) {
  if (!metrics || metrics.error) {
    return (
      <div className="dashboard-error">
        {metrics?.error || 'Unable to display metrics'}
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* GO/NO GO Indicator */}
      {metrics.blowAccountStatus && (
        <div className="blow-account-indicator" style={{ borderColor: metrics.blowAccountColor, backgroundColor: `${metrics.blowAccountColor}15` }}>
          <div className="blow-account-status">
            <span className="blow-account-label">Account Blowout Risk:</span>
            <span className="blow-account-value" style={{ color: metrics.blowAccountColor }}>
              {metrics.blowAccountStatus}
            </span>
          </div>
          {metrics.contractType && (
            <div className="contract-type-badge">
              Contract Type: <strong>{metrics.contractType}</strong>
            </div>
          )}
          <p className="blow-account-message">{metrics.blowAccountMessage}</p>
          {metrics.blowAccountProbability !== null && metrics.blowAccountProbability > 0 && (
            <div className="blow-account-probability">
              Probability of exceeding max drawdown: <strong>{metrics.blowAccountProbability}%</strong>
            </div>
          )}
        </div>
      )}

      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Risk Assessment</h2>
          <div className="risk-score-display">
            <span className="risk-score-label">Risk Score:</span>
            <span className="risk-score-value" style={{ color: metrics.riskColor }}>
              {metrics.riskScore}/100
            </span>
          </div>
        </div>
        <RiskIndicator 
          level={metrics.riskLevel} 
          color={metrics.riskColor}
          message={metrics.riskMessage}
        />
      </div>

      <div className="metrics-grid">
        <MetricCard
          title="Risk Score"
          value={`${metrics.riskScore}/100`}
          subtitle={metrics.riskScore < 40 ? 'Low Risk' : metrics.riskScore < 70 ? 'Moderate Risk' : 'High Risk'}
          icon="⚠️"
          trend={metrics.riskScore < 40 ? 'neutral' : metrics.riskScore < 70 ? 'moderate' : 'negative'}
        />
        
        <MetricCard
          title="Highest Loss"
          value={`$${metrics.highestLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${metrics.highestLossPercent}% of account (${metrics.numContracts || 1} contract${(metrics.numContracts || 1) > 1 ? 's' : ''})`}
          icon="📉"
          trend="negative"
        />
        
        <MetricCard
          title="Average Loss"
          value={`$${metrics.avgLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${metrics.avgLossPercent}% of account (${metrics.numContracts || 1} contract${(metrics.numContracts || 1) > 1 ? 's' : ''})`}
          icon="📊"
          trend="negative"
        />
        
        {metrics.highestLossPerContract && (
          <MetricCard
            title="Per-Contract Loss"
            value={`$${metrics.highestLossPerContract.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtitle={`Worst loss per contract`}
            icon="⚖️"
            trend="neutral"
          />
        )}
        
        <MetricCard
          title="Trading Days Analyzed"
          value={metrics.totalDays}
          subtitle={`${metrics.losingDays} losing days`}
          icon="📈"
          trend="neutral"
        />

        {metrics.drawdownBreach && (
          <MetricCard
            title="Max Drawdown Analysis"
            value={`$${metrics.drawdownBreach.maxDrawdown.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtitle={metrics.drawdownBreach.breaches > 0 
              ? `${metrics.drawdownBreach.breaches} breach(es) with ${metrics.numContracts || 1} contract(s) - ${metrics.drawdownBreach.breachProbability}% probability`
              : `No breaches - $${parseFloat(metrics.drawdownBreach.margin).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} buffer`}
            icon="🛡️"
            trend={metrics.drawdownBreach.highestExceeds ? 'negative' : 'neutral'}
          />
        )}
      </div>

      <div className="risk-message-box">
        <p className="risk-message-text">{metrics.riskMessage}</p>
      </div>
    </div>
  );
}

export default Dashboard;

