import React, { useState } from 'react';
import './TutorialModal.css';

function TutorialModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Welcome to RiskLo!',
      content: (
        <div>
          <p>RiskLo helps you analyze trading risk before you risk your account.</p>
          <p><strong>Quick Overview:</strong></p>
          <ul>
            <li>Analyze single strategies or multiple accounts at once</li>
            <li>Check if your setup will blow your account (Account Blowout Risk)</li>
            <li>Verify Apex 30% rule compliance (30% Rule Risk)</li>
            <li>Upload NinjaTrader CSVs for automated analysis</li>
          </ul>
        </div>
      ),
      icon: '👋'
    },
    {
      title: 'Single Strategy Analysis',
      content: (
        <div>
          <p><strong>Step 1:</strong> Select a strategy from the dropdown</p>
          <p><strong>Step 2:</strong> Enter your account details:</p>
          <ul>
            <li>Account size (e.g., $50,000)</li>
            <li>Number of contracts (e.g., 3)</li>
            <li>Contract type (NQ or MNQ)</li>
            <li>Max trailing drawdown (for Account Blowout Risk mode)</li>
          </ul>
          <p><strong>Step 3:</strong> Click "Analyze Risk" to see your risk assessment</p>
          <p><strong>Result:</strong> You'll see if your setup is safe (GO) or risky (NO GO)</p>
        </div>
      ),
      icon: '📊'
    },
    {
      title: 'Bulk Risk Calculator (Pro)',
      content: (
        <div>
          <p><strong>For Pro users:</strong> Analyze up to 40 accounts at once!</p>
          <p><strong>How to use:</strong></p>
          <ul>
            <li>Click the "Bulk Risk" tab</li>
            <li>Add rows for each account/strategy combination</li>
            <li>Fill in account details for each row</li>
            <li>Click "Analyze All" to get results for all accounts</li>
            <li>Review the table - red rows indicate high risk</li>
          </ul>
          <p><strong>Tip:</strong> Use CSV upload to automatically populate bulk rows!</p>
        </div>
      ),
      icon: '⚡'
    },
    {
      title: 'CSV Upload (Pro)',
      content: (
        <div>
          <p><strong>For Pro users:</strong> Upload NinjaTrader exports for instant analysis!</p>
          <p><strong>How to use:</strong></p>
          <ul>
            <li>Click the "CSV Upload" tab</li>
            <li>Export Accounts CSV from NinjaTrader (Account tab → Export)</li>
            <li>Export Strategies CSV from NinjaTrader (Strategy Performance tab → Export)</li>
            <li>Upload both files using "Auto-Detect" or manual selection</li>
            <li>Click "Analyze All" - results will populate automatically</li>
          </ul>
          <p><strong>Pro Tip:</strong> Use RiskLo Watcher desktop app for automatic daily uploads!</p>
        </div>
      ),
      icon: '📁'
    },
    {
      title: 'Understanding Risk Modes',
      content: (
        <div>
          <p><strong>Account Blowout Risk Mode:</strong></p>
          <ul>
            <li>Compares your worst historical loss vs your max trailing drawdown</li>
            <li>Shows if your strategy has ever lost more than your account can handle</li>
            <li>Result: GO (safe) or NO GO (risky)</li>
          </ul>
          <p><strong>30% Rule Risk Mode:</strong></p>
          <ul>
            <li>Checks Apex Trader Funding's 30% MAE rule compliance</li>
            <li>Calculates your MAE limit based on profit balance and safety net</li>
            <li>Shows if historical losses exceed the 30% limit</li>
          </ul>
          <p><strong>Switch modes:</strong> Use the toggle button at the top of the page</p>
        </div>
      ),
      icon: '🛡️'
    },
    {
      title: 'You\'re Ready!',
      content: (
        <div>
          <p><strong>That's it!</strong> You now know how to use RiskLo.</p>
          <p><strong>Remember:</strong></p>
          <ul>
            <li>Always check risk before trading a new setup</li>
            <li>Red/NO GO means high risk - adjust contracts or strategy</li>
            <li>Green/GO means safe - but always monitor your positions</li>
            <li>Historical data doesn't guarantee future results</li>
          </ul>
          <p><strong>Need help?</strong> Check the FAQ page or contact support.</p>
        </div>
      ),
      icon: '🎉'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    // Mark tutorial as seen
    localStorage.setItem('risklo_tutorial_seen', 'true');
    onClose();
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="tutorial-overlay" onClick={handleClose}>
      <div className="tutorial-modal" onClick={(e) => e.stopPropagation()}>
        <button className="tutorial-close" onClick={handleClose}>×</button>
        
        <div className="tutorial-header">
          <div className="tutorial-icon">{currentStepData.icon}</div>
          <h2 className="tutorial-title">{currentStepData.title}</h2>
          <div className="tutorial-progress">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
        
        <div className="tutorial-content">
          <div className="tutorial-step-content">
            {currentStepData.content}
          </div>
        </div>

        <div className="tutorial-footer">
          <div className="tutorial-progress-dots">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`tutorial-dot ${index === currentStep ? 'active' : ''}`}
                onClick={() => setCurrentStep(index)}
              />
            ))}
          </div>
          
          <div className="tutorial-buttons">
            {currentStep > 0 && (
              <button 
                className="tutorial-btn tutorial-btn-secondary"
                onClick={handlePrevious}
              >
                Previous
              </button>
            )}
            <button 
              className="tutorial-btn tutorial-btn-primary"
              onClick={handleNext}
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorialModal;

