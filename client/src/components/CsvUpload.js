import React, { useState } from 'react';
import './CsvUpload.css';
import { 
  parseAccountsCsv, 
  parseStrategiesCsv, 
  matchAccountsToStrategies,
  detectCsvType 
} from '../utils/ninjaTraderParser';

function CsvUpload({ isPro, sheetNames, onPopulateBulkRows, riskMode, onNavigate }) {
  const [accountsFile, setAccountsFile] = useState(null);
  const [strategiesFile, setStrategiesFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [parseSuccess, setParseSuccess] = useState(null);

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
        const rows = matchAccountsToStrategies(accounts, strategies, sheetNames);
        
        if (rows.length === 0) {
          throw new Error('No matching accounts and strategies found. Make sure strategy names match your Google Sheet names.');
        }

        // Populate bulk calculator
        if (onPopulateBulkRows) {
          onPopulateBulkRows(rows);
          setParseSuccess(`Successfully loaded ${rows.length} account/strategy combinations into the Bulk Risk Calculator!`);
          
          // Scroll to bulk calculator
          setTimeout(() => {
            const bulkSection = document.querySelector('.bulk-calculator');
            if (bulkSection) {
              bulkSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 500);
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

  if (!isPro) {
    return (
      <div className="csv-upload-gated">
        <div className="gate-overlay">
          <div className="gate-content">
            <div className="lock-icon">🔒</div>
            <h3>NinjaTrader CSV Upload</h3>
            <p>This feature is available in RiskLo Pro</p>
            <p className="gate-subtext">Upload NinjaTrader exports for instant multi-account risk checks</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="csv-upload">
      <div className="csv-header">
        <div className="csv-header-top">
          <div>
            <h2 className="csv-title">NinjaTrader CSV Upload (RiskLo Pro)</h2>
            <p className="csv-subtitle">Upload your NinjaTrader account export for bulk analysis</p>
          </div>
          <button
            className="how-to-button"
            onClick={() => onNavigate && onNavigate('how-to-export-csv')}
          >
            📖 How to Export CSV
          </button>
        </div>
      </div>

      <div className="csv-upload-area">
        <div className="csv-instructions">
          <p>Upload your NinjaTrader CSV exports. You can upload both files at once, or use auto-detect.</p>
        </div>

        <div className="csv-upload-grid">
          <div className="upload-box">
            <div className="upload-icon">📊</div>
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
            />
            <label htmlFor="accounts-file-input" className="browse-button">
              Browse Accounts
            </label>
          </div>

          <div className="upload-box">
            <div className="upload-icon">📈</div>
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
            />
            <label htmlFor="strategies-file-input" className="browse-button">
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
            />
            <label htmlFor="auto-file-input" className="browse-button">
              Auto-Detect
            </label>
          </div>
        </div>

        {(accountsFile || strategiesFile) && (
          <div className="file-info">
            {accountsFile && (
              <div className="file-item">
                <span className="file-name">📊 {accountsFile.name}</span>
                <span className="file-size">{(accountsFile.size / 1024).toFixed(2)} KB</span>
              </div>
            )}
            {strategiesFile && (
              <div className="file-item">
                <span className="file-name">📈 {strategiesFile.name}</span>
                <span className="file-size">{(strategiesFile.size / 1024).toFixed(2)} KB</span>
              </div>
            )}
          </div>
        )}

        {parseError && (
          <div className="csv-error">
            <strong>⚠️ Error:</strong> {parseError}
          </div>
        )}

        {parseSuccess && (
          <div className="csv-success">
            <strong>✅ Success:</strong> {parseSuccess}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={(!accountsFile && !strategiesFile) || uploading}
          className="upload-button"
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

