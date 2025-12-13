import React, { useState } from 'react';
import './Dashboard.css';
import MetricCard from './MetricCard';
import RiskIndicator from './RiskIndicator';
import CalculationModal from './CalculationModal';
import { IconTrendDown, IconTrendUp, IconAlert, IconChart, IconScale, IconInfo, IconCheck, IconLightbulb } from './Icons';

function Dashboard({ metrics, riskMode = 'risk', onNavigate, formData }) {
  const [selectedMetric, setSelectedMetric] = useState(null);
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
    windfallRule: metrics.windfallRule,
    riskMode: riskMode,
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
          {metrics.blowAccountProbability !== null && (
            <div className="blow-account-probability">
              Probability of end-of-day losses exceeding max drawdown: <strong>{metrics.blowAccountProbability.toFixed(1)}%</strong>
              <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: '0.9em' }}>
                <strong><IconAlert size={16} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} /> Important:</strong> Trailing drawdown is based on <strong>intraday maximum adverse excursion (MAE)</strong>, not end-of-day P&L. A trade could close positive but still blow the account if it exceeded the drawdown limit during the day. This analysis uses end-of-day data, so <strong>actual risk may be higher</strong> than shown.
              </div>
            </div>
          )}
        </div>
      )}

      {/* What to Fix Section - Show when there's a risk issue */}
      {((riskMode === 'risk' && (metrics.blowAccountStatus === 'NO GO' || metrics.blowAccountStatus === 'CAUTION' || metrics.riskScore >= 60)) || 
        (riskMode === 'apexMae' && metrics.apexMaeComparison?.exceedsMae)) && (
        <div className="what-to-fix-section">
          <div className="what-to-fix-header">
            <IconLightbulb size={20} style={{ color: '#f59e0b' }} />
            <h3 className="what-to-fix-title">What to Fix</h3>
          </div>
          <div className="what-to-fix-content">
            <ul className="what-to-fix-list">
              {/* Suggestion 1: Reduce Contracts */}
              {formData?.contracts && Number(formData.contracts) > 1 && (
                <li className="what-to-fix-item">
                  <strong>Reduce Contracts:</strong> Consider reducing from <strong>{formData.contracts}</strong> contract{Number(formData.contracts) > 1 ? 's' : ''} to{' '}
                  {riskMode === 'risk' && metrics.drawdownBreach?.maxDrawdown ? (
                    <strong>{Math.max(1, Math.floor((metrics.drawdownBreach.maxDrawdown / (metrics.highestLoss / Number(formData.contracts || 1))) * 0.9))}</strong>
                  ) : riskMode === 'apexMae' && metrics.apexMaeComparison?.maxMaePerTrade ? (
                    <strong>{Math.max(1, Math.floor((metrics.apexMaeComparison.maxMaePerTrade / (metrics.highestLoss / Number(formData.contracts || 1))) * 0.9))}</strong>
                  ) : (
                    <strong>{Math.max(1, Math.floor(Number(formData.contracts) * 0.5))}</strong>
                  )}
                  {' '}contract{Math.max(1, Math.floor(Number(formData.contracts) * 0.5)) > 1 ? 's' : ''} to lower your risk exposure.
                </li>
              )}
              
              {/* Suggestion 2: Switch to MNQ */}
              {formData?.contractType === 'NQ' && (
                <li className="what-to-fix-item">
                  <strong>Switch to Micro Contracts (MNQ):</strong> MNQ contracts are 1/10th the size of NQ contracts, which means{' '}
                  {formData?.contracts ? `your current ${formData.contracts} NQ contract${Number(formData.contracts) > 1 ? 's' : ''}` : 'your NQ position'}{' '}
                  would be equivalent to <strong>{Number(formData?.contracts || 1) * 10}</strong> MNQ contracts. This gives you{' '}
                  <strong>10x more granular control</strong> over your position size and can help you stay within risk limits.
                </li>
              )}
              
              {/* Suggestion 3: Consider Alternative Strategies (Last Resort) */}
              {formData?.contractType === 'MNQ' && Number(formData?.contracts || 1) === 1 ? (
                <li className="what-to-fix-item">
                  <strong>Consider Alternative Strategies:</strong> Since you're already trading <strong>1 MNQ contract</strong> (the smallest position size), switching to a different strategy may be your best option. 
                  <strong> Consult with the Vector Algorithmics team</strong> to determine which strategy would best align with your risk tolerance and account size. They can help you find a strategy with lower historical drawdowns that better matches your risk profile.
                </li>
              ) : (
                <li className="what-to-fix-item">
                  <strong>Consider Alternative Strategies (Last Resort):</strong> If reducing contracts or switching to MNQ isn't sufficient, this strategy may not align with your risk tolerance or account size. 
                  Try analyzing other strategies from the dropdown to find one with lower historical drawdowns. If you're unsure which strategy to choose, <strong>consult with the Vector Algorithmics team</strong> for guidance on the best strategy for your situation.
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">
            {riskMode === 'risk' ? 'Risk Results' : '30% Drawdown Results'}
          </h2>
          {riskMode === 'risk' && (
            <div className="risk-score-display">
              <span className="risk-score-label">Risk Score:</span>
              <span className="risk-score-value" style={{ color: metrics.riskColor }}>
                {metrics.riskScore}/100
              </span>
            </div>
          )}
        </div>
        {riskMode === 'risk' && (
          <RiskIndicator 
            level={metrics.riskLevel} 
            color={metrics.riskColor}
            message={metrics.riskMessage}
          />
        )}
      </div>

      {riskMode === 'apexMae' ? (
        // Simplified metrics for 30% Drawdown mode - focus on key info
        <div className="metrics-grid">
          {metrics.apexMaeComparison && (
            <MetricCard
              title="Maximum Loss Allowed"
              value={`$${metrics.apexMaeComparison.maxMaePerTrade.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle={`MAE Limit (${(metrics.apexMaeComparison.limitPercent * 100).toFixed(0)}% rule)`}
              icon="🛡️"
              trend={metrics.apexMaeComparison.exceedsMae ? 'negative' : 'neutral'}
              clickable={true}
              onClick={() => setSelectedMetric('apexMae')}
            />
          )}
          
          <MetricCard
            title="Your Worst Historical Loss"
            value={`$${metrics.highestLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtitle={`${metrics.highestLossPercent}% of account (${metrics.numContracts || 1} contract${(metrics.numContracts || 1) > 1 ? 's' : ''})`}
            icon={<IconTrendDown size={20} />}
            trend={metrics.apexMaeComparison?.exceedsMae ? 'negative' : 'neutral'}
            clickable={true}
            onClick={() => setSelectedMetric('highestLoss')}
          />

          {metrics.maxProfit !== undefined && metrics.maxProfit > 0 && (
            <MetricCard
              title="Maximum Profit"
              value={`$${metrics.maxProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle={`${metrics.maxProfitPercent}% of account (${metrics.numContracts || 1} contract${(metrics.numContracts || 1) > 1 ? 's' : ''})`}
              icon={<IconTrendUp size={20} />}
              trend="positive"
              clickable={true}
              onClick={() => setSelectedMetric('maxProfit')}
            />
          )}
        </div>
      ) : (
        // Full metrics for Risk mode
        <div className="metrics-grid">
          <MetricCard
            title="Risk Score"
            value={`${metrics.riskScore}/100`}
            subtitle={metrics.riskScore < 40 ? 'Low Risk' : metrics.riskScore < 70 ? 'Moderate Risk' : 'High Risk'}
            icon={<IconAlert size={20} />}
            trend={metrics.riskScore < 40 ? 'neutral' : metrics.riskScore < 70 ? 'moderate' : 'negative'}
            clickable={true}
            onClick={() => setSelectedMetric('riskScore')}
          />
          
          <MetricCard
            title="Highest Loss"
            value={`$${metrics.highestLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtitle={`${metrics.highestLossPercent}% of account (${metrics.numContracts || 1} contract${(metrics.numContracts || 1) > 1 ? 's' : ''})`}
            icon={<IconTrendDown size={20} />}
            trend="negative"
            clickable={true}
            onClick={() => setSelectedMetric('highestLoss')}
          />
          
          <MetricCard
            title="Average Loss"
            value={`$${metrics.avgLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtitle={`${metrics.avgLossPercent}% of account (${metrics.numContracts || 1} contract${(metrics.numContracts || 1) > 1 ? 's' : ''})`}
            icon={<IconChart size={20} />}
            trend="negative"
            clickable={true}
            onClick={() => setSelectedMetric('averageLoss')}
          />
          
          {metrics.maxProfit !== undefined && metrics.maxProfit > 0 && (
            <MetricCard
              title="Max Profit"
              value={`$${metrics.maxProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle={`${metrics.maxProfitPercent}% of account (${metrics.numContracts || 1} contract${(metrics.numContracts || 1) > 1 ? 's' : ''})`}
              icon={<IconTrendUp size={20} />}
              trend="positive"
              clickable={true}
              onClick={() => setSelectedMetric('maxProfit')}
            />
          )}
          
          {metrics.avgProfit !== undefined && metrics.avgProfit > 0 && (
            <MetricCard
              title="Average Profit"
              value={`$${metrics.avgProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle={`${metrics.avgProfitPercent}% of account (${metrics.numContracts || 1} contract${(metrics.numContracts || 1) > 1 ? 's' : ''})`}
              icon={<IconTrendUp size={20} />}
              trend="positive"
              clickable={true}
              onClick={() => setSelectedMetric('averageProfit')}
            />
          )}
          
          {metrics.highestLossPerContract && (
            <MetricCard
              title="Per-Contract Loss"
              value={`$${metrics.highestLossPerContract.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle={`Worst loss per contract`}
              icon={<IconScale size={20} />}
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

          {metrics.drawdownBreach && (
            <MetricCard
              title="Max Drawdown Analysis"
              value={`$${metrics.drawdownBreach.maxDrawdown.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle={metrics.drawdownBreach.breaches > 0 
                ? `${metrics.drawdownBreach.breaches} breach(es) with ${metrics.numContracts || 1} contract(s) - ${metrics.drawdownBreach.breachProbability}% probability`
                : `No breaches - $${parseFloat(metrics.drawdownBreach.margin).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} buffer`}
              icon="🛡️"
              trend={metrics.drawdownBreach.highestExceeds ? 'negative' : 'neutral'}
              clickable={true}
              onClick={() => setSelectedMetric('maxDrawdown')}
            />
          )}
        </div>
      )}

      {riskMode === 'apexMae' && metrics.apexMaeComparison && (
        <div className="apex-mae-simplified-box" style={{ 
          borderColor: metrics.apexMaeComparison.exceedsMae ? '#ef4444' : '#10b981',
          backgroundColor: metrics.apexMaeComparison.exceedsMae ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'
        }}>
          <div className="apex-mae-simplified-header">
            <div className="apex-mae-status-badge" style={{ 
              backgroundColor: metrics.apexMaeComparison.exceedsMae ? '#ef4444' : '#10b981',
              color: '#ffffff'
            }}>
              {metrics.apexMaeComparison.exceedsMae ? (
                <>
                  <IconAlert size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  EXCEEDS LIMIT
                </>
              ) : (
                <>
                  <IconCheck size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  WITHIN LIMIT
                </>
              )}
            </div>
            <h3 className="apex-mae-simplified-title">30% Negative P&L Rule (MAE)</h3>
          </div>
          
          <div className="apex-mae-simplified-content">
            <div className="apex-mae-key-metric">
              <div className="apex-mae-metric-label">Maximum Loss Allowed (MAE Limit)</div>
              <div className="apex-mae-metric-value" style={{ color: metrics.apexMaeComparison.exceedsMae ? '#ef4444' : '#10b981' }}>
                ${metrics.apexMaeComparison.maxMaePerTrade.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="apex-mae-metric-subtitle">
                {metrics.apexMaeComparison.limitPercent * 100}% of ${metrics.apexMaeComparison.baseAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="apex-mae-comparison">
              <div className="apex-mae-comparison-item">
                <span className="comparison-label">Your Worst Historical Loss:</span>
                <span className={`comparison-value ${metrics.apexMaeComparison.exceedsMae ? 'exceeds' : 'safe'}`}>
                  ${metrics.apexMaeComparison.worstLossForSize.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              
              {metrics.apexMaeComparison.exceedsMae ? (
                <div className="apex-mae-warning">
                  <strong><IconAlert size={16} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} /> WARNING:</strong> Your worst historical loss exceeds the MAE limit by ${Math.abs(parseFloat(metrics.apexMaeComparison.maeBuffer)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. 
                  This strategy has historically violated the 30% rule.
                  {metrics.apexMaeComparison.maeBreachProbability !== undefined && (
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                      <strong>Probability of exceeding MAE limit:</strong> <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '1.1em' }}>{metrics.apexMaeComparison.maeBreachProbability}%</span>
                      {metrics.apexMaeComparison.maeBreaches > 0 && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.9em', opacity: 0.9 }}>
                          ({metrics.apexMaeComparison.maeBreaches} of {metrics.apexMaeComparison.totalTradingDays} trading days exceeded the limit)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="apex-mae-safe">
                  <strong><IconCheck size={16} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} /> SAFE:</strong> Your worst historical loss is within the MAE limit. 
                  You have a ${metrics.apexMaeComparison.maeBuffer} buffer before hitting the limit.
                  {metrics.apexMaeComparison.maeBreachProbability !== undefined && metrics.apexMaeComparison.maeBreachProbability > 0 && (
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                      <strong>Probability of exceeding MAE limit:</strong> <span style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '1.1em' }}>{metrics.apexMaeComparison.maeBreachProbability}%</span>
                      {metrics.apexMaeComparison.maeBreaches > 0 && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.9em', opacity: 0.9 }}>
                          ({metrics.apexMaeComparison.maeBreaches} of {metrics.apexMaeComparison.totalTradingDays} trading days exceeded the limit)
                        </div>
                      )}
                    </div>
                  )}
                  {metrics.apexMaeComparison.maeBreachProbability !== undefined && metrics.apexMaeComparison.maeBreachProbability === 0 && (
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                      <strong>Probability of exceeding MAE limit:</strong> <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.1em' }}>0%</span>
                      <div style={{ marginTop: '0.5rem', fontSize: '0.9em', opacity: 0.9 }}>
                        (No historical trading days exceeded the MAE limit)
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {false && riskMode === 'apexMae' && metrics.windfallRule && (
        <div className="apex-mae-simplified-box" style={{ 
          borderColor: metrics.windfallRule.violatesWindfall === true ? '#ef4444' : metrics.windfallRule.violatesWindfall === false ? '#10b981' : '#f59e0b',
          backgroundColor: metrics.windfallRule.violatesWindfall === true ? 'rgba(239, 68, 68, 0.1)' : metrics.windfallRule.violatesWindfall === false ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'
        }}>
          <div className="apex-mae-simplified-header">
            <div className="apex-mae-status-badge" style={{ 
              backgroundColor: metrics.windfallRule.violatesWindfall === true ? '#ef4444' : metrics.windfallRule.violatesWindfall === false ? '#10b981' : '#f59e0b',
              color: '#ffffff'
            }}>
              {metrics.windfallRule.violatesWindfall === true ? (
                <>
                  <IconAlert size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  VIOLATES RULE
                </>
              ) : metrics.windfallRule.violatesWindfall === false ? (
                <>
                  <IconCheck size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  WITHIN RULE
                </>
              ) : (
                <>
                  <IconInfo size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  INFO
                </>
              )}
            </div>
            <h3 className="apex-mae-simplified-title">30% Consistency Rule (Windfall)</h3>
          </div>
          
          <div className="apex-mae-simplified-content">
            {metrics.windfallRule.maxProfitTodayAllowed !== null && metrics.windfallRule.maxProfitTodayAllowed !== undefined ? (
              <div className="apex-mae-key-metric">
                <div className="apex-mae-metric-label">Maximum Profit You Can Make Today</div>
                <div className="apex-mae-metric-value" style={{ color: metrics.windfallRule.violatesWindfall ? '#f59e0b' : '#10b981' }}>
                  ${parseFloat(metrics.windfallRule.maxProfitTodayAllowed).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="apex-mae-metric-subtitle">
                  Without violating windfall rule (if today becomes highest day)
                </div>
              </div>
            ) : (
              <div className="apex-mae-key-metric">
                <div className="apex-mae-metric-label">Maximum Profit You Can Make Today</div>
                <div className="apex-mae-metric-value" style={{ color: '#f59e0b' }}>
                  N/A
                </div>
                <div className="apex-mae-metric-subtitle">
                  Enter profit balance to calculate
                </div>
              </div>
            )}

            <div className="apex-mae-key-metric">
              <div className="apex-mae-metric-label">Highest Historical Profit Day</div>
              <div className="apex-mae-metric-value" style={{ color: metrics.windfallRule.violatesWindfall ? '#ef4444' : '#10b981' }}>
                ${metrics.windfallRule.maxProfitDay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="apex-mae-metric-subtitle">
                Maximum single-day profit from historical data
              </div>
            </div>

            <div className="apex-mae-comparison">
              <div className="apex-mae-comparison-item">
                <span className="comparison-label">Your Highest Profit Day:</span>
                <span className={`comparison-value ${metrics.windfallRule.violatesWindfall ? 'exceeds' : 'safe'}`}>
                  ${metrics.windfallRule.maxProfitDay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              
              {metrics.windfallRule.profitBalanceForWindfall && (
                <div className="apex-mae-comparison-item">
                  <span className="comparison-label">Current Profit Balance:</span>
                  <span className="comparison-value">
                    ${parseFloat(metrics.windfallRule.profitBalanceForWindfall).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              
              {metrics.windfallRule.maxProfitPercentOfBalance !== null && (
                <div className="apex-mae-comparison-item">
                  <span className="comparison-label">Highest Day as % of Profit Balance:</span>
                  <span className={`comparison-value ${metrics.windfallRule.violatesWindfall ? 'exceeds' : 'safe'}`}>
                    {metrics.windfallRule.maxProfitPercentOfBalance}%
                  </span>
                </div>
              )}
              
              {metrics.windfallRule.additionalProfitNeeded && parseFloat(metrics.windfallRule.additionalProfitNeeded) > 0 && (
                <div className="apex-mae-comparison-item">
                  <span className="comparison-label">Additional Profit Needed for Payout:</span>
                  <span className="comparison-value exceeds">
                    ${parseFloat(metrics.windfallRule.additionalProfitNeeded).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              
              {metrics.windfallRule.maxProfitTodayMessage && (
                <div className="apex-mae-info" style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'rgba(102, 126, 234, 0.15)',
                  borderLeft: '4px solid #667eea',
                  borderRadius: '8px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.95rem',
                  lineHeight: '1.6'
                }}>
                  <strong><IconInfo size={16} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} /> Today's Limit:</strong> {metrics.windfallRule.maxProfitTodayMessage}
                </div>
              )}
              
              {metrics.windfallRule.violatesWindfall === true ? (
                <div className="apex-mae-warning">
                  <strong><IconAlert size={16} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} /> WARNING:</strong> {metrics.windfallRule.windfallMessage}
                </div>
              ) : metrics.windfallRule.violatesWindfall === false ? (
                <div className="apex-mae-safe">
                  <strong><IconCheck size={16} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} /> SAFE:</strong> {metrics.windfallRule.windfallMessage}
                </div>
              ) : (
                <div className="apex-mae-info" style={{
                  padding: '1rem',
                  background: 'rgba(245, 158, 11, 0.15)',
                  borderLeft: '4px solid #f59e0b',
                  borderRadius: '8px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.95rem',
                  lineHeight: '1.6'
                }}>
                  <strong><IconInfo size={16} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} /> INFO:</strong> {metrics.windfallRule.windfallMessage}
                </div>
              )}

              <div className="windfall-disclaimer" style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: 'rgba(107, 114, 128, 0.1)',
                borderLeft: '3px solid #6b7280',
                borderRadius: '6px',
                fontSize: '0.85rem',
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: '1.5'
              }}>
                <strong>📌 Important:</strong> The Windfall Rule applies to profit accumulated <strong>since your last approved payout</strong> (or since you started trading if no payouts yet). 
                {metrics.windfallRule.usesProfitSincePayout ? (
                  <> This calculation uses your "Profit Since Last Payout" input for accuracy.</>
                ) : (
                  <> This calculation uses your start-of-day profit balance. For more accuracy after payouts, enter your "Profit Since Last Payout" in the form above.</>
                )}
                {' '}Remember: The rule resets after each payout and applies until your 6th payout or account transfer.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="risk-message-box">
        <p className="risk-message-text">{metrics.riskMessage}</p>
      </div>

      <CalculationModal
        isOpen={selectedMetric !== null}
        onClose={() => setSelectedMetric(null)}
        metricType={selectedMetric}
        metrics={metrics}
        formData={formData}
      />
    </div>
  );
}

export default Dashboard;

