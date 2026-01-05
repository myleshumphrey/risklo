import React, { useState } from 'react';
import './CsvUpload.css';
import { IconLock, IconChart, IconTrendUp, IconAlert, IconCheck } from './Icons';
import { 
  parseAccountsCsv, 
  parseStrategiesCsv, 
  matchAccountsToStrategies,
  detectCsvType 
} from '../utils/ninjaTraderParser';

function CsvUpload({ isPro, sheetNames, onPopulateBulkRows, riskMode, onNavigate, onUpgrade, onSwitchToBulkTab }) {
  const [accountsFile, setAccountsFile] = useState(null);
  const [strategiesFile, setStrategiesFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [parseSuccess, setParseSuccess] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Expose setIsAnalyzing to BulkRiskCalculator
  React.useEffect(() => {
    window.setAnalyzingState = setIsAnalyzing;
    return () => {
      delete window.setAnalyzingState;
    };
  }, []);

  const handleAccountsFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setAccountsFile(selectedFile);
        setParseError(null);
      } else {
        alert('Please select a CSV file');
      }
    }
  };

  const handleStrategiesFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setStrategiesFile(selectedFile);
        setParseError(null);
      } else {
        alert('Please select a CSV file');
      }
    }
  };

  const handleAutoDetectFile = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        // Read file to detect type
        const reader = new FileReader();
        reader.onload = (event) => {
          const csvText = event.target.result;
          const fileType = detectCsvType(csvText);
          
          if (fileType === 'accounts') {
            setAccountsFile(selectedFile);
          } else if (fileType === 'strategies') {
            setStrategiesFile(selectedFile);
          } else {
            alert('Could not detect file type. Please use the specific upload buttons for Accounts or Strategies files.');
          }
        };
        reader.readAsText(selectedFile);
      } else {
        alert('Please select a CSV file');
      }
    }
  };

  const handleUpload = async () => {
    if (!accountsFile && !strategiesFile) {
      alert('Please upload at least one CSV file (Accounts or Strategies)');
      return;
    }

    setUploading(true);
    setParseError(null);
    setParseSuccess(null);

    try {
      let accounts = [];
      let strategies = [];

      // Parse accounts file if provided
      if (accountsFile) {
        const accountsText = await readFileAsText(accountsFile);
        accounts = parseAccountsCsv(accountsText);
        console.log(`Parsed ${accounts.length} accounts`);
      }

      // Parse strategies file if provided
      if (strategiesFile) {
        const strategiesText = await readFileAsText(strategiesFile);
        strategies = parseStrategiesCsv(strategiesText);
        console.log(`Parsed ${strategies.length} strategies`);
      }

      // If we have both, match them. Otherwise, we can't create complete rows
      if (accounts.length === 0 && strategies.length === 0) {
        throw new Error('No valid data found in CSV files');
      }

      if (accounts.length > 0 && strategies.length > 0) {
        // Match accounts to strategies
        console.log('📊 Matching', accounts.length, 'accounts to', strategies.length, 'strategies');
        console.log('📋 Available sheet names:', sheetNames);
        const rows = matchAccountsToStrategies(accounts, strategies, sheetNames);
        console.log('✅ Generated', rows.length, 'rows from CSV matching');
        
        if (rows.length === 0) {
          throw new Error('No matching accounts and strategies found. Make sure your CSV files contain valid data.');
        }

        // Populate bulk calculator with rows and CSV file names
        if (onPopulateBulkRows) {
          const csvFileNames = {
            accountCsv: accountsFile ? accountsFile.name : null,
            strategyCsv: strategiesFile ? strategiesFile.name : null
          };
          onPopulateBulkRows(rows, csvFileNames);
          setParseSuccess(`Successfully loaded ${rows.length} account/strategy combinations into the Bulk Risk Calculator!`);
          setIsAnalyzing(true);
          
          // Switch to bulk tab on mobile after successful parse
          if (onSwitchToBulkTab) {
            setTimeout(() => {
              onSwitchToBulkTab();
            }, 500);
          }
          
          // Trigger auto-analysis after a longer delay to ensure state is updated
          setTimeout(() => {
            if (window.triggerBulkAnalysis) {
              window.triggerBulkAnalysis();
            }
          }, 800);
          
          // Scroll to bulk calculator after analysis starts
          setTimeout(() => {
            const bulkSection = document.querySelector('.bulk-calculator');
            if (bulkSection) {
              bulkSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 1500);
        } else {
          throw new Error('Bulk calculator not available');
        }
      } else if (accounts.length > 0) {
        throw new Error('Accounts file uploaded, but Strategies file is required to match accounts to strategies. Please upload both files.');
      } else if (strategies.length > 0) {
        throw new Error('Strategies file uploaded, but Accounts file is required. Please upload both files.');
      }
    } catch (err) {
      console.error('CSV parsing error:', err);
      setParseError(err.message || 'Failed to parse CSV files. Please check the file format.');
    } finally {
      setUploading(false);
    }
  };

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type === 'text/csv' || file.name.endsWith('.csv')
    );

    if (files.length === 0) {
      alert('Please drop CSV files only');
      return;
    }

    // Process each dropped file
    for (const file of files) {
      try {
        const csvText = await readFileAsText(file);
        const fileType = detectCsvType(csvText);
        
        if (fileType === 'accounts') {
          setAccountsFile(file);
          setParseError(null);
        } else if (fileType === 'strategies') {
          setStrategiesFile(file);
          setParseError(null);
        } else {
          // If we can't detect, try to assign based on filename or let user know
          const fileName = file.name.toLowerCase();
          if (fileName.includes('account')) {
            setAccountsFile(file);
          } else if (fileName.includes('strateg') || fileName.includes('strategy')) {
            setStrategiesFile(file);
          } else {
            // If we can't determine, show a message
            alert(`Could not determine file type for "${file.name}". Please use the specific upload buttons or rename your file to include "account" or "strategy" in the name.`);
          }
        }
      } catch (err) {
        console.error('Error reading dropped file:', err);
        alert(`Error reading file "${file.name}": ${err.message}`);
      }
    }
  };

  const handleRemoveAccountsFile = () => {
    setAccountsFile(null);
    setParseError(null);
    setParseSuccess(null);
    // Reset the file input
    const input = document.getElementById('accounts-file-input');
    if (input) {
      input.value = '';
    }
  };

  const handleRemoveStrategiesFile = () => {
    setStrategiesFile(null);
    setParseError(null);
    setParseSuccess(null);
    // Reset the file input
    const input = document.getElementById('strategies-file-input');
    if (input) {
      input.value = '';
    }
  };

  return (
    <div className={`csv-upload ${!isPro ? 'csv-upload-locked' : ''}`}>
      {!isPro && (
        <div className="pro-lock-overlay">
          <div className="pro-lock-content">
            <div className="pro-lock-icon">
              <IconLock size={48} />
            </div>
            <h3 className="pro-lock-title">NinjaTrader CSV Upload</h3>
            <p className="pro-lock-subtitle">This feature is available in RiskLo Pro</p>
            <p className="pro-lock-description">Upload NinjaTrader exports (CSV) for instant multi-account risk checks</p>
            <button className="pro-lock-upgrade-button" onClick={onUpgrade}>
              Upgrade to RiskLo Pro
            </button>
          </div>
        </div>
      )}
      <div className="csv-header">
        <div className="csv-header-top">
          <div>
            <h2 className="csv-title">NinjaTrader CSV Upload (RiskLo Pro)</h2>
            <p className="csv-subtitle">Upload your NinjaTrader account export for bulk analysis</p>
          </div>
          <button
            className="how-to-button"
            onClick={() => onNavigate && onNavigate('how-to-export-csv')}
            disabled={!isPro}
          >
            📖 How to Export CSV
          </button>
        </div>
      </div>

      <div 
        className={`csv-upload-area ${isDragging ? 'dragging' : ''} ${!isPro ? 'csv-preview-mode' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!isPro && (
          <div className="csv-sample-preview">
            <div className="csv-sample-header">
              <h3>Sample CSV Import Result</h3>
              <p>Here's what your NinjaTrader exports would look like after upload</p>
            </div>
            <div className="csv-sample-table-container">
              <table className="csv-sample-table">
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Strategy</th>
                    <th>Contract</th>
                    <th>Size</th>
                    <th>Contracts</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>PAAPEX...0001</td>
                    <td>Grass Fed Prime Beef</td>
                    <td>MNQ</td>
                    <td>$50,000</td>
                    <td>3</td>
                    <td>$52,500</td>
                  </tr>
                  <tr>
                    <td>PAAPEX...0002</td>
                    <td>ES Momentum Scalper</td>
                    <td>MNQ</td>
                    <td>$50,000</td>
                    <td>5</td>
                    <td>$51,200</td>
                  </tr>
                  <tr>
                    <td>PAAPEX...0003</td>
                    <td>RTY Breakout Strategy</td>
                    <td>MNQ</td>
                    <td>$100,000</td>
                    <td>10</td>
                    <td>$105,500</td>
                  </tr>
                  <tr>
                    <td>PAAPEX...0004</td>
                    <td>NQ Range Trader</td>
                    <td>MNQ</td>
                    <td>$50,000</td>
                    <td>4</td>
                    <td>$48,900</td>
                  </tr>
                  <tr>
                    <td>PAAPEX...0005</td>
                    <td>Volatility Expansion</td>
                    <td>NQ</td>
                    <td>$150,000</td>
                    <td>2</td>
                    <td>$158,200</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="csv-sample-footer">
              <p>✓ Automatically matches accounts to strategies</p>
              <p>✓ Ready for instant bulk analysis</p>
            </div>
          </div>
        )}
        {isDragging && (
          <div className="drag-overlay">
            <div className="drag-overlay-content">
              <div className="drag-icon">📥</div>
              <p>Drop your CSV files here</p>
            </div>
          </div>
        )}
        <div className="csv-instructions">
          <p>Upload your NinjaTrader CSV exports. You can drag and drop files here, upload both files at once, or use auto-detect.</p>
        </div>

        <div className="csv-upload-grid">
          <div className="upload-box">
            <div className="upload-icon"><IconChart size={32} /></div>
            <p className="upload-label">Accounts CSV</p>
            <p className="upload-text">
              {accountsFile ? accountsFile.name : 'Upload Accounts file'}
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleAccountsFileChange}
              className="file-input"
              id="accounts-file-input"
              disabled={!isPro}
            />
            <label htmlFor="accounts-file-input" className={`browse-button ${!isPro ? 'disabled' : ''}`}>
              Browse Accounts
            </label>
          </div>

          <div className="upload-box">
            <div className="upload-icon"><IconTrendUp size={32} /></div>
            <p className="upload-label">Strategies CSV</p>
            <p className="upload-text">
              {strategiesFile ? strategiesFile.name : 'Upload Strategies file'}
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleStrategiesFileChange}
              className="file-input"
              id="strategies-file-input"
              disabled={!isPro}
            />
            <label htmlFor="strategies-file-input" className={`browse-button ${!isPro ? 'disabled' : ''}`}>
              Browse Strategies
            </label>
          </div>

          <div className="upload-box">
            <div className="upload-icon">🔍</div>
            <p className="upload-label">Auto-Detect</p>
            <p className="upload-text">
              Let us detect the file type
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleAutoDetectFile}
              className="file-input"
              id="auto-file-input"
              disabled={!isPro}
            />
            <label htmlFor="auto-file-input" className={`browse-button ${!isPro ? 'disabled' : ''}`}>
              Auto-Detect
            </label>
          </div>
        </div>

        {(accountsFile || strategiesFile) && (
          <div className="file-info">
            {accountsFile && (
              <div className="file-item">
                <span className="file-name"><IconChart size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} /> {accountsFile.name}</span>
                <div className="file-item-right">
                  <span className="file-size">{(accountsFile.size / 1024).toFixed(2)} KB</span>
                  <button 
                    className="file-remove-btn" 
                    onClick={handleRemoveAccountsFile}
                    title="Remove file"
                    aria-label="Remove accounts file"
                    disabled={!isPro}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
            {strategiesFile && (
              <div className="file-item">
                <span className="file-name"><IconTrendUp size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} /> {strategiesFile.name}</span>
                <div className="file-item-right">
                  <span className="file-size">{(strategiesFile.size / 1024).toFixed(2)} KB</span>
                  <button 
                    className="file-remove-btn" 
                    onClick={handleRemoveStrategiesFile}
                    title="Remove file"
                    aria-label="Remove strategies file"
                    disabled={!isPro}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {parseError && (
          <div className="csv-error">
            <strong><IconAlert size={16} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} /> Error:</strong> {parseError}
          </div>
        )}

        {parseSuccess && (
          <div className="csv-success">
            <strong><IconCheck size={16} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} /> Success:</strong> {parseSuccess}
          </div>
        )}
        {isAnalyzing && (
          <div className="analyzing-indicator">
            <div className="spinner"></div>
            <span>Analyzing accounts... This may take a moment.</span>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={(!accountsFile && !strategiesFile) || uploading || !isPro}
          className={`upload-button ${accountsFile && strategiesFile && !uploading ? 'pulse-ready' : ''}`}
        >
          {uploading ? 'Processing...' : 'Parse & Load into Bulk Calculator'}
        </button>

        <div className="csv-note">
          <p>📝 <strong>How it works:</strong> Upload both your Accounts and Strategies CSV files from NinjaTrader. 
          The system will automatically match accounts to strategies, extract account sizes, balances, drawdowns, and contract counts, 
          then populate the Bulk Risk Calculator below for instant analysis.</p>
        </div>
      </div>
    </div>
  );
}

export default CsvUpload;

