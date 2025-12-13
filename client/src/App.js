import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import InputForm from './components/InputForm';
import UpgradeModal from './components/UpgradeModal';
import BulkRiskCalculator from './components/BulkRiskCalculator';
import CsvUpload from './components/CsvUpload';
import Footer from './components/Footer';
import HamburgerMenu from './components/HamburgerMenu';
import DisclaimerModal from './components/DisclaimerModal';
import PasswordModal from './components/PasswordModal';
import GoogleSignIn from './components/GoogleSignIn';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import About from './pages/About';
import FAQ from './pages/FAQ';
import HowWeCalculate from './pages/HowWeCalculate';
import Apex30PercentRule from './pages/Apex30PercentRule';
import HowToExportCsv from './pages/HowToExportCsv';
import Account from './pages/Account';
import TermsAndConditions from './pages/TermsAndConditions';
import DesktopAppGuide from './pages/DesktopAppGuide';
import { API_ENDPOINTS } from './config';
import { IconChart } from './components/Icons';

function AppContent() {
  const { user, isPro, isDevMode, refreshProStatus } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true); // Will be updated in useEffect
  const [riskMode, setRiskMode] = useState('risk'); // 'risk' or 'apexMae'
  const [riskMetrics, setRiskMetrics] = useState(null); // Metrics for Risk mode
  const [apexMaeMetrics, setApexMaeMetrics] = useState(null); // Metrics for 30% Drawdown mode
  const [mobileProTab, setMobileProTab] = useState('bulk'); // 'bulk' or 'csv' - for mobile tabs only
  const [lastFormData, setLastFormData] = useState(null); // Store last form data for calculations
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [loadingSheets, setLoadingSheets] = useState(true);

  // Get current metrics based on mode
  const metrics = riskMode === 'risk' ? riskMetrics : apexMaeMetrics;

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Check disclaimer acceptance on mount and when user changes
  useEffect(() => {
    if (!user) {
      // Always show disclaimer for non-logged-in users
      setShowDisclaimer(true);
    } else {
      // Check if logged-in user has accepted
      const userAcceptance = localStorage.getItem(`disclaimer_accepted_${user.email}`);
      const hasAccepted = userAcceptance === 'true';
      setShowDisclaimer(!hasAccepted);
    }
  }, [user]);

  useEffect(() => {
    // Fetch sheet names on component mount
    const fetchSheetNames = async () => {
      try {
        console.log('Fetching from:', API_ENDPOINTS.sheets);
        const response = await fetch(API_ENDPOINTS.sheets);
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (data.success) {
          setSheetNames(data.sheets);
          if (data.sheets.length === 0) {
            setError('No strategies found. Make sure the Google Sheet is shared with the service account.');
          }
        } else {
          setError(data.error || 'Failed to load strategies');
        }
      } catch (err) {
        console.error('Failed to fetch sheet names:', err);
        console.error('API URL:', API_ENDPOINTS.sheets);
        console.error('Hostname:', window.location.hostname);
        
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          setError(`Failed to connect to server at ${API_ENDPOINTS.sheets}. Make sure the backend is running and accessible from your network.`);
        } else {
          setError(err.message || 'Failed to connect to server. Make sure the backend is running.');
        }
      } finally {
        setLoadingSheets(false);
      }
    };
    fetchSheetNames();
  }, []);

  const handleAnalyze = async (formData) => {
    setLoading(true);
    setError(null);
    setLastFormData(formData); // Store form data for calculation details
    
    try {
      const response = await fetch(API_ENDPOINTS.analyze, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          startOfDayProfit: formData.startOfDayProfit || null,
          safetyNet: formData.safetyNet || null,
          profitSinceLastPayout: formData.profitSinceLastPayout || null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze data');
      }

      // Store metrics based on current mode
      if (riskMode === 'risk') {
        setRiskMetrics(data.metrics);
      } else {
        setApexMaeMetrics(data.metrics);
      }
    } catch (err) {
      setError(err.message);
      // Clear metrics for current mode on error
      if (riskMode === 'risk') {
        setRiskMetrics(null);
      } else {
        setApexMaeMetrics(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Clear metrics when switching modes
  const handleModeChange = (newMode) => {
    setRiskMode(newMode);
    // Don't clear metrics - let user see they need to analyze for the new mode
  };

  // Handle checkout success (check URL params)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get('checkout');
    const sessionId = params.get('session_id');

    if (checkout === 'success' && sessionId && user?.email) {
      // Verify the session and refresh Pro status
      fetch(API_ENDPOINTS.verifySession(sessionId))
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            refreshProStatus();
            // Clean up URL
            window.history.replaceState({}, '', window.location.pathname);
          }
        })
        .catch((error) => {
          console.error('Error verifying session:', error);
        });
    }
  }, [user, refreshProStatus]);

  const renderPage = () => {
    switch (currentPage) {
      case 'about':
        return <About onNavigate={setCurrentPage} />;
      case 'how-we-calculate':
        return <HowWeCalculate onNavigate={setCurrentPage} />;
      case 'faq':
        return <FAQ onNavigate={setCurrentPage} />;
      case 'apex-30-percent-rule':
        return <Apex30PercentRule onNavigate={setCurrentPage} />;
      case 'how-to-export-csv':
        return <HowToExportCsv onNavigate={setCurrentPage} />;
      case 'desktopAppGuide':
        return <DesktopAppGuide onNavigate={setCurrentPage} />;
      case 'account':
        return <Account onNavigate={setCurrentPage} onUpgrade={() => setShowUpgradeModal(true)} />;
      case 'terms-and-conditions':
        return <TermsAndConditions onNavigate={setCurrentPage} />;
      case 'home':
      default:
        return (
          <>
            <InputForm 
              onSubmit={handleAnalyze} 
              loading={loading}
              sheetNames={sheetNames}
              loadingSheets={loadingSheets}
              error={error && sheetNames.length === 0 ? error : null}
              riskMode={riskMode}
              onNavigate={setCurrentPage}
            />
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            {metrics ? (
              <Dashboard metrics={metrics} riskMode={riskMode} onNavigate={setCurrentPage} formData={lastFormData} />
            ) : (
              <div className="no-results-message">
                <div className="no-results-content">
                  <div className="no-results-icon"><IconChart size={64} /></div>
                  <h3 className="no-results-title">
                    {riskMode === 'risk' ? 'Risk Results' : '30% Drawdown Results'}
                  </h3>
                  <p className="no-results-text">
                    {riskMode === 'risk' 
                      ? 'Analyze your strategy to see risk assessment results.'
                      : 'Analyze your strategy to see 30% Drawdown rule results.'}
                  </p>
                </div>
              </div>
            )}

            {/* Mobile Tabs - Only visible on mobile */}
            <div className="pro-features-tabs-mobile">
              <button 
                className={`pro-tab ${mobileProTab === 'bulk' ? 'active' : ''}`}
                onClick={() => setMobileProTab('bulk')}
              >
                Bulk Risk
              </button>
              <button 
                className={`pro-tab ${mobileProTab === 'csv' ? 'active' : ''}`}
                onClick={() => setMobileProTab('csv')}
              >
                CSV Upload
              </button>
            </div>

            {/* Bulk Risk Calculator - Hidden on mobile when CSV tab is active */}
            <div className={`pro-feature-section ${mobileProTab === 'bulk' ? 'mobile-active' : ''}`}>
              <BulkRiskCalculator 
                isPro={isPro}
                sheetNames={sheetNames}
                riskMode={riskMode}
                onUpgrade={() => setShowUpgradeModal(true)}
                onPopulateRows={(setRowsFn) => {
                  // Store the setRows function so CsvUpload can use it
                  // The function accepts (rows, csvFileNames) parameters
                  window.bulkCalculatorSetRows = setRowsFn;
                }}
              />
            </div>

            {/* CSV Upload - Hidden on mobile when Bulk tab is active */}
            <div className={`pro-feature-section ${mobileProTab === 'csv' ? 'mobile-active' : ''}`}>
              <CsvUpload 
                isPro={isPro}
                sheetNames={sheetNames}
                riskMode={riskMode}
                onNavigate={setCurrentPage}
                onUpgrade={() => setShowUpgradeModal(true)}
                onPopulateBulkRows={(rows, csvFileNames) => {
                  // Populate bulk calculator rows with CSV file names
                  if (window.bulkCalculatorSetRows) {
                    window.bulkCalculatorSetRows(rows, csvFileNames);
                  }
                }}
                onSwitchToBulkTab={() => {
                  // Switch to bulk tab on mobile after successful parse
                  setMobileProTab('bulk');
                }}
              />
            </div>
          </>
        );
    }
  };

  const handleDisclaimerAccept = () => {
    // Store acceptance in localStorage
    if (user?.email) {
      // Store user-specific acceptance
      localStorage.setItem(`disclaimer_accepted_${user.email}`, 'true');
      localStorage.setItem(`disclaimer_accepted_date_${user.email}`, new Date().toISOString());
      setShowDisclaimer(false);
    } else {
      // For non-logged-in users, don't store acceptance - always show on next visit
      // Just close the modal for this session
      setShowDisclaimer(false);
    }
  };


  return (
    <div className="App">
      {showDisclaimer && (
        <DisclaimerModal onAccept={handleDisclaimerAccept} />
      )}
      
      <HamburgerMenu 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        onUpgrade={() => setShowUpgradeModal(true)}
        isPro={isPro}
        isDevMode={isDevMode}
      />
      
      {currentPage === 'home' && (
        <header className="app-header">
          <div className="header-content">
            <div className="header-left">
              <div className="header-sign-in-mobile">
                <GoogleSignIn onNavigate={setCurrentPage} />
              </div>
              <div className="title-with-badge">
                <h1 className="app-title">RiskLo</h1>
                <span className={`header-badge ${isPro ? 'pro-badge-header' : 'basic-badge-header'}`}>
                  {isPro ? 'Pro' : 'Basic'}
                </span>
              </div>
              <p className="app-subtitle">Strategy Risk Assessment Dashboard</p>
            </div>
            <div className="header-center">
              <div className="mode-toggle-container">
                <button
                  className={`mode-toggle-btn ${riskMode === 'risk' ? 'active' : ''}`}
                  onClick={() => handleModeChange('risk')}
                >
                  Drawdown Risk
                </button>
                <button
                  className={`mode-toggle-btn ${riskMode === 'apexMae' ? 'active' : ''}`}
                  onClick={() => handleModeChange('apexMae')}
                >
                  30% Rule
                </button>
              </div>
            </div>
            <div className="header-right">
              <div className={`header-sign-in-desktop ${user ? 'signed-in' : ''}`}>
                <GoogleSignIn onNavigate={setCurrentPage} />
              </div>
            </div>
          </div>
      </header>
      )}
      
      <main className="app-main">
        <div className="container">
          {renderPage()}
        </div>
      </main>

      <Footer />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        user={user}
        isPro={isPro}
      />
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => {
    // Check if user is already authenticated in this session
    return sessionStorage.getItem('risklo_authenticated') === 'true';
  });

  // Show password modal if not authenticated
  if (!isAuthenticated) {
    return (
      <PasswordModal
        isOpen={true}
        onPasswordCorrect={() => setIsAuthenticated(true)}
      />
    );
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
