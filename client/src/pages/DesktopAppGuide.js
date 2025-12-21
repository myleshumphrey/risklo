import React from 'react';
import './HowToExportCsv.css';
import PageHeader from '../components/PageHeader';

function DesktopAppGuide({ onNavigate }) {
  return (
    <>
      <PageHeader onNavigate={onNavigate} />
      <div className="how-to-export-csv-page">
      <div className="page-content">
        <h1>RiskLo Watcher - Desktop App Guide</h1>
        <p className="page-intro">
          Automated CSV upload and risk analysis for your NinjaTrader accounts. No manual website uploads needed!
        </p>

        <section className="instruction-section">
          <h2>What is RiskLo Watcher?</h2>
          <div className="step-content">
            <p>
              RiskLo Watcher is a simple Windows desktop application that automatically uploads your NinjaTrader CSV exports to RiskLo for risk analysis. 
              It sits in your system tray and watches for new CSV files - just export from NinjaTrader and get instant email results!
            </p>
          </div>
        </section>

        <section className="instruction-section">
          <h2>Installation (One-Time Setup)</h2>
          <div className="step-content">
            <ol className="instruction-steps">
              <li>
                <strong>Download the App</strong>
                <p>
                  Download <code>RiskLoWatcher.exe</code> from the RiskLo website footer.
                </p>
              </li>
              <li>
                <strong>Run the App</strong>
                <p>
                  Double-click <code>RiskLoWatcher.exe</code> to start. The app will appear in your system tray (bottom-right corner of Windows taskbar).
                </p>
                <div className="csv-requirements" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                  <div className="requirement-box">
                    <h3>Windows SmartScreen (Unrecognized App)</h3>
                    <p>You may see a blue warning that says "Windows protected your PC". This is normal for new/uncommon apps that aren't yet code-signed.</p>
                    <p style={{ marginTop: '0.75rem' }}>
                      <strong>→ Click "More info"</strong><br />
                      <strong>→ Click "Run anyway"</strong>
                    </p>
                    <p style={{ marginTop: '0.75rem' }}>
                      RiskLoWatcher is a lightweight helper that watches a single folder for CSV exports and uploads them to RiskLo over HTTPS.
                    </p>
                  </div>
                </div>
              </li>
              <li>
                <strong>Set Your Email</strong>
                <p>
                  Right-click the tray icon → <strong>Set Email Address</strong> → Enter your RiskLo email address.
                </p>
                <p>
                  <em>Note: This is the email where you'll receive risk analysis results.</em>
                </p>
              </li>
              <li>
                <strong>Done!</strong>
                <p>
                  The app is now watching for CSV exports. You're ready to go!
                </p>
              </li>
            </ol>
          </div>
        </section>

        <section className="instruction-section">
          <h2>Daily Usage (30 Seconds)</h2>
          <div className="step-content">
            <ol className="instruction-steps">
              <li>
                <strong>Export Account CSV</strong>
                <p>
                  In NinjaTrader, go to the <strong>Account</strong> tab → Right-click → <strong>Export</strong>
                </p>
                <p>
                  Save to: <code>C:\RiskLoExports\</code>
                </p>
                <p>
                  <em>Tip: Use a descriptive filename like <code>accounts_jan12.csv</code> or <code>NT_Accounts_20250112.csv</code></em>
                </p>
              </li>
              <li>
                <strong>Export Strategy CSV</strong>
                <p>
                  In NinjaTrader, go to the <strong>Strategy Performance</strong> tab → Right-click → <strong>Export</strong>
                </p>
                <p>
                  Save to: <code>C:\RiskLoExports\</code>
                </p>
                <p>
                  <em>Tip: Use a descriptive filename like <code>strategies_jan12.csv</code> or <code>NT_Strategies_20250112.csv</code></em>
                </p>
              </li>
              <li>
                <strong>Wait for Notification</strong>
                <p>
                  Within a few seconds, you'll see a balloon notification: <strong>"Upload Successful!"</strong>
                </p>
              </li>
              <li>
                <strong>Check Your Email</strong>
                <p>
                  Within a few minutes, you'll receive an email with:
                </p>
                <div style={{ paddingLeft: '1.5rem', marginTop: '0.75rem' }}>
                  <p style={{ marginBottom: '0.5rem' }}>• Risk summary for all accounts</p>
                  <p style={{ marginBottom: '0.5rem' }}>• High-risk accounts highlighted</p>
                  <p style={{ marginBottom: '0.5rem' }}>• Full analysis table</p>
                  <p style={{ marginBottom: '0.5rem' }}>• Link to view details on RiskLo</p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section className="instruction-section">
          <h2>How It Works</h2>
          <div className="step-content">
            <p>
              RiskLo Watcher monitors <code>C:\RiskLoExports\</code> for new CSV files. When it detects both an Accounts CSV and a Strategies CSV (exported around the same time), it automatically:
            </p>
            <div style={{ paddingLeft: '1.5rem', marginTop: '0.75rem' }}>
              <p style={{ marginBottom: '0.5rem' }}>• Detects which file is which based on column headers (no naming requirements!)</p>
              <p style={{ marginBottom: '0.5rem' }}>• Uploads both files to RiskLo for analysis</p>
              <p style={{ marginBottom: '0.5rem' }}>• Sends you an email with complete risk analysis results</p>
            </div>
            <p style={{ marginTop: '1rem' }}>
              <strong>Note:</strong> Just make sure your filenames are unique if you're exporting multiple times per day (e.g., add a timestamp or description).
            </p>
          </div>
        </section>

        <section className="instruction-section">
          <h2>System Tray Menu</h2>
          <div className="step-content">
            <p>
              Right-click the RiskLo Watcher icon in your system tray to access:
            </p>
            <ul className="feature-list">
              <li><strong>Upload Latest CSVs Now</strong> - Manually upload the most recent CSVs</li>
              <li><strong>View Upload History</strong> - See your last 10 uploads</li>
              <li><strong>Open Watch Folder</strong> - Opens <code>C:\RiskLoExports\</code> in File Explorer</li>
              <li><strong>Set Email Address</strong> - Update your email for results</li>
              <li><strong>Exit</strong> - Close the app</li>
            </ul>
          </div>
        </section>

        <section className="instruction-section">
          <h2>Auto-Start on Windows Boot (Optional)</h2>
          <div className="step-content">
            <p>
              To have RiskLo Watcher start automatically when Windows boots:
            </p>
            <ol className="instruction-steps">
              <li>Press <kbd>Win</kbd> + <kbd>R</kbd> on your keyboard</li>
              <li>Type <code>shell:startup</code> and press Enter</li>
              <li>Copy <code>RiskLoWatcher.exe</code> to this folder (or create a shortcut)</li>
              <li>Done! The app will start automatically when Windows boots</li>
            </ol>
          </div>
        </section>

        <section className="instruction-section">
          <h2>Troubleshooting</h2>
          <div className="step-content">
            <div className="tips-box">
              <h3>⚠️ App doesn't start</h3>
              <ul>
                <li>Make sure you have Windows 10 or later</li>
                <li>Try running as Administrator (right-click → Run as administrator)</li>
                <li>Download and install <a href="https://dotnet.microsoft.com/download" target="_blank" rel="noopener noreferrer">.NET 6.0 Desktop Runtime</a></li>
              </ul>
            </div>
            <div className="tips-box">
              <h3>⚠️ Files not uploading automatically</h3>
              <ul>
                <li>Check both files are in <code>C:\RiskLoExports\</code></li>
                <li>Make sure both CSVs were exported within a few minutes of each other</li>
                <li>Verify the CSVs contain valid NinjaTrader data (proper columns)</li>
                <li>Right-click tray icon → "View Upload History" for error messages</li>
                <li>Try "Upload Latest CSVs Now" manually</li>
              </ul>
            </div>
            <div className="tips-box">
              <h3>⚠️ No email received</h3>
              <ul>
                <li>Check your spam/junk folder</li>
                <li>Verify your email is set correctly (right-click tray icon → Set Email Address)</li>
                <li>Visit RiskLo dashboard to see results online</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="instruction-section">
          <h2>Safety & Security (Read This If You're Unsure)</h2>
          <div className="step-content">
            <p>
              It's normal to be cautious with desktop apps—especially when Windows shows a SmartScreen warning.
              Here's what RiskLoWatcher does (and does not do).
            </p>
            <div className="csv-requirements">
              <div className="requirement-box">
                <h3>What RiskLoWatcher DOES</h3>
                <ul>
                  <li>Watches <code>C:\RiskLoExports\</code> for new CSV files you export from NinjaTrader</li>
                  <li>Uploads only the CSV contents to RiskLo over <strong>HTTPS</strong> for analysis</li>
                  <li>Sends results to the email address you set in the tray menu</li>
                </ul>
              </div>
              <div className="requirement-box">
                <h3>What RiskLoWatcher DOES NOT do</h3>
                <ul>
                  <li>Does not place trades, connect to your broker, or control NinjaTrader</li>
                  <li>Does not read other folders on your computer</li>
                  <li>Does not collect passwords or store your Google/Stripe credentials</li>
                  <li>Does not install drivers or require special permissions</li>
                </ul>
              </div>
            </div>
            <p>
              <strong>Best practice:</strong> only download RiskLoWatcher from <strong>risklo.io</strong> and keep it in a known folder.
            </p>
          </div>
        </section>

        <section className="instruction-section">
          <h2>Why Use RiskLo Watcher?</h2>
          <div className="step-content">
            <div className="csv-requirements">
              <div className="requirement-box">
                <h3>Before (Manual)</h3>
                <ol>
                  <li>Export CSVs from NinjaTrader</li>
                  <li>Open browser</li>
                  <li>Navigate to RiskLo</li>
                  <li>Sign in</li>
                  <li>Find CSV upload page</li>
                  <li>Drag and drop files</li>
                  <li>Wait for processing</li>
                  <li>Check results</li>
                </ol>
                <p><strong>Total time: ~3-5 minutes</strong></p>
              </div>
              <div className="requirement-box">
                <h3>After (With RiskLo Watcher)</h3>
                <ol>
                  <li>Export CSVs from NinjaTrader to <code>C:\RiskLoExports\</code></li>
                  <li>Done!</li>
                </ol>
                <p><strong>Total time: ~30 seconds</strong></p>
                <p>Email arrives automatically with full analysis.</p>
              </div>
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

export default DesktopAppGuide;

