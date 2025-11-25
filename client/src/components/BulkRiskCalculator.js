import React, { useState, useEffect } from 'react';
import './BulkRiskCalculator.css';
import Dashboard from './Dashboard';
import { API_ENDPOINTS } from '../config';
import { ACCOUNT_SIZE_PRESETS, DEFAULT_ACCOUNT_SIZE, DEFAULT_THRESHOLD, getThresholdForAccountSize } from '../utils/accountSizes';

function BulkRiskCalculator({ isPro, sheetNames, onAnalyzeBulk, riskMode, onPopulateRows, onUpgrade }) {
  const [rows, setRows] = useState([
    { 
      id: 1, 
      accountName: '', // Optional account name (e.g., PAAPEX3982600000002)
      strategy: '', 
      contractType: 'MNQ', 
      accountSize: riskMode === 'apexMae' ? DEFAULT_ACCOUNT_SIZE : '', 
      contracts: '', 
      maxDrawdown: '', 
      currentBalance: '', 
      startOfDayProfit: '', 
      safetyNet: riskMode === 'apexMae' ? DEFAULT_THRESHOLD : '' 
    }
  ]);

  // Expose setRows to parent component via callback
  useEffect(() => {
    if (onPopulateRows) {
      onPopulateRows(setRows);
    }
  }, [onPopulateRows]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);

  const addRow = () => {
    if (rows.length >= 20) return;
    setRows([...rows, {
      id: Date.now(),
      accountName: '', // Optional account name
      strategy: '',
      contractType: 'MNQ',
      accountSize: riskMode === 'apexMae' ? DEFAULT_ACCOUNT_SIZE : '',
      contracts: '',
      maxDrawdown: '',
      currentBalance: '',
      startOfDayProfit: '',
      safetyNet: riskMode === 'apexMae' ? DEFAULT_THRESHOLD : ''
    }]);
  };


  const removeRow = (id) => {
    if (rows.length === 1) return;
    setRows(rows.filter(row => row.id !== id));
  };

  const updateRow = (id, field, value) => {
    setRows(rows.map(row => {
      if (row.id !== id) return row;
      
      const updatedRow = { ...row, [field]: value };
      
      // Auto-update safety net when account size changes in apexMae mode
      if (riskMode === 'apexMae' && field === 'accountSize') {
        const threshold = getThresholdForAccountSize(Number(value));
        if (threshold) {
          updatedRow.safetyNet = threshold;
        }
      }
      
      // Auto-calculate start-of-day profit when current balance or account size changes
      if (riskMode === 'apexMae' && (field === 'currentBalance' || field === 'accountSize')) {
        const currentBalance = Number(updatedRow.currentBalance || 0);
        const accountSize = Number(updatedRow.accountSize || 0);
        if (currentBalance > 0 && accountSize > 0) {
          updatedRow.startOfDayProfit = Math.max(0, currentBalance - accountSize);
        }
      }
      
      return updatedRow;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate all rows based on mode
      const validRows = rows.filter(row => {
        if (riskMode === 'risk') {
          return row.strategy && row.accountSize && row.contracts && row.maxDrawdown;
        } else {
          return row.strategy && row.accountSize && row.contracts && row.currentBalance && row.startOfDayProfit && row.safetyNet;
        }
      });

      if (validRows.length === 0) {
        alert('Please fill in at least one complete row');
        setLoading(false);
        return;
      }


      // Analyze each row
      const analysisPromises = validRows.map(row => 
        fetch(API_ENDPOINTS.analyze, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sheetName: row.strategy,
              contractType: row.contractType,
              accountSize: parseFloat(row.accountSize),
              contracts: parseFloat(row.contracts),
              maxDrawdown: riskMode === 'risk' ? parseFloat(row.maxDrawdown) : null,
              startOfDayProfit: riskMode === 'apexMae' ? parseFloat(row.startOfDayProfit) : null,
              safetyNet: riskMode === 'apexMae' ? parseFloat(row.safetyNet) : null
            })
        }).then(res => res.json())
      );

      const results = await Promise.all(analysisPromises);
      setResults(results.map((result, index) => ({
        ...validRows[index],
        accountNumber: index + 1,
        metrics: result.metrics
      })));
    } catch (err) {
      console.error('Bulk analysis error:', err);
      alert('Error analyzing bulk data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isPro) {
    return (
      <div className="bulk-calculator-gated">
        <div className="gate-overlay">
          <div className="gate-content">
            <div className="lock-icon">🔒</div>
            <h3>Bulk Risk Assessment</h3>
            <p>This feature is available in RiskLo Pro</p>
            <p className="gate-subtext">Upgrade to analyze up to 20 account + strategy combinations at once</p>
            {onUpgrade && (
              <button className="gate-upgrade-btn" onClick={onUpgrade}>
                Upgrade to RiskLo Pro
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bulk-calculator">
      <div className="bulk-header">
        <h2 className="bulk-title">Bulk Risk Assessment (RiskLo Pro)</h2>
        <p className="bulk-subtitle">Analyze multiple account configurations at once</p>
      </div>

      <form onSubmit={handleSubmit} className="bulk-form">
        <div className="bulk-table-container">
          <table className="bulk-table">
            <thead>
              <tr>
                <th className="account-number-header">#</th>
                <th>Account Name</th>
                <th>Strategy</th>
                <th>Contract Type</th>
                <th>Account Size ($)</th>
                <th>Contracts</th>
                {riskMode === 'risk' ? (
                  <th>Max Drawdown ($)</th>
                ) : (
                  <>
                    <th>Current Balance ($)</th>
                    <th>Start-of-Day Profit ($)</th>
                    <th>Safety Net ($)</th>
                  </>
                )}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <td className="account-number-cell">
                    <span className="account-number">{index + 1}</span>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.accountName || ''}
                      onChange={(e) => updateRow(row.id, 'accountName', e.target.value)}
                      className="bulk-input"
                      placeholder="e.g., PAAPEX3982600000002"
                      style={{ 
                        fontFamily: 'monospace',
                        fontSize: '0.85rem'
                      }}
                    />
                  </td>
                  <td>
                    <select
                      value={row.strategy}
                      onChange={(e) => updateRow(row.id, 'strategy', e.target.value)}
                      className="bulk-input"
                      required={index === 0}
                    >
                      <option value="">Select...</option>
                      {sheetNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={row.contractType}
                      onChange={(e) => updateRow(row.id, 'contractType', e.target.value)}
                      className="bulk-input"
                    >
                      <option value="NQ">NQ</option>
                      <option value="MNQ">MNQ</option>
                    </select>
                  </td>
                  <td>
                    {riskMode === 'apexMae' ? (
                      <select
                        value={row.accountSize}
                        onChange={(e) => updateRow(row.id, 'accountSize', e.target.value)}
                        className="bulk-input"
                        required={index === 0}
                      >
                        {ACCOUNT_SIZE_PRESETS.map((preset) => (
                          <option key={preset.value} value={preset.value}>
                            {preset.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="number"
                        value={row.accountSize}
                        onChange={(e) => updateRow(row.id, 'accountSize', e.target.value)}
                        className="bulk-input"
                        placeholder="50000"
                        step="0.01"
                        required={index === 0}
                      />
                    )}
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.contracts}
                      onChange={(e) => updateRow(row.id, 'contracts', e.target.value)}
                      className="bulk-input"
                      placeholder="1"
                      min="1"
                      step="1"
                      required={index === 0}
                    />
                  </td>
                  {riskMode === 'risk' ? (
                    <td>
                      <input
                        type="number"
                        value={row.maxDrawdown}
                        onChange={(e) => updateRow(row.id, 'maxDrawdown', e.target.value)}
                        className="bulk-input"
                        placeholder="2500"
                        step="0.01"
                        required={index === 0}
                      />
                    </td>
                  ) : (
                    <>
                      <td>
                        <input
                          type="number"
                          value={row.currentBalance}
                          onChange={(e) => updateRow(row.id, 'currentBalance', e.target.value)}
                          className="bulk-input"
                          placeholder="52500"
                          step="0.01"
                          min="0"
                          required={index === 0}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={row.startOfDayProfit}
                          readOnly
                          className="bulk-input"
                          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', cursor: 'not-allowed' }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={row.safetyNet}
                          readOnly
                          className="bulk-input"
                          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', cursor: 'not-allowed' }}
                        />
                      </td>
                    </>
                  )}
                  <td>
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        className="remove-row-btn"
                      >
                        ×
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bulk-actions">
          {rows.length < 20 && (
            <button
              type="button"
              onClick={addRow}
              className="add-row-btn"
            >
              + Add Row
            </button>
          )}
          <button
            type="submit"
            className="analyze-bulk-btn"
            disabled={loading}
          >
            {loading ? 'Analyzing...' : `Analyze ${rows.filter(r => {
              if (riskMode === 'risk') {
                return r.strategy && r.accountSize && r.contracts && r.maxDrawdown;
              } else {
                return r.strategy && r.accountSize && r.contracts && r.startOfDayProfit && r.safetyNet;
              }
            }).length} Configuration(s)`}
          </button>
        </div>
      </form>

      {results && (
        <div className="bulk-results">
          <h3>Results</h3>
          <div className="results-grid">
            {results.map((result, index) => (
              <div 
                key={index} 
                className="result-card"
                onClick={() => setSelectedResult(result)}
              >
                <div className="result-header">
                  <div className="result-left">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className="account-number-badge">Account #{result.accountNumber}</span>
                      {result.accountName && (
                        <span className="account-name-display">
                          {result.accountName}
                        </span>
                      )}
                    </div>
                    <span className="result-strategy">{result.strategy}</span>
                  </div>
                  <span 
                    className="result-status"
                    style={{ color: result.metrics?.blowAccountColor || '#6b7280' }}
                  >
                    {result.metrics?.blowAccountStatus || 'N/A'}
                  </span>
                </div>
                <div className="result-metrics">
                  <div className="result-metric">
                    <span>Highest Loss:</span>
                    <span>${result.metrics?.highestLoss?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="result-metric">
                    <span>Risk Score:</span>
                    <span>{result.metrics?.riskScore || 'N/A'}/100</span>
                  </div>
                  {result.metrics?.apexMaeComparison && (
                    <div className="result-metric">
                      <span>Apex MAE Limit:</span>
                      <span style={{ 
                        color: result.metrics.apexMaeComparison.exceedsMae ? '#ef4444' : '#10b981' 
                      }}>
                        ${result.metrics.apexMaeComparison.maxMaePerTrade?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="result-click-hint">Click for details →</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedResult && (
        <div className="result-detail-modal" onClick={() => setSelectedResult(null)}>
          <div className="result-detail-content" onClick={(e) => e.stopPropagation()}>
            <div className="result-detail-header">
              <h3>
                Account #{selectedResult.accountNumber}
                {selectedResult.accountName && (
                  <span style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '0.9rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginLeft: '0.5rem',
                    fontWeight: 'normal'
                  }}>
                    ({selectedResult.accountName})
                  </span>
                )}
                {' - '}
                {selectedResult.strategy}
              </h3>
              <button className="close-detail-btn" onClick={() => setSelectedResult(null)}>×</button>
            </div>
            <Dashboard metrics={selectedResult.metrics} />
          </div>
        </div>
      )}
    </div>
  );
}

export default BulkRiskCalculator;

