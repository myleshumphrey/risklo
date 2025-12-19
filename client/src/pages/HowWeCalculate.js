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
              RiskLo uses preset account sizes with their corresponding trailing thresholds. These presets are available in both Risk mode and 30% Drawdown mode:
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
            <p>RiskLo calculates two key values:</p>
            
            <h4>1. Maximum Profit Allowed (Windfall Limit)</h4>
            <div className="formula-box">
              <div className="formula">
                <strong>Maximum Profit Allowed = Profit Balance × 30%</strong>
              </div>
            </div>
            <p className="note">
              This is the maximum amount you can profit in a single day without violating the rule. If your profit balance is $2,500, 
              your maximum profit allowed per day is $750 (30% of $2,500).
            </p>

            <h4>2. Minimum Total Profit Required</h4>
            <div className="formula-box">
              <div className="formula">
                <strong>Minimum Total Profit Required = Highest Profit Day ÷ 0.3</strong>
              </div>
            </div>
            <p>
              This calculates the minimum total profit you need to have accumulated to request a payout, based on your highest single-day profit.
            </p>

            <div className="example-box">
              <h3>Example:</h3>
              <ul>
                <li>Account Size: $50,000</li>
                <li>Current Balance: $52,500</li>
                <li>Start-of-Day Profit Balance: $2,500</li>
                <li>Maximum Profit Allowed: $2,500 × 0.30 = <strong>$750</strong></li>
                <li>Highest Profit Day (from historical data): $249.50</li>
                <li>Minimum Total Profit Required: $249.50 ÷ 0.3 = <strong>$831.67</strong></li>
              </ul>
              <p>
                In this example, your highest profit day ($249.50) is within the maximum allowed ($750), so it's safe. 
                However, to request a payout, you would need at least $831.67 in total profit. If your current total profit is below this minimum, 
                you'll need to continue trading until you meet this requirement before requesting a payout.
              </p>
            </div>

            <h3>How RiskLo Checks This:</h3>
            <p>
              RiskLo analyzes your historical trading data to find the highest single-day profit. It then:
            </p>
            <ul>
              <li>Calculates the maximum profit allowed (30% of your profit balance)</li>
              <li>Compares your highest profit day against this limit</li>
              <li>Calculates the minimum total profit required based on your highest profit day</li>
              <li>Shows a warning if the strategy has historically produced profits that would violate the windfall rule</li>
            </ul>
            <p className="note">
              <strong>Note:</strong> The windfall rule is separate from the MAE (30% Negative P&L) rule. The MAE rule limits losses, 
              while the Windfall rule limits profits to ensure consistency. RiskLo uses your "Profit Since Last Payout" if provided, 
              otherwise it uses your start-of-day profit balance for calculations.
            </p>
          </div>
        </section>

        <section className="calculation-section">
          <h2 className="section-title">Payout Planner (Calendar + Daily Targets)</h2>
          <div className="section-content">
            <p>
              RiskLo’s Payout Planner turns the 30% Consistency Rule into actionable numbers and a date you can plan around.
              It uses the highest profit day from the selected strategy’s historical results and combines it with your current profit balance
              (profit since last payout, if provided).
            </p>

            <h3>Core Formulas</h3>
            <div className="formula-box">
              <div className="formula">
                <strong>Minimum Total Profit Required = Highest Profit Day ÷ 0.30</strong><br />
                <strong>Remaining Profit Needed = max(0, Minimum Total Profit Required − Profit Balance)</strong><br />
                <strong>Profit Per Day Target = Remaining Profit Needed ÷ Trading Days Required</strong>
              </div>
            </div>

            <h3>Earliest Payout Request Date</h3>
            <p>
              The calendar counts <strong>US trading days</strong> starting from your selected Start Date (counting the start day if it’s a trading day).
              RiskLo excludes:
            </p>
            <ul>
              <li><strong>Weekends</strong> (Saturday/Sunday)</li>
              <li><strong>US market holidays</strong> (NYSE closures), including:
                New Year’s Day (observed), MLK Day, Presidents Day, Good Friday, Memorial Day, Juneteenth (observed),
                Independence Day (observed), Labor Day, Thanksgiving, and Christmas (observed).</li>
            </ul>
            <p className="note">
              This is a planning tool. Always confirm payout eligibility and rules directly with Apex, as policies can change.
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
              All risk calculations account for your number of contracts and contract type. The process works in two steps:
            </p>
            
            <h3>Step 1: Apply Contract Type Multiplier</h3>
            <p>
              First, the raw value from the Google Sheet is adjusted based on contract type:
            </p>
            <div className="formula-box">
              <div className="formula">
                <strong>Adjusted Value = Raw Value × Contract Multiplier</strong>
              </div>
            </div>
            <p>Where:</p>
            <ul>
              <li><strong>Contract Multiplier:</strong> 1.0 for NQ, 0.1 for MNQ (since MNQ is 1/10th the value of NQ)</li>
            </ul>
            <p className="note">
              If your Google Sheet data is for NQ contracts but you're trading MNQ, the values are automatically divided by 10.
            </p>

            <h3>Step 2: Scale by Number of Contracts</h3>
            <div className="formula-box">
              <div className="formula">
                <strong>Final Scaled Value = Adjusted Value × Number of Contracts</strong>
              </div>
            </div>

            <div className="example-box">
              <h3>Example:</h3>
              <ul>
                <li>Raw Value from Sheet (NQ): $643.50</li>
                <li>Contract Type: MNQ (multiplier = 0.1)</li>
                <li>Adjusted Value: $643.50 × 0.1 = $64.35</li>
                <li>Number of Contracts: 3</li>
                <li>Final Scaled Loss: $64.35 × 3 = <strong>$193.05</strong></li>
              </ul>
              <p>
                This ensures that all risk metrics (highest loss, average loss, max profit, etc.) are calculated 
                for your actual position size, not just per-contract values.
              </p>
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
            
            <h3>Important Limitation: Trailing Drawdown vs. End-of-Day P&L</h3>
            <div className="warning-box" style={{
              padding: '1rem',
              background: 'rgba(245, 158, 11, 0.15)',
              borderLeft: '4px solid #f59e0b',
              borderRadius: '8px',
              marginTop: '1rem'
            }}>
              <p>
                <strong>⚠️ Critical Note:</strong> Trailing drawdown is based on <strong>intraday maximum adverse excursion (MAE)</strong>, 
                not end-of-day P&L. This means:
              </p>
              <ul>
                <li>A trade could close positive but still blow the account if it exceeded the drawdown limit during the day</li>
                <li>For example: If your max drawdown is $300, but a trade dips to -$400 intraday before recovering to +$200, 
                the account would still be liquidated</li>
                <li>RiskLo uses end-of-day P&L data from your Google Sheet, so <strong>actual risk may be higher</strong> than shown</li>
              </ul>
              <p>
                This analysis provides a conservative estimate based on end-of-day data. Always account for intraday volatility 
                when assessing risk.
              </p>
            </div>
          </div>
        </section>

        <section className="calculation-section">
          <h2 className="section-title">Probability of Exceeding Limits</h2>
          <div className="section-content">
            <p>
              RiskLo calculates the probability of exceeding your limits based on historical trading data:
            </p>
            
            <h3>For Risk Mode (Max Drawdown):</h3>
            <div className="formula-box">
              <div className="formula">
                <strong>Probability = (Number of Days That Exceeded Max Drawdown ÷ Total Trading Days) × 100%</strong>
              </div>
            </div>
            <p>
              This shows what percentage of historical trading days had losses that exceeded your max drawdown limit. 
              The calculation uses end-of-day P&L values, so actual intraday breach probability may be higher.
            </p>

            <h3>For 30% Drawdown Mode (MAE Limit):</h3>
            <div className="formula-box">
              <div className="formula">
                <strong>Probability = (Number of Days That Exceeded MAE Limit ÷ Total Trading Days) × 100%</strong>
              </div>
            </div>
            <p>
              This shows what percentage of historical trading days had losses that exceeded your Apex MAE limit. 
              Again, this is based on end-of-day P&L, so actual intraday breach probability may be higher.
            </p>

            <div className="example-box">
              <h3>Example:</h3>
              <ul>
                <li>Total Trading Days: 50</li>
                <li>Days That Exceeded Limit: 3</li>
                <li>Probability: (3 ÷ 50) × 100% = <strong>6.0%</strong></li>
              </ul>
              <p>
                This means 6% of historical trading days exceeded the limit. However, if the worst loss already exceeds the limit, 
                the probability reflects how often this happened historically, not a guaranteed 100% occurrence.
              </p>
            </div>
          </div>
        </section>

        <section className="calculation-section">
          <h2 className="section-title">Profit Metrics</h2>
          <div className="section-content">
            <p>
              RiskLo calculates profit metrics to give you a complete picture of your strategy's performance:
            </p>
            
            <h3>Maximum Profit</h3>
            <div className="formula-box">
              <div className="formula">
                <strong>Maximum Profit = Highest Single-Day Profit × Number of Contracts × Contract Multiplier</strong>
              </div>
            </div>
            <p>
              This is the highest profit achieved in a single trading day, scaled by your contract size.
            </p>

            <h3>Average Profit</h3>
            <div className="formula-box">
              <div className="formula">
                <strong>Average Profit = (Sum of All Profits ÷ Number of Profitable Days) × Number of Contracts × Contract Multiplier</strong>
              </div>
            </div>
            <p>
              This shows the average profit on winning days, scaled by your contract size.
            </p>

            <div className="example-box">
              <h3>Example:</h3>
              <ul>
                <li>Highest Single-Day Profit (per contract): $1,198.00</li>
                <li>Number of Contracts: 3</li>
                <li>Contract Type: MNQ (multiplier = 0.1)</li>
                <li>Maximum Profit: $1,198.00 × 3 × 0.1 = <strong>$359.40</strong></li>
              </ul>
            </div>
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

