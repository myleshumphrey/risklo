import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
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

