import React from 'react';
import './HowToExportCsv.css';
import PageHeader from '../components/PageHeader';

function HowToExportCsv({ onNavigate }) {
  return (
    <>
      <PageHeader onNavigate={onNavigate} />
      <div className="how-to-export-csv-page">
      <div className="page-content">
        <h1>How to Export CSV Files from NinjaTrader</h1>
        <p className="page-intro">
          Follow these steps to export your account and strategy data from NinjaTrader and upload them to RiskLo for bulk risk analysis.
        </p>

        <section className="instruction-section">
          <h2>Step 1: Export Accounts CSV</h2>
          <div className="step-content">
            <ol className="instruction-steps">
              <li>
                <strong>Open NinjaTrader</strong>
                <p>Launch your NinjaTrader platform and ensure you're connected to your accounts.</p>
              </li>
              <li>
                <strong>Navigate to Accounts Tab</strong>
                <p>In NinjaTrader, go to the <strong>Accounts</strong> tab or window where you can see all your connected accounts.</p>
              </li>
              <li>
                <strong>Export Accounts Data</strong>
                <p>
                  Right-click on the accounts list or look for an <strong>"Export"</strong> or <strong>"Export to CSV"</strong> option in the Accounts window menu.
                  <br />
                  <em>Note: The exact location may vary by NinjaTrader version. Look for File → Export or a right-click context menu.</em>
                </p>
              </li>
              <li>
                <strong>Save the File</strong>
                <p>
                  Save the exported file with a descriptive name like <code>NT_Accounts.csv</code>
                  <br />
                  <strong>Required columns:</strong> The CSV should include columns like "Display name", "Net liquidation", and "Trailing max drawdown"
                </p>
              </li>
            </ol>
          </div>
        </section>

        <section className="instruction-section">
          <h2>Step 2: Export Strategies CSV</h2>
          <div className="step-content">
            <ol className="instruction-steps">
              <li>
                <strong>Open Strategies Window</strong>
                <p>In NinjaTrader, navigate to the <strong>Strategies</strong> tab or window where you can see all your running strategies.</p>
              </li>
              <li>
                <strong>Export Strategies Data</strong>
                <p>
                  Right-click on the strategies list or use the menu to find <strong>"Export"</strong> or <strong>"Export to CSV"</strong>
                  <br />
                  <em>This exports the strategy-to-account mappings and configuration details.</em>
                </p>
              </li>
              <li>
                <strong>Save the File</strong>
                <p>
                  Save the exported file with a name like <code>NT_Strategies.csv</code>
                  <br />
                  <strong>Required columns:</strong> The CSV should include "Strategy", "Instrument" (NQ/MNQ), and "Account display name"
                </p>
              </li>
            </ol>
          </div>
        </section>

        <section className="instruction-section">
          <h2>Step 3: Upload to RiskLo</h2>
          <div className="step-content">
            <ol className="instruction-steps">
              <li>
                <strong>Navigate to CSV Upload Section</strong>
                <p>
                  On the RiskLo dashboard, scroll down to the <strong>"NinjaTrader CSV Upload"</strong> section
                  <br />
                  <em>Note: This feature is available in RiskLo Pro. Upgrade if you haven't already.</em>
                </p>
              </li>
              <li>
                <strong>Upload Accounts CSV</strong>
                <p>
                  Click the <strong>"Browse Accounts"</strong> button and select your exported Accounts CSV file.
                  <br />
                  You'll see the filename appear once selected.
                </p>
              </li>
              <li>
                <strong>Upload Strategies CSV</strong>
                <p>
                  Click the <strong>"Browse Strategies"</strong> button and select your exported Strategies CSV file.
                  <br />
                  Both files should now be selected and ready to process.
                </p>
              </li>
              <li>
                <strong>Alternative: Auto-Detect</strong>
                <p>
                  If you're not sure which file is which, you can use the <strong>"Auto-Detect"</strong> option.
                  <br />
                  Upload one file at a time, and RiskLo will automatically identify whether it's an Accounts or Strategies file.
                </p>
              </li>
              <li>
                <strong>Parse & Load</strong>
                <p>
                  Click the <strong>"Parse & Load into Bulk Calculator"</strong> button.
                  <br />
                  RiskLo will:
                  <ul className="feature-list">
                    <li>Parse both CSV files</li>
                    <li>Match accounts to their assigned strategies</li>
                    <li>Extract account sizes, balances, drawdowns, and contract counts</li>
                    <li>Auto-populate the Bulk Risk Calculator with all matched combinations</li>
                  </ul>
                </p>
              </li>
              <li>
                <strong>Review & Analyze</strong>
                <p>
                  Once loaded, scroll to the <strong>"Bulk Risk Assessment"</strong> section above.
                  <br />
                  You'll see all your accounts populated with their data. Review the information, make any adjustments if needed, then click <strong>"Analyze"</strong> to run risk calculations for all accounts at once.
                </p>
              </li>
            </ol>
          </div>
        </section>

        <section className="instruction-section">
          <h2>CSV File Format Requirements</h2>
          <div className="step-content">
            <div className="csv-requirements">
              <div className="requirement-box">
                <h3>Accounts CSV Must Include:</h3>
                <ul>
                  <li><strong>Display name</strong> - The account identifier (e.g., PAAPEX3982600000002)</li>
                  <li><strong>Net liquidation</strong> - Current account balance</li>
                  <li><strong>Trailing max drawdown</strong> - Current trailing drawdown value</li>
                </ul>
              </div>
              <div className="requirement-box">
                <h3>Strategies CSV Must Include:</h3>
                <ul>
                  <li><strong>Strategy</strong> - Strategy name (must match Google Sheet names)</li>
                  <li><strong>Instrument</strong> - Contract type (NQ or MNQ)</li>
                  <li><strong>Account display name</strong> - Links strategy to account</li>
                  <li><strong>Parameters</strong> - Used to extract contract count</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="instruction-section">
          <h2>Tips & Troubleshooting</h2>
          <div className="step-content">
            <div className="tips-box">
              <h3>✅ Tips for Success:</h3>
              <ul>
                <li>Make sure strategy names in your Strategies CSV match the names in your Google Sheet exactly (or closely)</li>
                <li>Export both files from the same NinjaTrader session to ensure data consistency</li>
                <li>Account sizes are automatically determined from balances (rounded to nearest preset: 25K, 50K, 100K, etc.)</li>
                <li>Contract counts are extracted from strategy parameters - verify these are correct</li>
              </ul>
            </div>
            <div className="tips-box">
              <h3>⚠️ Common Issues:</h3>
              <ul>
                <li><strong>"No matching accounts and strategies found"</strong> - Check that strategy names match your Google Sheet names</li>
                <li><strong>"CSV file missing required columns"</strong> - Ensure your export includes all required columns listed above</li>
                <li><strong>"No valid data found"</strong> - Check that your CSV files aren't empty and contain actual account/strategy data</li>
                <li><strong>Account names not showing</strong> - The account name is automatically extracted from the "Display name" column</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="instruction-section">
          <div className="back-button-container">
            <button 
              className="back-to-dashboard-btn"
              onClick={() => onNavigate && onNavigate('home')}
            >
              ← Back to Dashboard
            </button>
          </div>
        </section>
      </div>
    </div>
    </>
  );
}

export default HowToExportCsv;

