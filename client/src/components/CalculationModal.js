import React from 'react';
import './CalculationModal.css';
import { IconInfo } from './Icons';

function CalculationModal({ isOpen, onClose, metricType, metrics, formData }) {
  if (!isOpen) return null;

  const getCalculationDetails = () => {
    if (!metrics) return null;
    
    // Use default values if formData is not available
    if (!formData) {
      formData = {
        accountSize: metrics.accountSize || 50000,
        contracts: metrics.numContracts || 1,
        contractType: metrics.contractType || 'NQ',
        maxDrawdown: metrics.drawdownBreach?.maxDrawdown || null,
        startOfDayProfit: null,
        safetyNet: null,
        currentBalance: null
      };
    }

    const accountSize = formData.accountSize || 0;
    const contracts = formData.contracts || 1;
    const contractType = formData.contractType || 'NQ';
    const contractMultiplier = contractType === 'MNQ' ? 0.1 : 1.0;

    switch (metricType) {
      case 'riskScore':
        return {
          title: 'Risk Score Calculation',
          formula: 'Risk Score = (Worst Loss % of Account × 50) + (Drawdown Usage % × 50)',
          steps: [
            {
              label: 'Worst Loss % of Account',
              calculation: `(${metrics.highestLoss?.toFixed(2) || 0} / ${accountSize}) × 100`,
              result: `${metrics.highestLossPercent || 0}%`
            },
            {
              label: 'Drawdown Usage %',
              calculation: formData.maxDrawdown 
                ? `(${metrics.highestLoss?.toFixed(2) || 0} / ${formData.maxDrawdown}) × 100`
                : 'N/A (No max drawdown set)',
              result: formData.maxDrawdown && metrics.drawdownBreach
                ? `${((metrics.highestLoss / formData.maxDrawdown) * 100).toFixed(2)}%`
                : 'N/A'
            },
            {
              label: 'Final Risk Score',
              calculation: `(${metrics.highestLossPercent || 0}% × 50) + (${formData.maxDrawdown ? ((metrics.highestLoss / formData.maxDrawdown) * 100).toFixed(2) : 0}% × 50)`,
              result: `${metrics.riskScore || 0}/100`
            }
          ],
          inputs: {
            'Account Size': `$${accountSize.toLocaleString()}`,
            'Number of Contracts': contracts,
            'Contract Type': contractType,
            'Max Drawdown': formData.maxDrawdown ? `$${parseFloat(formData.maxDrawdown).toLocaleString()}` : 'Not set'
          }
        };

      case 'highestLoss':
        return {
          title: 'Highest Loss Calculation',
          formula: 'Highest Loss = Max Historical Loss Per Contract × Number of Contracts',
          steps: [
            {
              label: 'Max Historical Loss Per Contract',
              calculation: `From Google Sheet data (${contractType === 'MNQ' ? 'divided by 10 for MNQ' : 'NQ value'})`,
              result: `$${metrics.highestLossPerContract?.toFixed(2) || 0}`
            },
            {
              label: 'Contract Multiplier',
              calculation: contractType === 'MNQ' ? 'MNQ = 0.1 × NQ value' : 'NQ = 1.0 × sheet value',
              result: contractMultiplier
            },
            {
              label: 'Number of Contracts',
              calculation: 'User input',
              result: contracts
            },
            {
              label: 'Final Highest Loss',
              calculation: `${metrics.highestLossPerContract?.toFixed(2) || 0} × ${contracts}`,
              result: `$${metrics.highestLoss?.toFixed(2) || 0}`
            },
            {
              label: 'As % of Account',
              calculation: `(${metrics.highestLoss?.toFixed(2) || 0} / ${accountSize}) × 100`,
              result: `${metrics.highestLossPercent || 0}%`
            }
          ],
          inputs: {
            'Account Size': `$${accountSize.toLocaleString()}`,
            'Number of Contracts': contracts,
            'Contract Type': contractType,
            'Trading Days Analyzed': metrics.totalDays || 0
          }
        };

      case 'averageLoss':
        return {
          title: 'Average Loss Calculation',
          formula: 'Average Loss = Sum of All Losses / Number of Losing Days × Number of Contracts',
          steps: [
            {
              label: 'Sum of All Losses Per Contract',
              calculation: 'Sum of all negative P&L days from historical data',
              result: `$${(metrics.avgLossPerContract * metrics.losingDays)?.toFixed(2) || 0}`
            },
            {
              label: 'Number of Losing Days',
              calculation: 'Count of days with negative P&L',
              result: metrics.losingDays || 0
            },
            {
              label: 'Average Loss Per Contract',
              calculation: `Sum of losses / ${metrics.losingDays || 1} losing days`,
              result: `$${metrics.avgLossPerContract?.toFixed(2) || 0}`
            },
            {
              label: 'Number of Contracts',
              calculation: 'User input',
              result: contracts
            },
            {
              label: 'Final Average Loss',
              calculation: `${metrics.avgLossPerContract?.toFixed(2) || 0} × ${contracts}`,
              result: `$${metrics.avgLoss?.toFixed(2) || 0}`
            },
            {
              label: 'As % of Account',
              calculation: `(${metrics.avgLoss?.toFixed(2) || 0} / ${accountSize}) × 100`,
              result: `${metrics.avgLossPercent || 0}%`
            }
          ],
          inputs: {
            'Account Size': `$${accountSize.toLocaleString()}`,
            'Number of Contracts': contracts,
            'Contract Type': contractType,
            'Losing Days': metrics.losingDays || 0,
            'Total Trading Days': metrics.totalDays || 0
          }
        };

      case 'maxProfit':
        return {
          title: 'Maximum Profit Calculation',
          formula: 'Maximum Profit = Max Historical Profit Per Contract × Number of Contracts',
          steps: [
            {
              label: 'Max Historical Profit Per Contract',
              calculation: `From Google Sheet data (${contractType === 'MNQ' ? 'divided by 10 for MNQ' : 'NQ value'})`,
              result: `$${metrics.maxProfitPerContract?.toFixed(2) || 0}`
            },
            {
              label: 'Contract Multiplier',
              calculation: contractType === 'MNQ' ? 'MNQ = 0.1 × NQ value' : 'NQ = 1.0 × sheet value',
              result: contractMultiplier
            },
            {
              label: 'Number of Contracts',
              calculation: 'User input',
              result: contracts
            },
            {
              label: 'Final Maximum Profit',
              calculation: `${metrics.maxProfitPerContract?.toFixed(2) || 0} × ${contracts}`,
              result: `$${metrics.maxProfit?.toFixed(2) || 0}`
            },
            {
              label: 'As % of Account',
              calculation: `(${metrics.maxProfit?.toFixed(2) || 0} / ${accountSize}) × 100`,
              result: `${metrics.maxProfitPercent || 0}%`
            }
          ],
          inputs: {
            'Account Size': `$${accountSize.toLocaleString()}`,
            'Number of Contracts': contracts,
            'Contract Type': contractType,
            'Winning Days': metrics.winningDays || 0
          }
        };

      case 'averageProfit':
        return {
          title: 'Average Profit Calculation',
          formula: 'Average Profit = Sum of All Profits / Number of Winning Days × Number of Contracts',
          steps: [
            {
              label: 'Sum of All Profits Per Contract',
              calculation: 'Sum of all positive P&L days from historical data',
              result: `$${(metrics.avgProfitPerContract * metrics.winningDays)?.toFixed(2) || 0}`
            },
            {
              label: 'Number of Winning Days',
              calculation: 'Count of days with positive P&L',
              result: metrics.winningDays || 0
            },
            {
              label: 'Average Profit Per Contract',
              calculation: `Sum of profits / ${metrics.winningDays || 1} winning days`,
              result: `$${metrics.avgProfitPerContract?.toFixed(2) || 0}`
            },
            {
              label: 'Number of Contracts',
              calculation: 'User input',
              result: contracts
            },
            {
              label: 'Final Average Profit',
              calculation: `${metrics.avgProfitPerContract?.toFixed(2) || 0} × ${contracts}`,
              result: `$${metrics.avgProfit?.toFixed(2) || 0}`
            },
            {
              label: 'As % of Account',
              calculation: `(${metrics.avgProfit?.toFixed(2) || 0} / ${accountSize}) × 100`,
              result: `${metrics.avgProfitPercent || 0}%`
            }
          ],
          inputs: {
            'Account Size': `$${accountSize.toLocaleString()}`,
            'Number of Contracts': contracts,
            'Contract Type': contractType,
            'Winning Days': metrics.winningDays || 0,
            'Total Trading Days': metrics.totalDays || 0
          }
        };

      case 'maxDrawdown':
        if (!metrics.drawdownBreach) return null;
        return {
          title: 'Max Drawdown Analysis Calculation',
          formula: 'Breach Probability = (Days Exceeding Max Drawdown / Total Trading Days) × 100',
          steps: [
            {
              label: 'Max Drawdown Limit',
              calculation: 'User input',
              result: `$${parseFloat(formData.maxDrawdown).toLocaleString()}`
            },
            {
              label: 'Highest Historical Loss',
              calculation: `Worst loss with ${contracts} contract(s)`,
              result: `$${metrics.highestLoss?.toFixed(2) || 0}`
            },
            {
              label: 'Days Exceeding Limit',
              calculation: 'Count of days where loss exceeded max drawdown',
              result: `${metrics.drawdownBreach.breaches || 0} day(s)`
            },
            {
              label: 'Total Trading Days',
              calculation: 'Total days analyzed',
              result: metrics.totalDays || 0
            },
            {
              label: 'Breach Probability',
              calculation: `(${metrics.drawdownBreach.breaches || 0} / ${metrics.totalDays || 1}) × 100`,
              result: `${metrics.drawdownBreach.breachProbability || 0}%`
            },
            {
              label: 'Buffer Above Highest Loss',
              calculation: `${parseFloat(formData.maxDrawdown)} - ${metrics.highestLoss?.toFixed(2) || 0}`,
              result: `$${parseFloat(metrics.drawdownBreach.margin).toFixed(2)}`
            }
          ],
          inputs: {
            'Account Size': `$${accountSize.toLocaleString()}`,
            'Number of Contracts': contracts,
            'Max Drawdown': `$${parseFloat(formData.maxDrawdown).toLocaleString()}`,
            'Total Trading Days': metrics.totalDays || 0
          }
        };

      case 'apexMae':
        if (!metrics.apexMaeComparison) return null;
        const startOfDayProfit = formData.startOfDayProfit || 0;
        const safetyNet = formData.safetyNet || 0;
        const baseAmount = metrics.apexMaeComparison.baseAmount || 0;
        const limitPercent = metrics.apexMaeComparison.limitPercent || 0.3;
        
        return {
          title: 'Apex MAE Limit Calculation (30% Rule)',
          formula: 'MAE Limit = Base Amount × Limit Percentage',
          steps: [
            {
              label: 'Start-of-Day Profit',
              calculation: 'Current Account Balance - Account Size',
              result: `$${startOfDayProfit.toFixed(2)}`
            },
            {
              label: 'Safety Net (Trailing Threshold)',
              calculation: 'Auto-set based on account size',
              result: `$${safetyNet.toFixed(2)}`
            },
            {
              label: 'Base Amount Determination',
              calculation: startOfDayProfit <= safetyNet && safetyNet > 0
                ? `Profit (${startOfDayProfit.toFixed(2)}) ≤ Safety Net (${safetyNet.toFixed(2)}) → Use Safety Net`
                : `Profit (${startOfDayProfit.toFixed(2)}) > Safety Net (${safetyNet.toFixed(2)}) → Use Profit`,
              result: `$${baseAmount.toFixed(2)}`
            },
            {
              label: 'Limit Percentage',
              calculation: startOfDayProfit >= 2 * safetyNet && safetyNet > 0
                ? `Profit (${startOfDayProfit.toFixed(2)}) ≥ 2 × Safety Net (${(2 * safetyNet).toFixed(2)}) → Use 50%`
                : 'Default → Use 30%',
              result: `${(limitPercent * 100).toFixed(0)}%`
            },
            {
              label: 'MAE Limit Per Trade',
              calculation: `${baseAmount.toFixed(2)} × ${limitPercent.toFixed(2)}`,
              result: `$${metrics.apexMaeComparison.maxMaePerTrade?.toFixed(2) || 0}`
            },
            {
              label: 'Your Worst Historical Loss',
              calculation: `Highest loss with ${contracts} contract(s)`,
              result: `$${metrics.highestLoss?.toFixed(2) || 0}`
            },
            {
              label: 'Status',
              calculation: metrics.apexMaeComparison.exceedsMae
                ? `Worst Loss (${metrics.highestLoss?.toFixed(2)}) > MAE Limit (${metrics.apexMaeComparison.maxMaePerTrade?.toFixed(2)})`
                : `Worst Loss (${metrics.highestLoss?.toFixed(2)}) ≤ MAE Limit (${metrics.apexMaeComparison.maxMaePerTrade?.toFixed(2)})`,
              result: metrics.apexMaeComparison.exceedsMae ? 'NO GO' : 'GO'
            }
          ],
          inputs: {
            'Account Size': `$${accountSize.toLocaleString()}`,
            'Current Account Balance': formData.currentBalance ? `$${parseFloat(formData.currentBalance).toLocaleString()}` : 'N/A',
            'Start-of-Day Profit': `$${startOfDayProfit.toFixed(2)}`,
            'Safety Net': `$${safetyNet.toFixed(2)}`,
            'Number of Contracts': contracts,
            'Contract Type': contractType
          }
        };

      default:
        return null;
    }
  };

  const details = getCalculationDetails();
  if (!details) {
    return (
      <div className="calculation-modal-overlay" onClick={onClose}>
        <div className="calculation-modal" onClick={(e) => e.stopPropagation()}>
          <div className="calculation-modal-header">
            <div className="calculation-modal-title">
              <IconInfo size={24} />
              <h2>Calculation Details</h2>
            </div>
            <button className="calculation-modal-close" onClick={onClose}>×</button>
          </div>
          <div className="calculation-modal-content">
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', padding: '2rem' }}>
              Calculation details are not available. Please analyze your strategy first to see how metrics are calculated.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="calculation-modal-overlay" onClick={onClose}>
      <div className="calculation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="calculation-modal-header">
          <div className="calculation-modal-title">
            <IconInfo size={24} />
            <h2>{details.title}</h2>
          </div>
          <button className="calculation-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="calculation-modal-content">
          <div className="formula-section">
            <h3>Formula</h3>
            <div className="formula-box">
              {details.formula}
            </div>
          </div>

          <div className="steps-section">
            <h3>Step-by-Step Calculation</h3>
            {details.steps.map((step, index) => (
              <div key={index} className="calculation-step">
                <div className="step-number">{index + 1}</div>
                <div className="step-content">
                  <div className="step-label">{step.label}</div>
                  <div className="step-calculation">{step.calculation}</div>
                  <div className="step-result">= {step.result}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="inputs-section">
            <h3>Input Values</h3>
            <div className="inputs-grid">
              {Object.entries(details.inputs).map(([key, value]) => (
                <div key={key} className="input-item">
                  <span className="input-label">{key}:</span>
                  <span className="input-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalculationModal;

