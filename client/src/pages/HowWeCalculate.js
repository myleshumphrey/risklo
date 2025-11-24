import React from 'react';
import './HowWeCalculate.css';
import { ACCOUNT_SIZE_PRESETS } from '../utils/accountSizes';
import PageHeader from '../components/PageHeader';

function HowWeCalculate({ onNavigate }) {
  return (
    <>
      <PageHeader onNavigate={onNavigate} />
      <div className="how-we-calculate-page">
      <div className="how-we-calculate-container">
        <h1 className="page-title">How We Calculate</h1>
        <p className="page-intro">
          Transparency is important to us. Here's exactly how RiskLo calculates risk metrics and Apex MAE limits.
        </p>

        <section className="calculation-section">
          <h2 className="section-title">Account Size Presets & Trailing Thresholds</h2>
          <div className="section-content">
            <p>
              For the 30% Drawdown calculator, we use preset account sizes with their corresponding trailing thresholds:
            </p>
            <div className="account-table">
              <table>
                <thead>
                  <tr>
                    <th>Account Size</th>
                    <th>Trailing Threshold</th>
                  </tr>
                </thead>
                <tbody>
                  {ACCOUNT_SIZE_PRESETS.map((preset, index) => (
                    <tr key={index}>
                      <td>{preset.label}</td>
                      <td>${preset.threshold.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="note">
              <strong>Note:</strong> The trailing threshold is automatically set based on your selected account size. 
              This matches the standard thresholds used by Apex Trader Funding for each account tier.
            </p>
          </div>
        </section>

        <section className="calculation-section">
          <h2 className="section-title">Start-of-Day Profit Balance Calculation</h2>
          <div className="section-content">
            <p>
              The start-of-day profit balance is automatically calculated using a simple formula:
            </p>
            <div className="formula-box">
              <div className="formula">
                <strong>Start-of-Day Profit = Current Account Balance - Account Size</strong>
              </div>
            </div>
            <div className="example-box">
              <h3>Example:</h3>
              <ul>
                <li>Account Size: $50,000 (50K FULL)</li>
                <li>Current Account Balance: $52,500</li>
                <li>Start-of-Day Profit = $52,500 - $50,000 = <strong>$2,500</strong></li>
              </ul>
            </div>
            <p>
              This profit balance represents how much you're above your original account size at the start of the trading day.
            </p>
          </div>
        </section>

        <section className="calculation-section">
          <h2 className="section-title">Apex MAE Limit Calculation (30% Rule)</h2>
          <div className="section-content">
            <p>
              The Maximum Adverse Excursion (MAE) limit determines how much you can lose on a single open trade. 
              The calculation follows Apex Trader Funding's 30% Negative P&L Rule:
            </p>

            <h3>Step 1: Determine Base Amount</h3>
            <p>The base amount depends on your profit balance and safety net:</p>
            <div className="formula-box">
              <div className="formula">
                <strong>If Profit ≤ Safety Net:</strong> Base Amount = Safety Net<br />
                <strong>Otherwise:</strong> Base Amount = Profit Balance (or Safety Net if Profit is 0)
              </div>
            </div>

            <h3>Step 2: Determine Limit Percentage</h3>
            <p>The percentage limit depends on how much profit you have:</p>
            <div className="formula-box">
              <div className="formula">
                <strong>Default:</strong> Limit = 30% (0.3)<br />
                <strong>If Profit ≥ 2 × Safety Net:</strong> Limit = 50% (0.5)
              </div>
            </div>
            <p className="note">
              When your profit roughly doubles your safety net, Apex increases the limit to 50% and uses your profit balance as the base.
            </p>

            <h3>Step 3: Calculate MAE Limit</h3>
            <div className="formula-box">
              <div className="formula">
                <strong>MAE Limit = Base Amount × Limit Percentage</strong>
              </div>
            </div>

            <div className="example-box">
              <h3>Example 1: New Account (Low Profit)</h3>
              <ul>
                <li>Account Size: $50,000</li>
                <li>Current Balance: $50,500</li>
                <li>Start-of-Day Profit: $500</li>
                <li>Safety Net: $2,500</li>
                <li>Base Amount: $2,500 (Profit ≤ Safety Net, so use Safety Net)</li>
                <li>Limit Percentage: 30% (Profit &lt; 2 × Safety Net)</li>
                <li>MAE Limit: $2,500 × 0.30 = <strong>$750</strong></li>
              </ul>
            </div>

            <div className="example-box">
              <h3>Example 2: Profitable Account (50% Rule)</h3>
              <ul>
                <li>Account Size: $50,000</li>
                <li>Current Balance: $55,000</li>
                <li>Start-of-Day Profit: $5,000</li>
                <li>Safety Net: $2,500</li>
                <li>Base Amount: $5,000 (Profit &gt; Safety Net, so use Profit)</li>
                <li>Limit Percentage: 50% (Profit ≥ 2 × Safety Net: $5,000 ≥ $5,000)</li>
                <li>MAE Limit: $5,000 × 0.50 = <strong>$2,500</strong></li>
              </ul>
            </div>
          </div>
        </section>

        <section className="calculation-section">
          <h2 className="section-title">Apex Windfall Rule (30% Consistency Rule)</h2>
          <div className="section-content">
            <p>
              The 30% Consistency Rule (also called the "Windfall Rule") ensures that no single trading day accounts for more than 30% 
              of the total profit balance at the time of a payout request. This rule promotes consistent trading practices and 
              discourages high-risk, erratic trading styles.
            </p>

            <h3>Key Details:</h3>
            <ul>
              <li><strong>Profit Restrictions:</strong> If a single trading day generates more than 30% of the profit balance accumulated 
              since the last approved payout (or since the start of trading if no payouts have been made), it violates the rule.</li>
              <li><strong>Reset After Payout:</strong> Once a payout is approved, the 30% rule resets and applies only to profits earned 
              after the most recent payout. It does not look back at previous trading periods.</li>
              <li><strong>Exceptions:</strong> The rule applies until the sixth payout or until the account is transferred to a Live Prop 
              Trading Account. At that point, the 30% rule is no longer in effect.</li>
            </ul>

            <h3>Calculation Method</h3>
            <div className="formula-box">
              <div className="formula">
                <strong>Highest Profit Day ÷ 0.3 = Minimum Total Profit Required</strong>
              </div>
            </div>

            <div className="example-box">
              <h3>Example:</h3>
              <ul>
                <li>Account Size: $50,000</li>
                <li>Highest Profit Day: $1,500</li>
                <li>Minimum Total Profit Required: $1,500 ÷ 0.3 = <strong>$5,000</strong></li>
              </ul>
              <p>
                In this situation, to request a payout, you would need to have at least $5,000 in total profit 
                (current balance minus starting balance). If your current total profit is below this minimum, you'll need 
                to continue trading until you meet this requirement before requesting a payout.
              </p>
            </div>

            <h3>How RiskLo Checks This:</h3>
            <p>
              RiskLo analyzes your historical trading data to find the highest single-day profit. It then calculates:
            </p>
            <ul>
              <li>The minimum total profit you would need to have accumulated to avoid violating the rule</li>
              <li>If you have a profit balance entered, it checks whether your highest profit day exceeds 30% of that balance</li>
              <li>Shows a warning if the strategy has historically produced profits that would violate the windfall rule</li>
            </ul>
            <p className="note">
              <strong>Note:</strong> The windfall rule is separate from the MAE (30% Negative P&L) rule. The MAE rule limits losses, 
              while the Windfall rule limits profits to ensure consistency.
            </p>
          </div>
        </section>

        <section className="calculation-section">
          <h2 className="section-title">Risk Score Calculation</h2>
          <div className="section-content">
            <p>
              The risk score (0-100) combines multiple factors to give you a quick assessment:
            </p>
            <div className="formula-box">
              <div className="formula">
                <strong>Risk Score = (Worst Loss % of Account × 50) + (Drawdown Usage % × 50)</strong>
              </div>
            </div>
            <p>Where:</p>
            <ul>
              <li><strong>Worst Loss % of Account</strong> = (Highest Historical Loss ÷ Account Size) × 100</li>
              <li><strong>Drawdown Usage %</strong> = (Highest Historical Loss ÷ Max Drawdown) × 100 (capped at 100%)</li>
            </ul>
            <div className="risk-levels">
              <h3>Risk Level Interpretation:</h3>
              <ul>
                <li><strong>0-39:</strong> Low Risk</li>
                <li><strong>40-69:</strong> Moderate Risk</li>
                <li><strong>70-100:</strong> High Risk</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="calculation-section">
          <h2 className="section-title">Contract Scaling</h2>
          <div className="section-content">
            <p>
              All risk calculations account for your number of contracts and contract type:
            </p>
            <div className="formula-box">
              <div className="formula">
                <strong>Scaled Loss = Per-Contract Loss × Number of Contracts × Contract Multiplier</strong>
              </div>
            </div>
            <p>Where:</p>
            <ul>
              <li><strong>Contract Multiplier:</strong> 1.0 for NQ, 0.1 for MNQ (since MNQ is 1/10th the value)</li>
            </ul>
            <div className="example-box">
              <h3>Example:</h3>
              <ul>
                <li>Per-Contract Loss: $643.50</li>
                <li>Number of Contracts: 3</li>
                <li>Contract Type: MNQ (multiplier = 0.1)</li>
                <li>Scaled Loss = $643.50 × 3 × 0.1 = <strong>$193.05</strong></li>
              </ul>
            </div>
          </div>
        </section>

        <section className="calculation-section">
          <h2 className="section-title">Account Blowout Risk (GO/NO GO)</h2>
          <div className="section-content">
            <p>
              The GO/NO GO indicator compares your worst historical loss (scaled by contracts) against your limits:
            </p>
            <div className="formula-box">
              <div className="formula">
                <strong>GO Status:</strong> Worst Historical Loss ≤ Max Drawdown (or MAE Limit)<br />
                <strong>NO GO Status:</strong> Worst Historical Loss &gt; Max Drawdown (or MAE Limit)
              </div>
            </div>
            <p>
              If your worst historical loss exceeds your limit, the strategy has historically lost more than your account can handle, 
              indicating a high risk of account blowout.
            </p>
          </div>
        </section>

        <section className="calculation-section">
          <h2 className="section-title">Data Sources</h2>
          <div className="section-content">
            <p>
              RiskLo analyzes historical trading data from your Google Sheet:
            </p>
            <ul>
              <li>Daily P&L values are read from columns C-G (Monday through Friday)</li>
              <li>The first two rows are treated as headers and skipped</li>
              <li>All values are parsed as per-contract amounts</li>
              <li>Losses are identified as negative values</li>
              <li>Profits are identified as positive values</li>
            </ul>
            <p className="note">
              <strong>Important:</strong> Past performance doesn't guarantee future results. RiskLo shows historical patterns, 
              but market conditions can change. Always use multiple risk management tools and consult with financial professionals.
            </p>
          </div>
        </section>
      </div>
    </div>
    </>
  );
}

export default HowWeCalculate;

