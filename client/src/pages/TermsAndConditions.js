import React from 'react';
import PageHeader from '../components/PageHeader';
import './TermsAndConditions.css';

function TermsAndConditions({ onNavigate }) {
  return (
    <div className="terms-page">
      <PageHeader onNavigate={onNavigate} />
      <div className="terms-content">
        <div className="terms-card">
          <h1>Terms and Conditions</h1>
          <p className="terms-last-updated">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <section className="terms-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using RiskLo ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="terms-section">
            <h2>2. Not Financial Advice</h2>
            <p>
              RiskLo is NOT a financial advisory service and does NOT provide financial, investment, or trading advice. 
              The information, data, calculations, and risk assessments provided by RiskLo are for informational and educational purposes only 
              and should not be construed as professional financial advice, investment recommendations, or a solicitation to buy or sell any financial instruments.
            </p>
            <p>
              You acknowledge that RiskLo is a risk assessment tool that uses historical data and statistical probability calculations. 
              All results are estimates based on past performance and do not guarantee future results.
            </p>
          </section>

          <section className="terms-section">
            <h2>3. Historical Data & Probability</h2>
            <p>
              All risk assessments, calculations, and suggestions displayed by RiskLo are based solely on historical performance data and statistical probability. 
              Past performance does not guarantee future results. Market conditions, volatility, and trading outcomes can change dramatically and unpredictably. 
              Historical data may not accurately reflect future market behavior, and probability calculations are estimates based on past occurrences only.
            </p>
            <p>
              <strong>Important Note:</strong> Trailing drawdown is based on intraday maximum adverse excursion (MAE), not end-of-day P&L. 
              This means a trade could close positive but still blow the account if it exceeded the drawdown limit during the day. 
              RiskLo uses end-of-day P&L data, so actual risk may be higher than shown. Always account for intraday volatility when assessing risk.
            </p>
          </section>

          <section className="terms-section">
            <h2>4. No Guarantees or Warranties</h2>
            <p>
              RiskLo makes NO WARRANTIES, EXPRESS OR IMPLIED, regarding the accuracy, completeness, reliability, or suitability of any information, 
              calculations, or risk assessments provided. RiskLo does not guarantee that following any suggestions, calculations, or risk assessments will result 
              in profits or prevent losses. Trading involves substantial risk of loss and is not suitable for everyone.
            </p>
          </section>

          <section className="terms-section">
            <h2>5. Your Responsibility</h2>
            <p>
              YOU ARE SOLELY RESPONSIBLE for all trading decisions, investment choices, and financial actions you take. You acknowledge that:
            </p>
            <ul className="terms-list">
              <li>You understand that trading involves the risk of substantial financial loss</li>
              <li>You have the knowledge and experience necessary to make independent trading decisions</li>
              <li>You will not hold RiskLo, its owners, operators, or affiliates liable for any losses, damages, or consequences resulting from your use of this tool</li>
              <li>You will consult with qualified financial professionals before making any significant trading or investment decisions</li>
              <li>You understand that RiskLo's calculations may be inaccurate, incomplete, or based on outdated data</li>
              <li>You will use RiskLo at your own risk and discretion</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>6. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, RiskLo, its owners, operators, employees, affiliates, and partners shall not be liable for any direct, 
              indirect, incidental, special, consequential, or punitive damages, including but not limited to trading losses, lost profits, or other financial losses, 
              arising from or related to your use of or reliance on RiskLo, its data, calculations, or risk assessments, regardless of the theory of liability.
            </p>
          </section>

          <section className="terms-section">
            <h2>7. Data Accuracy</h2>
            <p>
              While we strive to provide accurate and up-to-date information, RiskLo does not guarantee the accuracy, completeness, or timeliness of any data, 
              calculations, or risk assessments. Data may be delayed, incomplete, or contain errors. You should verify any information independently before making trading decisions.
            </p>
          </section>

          <section className="terms-section">
            <h2>8. Service Availability</h2>
            <p>
              RiskLo reserves the right to modify, suspend, or discontinue any part of the Service at any time, with or without notice. 
              We do not guarantee that the Service will be available at all times or that it will be free from errors or interruptions.
            </p>
          </section>

          <section className="terms-section">
            <h2>9. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. 
              You agree to notify RiskLo immediately of any unauthorized use of your account.
            </p>
          </section>

          <section className="terms-section">
            <h2>10. Intellectual Property</h2>
            <p>
              All content, features, and functionality of RiskLo, including but not limited to text, graphics, logos, icons, images, and software, 
              are the property of RiskLo or its content suppliers and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="terms-section">
            <h2>11. Modifications to Terms</h2>
            <p>
              RiskLo reserves the right to modify these Terms and Conditions at any time. We will notify users of any material changes by updating the "Last Updated" date. 
              Your continued use of the Service after such modifications constitutes acceptance of the updated terms.
            </p>
          </section>

          <section className="terms-section">
            <h2>12. Governing Law</h2>
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with applicable laws, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="terms-section">
            <h2>13. Contact Information</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> myles2595@gmail.com<br />
              <strong>Website:</strong> <a href="https://risklo.io" target="_blank" rel="noopener noreferrer">https://risklo.io</a>
            </p>
          </section>

          <div className="terms-footer">
            <p>
              By using RiskLo, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsAndConditions;

