import React from 'react';
import './Footer.css';

function Footer() {
  const handleDesktopAppDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Link to GitHub release (for large file hosting)
    // Update this URL after creating the GitHub release
    const releaseUrl = 'https://github.com/myleshumphrey/risklo/releases/latest/download/RiskLoWatcher.exe';
    
    // Try GitHub release first, fallback to local if available
    const link = document.createElement('a');
    link.href = releaseUrl;
    link.download = 'RiskLoWatcher.exe';
    link.target = '_blank';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDesktopAppGuide = () => {
    // Navigate to desktop app guide page
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'desktopAppGuide' }));
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
          <p>
            &copy; {new Date().getFullYear()} RiskLo. All rights reserved. | {' '}
            <button 
              onClick={() => { window.dispatchEvent(new CustomEvent('navigate', { detail: 'privacy-policy' })); }}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'rgba(255, 255, 255, 0.6)', 
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit'
              }}
            >
              Privacy Policy
            </button>
            {' '} | {' '}
            <button 
              onClick={() => { window.dispatchEvent(new CustomEvent('navigate', { detail: 'terms-and-conditions' })); }}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'rgba(255, 255, 255, 0.6)', 
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit'
              }}
            >
              Terms & Conditions
            </button>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

