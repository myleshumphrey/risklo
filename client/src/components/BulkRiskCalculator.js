import React, { useState } from 'react';
import './BulkRiskCalculator.css';
import Dashboard from './Dashboard';

function BulkRiskCalculator({ isPro, sheetNames, onAnalyzeBulk }) {
  const [rows, setRows] = useState([
    { id: 1, strategy: '', contractType: 'NQ', accountSize: '', contracts: '', maxDrawdown: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);

  const addRow = () => {
    if (rows.length >= 20) return;
    setRows([...rows, {
      id: Date.now(),
      strategy: '',
      contractType: 'NQ',
      accountSize: '',
      contracts: '',
      maxDrawdown: ''
    }]);
  };

  const removeRow = (id) => {
    if (rows.length === 1) return;
    setRows(rows.filter(row => row.id !== id));
  };

  const updateRow = (id, field, value) => {
    setRows(rows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate all rows
      const validRows = rows.filter(row => 
        row.strategy && row.accountSize && row.contracts && row.maxDrawdown
      );

      if (validRows.length === 0) {
        alert('Please fill in at least one complete row');
        setLoading(false);
        return;
      }

      // Analyze each row
      const analysisPromises = validRows.map(row => 
        fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sheetName: row.strategy,
            contractType: row.contractType,
            accountSize: parseFloat(row.accountSize),
            contracts: parseFloat(row.contracts),
            maxDrawdown: parseFloat(row.maxDrawdown)
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
                <th>Strategy</th>
                <th>Contract Type</th>
                <th>Account Size ($)</th>
                <th>Contracts</th>
                <th>Max Drawdown ($)</th>
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
                    <input
                      type="number"
                      value={row.accountSize}
                      onChange={(e) => updateRow(row.id, 'accountSize', e.target.value)}
                      className="bulk-input"
                      placeholder="50000"
                      step="0.01"
                      required={index === 0}
                    />
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
            {loading ? 'Analyzing...' : `Analyze ${rows.filter(r => r.strategy && r.accountSize && r.contracts && r.maxDrawdown).length} Configuration(s)`}
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
                    <span className="account-number-badge">Account #{result.accountNumber}</span>
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
              <h3>Account #{selectedResult.accountNumber} - {selectedResult.strategy}</h3>
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

