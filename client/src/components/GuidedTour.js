import React, { useState, useEffect, useRef, useCallback } from 'react';
import './GuidedTour.css';

// Move steps array to module scope to keep reference stable for hooks
const STEPS = [
    {
      target: null, // No target - center on screen
      title: 'Welcome to RiskLo! 👋',
      content: 'RiskLo helps you analyze trading risk before risking your account. Let\'s take a quick tour!',
      placement: 'center',
      showProFeatures: true
    },
    {
      target: '.risk-tab.active',
      title: 'Single Strategy Analysis',
      content: 'Start here! Select a strategy, enter your account details, and get instant risk analysis. This works for free users.',
      placement: 'bottom',
      showProFeatures: false
    },
    {
      target: '.mode-toggle-btn',
      title: 'Risk Mode Toggle',
      content: 'Switch between "Account Blowout Risk" (checks if you\'ll blow your account) and "30% Rule Risk" (checks Apex MAE compliance).',
      placement: 'bottom',
      showProFeatures: false
    },
    {
      target: '.form-select',
      title: 'Select a Strategy',
      content: 'Choose a trading strategy from the dropdown. Strategies are updated daily with the latest performance data.',
      placement: 'right',
      showProFeatures: false,
      findElement: () => {
        // Make sure we're on the single strategy tab
        const singleTab = document.querySelector('.risk-tab.active');
        if (singleTab && (singleTab.textContent.includes('Account Blowout') || singleTab.textContent.includes('30% Rule'))) {
          return document.querySelector('.form-select');
        }
        return null;
      }
    },
    {
      target: '.input-form',
      title: 'Enter Account Details',
      content: 'Fill in your account size, number of contracts, contract type (NQ or MNQ), and max trailing drawdown. Then click "Analyze Risk".',
      placement: 'left',
      showProFeatures: false,
      findElement: () => {
        // Make sure we're on the single strategy tab
        const singleTab = document.querySelector('.risk-tab.active');
        if (singleTab && (singleTab.textContent.includes('Account Blowout') || singleTab.textContent.includes('30% Rule'))) {
          return document.querySelector('.input-form');
        }
        return null;
      }
    },
    {
      target: '.risk-tab',
      title: 'Bulk Risk Calculator (Pro)',
      content: 'Pro users can analyze up to 40 accounts at once! Click the "Bulk Risk" tab to see the bulk calculator. You\'ll need to sign in and upgrade to Pro to use it.',
      placement: 'bottom',
      showProFeatures: true,
      findElement: () => {
        const tabs = document.querySelectorAll('.risk-tab');
        return Array.from(tabs).find(tab => 
          tab.textContent.includes('Bulk') && tab.querySelector('.pro-badge-inline')
        );
      }
    },
    {
      target: '.risk-tab',
      title: 'CSV Upload (Pro)',
      content: 'Upload NinjaTrader CSV exports for automatic analysis! Perfect for managing multiple accounts. Requires Pro subscription.',
      placement: 'bottom',
      showProFeatures: true,
      findElement: () => {
        const tabs = document.querySelectorAll('.risk-tab');
        return Array.from(tabs).find(tab => 
          tab.textContent.includes('CSV') && tab.querySelector('.pro-badge-inline')
        );
      }
    },
    {
      target: '.hamburger-btn',
      title: 'Menu & Navigation',
      content: 'Access all features from here: Account settings, FAQ, About, and more. You can also reopen this tutorial anytime!',
      placement: 'bottom',
      showProFeatures: false
    },
    {
      target: '.header-sign-in-desktop, .google-sign-in-button',
      title: 'Sign In with Google',
      content: 'Sign in to save your preferences, access Pro features, and get email summaries of your risk analysis.',
      placement: 'bottom',
      showProFeatures: false
    }
];

