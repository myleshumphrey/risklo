import React, { useState } from 'react';
import './FAQ.css';
import PageHeader from '../components/PageHeader';

function FAQ({ onNavigate }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "What is RiskLo and how does it work?",
      answer: "RiskLo is a risk assessment dashboard that analyzes trading strategy historical performance data. It calculates key risk metrics like maximum drawdown, average losses, and compares them against your account parameters (account size, number of contracts, max drawdown limits) to give you a clear risk assessment. Strategy data is updated daily with the latest performance results. Simply select a strategy, enter your account details, and get instant risk analysis."
    },
    {
      question: "Where does the strategy data come from?",
      answer: "RiskLo uses daily updated performance data for each trading strategy. The strategy data is maintained and automatically updated daily with the latest trading results. Historical daily profit and loss values are included for each strategy, allowing RiskLo to calculate accurate risk metrics. You simply select a strategy from the dropdown - the data is already there and ready to use."
    },
    {
      question: "What's the difference between NQ and MNQ contract types?",
      answer: "NQ (Nasdaq E-mini) and MNQ (Micro E-mini Nasdaq) are different contract sizes. MNQ is 1/10th the value of NQ. Strategy data is typically based on NQ contracts. If you're trading MNQ, selecting MNQ will automatically adjust all values by dividing by 10 to give you accurate risk calculations for your actual position size."
    },
    {
      question: "How does the Account Blowout Risk calculation work?",
      answer: "The Account Blowout Risk compares your historical worst loss (scaled by your number of contracts) against your maximum trailing drawdown limit. If your worst historical loss exceeds your max drawdown, you'll see a 'NO GO' status because historically, this strategy has lost more than your account can handle. If it's below your limit, you'll see a 'GO' status with a buffer amount showing how much room you have. ⚠️ Important Note: Trailing drawdown is based on intraday maximum adverse excursion (MAE), not end-of-day P&L. This means a trade could close positive but still blow the account if it exceeded the drawdown limit during the day. RiskLo uses end-of-day P&L data, so actual risk may be higher than shown. Always account for intraday volatility when assessing risk."
    },
    {
      question: "What is the 30% Drawdown Rule (Apex MAE)?",
      answer: "The 30% Negative P&L Rule (Maximum Adverse Excursion) is a rule used by Apex Trader Funding and similar prop firms. It limits how much you can lose on a single open trade. The limit is typically 30% of your start-of-day profit balance, or 30% of your trailing threshold (safety net) for new/low-profit accounts. Once your profit roughly doubles your safety net, the rule increases to 50% and uses your profit balance as the base."
    },
    {
      question: "How does RiskLo calculate the Apex MAE limit?",
      answer: "RiskLo uses your Start-of-Day Profit Balance and Safety Net to determine: (1) The base amount - if profit is less than or equal to safety net, it uses safety net; otherwise it uses profit. (2) The percentage - 30% default, or 50% if profit is at least 2x the safety net. Then it multiplies the base amount by the percentage to get your MAE limit. It compares this against your historical worst loss (scaled by contracts) to show if you're at risk of violating the rule."
    },
    {
      question: "What does the Risk Score mean?",
      answer: "The Risk Score is a 0-100 scale that combines multiple risk factors. It considers your highest loss as a percentage of account size and your drawdown usage. Scores below 40 are considered low risk, 40-70 is moderate risk, and above 70 is high risk. This gives you a quick, single-number assessment of your overall risk level."
    },
    {
      question: "Can I analyze multiple accounts at once?",
      answer: "Yes! RiskLo Pro includes a Bulk Risk Calculator that lets you analyze up to 40 different account configurations simultaneously. You can compare different strategies, contract sizes, account sizes, and drawdown limits all at once. This is perfect for managing multiple prop firm accounts or testing different position sizes."
    },
    {
      question: "Is my data secure?",
      answer: "Yes. RiskLo only uses strategy performance data for calculations - it never stores or transmits your personal account information. All risk calculations happen securely, and your account details (account size, contracts, drawdown limits) are only used locally for analysis. No personal trading data is stored or shared with third parties."
    },
    {
      question: "How much historical data is needed for accurate risk assessment?",
      answer: "RiskLo uses the available historical trading data for each strategy to calculate risk metrics. The more trading days included in the data, the more accurate your risk assessment will be. Strategies with extensive historical data will provide more reliable probability calculations and risk scores. The tool works with whatever historical data is available for each strategy."
    },
    {
      question: "How accurate are the risk calculations?",
      answer: "RiskLo calculates risk based on each strategy's historical performance data. It's important to understand that past performance doesn't guarantee future results. The tool shows you what has happened historically with each strategy, but market conditions can change. Use RiskLo as one tool in your risk management toolkit, not as the sole determinant of your trading decisions. Always consider current market conditions and consult with financial professionals when making significant trading decisions."
    },
    {
      question: "What's the difference between 'Risk' mode and '30% Drawdown' mode?",
      answer: "Risk mode focuses on your account's maximum trailing drawdown limit - it tells you if your historical losses could blow your account based on your drawdown threshold. 30% Drawdown mode focuses specifically on Apex's MAE rule - it calculates your MAE limit and compares it to your historical losses to see if you're at risk of violating the 30% rule on a single trade. Both are important, but they measure different types of risk."
    },
    {
      question: "Can I use RiskLo for live trading decisions?",
      answer: "RiskLo is designed to help you assess risk before you start trading a strategy. It analyzes historical data to give you a risk profile. However, it doesn't track live positions or real-time P&L. Use RiskLo to evaluate strategies and account setups, but always monitor your live positions separately and follow your broker's or prop firm's real-time risk management tools."
    },
    {
      question: "How often is the strategy data updated?",
      answer: "Strategy performance data is updated daily with the latest trading results. This ensures that your risk assessments are based on the most current performance data available. Each strategy's historical daily profit and loss values are refreshed automatically, so you always have access to up-to-date risk analysis."
    },
    {
      question: "Can I add my own strategy or update the data?",
      answer: "The strategy data is maintained by RiskLo's development team and updated automatically. If you'd like to request a new strategy to be added or have questions about the available strategies, please contact support. The daily updates ensure all strategies reflect the latest trading performance."
    },
    {
      question: "What if a strategy I want to analyze isn't in the list?",
      answer: "If you don't see a specific strategy in the dropdown, it may not be available yet. Strategy data is added and maintained by RiskLo's team. You can contact support to request that a strategy be added. In the meantime, you can use similar strategies that are available to get a sense of risk levels."
    },
    {
      question: "Is RiskLo affiliated with Vector Algorithmics or Apex Trader Funding?",
      answer: "No. RiskLo is an independent tool and is not affiliated with Vector Algorithmics, Apex Trader Funding, or any other trading platform or algorithm provider. RiskLo is a standalone risk analysis tool that helps traders analyze their own data. See our disclaimers for more information."
    }
  ];

  return (
    <>
      <PageHeader onNavigate={onNavigate} />
      <div className="faq-page">
      <div className="faq-container">
        <h1 className="faq-title">Frequently Asked Questions</h1>
        <p className="faq-intro">
          Everything you need to know about RiskLo and how it helps you manage trading risk.
        </p>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className={`faq-item ${openIndex === index ? 'open' : ''}`}>
              <button
                className="faq-question"
                onClick={() => toggleQuestion(index)}
              >
                <span className="faq-question-text">{faq.question}</span>
                <span className="faq-toggle-icon">{openIndex === index ? '−' : '+'}</span>
              </button>
              {openIndex === index && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}

export default FAQ;

