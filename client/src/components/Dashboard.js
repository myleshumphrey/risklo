import React from 'react';
import './Dashboard.css';
import MetricCard from './MetricCard';
import RiskIndicator from './RiskIndicator';

function Dashboard({ metrics, riskMode = 'risk' }) {
  if (!metrics || metrics.error) {
    return (
      <div className="dashboard-error">
        {metrics?.error || 'Unable to display metrics'}
      </div>
    );
  }

  // Debug logging (can be removed later)
  console.log('Dashboard metrics:', {
    maxProfit: metrics.maxProfit,
    avgProfit: metrics.avgProfit,
    maxProfitPercent: metrics.maxProfitPercent,
    avgProfitPercent: metrics.avgProfitPercent,
    allKeys: Object.keys(metrics)
  });

  return (
    <div className="dashboard">
      {/* GO/NO GO Indicator - only show for Risk mode */}
      {riskMode === 'risk' && metrics.blowAccountStatus && (
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
        
        {metrics.maxProfit !== undefined && (
          <MetricCard
            title="Max Profit"
            value={`$${(metrics.maxProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtitle={metrics.maxProfit > 0 
              ? `${metrics.maxProfitPercent}% of account (${metrics.numContracts || 1} contract${(metrics.numContracts || 1) > 1 ? 's' : ''})`
              : `No profit data (${metrics.numContracts || 1} contract${(metrics.numContracts || 1) > 1 ? 's' : ''})`}
            icon="📈"
            trend={metrics.maxProfit > 0 ? "positive" : "neutral"}
          />
        )}
        
        {metrics.avgProfit !== undefined && (
          <MetricCard
            title="Average Profit"
            value={`$${(metrics.avgProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtitle={metrics.avgProfit > 0
              ? `${metrics.avgProfitPercent}% of account (${metrics.numContracts || 1} contract${(metrics.numContracts || 1) > 1 ? 's' : ''})`
              : `No profit data (${metrics.numContracts || 1} contract${(metrics.numContracts || 1) > 1 ? 's' : ''})`}
            icon="💰"
            trend={metrics.avgProfit > 0 ? "positive" : "neutral"}
          />
        )}
        
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
          subtitle={metrics.winningDays !== undefined 
            ? `${metrics.winningDays} winning, ${metrics.losingDays} losing days`
            : `${metrics.losingDays} losing days`}
          icon="📈"
          trend="neutral"
        />

        {riskMode === 'risk' && metrics.drawdownBreach && (
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

        {riskMode === 'apexMae' && metrics.apexMaeComparison && (
          <MetricCard
            title="Apex MAE Limit"
            value={`$${metrics.apexMaeComparison.maxMaePerTrade.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtitle={`${(metrics.apexMaeComparison.limitPercent * 100).toFixed(0)}% of $${metrics.apexMaeComparison.baseAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon="📏"
            trend={metrics.apexMaeComparison.exceedsMae ? 'negative' : 'neutral'}
          />
        )}
      </div>

      {riskMode === 'apexMae' && metrics.apexMaeComparison && (
        <div className="apex-mae-box" style={{ 
          borderColor: metrics.apexMaeComparison.exceedsMae ? '#ef4444' : '#10b981',
          backgroundColor: metrics.apexMaeComparison.exceedsMae ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'
        }}>
          <div className="apex-mae-header">
            <span className="apex-mae-label">Apex MAE (30% Rule) Status:</span>
            <span className="apex-mae-status" style={{ color: metrics.apexMaeComparison.exceedsMae ? '#ef4444' : '#10b981' }}>
              {metrics.apexMaeComparison.maeStatus}
            </span>
          </div>
          <p className="apex-mae-message">{metrics.apexMaeComparison.maeMessage}</p>
          <div className="apex-mae-details">
            <div className="apex-mae-detail">
              <span>Historical Worst Loss:</span>
              <span>${metrics.apexMaeComparison.worstLossForSize.toFixed(2)}</span>
            </div>
            <div className="apex-mae-detail">
              <span>Apex MAE Limit:</span>
              <span>${metrics.apexMaeComparison.maxMaePerTrade.toFixed(2)}</span>
            </div>
            {!metrics.apexMaeComparison.exceedsMae && (
              <div className="apex-mae-detail">
                <span>Buffer:</span>
                <span style={{ color: '#10b981' }}>${metrics.apexMaeComparison.maeBuffer}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="risk-message-box">
        <p className="risk-message-text">{metrics.riskMessage}</p>
      </div>
    </div>
  );
}

export default Dashboard;