function GuidedTour({ isOpen, onClose, user }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [showVideo, setShowVideo] = useState(true); // Show video by default on welcome step
  const overlayRef = useRef(null);
  const tooltipRef = useRef(null);

  // Use the stable steps array from module scope
  const steps = STEPS;

  const handleClose = useCallback(() => {
    // Save progress for signed-in users
    if (user?.email) {
      localStorage.setItem(`tour_progress_${user.email}`, currentStep.toString());
      localStorage.setItem(`tour_completed_${user.email}`, 'true');
    } else {
      localStorage.setItem('tour_completed', 'true');
    }
    
    setHighlightedElement(null);
    setCurrentStep(0);
    onClose();
  }, [user, currentStep, onClose]);

  const updateTooltipPosition = useCallback((element, placement) => {
    if (placement === 'center') {
      // Already handled in highlightStep
      return;
    }

    if (!element || !tooltipRef.current) return;

    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'bottom':
        top = rect.bottom + scrollY + 10;
        left = rect.left + scrollX + (rect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'top':
        top = rect.top + scrollY - tooltipRect.height - 10;
        left = rect.left + scrollX + (rect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'right':
        top = rect.top + scrollY + (rect.height / 2) - (tooltipRect.height / 2);
        left = rect.right + scrollX + 10;
        break;
      case 'left':
        top = rect.top + scrollY + (rect.height / 2) - (tooltipRect.height / 2);
        left = rect.left + scrollX - tooltipRect.width - 10;
        break;
      default:
        top = rect.bottom + scrollY + 10;
        left = rect.left + scrollX + (rect.width / 2) - (tooltipRect.width / 2);
    }

    // Keep tooltip in viewport
    const padding = 20;
    if (left < padding) left = padding;
    if (left + tooltipRect.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltipRect.width - padding;
    }
    if (top < padding) top = padding;
    if (top + tooltipRect.height > window.innerHeight + scrollY - padding) {
      top = rect.top + scrollY - tooltipRect.height - 10;
    }

    setTooltipPosition({ top, left });
  }, []);

  const highlightStep = useCallback((stepIndex) => {
    const step = steps[stepIndex];
    if (!step) return;

    // Wait for element to be available
    setTimeout(() => {
      // Special handling for centered steps (no target element)
      if (!step.target && step.placement === 'center') {
        setHighlightedElement(null);
        // Position will be handled by CSS transform
        setTooltipPosition({
          top: window.innerHeight / 2,
          left: window.innerWidth / 2
        });
        return;
      }

      let element = null;
      
      // Use custom findElement function if provided
      if (step.findElement) {
        element = step.findElement();
      } else if (step.target) {
        element = document.querySelector(step.target);
      }

      if (element) {
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        
        // Wait for scroll to complete
        setTimeout(() => {
          setHighlightedElement(element);
          updateTooltipPosition(element, step.placement);
        }, 300);
      } else {
        // Element not found - skip this step
        console.log(`Tour step ${stepIndex} element not found, skipping...`);
        if (stepIndex < steps.length - 1) {
          // Try next step after a short delay
          setTimeout(() => {
            setCurrentStep(stepIndex + 1);
          }, 200);
        } else {
          handleClose();
        }
      }
    }, 100);
  }, [steps, handleClose, updateTooltipPosition, setTooltipPosition]);

  useEffect(() => {
    if (!isOpen) return;

    // Start the tour
    setCurrentStep(0);
    setShowVideo(true); // Show video on welcome step
    highlightStep(0);

    // Handle escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose, highlightStep]);

  // Reset showVideo when step changes
  useEffect(() => {
    if (currentStep === 0) {
      setShowVideo(true);
    } else {
      setShowVideo(false);
    }
  }, [currentStep]);

  useEffect(() => {
    if (isOpen && currentStep < steps.length) {
      highlightStep(currentStep);
    }
  }, [currentStep, isOpen, highlightStep, steps.length]);

  // Handle window resize and scroll
  useEffect(() => {
    if (!isOpen || !highlightedElement) return;

    const handleResize = () => {
      updateTooltipPosition(highlightedElement, steps[currentStep]?.placement || 'bottom');
    };

    const handleScroll = () => {
      if (highlightedElement) {
        updateTooltipPosition(highlightedElement, steps[currentStep]?.placement || 'bottom');
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, highlightedElement, currentStep, updateTooltipPosition, steps]);

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

  const handleSkip = () => {
    handleClose();
  };

  if (!isOpen || currentStep >= steps.length) return null;

  const step = steps[currentStep];
  if (!step) return null;

  const isWelcomeStep = currentStep === 0 && steps[0]?.placement === 'center';

  return (
    <>
      {/* Overlay with cutout - hide for welcome step */}
      {!isWelcomeStep && (
        <div 
          ref={overlayRef}
          className="tour-overlay"
          onClick={handleClose}
        >
          {highlightedElement && (
            <div
              className="tour-highlight"
              style={{
                top: highlightedElement.getBoundingClientRect().top + window.scrollY - 4,
                left: highlightedElement.getBoundingClientRect().left + window.scrollX - 4,
                width: highlightedElement.getBoundingClientRect().width + 8,
                height: highlightedElement.getBoundingClientRect().height + 8,
              }}
            />
          )}
        </div>
      )}
      
      {/* Welcome overlay - lighter for welcome step */}
      {isWelcomeStep && (
        <div 
          className="tour-overlay tour-overlay-welcome"
          onClick={(e) => {
            // Don't close on overlay click for welcome
            e.stopPropagation();
          }}
        />
      )}

      {/* Tooltip */}
      {(highlightedElement || steps[currentStep]?.placement === 'center') && (
        <div
          ref={tooltipRef}
          className={`tour-tooltip ${steps[currentStep]?.placement === 'center' ? 'tour-tooltip-centered tour-tooltip-welcome' : ''}`}
          style={{
            top: steps[currentStep]?.placement === 'center' 
              ? '50%' 
              : `${tooltipPosition.top}px`,
            left: steps[currentStep]?.placement === 'center' 
              ? '50%' 
              : `${tooltipPosition.left}px`,
            transform: steps[currentStep]?.placement === 'center' 
              ? 'translate(-50%, -50%)' 
              : 'none',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {isWelcomeStep && !showVideo ? (
            <>
              <div className="tour-tooltip-header">
                <div className="tour-welcome-icon">👋</div>
                <h3 className="tour-tooltip-title tour-welcome-title">{step.title}</h3>
                <button className="tour-tooltip-close" onClick={handleClose}>×</button>
              </div>
              <div className="tour-tooltip-content tour-welcome-content">
                <p>{step.content}</p>
                <div className="tour-welcome-options">
                  <button 
                    className="tour-btn tour-btn-video" 
                    onClick={() => setShowVideo(true)}
                  >
                    📹 Watch Video Tutorial
                  </button>
                  <button 
                    className="tour-btn tour-btn-primary tour-btn-tour" 
                    onClick={handleNext}
                  >
                    🚀 Take Interactive Tour
                  </button>
                </div>
              </div>
              <div className="tour-tooltip-footer">
                <button className="tour-btn tour-btn-skip" onClick={handleSkip}>
                  Skip for now
                </button>
              </div>
            </>
          ) : isWelcomeStep && showVideo ? (
            <>
              <div className="tour-tooltip-header tour-tooltip-header-centered">
                <h3 className="tour-tooltip-title tour-tooltip-title-centered">Watch the Video Tutorial!</h3>
                <button className="tour-tooltip-close" onClick={() => setShowVideo(false)}>×</button>
              </div>
              <div className="tour-tooltip-content tour-video-content">
                <div className="tour-video-wrapper">
                  <iframe
                    width="100%"
                    height="315"
                    src="https://www.youtube.com/embed/V03_3pfUXCQ"
                    title="RiskLo Tutorial"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="tour-welcome-options" style={{ marginTop: '1rem' }}>
                  <button 
                    className="tour-btn tour-btn-primary tour-btn-tour" 
                    onClick={() => {
                      setShowVideo(false);
                      handleNext();
                    }}
                  >
                    🚀 Take Interactive Tour Instead
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="tour-tooltip-header">
                <h3 className="tour-tooltip-title">{step.title}</h3>
                <button className="tour-tooltip-close" onClick={handleClose}>×</button>
              </div>
              <div className="tour-tooltip-content">
                <p>{step.content}</p>
              </div>
              <div className="tour-tooltip-footer">
                <div className="tour-progress">
                  {currentStep + 1} / {steps.length}
                </div>
                <div className="tour-tooltip-actions">
                  {currentStep > 0 && (
                    <button className="tour-btn tour-btn-secondary" onClick={handlePrevious}>
                      Previous
                    </button>
                  )}
                  <button className="tour-btn tour-btn-skip" onClick={handleSkip}>
                    Skip
                  </button>
                  <button className="tour-btn tour-btn-primary" onClick={handleNext}>
                    {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default GuidedTour;

