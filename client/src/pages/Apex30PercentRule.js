import React from 'react';
import './Apex30PercentRule.css';
import PageHeader from '../components/PageHeader';

function Apex30PercentRule({ onNavigate }) {
  return (
    <>
      <PageHeader onNavigate={onNavigate} />
      <div className="apex-30-percent-page">
      <div className="apex-30-percent-container">
        <h1 className="page-title">Understanding Apex Trader Funding's 30% Rules</h1>
        <p className="page-intro">
          Apex Trader Funding has two important 30% rules that traders must understand: the <strong>30% Negative P&L Rule (MAE)</strong> and the <strong>30% Consistency Rule (Windfall)</strong>. Both are designed to promote consistent, responsible trading practices.
        </p>
        
        <div className="reference-links">
          <p><strong>Reference the official Apex Trader Funding documentation:</strong></p>
          <ul>
            <li>
              <a href="https://support.apextraderfunding.com/hc/en-us/articles/40463232267035-30-Negative-P-L-Rule-Maximum-Adverse-Excursion-MAE" target="_blank" rel="noopener noreferrer">
                30% Negative P&L Rule (Maximum Adverse Excursion / MAE)
              </a>
            </li>
            <li>
              <a href="https://support.apextraderfunding.com/hc/en-us/articles/40463260337819-30-Consistency-Rule-Windfall" target="_blank" rel="noopener noreferrer">
                30% Consistency Rule (Windfall)
              </a>
            </li>
          </ul>
        </div>

        <section className="rule-section">
          <h2 className="section-title">
            30% Negative P&L Rule (Maximum Adverse Excursion / MAE)
            <span className="reference-link-inline">
              {' '}(<a href="https://support.apextraderfunding.com/hc/en-us/articles/40463232267035-30-Negative-P-L-Rule-Maximum-Adverse-Excursion-MAE" target="_blank" rel="noopener noreferrer">Reference Apex Rule</a>)
            </span>
          </h2>
          <div className="section-content">
            <h3>What is it?</h3>
            <p>
              The 30% Negative P&L Rule limits how much you can lose on a single open trade relative to your profit balance. This prevents large, risky trades that could quickly wipe out your account.
            </p>

            <h3>How it works:</h3>
            <div className="formula-box">
              <div className="formula">
                <strong>MAE Limit = Base Amount × Limit Percentage</strong>
              </div>
            </div>

            <h4>Step 1: Determine Base Amount</h4>
            <p>The base amount depends on your profit balance and safety net (trailing threshold):</p>
            <ul>
              <li><strong>If Profit ≤ Safety Net:</strong> Base Amount = Safety Net</li>
              <li><strong>If Profit &gt; Safety Net:</strong> Base Amount = Profit Balance</li>
            </ul>

            <h4>Step 2: Determine Limit Percentage</h4>
            <ul>
              <li><strong>Default:</strong> 30% (0.3) - applies when profit is less than 2× the safety net</li>
              <li><strong>Increased Limit:</strong> 50% (0.5) - applies when profit ≥ 2× the safety net</li>
            </ul>

            <div className="example-box">
              <h3>Example 1: New Account (30% Rule)</h3>
              <ul>
                <li>Account Size: $50,000</li>
                <li>Current Balance: $50,500</li>
                <li>Start-of-Day Profit: $500</li>
                <li>Safety Net: $2,500</li>
                <li><strong>Base Amount:</strong> $2,500 (Profit ≤ Safety Net, so use Safety Net)</li>
                <li><strong>Limit Percentage:</strong> 30% (Profit &lt; 2 × Safety Net)</li>
                <li><strong>MAE Limit:</strong> $2,500 × 0.30 = <strong>$750</strong></li>
              </ul>
              <p className="note">
                You can lose up to $750 on a single open trade before violating the rule.
              </p>
            </div>

            <div className="example-box">
              <h3>Example 2: Profitable Account (50% Rule)</h3>
              <ul>
                <li>Account Size: $50,000</li>
                <li>Current Balance: $55,000</li>
                <li>Start-of-Day Profit: $5,000</li>
                <li>Safety Net: $2,500</li>
                <li><strong>Base Amount:</strong> $5,000 (Profit &gt; Safety Net, so use Profit)</li>
                <li><strong>Limit Percentage:</strong> 50% (Profit ≥ 2 × Safety Net: $5,000 ≥ $5,000)</li>
                <li><strong>MAE Limit:</strong> $5,000 × 0.50 = <strong>$2,500</strong></li>
              </ul>
              <p className="note">
                When your profit doubles your safety net, the limit increases to 50% of your profit balance.
              </p>
            </div>

            <h3>Why it matters:</h3>
            <ul>
              <li>Prevents large losses that could blow your account</li>
              <li>Encourages proper position sizing</li>
              <li>Promotes consistent risk management</li>
              <li>Protects your account from single-trade disasters</li>
            </ul>
          </div>
        </section>

        <section className="rule-section">
          <h2 className="section-title">
            30% Consistency Rule (Windfall Rule)
            <span className="reference-link-inline">
              {' '}(<a href="https://support.apextraderfunding.com/hc/en-us/articles/40463260337819-30-Consistency-Rule-Windfall" target="_blank" rel="noopener noreferrer">Reference Apex Rule</a>)
            </span>
          </h2>
          <div className="section-content">
            <h3>What is it?</h3>
            <p>
              The 30% Consistency Rule ensures that no single trading day accounts for more than 30% of your total profit balance at the time of a payout request. This rule promotes consistent trading practices and discourages high-risk, erratic trading styles.
            </p>

            <h3>How it works:</h3>
            <div className="formula-box">
              <div className="formula">
                <strong>Highest Profit Day ÷ 0.3 = Minimum Total Profit Required</strong>
              </div>
            </div>

            <p>
              If your highest profit day since your last payout (or since you started trading) exceeds 30% of your total profit balance, you cannot request a payout until you've accumulated enough total profit.
            </p>

            <div className="example-box">
              <h3>Example:</h3>
              <ul>
                <li>Account Size: $50,000</li>
                <li>Highest Profit Day: $1,500</li>
                <li><strong>Minimum Total Profit Required:</strong> $1,500 ÷ 0.3 = <strong>$5,000</strong></li>
              </ul>
              <p>
                In this situation, to request a payout, you would need to have at least <strong>$5,000</strong> in total profit 
                (current balance minus starting balance). If your current total profit is below this minimum, you'll need 
                to continue trading until you meet this requirement before requesting a payout.
              </p>
            </div>

            <h3>Key Details:</h3>
            <ul>
              <li><strong>Profit Restrictions:</strong> If a single trading day generates more than 30% of the profit balance 
              accumulated since the last approved payout (or since the start of trading if no payouts have been made), it violates the rule.</li>
              
              <li><strong>Reset After Payout:</strong> Once a payout is approved, the 30% rule resets and applies only to profits 
              earned after the most recent payout. It does not look back at previous trading periods.</li>
              
              <li><strong>Exceptions:</strong> The rule applies until the sixth payout or until the account is transferred to a Live Prop 
              Trading Account. At that point, the 30% rule is no longer in effect.</li>
            </ul>

            <h3>Why it matters:</h3>
            <ul>
              <li>Prevents "lucky" single-day windfalls from dominating your profit</li>
              <li>Encourages consistent, sustainable trading</li>
              <li>Ensures you're not relying on one big win</li>
              <li>Promotes professional trading habits</li>
            </ul>
          </div>
        </section>

        <section className="rule-section">
          <h2 className="section-title">How RiskLo Helps</h2>
          <div className="section-content">
            <p>
              RiskLo analyzes your historical trading data to help you understand both 30% rules:
            </p>
            <ul>
              <li><strong>MAE Rule Check:</strong> Compares your worst historical loss against your MAE limit to see if you're at risk of violating the rule</li>
              <li><strong>Windfall Rule Check:</strong> Shows your highest profit day and calculates the minimum total profit you'd need to avoid violating the consistency rule</li>
              <li><strong>Real-time Calculations:</strong> Automatically calculates limits based on your account size, current balance, and safety net</li>
              <li><strong>Historical Analysis:</strong> Uses your actual trading history to predict potential rule violations</li>
            </ul>
            <p className="note">
              <strong>Remember:</strong> These rules are designed to protect both you and Apex Trader Funding. Understanding and following them is essential for successful prop trading.
            </p>
          </div>
        </section>

        <section className="rule-section">
          <h2 className="section-title">Tips for Success</h2>
          <div className="section-content">
            <ul>
              <li><strong>Monitor Your MAE:</strong> Keep track of your open trade losses relative to your MAE limit</li>
              <li><strong>Diversify Your Wins:</strong> Don't rely on one big profit day - spread your profits across multiple days</li>
              <li><strong>Plan for Payouts:</strong> Before requesting a payout, ensure your highest profit day doesn't exceed 30% of your total profit</li>
              <li><strong>Use RiskLo:</strong> Regularly check your risk metrics to stay within both rules</li>
              <li><strong>Stay Consistent:</strong> Both rules reward consistent, disciplined trading over erratic, high-risk strategies</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
    </>
  );
}

export default Apex30PercentRule;

