import React from 'react';
import './About.css';
import PageHeader from '../components/PageHeader';

function About({ onNavigate }) {
  return (
    <>
      <PageHeader onNavigate={onNavigate} />
      <div className="about-page">
      <div className="about-container">
        <h1 className="about-title">About RiskLo</h1>
        <p className="about-intro">
          RiskLo was born from a simple frustration: understanding trading risk shouldn't be complicated.
        </p>

        <section className="about-section">
          <h2 className="section-title">The Problem: Calculating Risk is Hard</h2>
          <div className="section-content">
            <p>
              As a trader, you're constantly making decisions that could make or break your account. But how do you 
              know if you're taking too much risk? The answer isn't always clear.
            </p>
            
            <p>
              Traditional risk management involves complex spreadsheets, manual calculations, and hours of analysis. 
              You have to:
            </p>
            
            <ul className="problem-list">
              <li>Pull historical performance data from multiple sources</li>
              <li>Manually calculate maximum drawdowns and average losses</li>
              <li>Compare your account size against historical worst-case scenarios</li>
              <li>Factor in contract sizes and position scaling</li>
              <li>Keep track of multiple accounts and strategies</li>
            </ul>
            
            <p>
              This process is time-consuming, error-prone, and often leads to analysis paralysis. By the time you've 
              crunched all the numbers, market conditions may have changed, or you've missed trading opportunities.
            </p>
          </div>
        </section>

        <section className="about-section">
          <h2 className="section-title">The 30% Drawdown Rule: A Hidden Challenge</h2>
          <div className="section-content">
            <p>
              If you trade with Apex Trader Funding or similar prop firms, you've encountered the 30% Negative P&L Rule 
              (also known as Maximum Adverse Excursion or MAE). This rule limits how much you can lose on a single trade 
              while it's still open.
            </p>
            
            <p>
              Sounds simple, right? But here's where it gets complicated:
            </p>
            
            <div className="challenge-box">
              <h3>The Base Amount Problem</h3>
              <p>
                The 30% limit isn't always based on the same amount. For new accounts or accounts with low profits, 
                the limit is based on your trailing threshold (safety net). But once your profit roughly doubles that 
                threshold, the rule switches to 50% and uses your profit balance instead.
              </p>
              <p>
                This means you need to constantly recalculate: "What's my base amount today? Is it my safety net or 
                my profit? Am I at 30% or 50%?"
              </p>
            </div>
            
            <div className="challenge-box">
              <h3>The Scaling Problem</h3>
              <p>
                Your Google Sheets might show losses for 1 contract, but you're trading 3 contracts. Or maybe your 
                data is for NQ contracts but you're trading MNQ. Every loss needs to be scaled correctly, and one 
                miscalculation could mean violating the rule.
              </p>
            </div>
            
            <div className="challenge-box">
              <h3>The Historical Context Problem</h3>
              <p>
                Just knowing your MAE limit isn't enough. You need to know: "Has this strategy ever lost more than 
                my limit? How often? What's the probability I'll blow my account if I run this setup?"
              </p>
              <p>
                Without historical analysis, you're flying blind. You might think you're safe, only to discover your 
                worst historical loss exceeds your MAE limit by hundreds of dollars.
              </p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2 className="section-title">How RiskLo Solves This</h2>
          <div className="section-content">
            <p>
              RiskLo automates the entire risk calculation process, giving you instant answers to critical questions:
            </p>
            
            <div className="solution-grid">
              <div className="solution-card">
                <div className="solution-icon">⚡</div>
                <h3>Instant Analysis</h3>
                <p>
                  Connect your Google Sheet and get risk metrics in seconds, not hours. No more manual calculations 
                  or spreadsheet formulas.
                </p>
              </div>
              
              <div className="solution-card">
                <div className="solution-icon">📊</div>
                <h3>Contract Scaling</h3>
                <p>
                  Automatically scales historical losses by your contract count and type (NQ vs MNQ). See exactly 
                  how your position size affects risk.
                </p>
              </div>
              
              <div className="solution-card">
                <div className="solution-icon">🛡️</div>
                <h3>Account Blowout Protection</h3>
                <p>
                  Compare your worst historical loss against your max trailing drawdown. Get a clear GO/NO GO answer 
                  before you risk your account.
                </p>
              </div>
              
              <div className="solution-card">
                <div className="solution-icon">📏</div>
                <h3>Apex MAE Calculation</h3>
                <p>
                  Automatically calculates your MAE limit based on profit balance and safety net. See if your 
                  historical losses exceed the limit.
                </p>
              </div>
              
              <div className="solution-card">
                <div className="solution-icon">📈</div>
                <h3>Bulk Analysis</h3>
                <p>
                  Analyze up to 40 account configurations at once. Quickly compare different strategies, contract 
                  sizes, and account setups.
                </p>
              </div>
              
              <div className="solution-card">
                <div className="solution-icon">🎯</div>
                <h3>Risk Score</h3>
                <p>
                  Get a simple 0-100 risk score that combines multiple factors. Instantly understand if your setup 
                  is low, moderate, or high risk.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2 className="section-title">Our Mission</h2>
          <div className="section-content">
            <p>
              We believe risk management should be simple, fast, and accessible. You shouldn't need a finance degree 
              or hours of spreadsheet work to know if your trading setup is safe.
            </p>
            <p>
              RiskLo gives you the tools to make informed decisions quickly, so you can focus on what matters: 
              executing your trading strategy with confidence.
            </p>
          </div>
        </section>
      </div>
    </div>
    </>
  );
}

export default About;

