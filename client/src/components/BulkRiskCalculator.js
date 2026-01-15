import React, { useState, useEffect, useCallback, useRef } from 'react';
import './BulkRiskCalculator.css';
import Dashboard from './Dashboard';
import { API_BASE_URL, API_ENDPOINTS } from '../config';
import { ACCOUNT_SIZE_PRESETS, DEFAULT_ACCOUNT_SIZE, DEFAULT_THRESHOLD, getThresholdForAccountSize } from '../utils/accountSizes';
import { sortStrategies } from '../utils/strategySort';
import { IconLock } from './Icons';
import { useAuth } from '../contexts/AuthContext';

function BulkRiskCalculator({ 
  isPro, 
  sheetNames, 
  onAnalyzeBulk, 
  riskMode, 
  onUpgrade, 
  autoAnalyzeAfterPopulate, 
  sheetsConnectUrl,
  csvBulkRows,
  csvFileNames: propCsvFileNames,
  onClearCsvData
}) {
  const { user } = useAuth();
  const [results, setResults] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [csvFileNames, setCsvFileNames] = useState(null); // Track CSV file names
  const resultsRef = useRef(null);

  // Clear results when switching modes
  useEffect(() => {
    setResults(null);
    setSelectedResult(null);
    setEmailSent(false);
    setEmailError(null);
  }, [riskMode]);

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

  // Populate with sample data if not Pro (for preview/teaser)
  useEffect(() => {
    if (!isPro) {
      const sampleData = [
        {
          id: 1,
          accountName: 'PAAPEX3982600000001',
          strategy: 'Grass Fed Prime Beef',
          contractType: 'MNQ',
          accountSize: riskMode === 'apexMae' ? 50000 : 50000,
          contracts: 3,
          maxDrawdown: riskMode === 'apexMae' ? '' : 2500,
          currentBalance: riskMode === 'apexMae' ? 52500 : '',
          startOfDayProfit: riskMode === 'apexMae' ? 0 : '',
          safetyNet: riskMode === 'apexMae' ? 2500 : '',
          profitSinceLastPayout: ''
        },
        {
          id: 2,
          accountName: 'PAAPEX3982600000002',
          strategy: 'ES Momentum Scalper',
          contractType: 'MNQ',
          accountSize: riskMode === 'apexMae' ? 50000 : 50000,
          contracts: 5,
          maxDrawdown: riskMode === 'apexMae' ? '' : 2500,
          currentBalance: riskMode === 'apexMae' ? 51200 : '',
          startOfDayProfit: riskMode === 'apexMae' ? 0 : '',
          safetyNet: riskMode === 'apexMae' ? 2500 : '',
          profitSinceLastPayout: ''
        },
        {
          id: 3,
          accountName: 'PAAPEX3982600000003',
          strategy: 'RTY Breakout Strategy',
          contractType: 'MNQ',
          accountSize: riskMode === 'apexMae' ? 100000 : 100000,
          contracts: 10,
          maxDrawdown: riskMode === 'apexMae' ? '' : 5000,
          currentBalance: riskMode === 'apexMae' ? 105500 : '',
          startOfDayProfit: riskMode === 'apexMae' ? 0 : '',
          safetyNet: riskMode === 'apexMae' ? 5000 : '',
          profitSinceLastPayout: ''
        },
        {
          id: 4,
          accountName: 'PAAPEX3982600000004',
          strategy: 'NQ Range Trader',
          contractType: 'MNQ',
          accountSize: riskMode === 'apexMae' ? 50000 : 50000,
          contracts: 4,
          maxDrawdown: riskMode === 'apexMae' ? '' : 2500,
          currentBalance: riskMode === 'apexMae' ? 48900 : '',
          startOfDayProfit: riskMode === 'apexMae' ? 0 : '',
          safetyNet: riskMode === 'apexMae' ? 2500 : '',
          profitSinceLastPayout: ''
        },
        {
          id: 5,
          accountName: 'PAAPEX3982600000005',
          strategy: 'Volatility Expansion',
          contractType: 'NQ',
          accountSize: riskMode === 'apexMae' ? 150000 : 150000,
          contracts: 2,
          maxDrawdown: riskMode === 'apexMae' ? '' : 7500,
          currentBalance: riskMode === 'apexMae' ? 158200 : '',
          startOfDayProfit: riskMode === 'apexMae' ? 0 : '',
          safetyNet: riskMode === 'apexMae' ? 7500 : '',
          profitSinceLastPayout: ''
        }
      ];
      setRows(sampleData);
    }
  }, [isPro, riskMode]);

  // Populate rows from CSV data when provided
  useEffect(() => {
    if (csvBulkRows && csvBulkRows.length > 0) {
      console.log('BulkRiskCalculator: Populating rows from CSV data', { rowCount: csvBulkRows.length });
      setRows(csvBulkRows);
      if (propCsvFileNames) {
        setCsvFileNames(propCsvFileNames);
      }
      // Clear the CSV data after populating
      if (onClearCsvData) {
        onClearCsvData();
      }
    }
  }, [csvBulkRows, propCsvFileNames, onClearCsvData]);

  const [loading, setLoading] = useState(false);

  const addRow = () => {
    if (rows.length >= 40) return;
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
        const currentBalance = Math.floor(Number(updatedRow.currentBalance || 0) * 100) / 100; // Round down to 2 decimal places
        const accountSize = Math.floor(Number(updatedRow.accountSize || 0) * 100) / 100; // Round down to 2 decimal places
        if (currentBalance > 0 && accountSize > 0) {
          updatedRow.startOfDayProfit = Math.max(0, Math.floor((currentBalance - accountSize) * 100) / 100); // Round down to 2 decimal places
        }
      }
      
      // Round down numeric fields to 2 decimal places to avoid validation errors
      if (field === 'currentBalance' || field === 'maxDrawdown' || field === 'startOfDayProfit' || field === 'safetyNet') {
        const numValue = Number(updatedRow[field]);
        if (!isNaN(numValue) && updatedRow[field] !== '') {
          updatedRow[field] = Math.floor(numValue * 100) / 100; // Round down to 2 decimal places
        }
      }
      
      return updatedRow;
    }));
  };

  const handleSubmit = useCallback(async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setLoading(true);
    
    try {
      // Validate all rows based on mode, preserving original row index
      const rowsWithIndex = rows.map((row, originalIndex) => ({ ...row, originalIndex: originalIndex + 1 }));
      const validRows = rowsWithIndex.filter(row => {
        if (riskMode === 'risk') {
          return row.strategy && 
                 row.accountSize && 
                 row.contracts && 
                 row.maxDrawdown !== undefined && row.maxDrawdown !== null && row.maxDrawdown !== '';
        } else {
          return row.strategy && 
                 row.accountSize && 
                 row.contracts && 
                 row.currentBalance !== undefined && row.currentBalance !== null && row.currentBalance !== '' &&
                 (row.startOfDayProfit !== undefined && row.startOfDayProfit !== null) &&
                 row.safetyNet !== undefined && row.safetyNet !== null && row.safetyNet !== '';
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
              userEmail: user?.email || null,
              maxDrawdown: riskMode === 'risk' ? parseFloat(row.maxDrawdown) : null,
              startOfDayProfit: riskMode === 'apexMae' ? parseFloat(row.startOfDayProfit) : null,
              // Safety net is derived from account size; keep sending it for calculations, but don't show it in the UI.
              safetyNet: riskMode === 'apexMae' ? getThresholdForAccountSize(Number(row.accountSize)) : null
            })
        }).then(res => res.json())
      );

      const results = await Promise.all(analysisPromises);
      const formattedResults = results.map((result, index) => ({
        ...validRows[index],
        accountNumber: validRows[index].originalIndex, // Use original table row number
        metrics: result.metrics
      }));
      setResults(formattedResults);
      
      // Send email summary if user is logged in
      if (user?.email) {
        try {
          console.log('Sending email with CSV file names:', csvFileNames);
          const emailResponse = await fetch(API_ENDPOINTS.sendRiskSummary, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              results: formattedResults,
              riskMode: riskMode,
              csvFileNames: csvFileNames || null
            })
          });
          
          const emailData = await emailResponse.json();
          if (emailData.success && emailData.emailSent) {
            setEmailSent(true);
            setEmailError(null);
          } else {
            setEmailSent(false);
            setEmailError(emailData.message || 'Email could not be sent');
          }
        } catch (emailErr) {
          console.error('Error sending email summary:', emailErr);
          setEmailSent(false);
          setEmailError('Failed to send email summary');
        }
      }
      
      // Auto-scroll to results after a short delay to ensure DOM is updated
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    } catch (err) {
      console.error('Bulk analysis error:', err);
      alert('Error analyzing bulk data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [rows, riskMode, user, csvFileNames]);

  // Expose handleSubmit for external triggering (from CSV upload)
  useEffect(() => {
    window.triggerBulkAnalysis = () => {
      // Notify CSV upload that analysis is starting
      if (window.setAnalyzingState) {
        window.setAnalyzingState(true);
      }
      
      // Check if rows have required fields filled before triggering
      const rowsWithIndex = rows.map((row, originalIndex) => ({ ...row, originalIndex: originalIndex + 1 }));
      const validRows = rowsWithIndex.filter(row => {
        if (riskMode === 'risk') {
          return row.strategy && 
                 row.accountSize && 
                 row.contracts && 
                 row.maxDrawdown !== undefined && row.maxDrawdown !== null && row.maxDrawdown !== '';
        } else {
          return row.strategy && 
                 row.accountSize && 
                 row.contracts && 
                 row.currentBalance !== undefined && row.currentBalance !== null && row.currentBalance !== '' &&
                 (row.startOfDayProfit !== undefined && row.startOfDayProfit !== null) &&
                 row.safetyNet !== undefined && row.safetyNet !== null && row.safetyNet !== '';
        }
      });
      
      if (validRows.length > 0) {
        // Small delay to ensure rows are fully populated in state
        setTimeout(() => {
          handleSubmit(null).finally(() => {
            // Notify CSV upload that analysis is complete
            setTimeout(() => {
              if (window.setAnalyzingState) {
                window.setAnalyzingState(false);
              }
            }, 500);
          });
        }, 500);
      } else {
        console.log('No valid rows found for auto-analysis. Rows:', rows);
        console.log('Risk mode:', riskMode);
        // Clear analyzing state if no valid rows
        if (window.setAnalyzingState) {
          window.setAnalyzingState(false);
        }
      }
    };
    
    return () => {
      delete window.triggerBulkAnalysis;
    };
  }, [rows, riskMode, handleSubmit]); // Include handleSubmit in dependencies

  return (
    <div className={`bulk-calculator ${!isPro ? 'bulk-calculator-locked' : ''}`}>
      {!isPro && (
        <div className="pro-lock-overlay">
          <div className="pro-lock-content">
            <div className="pro-lock-icon">
              <IconLock size={48} />
            </div>
            <h3 className="pro-lock-title">Bulk Risk Assessment</h3>
            <p className="pro-lock-subtitle">This feature is available in RiskLo Pro</p>
            <p className="pro-lock-description">Upgrade to analyze up to 40 account + strategy combinations at once</p>
            <button className="pro-lock-upgrade-button" onClick={onUpgrade}>
              Upgrade to RiskLo Pro
            </button>
          </div>
        </div>
      )}
      <div className="bulk-header">
        <h2 className="bulk-title">Bulk Risk Assessment (RiskLo Pro)</h2>
        <p className="bulk-subtitle">Analyze multiple account configurations at once</p>
      </div>

      {sheetNames.length === 0 && sheetsConnectUrl && user?.email && (
        <div className="bulk-connect-sheets-banner">
          <div className="bulk-connect-sheets-text">
            Connect your Google access to load strategies from the Results Spreadsheet.
          </div>
          <button
            type="button"
            className="bulk-connect-sheets-btn"
            onClick={() => {
              const fullUrl = sheetsConnectUrl.startsWith('http')
                ? sheetsConnectUrl
                : `${API_BASE_URL}${sheetsConnectUrl}`;
              window.location.href = fullUrl;
            }}
          >
            Connect
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bulk-form">
        <div className="bulk-table-container" style={{ position: 'relative' }}>
          {loading && (
            <div className="bulk-analyzing-overlay">
              <div className="bulk-analyzing-content">
                <div className="bulk-analyzing-spinner"></div>
                <div className="bulk-analyzing-text">Analyzing...</div>
              </div>
            </div>
          )}
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
                      disabled={!isPro}
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
                      disabled={!isPro}
                    >
                      <option value="">Select...</option>
                      {sortStrategies(sheetNames).map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={row.contractType}
                      onChange={(e) => updateRow(row.id, 'contractType', e.target.value)}
                      className="bulk-input"
                      disabled={!isPro}
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
                        disabled={!isPro}
                      >
                        {ACCOUNT_SIZE_PRESETS.map((preset) => (
                          <option key={`${preset.value}-${preset.label}`} value={preset.value}>
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
                        disabled={!isPro}
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
                      disabled={!isPro}
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
                        disabled={!isPro}
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
                          disabled={!isPro}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={row.startOfDayProfit}
                          readOnly
                          className="bulk-input"
                          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', cursor: 'not-allowed' }}
                          disabled={!isPro}
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
                        disabled={!isPro}
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
          {rows.length < 40 && (
            <button
              type="button"
              onClick={addRow}
              className="add-row-btn"
              disabled={!isPro}
            >
              + Add Row
            </button>
          )}
          <button
            type="submit"
            className="analyze-bulk-btn"
            disabled={loading || !isPro}
          >
            {loading ? 'Analyzing...' : `Analyze ${rows.filter(r => {
              if (riskMode === 'risk') {
                return r.strategy && r.accountSize && r.contracts && r.maxDrawdown;
              } else {
                return r.strategy && r.accountSize && r.contracts && r.startOfDayProfit !== undefined && r.startOfDayProfit !== null;
              }
            }).length} Configuration(s)`}
          </button>
        </div>
      </form>

      {results && (
        <div className="bulk-results" ref={resultsRef}>
          <h3>{riskMode === 'risk' ? 'Risk Results' : '30% Drawdown Results'}</h3>

          {/* Blown warning (30% Drawdown mode) */}
          {riskMode === 'apexMae' && results.some(r => {
            const profit = Number(r.startOfDayProfit);
            const currentBal = Number(r.currentBalance);
            const acctSize = Number(r.accountSize);
            const computedProfit = Number.isFinite(profit) ? profit : (Number.isFinite(currentBal) && Number.isFinite(acctSize) ? (currentBal - acctSize) : NaN);
            const dd = Number(r.maxDrawdown);
            const isNegativeProfit = Number.isFinite(computedProfit) && computedProfit < 0;
            const isNegativeTrailingDd = Number.isFinite(dd) && dd < 0;
            return isNegativeProfit || isNegativeTrailingDd;
          }) && (
            <div className="bulk-blown-warning">
              <strong>BLOWN:</strong> One or more accounts show a negative trailing drawdown value (or negative profit balance). These accounts should be treated as blown and require immediate attention.
            </div>
          )}
          
          {/* Email confirmation message */}
          {emailSent && user?.email && (
            <div className="email-confirmation" style={{
              padding: '1rem',
              marginBottom: '1.5rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              color: '#10b981'
            }}>
              <strong>✓ Email sent:</strong> We've processed your CSVs and emailed a risk summary to <strong>{user.email}</strong>.
            </div>
          )}
          
          {emailError && user?.email && (
            <div className="email-error" style={{
              padding: '1rem',
              marginBottom: '1.5rem',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '8px',
              color: '#f59e0b'
            }}>
              <strong>⚠ Note:</strong> Analysis completed successfully, but we couldn't send the email summary. {emailError}
            </div>
          )}
          
          <div className="results-grid">
            {results.map((result, index) => (
              (() => {
                const profit = Number(result.startOfDayProfit);
                const currentBal = Number(result.currentBalance);
                const acctSize = Number(result.accountSize);
                const computedProfit = Number.isFinite(profit) ? profit : (Number.isFinite(currentBal) && Number.isFinite(acctSize) ? (currentBal - acctSize) : NaN);
                const dd = Number(result.maxDrawdown);
                const isBlown = riskMode === 'apexMae' && ((Number.isFinite(computedProfit) && computedProfit < 0) || (Number.isFinite(dd) && dd < 0));
                const exceedsMae = !!result.metrics?.apexMaeComparison?.exceedsMae;
                const statusText = riskMode === 'apexMae'
                  ? (isBlown ? 'BLOWN' : (exceedsMae ? 'NO GO' : 'GO'))
                  : (result.metrics?.blowAccountStatus || 'N/A');
                const statusColor = riskMode === 'apexMae'
                  ? (isBlown ? '#ef4444' : (exceedsMae ? '#ef4444' : '#10b981'))
                  : (result.metrics?.blowAccountColor || '#6b7280');

                return (
              <div 
                key={index} 
                className={`result-card ${isBlown ? 'blown' : ''}`}
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
                    style={{ 
                      color: statusColor
                    }}
                  >
                    {statusText}
                  </span>
                </div>
                <div className="result-metrics">
                  <div className="result-metric">
                    <span>Highest Loss:</span>
                    <span>${result.metrics?.highestLoss?.toFixed(2) || 'N/A'}</span>
                  </div>
                  {riskMode === 'risk' && (
                    <>
                      <div className="result-metric">
                        <span>Risk Score:</span>
                        <span>{result.metrics?.riskScore || 'N/A'}/100</span>
                      </div>
                      {result.metrics?.blowAccountProbability !== null && result.metrics?.blowAccountProbability !== undefined && (
                        <div className="result-metric">
                          <span>Exceed Probability:</span>
                          <span style={{ 
                            color: result.metrics.blowAccountProbability > 0 
                              ? (result.metrics.blowAccountStatus === 'NO GO' ? '#ef4444' : '#f59e0b')
                              : '#10b981',
                            fontWeight: '600'
                          }}>
                            {result.metrics.blowAccountProbability.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {riskMode === 'apexMae' && result.metrics?.apexMaeComparison && (
                    <>
                      <div className="result-metric">
                        <span>Apex MAE Limit:</span>
                        <span style={{ 
                          color: result.metrics.apexMaeComparison.exceedsMae ? '#ef4444' : '#10b981' 
                        }}>
                          ${result.metrics.apexMaeComparison.maxMaePerTrade?.toFixed(2) || 'N/A'}
                        </span>
                      </div>
                      {result.metrics.apexMaeComparison.maeBreachProbability !== undefined && (
                        <div className="result-metric">
                          <span>Exceed Probability:</span>
                          <span style={{ 
                            color: result.metrics.apexMaeComparison.maeBreachProbability > 0 
                              ? (result.metrics.apexMaeComparison.exceedsMae ? '#ef4444' : '#f59e0b')
                              : '#10b981',
                            fontWeight: '600'
                          }}>
                            {result.metrics.apexMaeComparison.maeBreachProbability.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="result-click-hint">Click for details →</div>
              </div>
                );
              })()
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
            <Dashboard metrics={selectedResult.metrics} riskMode={riskMode} />
          </div>
        </div>
      )}
    </div>
  );
}

export default BulkRiskCalculator;

