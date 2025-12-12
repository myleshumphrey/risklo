import React from 'react';
import './Footer.css';

function Footer() {
  const handleDesktopAppDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Force download the desktop app
    const link = document.createElement('a');
    link.href = '/downloads/RiskLoWatcher.exe';
    link.download = 'RiskLoWatcher.exe';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDesktopAppGuide = () => {
    // Navigate to desktop app guide page
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'desktopAppGuide' }));
  };

  const handleDownloadClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only download when button is explicitly clicked
    const link = document.createElement('a');
    link.href = '/downloads/RiskLoExporter.zip';
    link.download = 'RiskLoExporter.zip';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSetupInstructionsClick = () => {
    // Scroll to setup instructions or open modal
    const instructionsElement = document.getElementById('risklo-exporter-instructions');
    if (instructionsElement) {
      instructionsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="app-footer">
      <div className="footer-content">
        {/* Desktop App Section - Recommended */}
        <div className="footer-addon-section">
          <div className="addon-info">
            <h3 className="addon-title">
              RiskLo Watcher (Desktop App) 
              <span className="recommended-badge">Recommended</span>
            </h3>
            <p className="addon-description">
              Simple Windows app that automatically uploads your NinjaTrader CSV exports to RiskLo. 
              Just export your CSVs and get instant email results - no website login needed!
            </p>
            <div className="addon-buttons">
              <button className="download-button primary" onClick={handleDesktopAppDownload}>
                Download Desktop App
              </button>
              <button className="setup-link" onClick={handleDesktopAppGuide}>
                User Guide
              </button>
            </div>
          </div>
        </div>

        {/* NinjaTrader AddOn Section - Alternative */}
        <div className="footer-addon-section">
          <div className="addon-info">
            <h3 className="addon-title">RiskLoExporter (NinjaTrader AddOn)</h3>
            <p className="addon-description">
              Alternative: NinjaTrader AddOn for exporting account and strategy data to CSV files.
            </p>
            <div className="addon-buttons">
              <button className="download-button" onClick={handleDownloadClick}>
                Download AddOn
              </button>
              <button className="setup-link" onClick={handleSetupInstructionsClick}>
                Setup Instructions
              </button>
            </div>
          </div>
        </div>

        <div className="disclaimers">
          <div className="disclaimer-section">
            <h3 className="disclaimer-title">Financial Advice Disclaimer</h3>
            <p className="disclaimer-text">
              This tool is for informational and educational purposes only and does not constitute financial advice. 
              Users are solely responsible for their own trading decisions and the associated risks. We do not guarantee 
              the accuracy of the data or the outcomes of any analysis performed using this tool. Please consult with a 
              professional financial advisor before making any investment decisions.
            </p>
          </div>
          
          <div className="disclaimer-section">
            <h3 className="disclaimer-title">Affiliation Disclaimer</h3>
            <p className="disclaimer-text">
              RiskLo is an independent tool and is not affiliated with Vector Algorithmics. All algorithm data is used 
              with permission from the user and is intended solely for personal analysis purposes. Vector Algorithmics is 
              not responsible for the content or results of this tool.
            </p>
          </div>
        </div>
        
        <div className="footer-copyright">
          <p>&copy; {new Date().getFullYear()} RiskLo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

