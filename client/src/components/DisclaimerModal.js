import React, { useState } from 'react';
import './DisclaimerModal.css';
import { IconChart } from './Icons';

function DisclaimerModal({ onAccept }) {
  const [showFullDisclaimer, setShowFullDisclaimer] = useState(false);

  return (
    <div className="disclaimer-overlay">
      <div className="disclaimer-modal">
        <div className="disclaimer-header">
          <h2 className="disclaimer-title">
            <IconChart size={24} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Welcome to RiskLo
          </h2>
        </div>
        
        <div className="disclaimer-content">
          <div className="disclaimer-main-message">
            <p>
              RiskLo provides <strong>informational risk assessments</strong> based on historical trading data and probability calculations. 
              This tool is for <strong>educational purposes only</strong> and is not financial advice.
            </p>
            <p>
              All calculations are estimates based on past performance and do not guarantee future results. 
              Trading involves risk, and you are responsible for your own trading decisions.
            </p>
          </div>

          {showFullDisclaimer && (
            <div className="disclaimer-expanded">
              <div className="disclaimer-section">
                <h3 className="disclaimer-section-title">Not Financial Advice</h3>
                <p>
                  RiskLo is NOT a financial advisory service and does NOT provide financial, investment, or trading advice. 
                  The information, data, calculations, and risk assessments provided by RiskLo are for informational and educational purposes only 
                  and should not be construed as professional financial advice, investment recommendations, or a solicitation to buy or sell any financial instruments.
                </p>
              </div>

              <div className="disclaimer-section">
                <h3 className="disclaimer-section-title">Historical Data & Probability</h3>
                <p>
                  All risk assessments, calculations, and suggestions displayed by RiskLo are based solely on historical performance data and statistical probability. 
                  Past performance does not guarantee future results. Market conditions, volatility, and trading outcomes can change dramatically and unpredictably. 
                  Historical data may not accurately reflect future market behavior, and probability calculations are estimates based on past occurrences only.
                </p>
              </div>

              <div className="disclaimer-section">
                <h3 className="disclaimer-section-title">No Guarantees or Warranties</h3>
                <p>
                  RiskLo makes NO WARRANTIES, EXPRESS OR IMPLIED, regarding the accuracy, completeness, reliability, or suitability of any information, 
                  calculations, or risk assessments provided. RiskLo does not guarantee that following any suggestions, calculations, or risk assessments will result 
                  in profits or prevent losses. Trading involves substantial risk of loss and is not suitable for everyone.
                </p>
              </div>

              <div className="disclaimer-section">
                <h3 className="disclaimer-section-title">Your Responsibility</h3>
                <p>
                  YOU ARE SOLELY RESPONSIBLE for all trading decisions, investment choices, and financial actions you take. You acknowledge that:
                </p>
                <ul className="disclaimer-list">
                  <li>You understand that trading involves the risk of substantial financial loss</li>
                  <li>You have the knowledge and experience necessary to make independent trading decisions</li>
                  <li>You will not hold RiskLo, its owners, operators, or affiliates liable for any losses, damages, or consequences resulting from your use of this tool</li>
                  <li>You will consult with qualified financial professionals before making any significant trading or investment decisions</li>
                  <li>You understand that RiskLo's calculations may be inaccurate, incomplete, or based on outdated data</li>
                </ul>
              </div>

              <div className="disclaimer-section">
                <h3 className="disclaimer-section-title">Limitation of Liability</h3>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, RiskLo, its owners, operators, employees, affiliates, and partners shall not be liable for any direct, 
                  indirect, incidental, special, consequential, or punitive damages, including but not limited to trading losses, lost profits, or other financial losses, 
                  arising from or related to your use of or reliance on RiskLo, its data, calculations, or risk assessments, regardless of the theory of liability.
                </p>
              </div>
            </div>
          )}

          <button 
            className="disclaimer-read-more-btn"
            onClick={() => setShowFullDisclaimer(!showFullDisclaimer)}
          >
            {showFullDisclaimer ? '↑ Show Less' : '↓ Read Full Disclaimer'}
          </button>
        </div>

        <div className="disclaimer-footer">
          <button 
            className="disclaimer-accept-btn"
            onClick={onAccept}
          >
            I Understand & Accept
          </button>
        </div>
      </div>
    </div>
  );
}

export default DisclaimerModal;

