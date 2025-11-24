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
      answer: "RiskLo is a risk assessment dashboard that analyzes your trading algorithm's historical performance data from Google Sheets. It calculates key risk metrics like maximum drawdown, average losses, and compares them against your account parameters (account size, number of contracts, max drawdown limits) to give you a clear risk assessment. Simply connect your Google Sheet, enter your account details, and get instant risk analysis."
    },
    {
      question: "How do I connect my Google Sheet?",
      answer: "You'll need to set up Google Sheets API credentials. First, create a service account in Google Cloud Console, download the credentials JSON file, and place it in the server directory. Then share your Google Sheet with the service account email address. The app will automatically fetch all available strategy sheets (tabs) from your spreadsheet. See the SETUP.md file for detailed instructions."
    },
    {
      question: "What format should my Google Sheet be in?",
      answer: "Your Google Sheet should have dates in column A and daily P&L values in columns C through G (Monday through Friday). The first two rows are treated as headers. Each row starting from row 3 should contain a date and the corresponding daily profit/loss values for each day of the week. Losses should be negative values (e.g., -$500)."
    },
    {
      question: "What's the difference between NQ and MNQ contract types?",
      answer: "NQ (Nasdaq E-mini) and MNQ (Micro E-mini Nasdaq) are different contract sizes. MNQ is 1/10th the value of NQ. If your Google Sheet data is based on NQ contracts but you're trading MNQ, selecting MNQ will automatically divide all values by 10 to give you accurate risk calculations for your actual position size."
    },
    {
      question: "How does the Account Blowout Risk calculation work?",
      answer: "The Account Blowout Risk compares your historical worst loss (scaled by your number of contracts) against your maximum trailing drawdown limit. If your worst historical loss exceeds your max drawdown, you'll see a 'NO GO' status because historically, this strategy has lost more than your account can handle. If it's below your limit, you'll see a 'GO' status with a buffer amount showing how much room you have."
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
      answer: "Yes! RiskLo Pro includes a Bulk Risk Calculator that lets you analyze up to 20 different account configurations simultaneously. You can compare different strategies, contract sizes, account sizes, and drawdown limits all at once. This is perfect for managing multiple prop firm accounts or testing different position sizes."
    },
    {
      question: "Is my data secure?",
      answer: "Yes. RiskLo only reads data from your Google Sheet - it never writes or modifies anything. Your credentials are stored locally on your server and never shared. The app uses Google's official Sheets API with read-only permissions. All calculations happen on your local server, and no data is sent to external services except Google Sheets (which you control)."
    },
    {
      question: "What if I don't have historical data yet?",
      answer: "RiskLo needs at least some historical trading data to calculate meaningful risk metrics. If you're starting a new strategy, you'll need to collect some trading data first. Once you have a few weeks of data, you can start using RiskLo to assess risk. The more data you have, the more accurate your risk assessment will be."
    },
    {
      question: "How accurate are the risk calculations?",
      answer: "RiskLo calculates risk based on your historical data. It's important to understand that past performance doesn't guarantee future results. The tool shows you what has happened historically, but market conditions can change. Use RiskLo as one tool in your risk management toolkit, not as the sole determinant of your trading decisions. Always consider current market conditions and consult with financial professionals when making significant trading decisions."
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
      question: "What if my Google Sheet has a different format?",
      answer: "Currently, RiskLo expects a specific format (dates in column A, daily values in columns C-G). If your sheet has a different structure, you may need to reformat it or contact support for custom solutions. The tool is designed to work with common trading performance tracking formats."
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

