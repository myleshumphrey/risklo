import React from 'react';
import './HowToExportCsv.css'; // Reuse same styling

function DesktopAppGuide({ onNavigate }) {
  return (
    <div className="how-to-page">
      <div className="how-to-header">
        <h1 className="how-to-title">RiskLo Watcher - Desktop App Guide</h1>
        <p className="how-to-subtitle">Automated CSV Upload & Risk Analysis</p>
      </div>

      <div className="how-to-content">
        {/* What is it */}
        <section className="how-to-section">
          <h2 className="section-title">What is RiskLo Watcher?</h2>
          <p className="section-text">
            RiskLo Watcher is a simple Windows desktop application that automatically uploads your NinjaTrader CSV exports to RiskLo for risk analysis. 
            It sits in your system tray and watches for new CSV files - no manual website uploads needed!
          </p>
        </section>

        {/* Installation */}
        <section className="how-to-section">
          <h2 className="section-title">Installation (One-Time Setup)</h2>
          
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3 className="step-title">Download the App</h3>
              <p className="step-description">
                Download <strong>RiskLoWatcher.exe</strong> from the RiskLo website footer.
              </p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3 className="step-title">Run the App</h3>
              <p className="step-description">
                Double-click <strong>RiskLoWatcher.exe</strong> to start. The app will appear in your system tray (bottom-right corner of Windows taskbar).
              </p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3 className="step-title">Set Your Email</h3>
              <p className="step-description">
                Right-click the tray icon → <strong>Set Email Address</strong> → Enter your RiskLo email address.
              </p>
              <div className="note-box">
                <strong>Note:</strong> This is the email where you'll receive risk analysis results.
              </div>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3 className="step-title">Done!</h3>
              <p className="step-description">
                The app is now watching for CSV exports. You're ready to go!
              </p>
            </div>
          </div>
        </section>

        {/* Daily Usage */}
        <section className="how-to-section">
          <h2 className="section-title">Daily Usage (30 Seconds)</h2>
          
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3 className="step-title">Export Account CSV</h3>
              <p className="step-description">
                In NinjaTrader, go to the <strong>Account</strong> tab → Right-click → <strong>Export</strong>
              </p>
              <p className="step-description">
                Save to: <code>C:\RiskLoExports\</code>
              </p>
              <p className="step-description">
                Filename must contain <strong>"account"</strong> (e.g., <code>accounts_jan12.csv</code>)
              </p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3 className="step-title">Export Strategy CSV</h3>
              <p className="step-description">
                In NinjaTrader, go to the <strong>Strategy Performance</strong> tab → Right-click → <strong>Export</strong>
              </p>
              <p className="step-description">
                Save to: <code>C:\RiskLoExports\</code>
              </p>
              <p className="step-description">
                Filename must contain <strong>"strat"</strong> (e.g., <code>strategies_jan12.csv</code>)
              </p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3 className="step-title">Wait for Notification</h3>
              <p className="step-description">
                Within a few seconds, you'll see a balloon notification: <strong>"Upload Successful!"</strong>
              </p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3 className="step-title">Check Your Email</h3>
              <p className="step-description">
                Within a few minutes, you'll receive an email with:
              </p>
              <ul className="feature-list">
                <li>Risk summary for all accounts</li>
                <li>High-risk accounts highlighted</li>
                <li>Full analysis table</li>
                <li>Link to view details on RiskLo</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="how-to-section">
          <h2 className="section-title">System Tray Menu</h2>
          <p className="section-text">
            Right-click the RiskLo Watcher icon in your system tray to access:
          </p>
          <ul className="feature-list">
            <li><strong>Upload Latest CSVs Now</strong> - Manually upload the most recent CSVs</li>
            <li><strong>View Upload History</strong> - See your last 10 uploads</li>
            <li><strong>Open Watch Folder</strong> - Opens <code>C:\RiskLoExports\</code> in File Explorer</li>
            <li><strong>Set Email Address</strong> - Update your email for results</li>
            <li><strong>Exit</strong> - Close the app</li>
          </ul>
        </section>

        {/* File Naming */}
        <section className="how-to-section">
          <h2 className="section-title">File Naming Requirements</h2>
          <div className="note-box">
            <p><strong>Account CSV</strong> - filename must contain "account" (case-insensitive):</p>
            <ul className="feature-list">
              <li>✓ <code>account_export.csv</code></li>
              <li>✓ <code>NT_Accounts_20250112.csv</code></li>
              <li>✓ <code>my_accounts.csv</code></li>
              <li>✗ <code>acct.csv</code> (doesn't contain "account")</li>
            </ul>
            <br />
            <p><strong>Strategy CSV</strong> - filename must contain "strat" (case-insensitive):</p>
            <ul className="feature-list">
              <li>✓ <code>strategy_export.csv</code></li>
              <li>✓ <code>NT_Strategies_20250112.csv</code></li>
              <li>✓ <code>my_strats.csv</code></li>
              <li>✗ <code>performance.csv</code> (doesn't contain "strat")</li>
            </ul>
          </div>
        </section>

        {/* Auto-Start */}
        <section className="how-to-section">
          <h2 className="section-title">Auto-Start on Windows Boot (Optional)</h2>
          <p className="section-text">
            To have RiskLo Watcher start automatically when Windows boots:
          </p>
          <ol className="feature-list">
            <li>Press <kbd>Win</kbd> + <kbd>R</kbd> on your keyboard</li>
            <li>Type <code>shell:startup</code> and press Enter</li>
            <li>Copy <code>RiskLoWatcher.exe</code> to this folder (or create a shortcut)</li>
            <li>Done! The app will start automatically when Windows boots</li>
          </ol>
        </section>

        {/* Troubleshooting */}
        <section className="how-to-section">
          <h2 className="section-title">Troubleshooting</h2>
          
          <div className="note-box">
            <h4>App doesn't start</h4>
            <ul className="feature-list">
              <li>Make sure you have Windows 10 or later</li>
              <li>Try running as Administrator (right-click → Run as administrator)</li>
              <li>Download and install <a href="https://dotnet.microsoft.com/download" target="_blank" rel="noopener noreferrer">.NET 6.0 Desktop Runtime</a></li>
            </ul>
          </div>

          <div className="note-box">
            <h4>Files not uploading automatically</h4>
            <ul className="feature-list">
              <li>Check both files are in <code>C:\RiskLoExports\</code></li>
              <li>Verify filenames contain "account" and "strat"</li>
              <li>Right-click tray icon → "View Upload History" for error messages</li>
              <li>Try "Upload Latest CSVs Now" manually</li>
            </ul>
          </div>

          <div className="note-box">
            <h4>No email received</h4>
            <ul className="feature-list">
              <li>Check your spam/junk folder</li>
              <li>Verify your email is set correctly (right-click tray icon → Set Email Address)</li>
              <li>Visit <a href="https://risklo.io" onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }}>RiskLo dashboard</a> to see results</li>
            </ul>
          </div>
        </section>

        {/* Benefits */}
        <section className="how-to-section">
          <h2 className="section-title">Why Use RiskLo Watcher?</h2>
          <div className="comparison-box">
            <div className="comparison-column">
              <h4>Before (Manual)</h4>
              <ol className="feature-list">
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
            <div className="comparison-column">
              <h4>After (With RiskLo Watcher)</h4>
              <ol className="feature-list">
                <li>Export CSVs from NinjaTrader</li>
                <li>Done!</li>
              </ol>
              <p><strong>Total time: ~30 seconds</strong></p>
              <p>Email arrives automatically with full analysis.</p>
            </div>
          </div>
        </section>

        {/* Back Button */}
        <div className="back-button-container">
          <button className="back-button" onClick={() => onNavigate('dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default DesktopAppGuide;

