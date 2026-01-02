import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import InputForm from './components/InputForm';
import UpgradeModal from './components/UpgradeModal';
import BulkRiskCalculator from './components/BulkRiskCalculator';
import CsvUpload from './components/CsvUpload';
import Footer from './components/Footer';
import HamburgerMenu from './components/HamburgerMenu';
import DisclaimerModal from './components/DisclaimerModal';
import GoogleSignIn from './components/GoogleSignIn';
import GooglePicker from './components/GooglePicker';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import About from './pages/About';
import FAQ from './pages/FAQ';
import HowWeCalculate from './pages/HowWeCalculate';
import Apex30PercentRule from './pages/Apex30PercentRule';
import HowToExportCsv from './pages/HowToExportCsv';
import Account from './pages/Account';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import DesktopAppGuide from './pages/DesktopAppGuide';
import ResultsDashboard from './pages/ResultsDashboard';
import { API_BASE_URL, API_ENDPOINTS } from './config';
import { IconChart } from './components/Icons';

function AppContent() {
  const { user, isPro, isDevMode, refreshProStatus, handleGoogleSignIn } = useAuth();
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('currentPage') || 'home';
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true); // Will be updated in useEffect
  const [riskMode, setRiskMode] = useState(() => {
    return localStorage.getItem('riskMode') || 'risk'; // 'risk' or 'apexMae'
  });
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [riskMetrics, setRiskMetrics] = useState(null); // Metrics for Risk mode
  const [apexMaeMetrics, setApexMaeMetrics] = useState(null); // Metrics for 30% Drawdown mode
  const [mobileProTab, setMobileProTab] = useState('bulk'); // 'bulk' or 'csv' - for mobile tabs only
  const [lastFormData, setLastFormData] = useState(null); // Store last form data for calculations
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [loadingSheets, setLoadingSheets] = useState(true);
  const [sheetsConnectUrl, setSheetsConnectUrl] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerEmail, setPickerEmail] = useState(null);
  const pickerShownRef = useRef(false); // prevent duplicate picker shows
  
  // Vector Results Spreadsheet ID (should match backend RESULTS_SPREADSHEET_ID)
  const RESULTS_SPREADSHEET_ID = '1rqGGpl5SJ_34L72yCCcSZIoUrD_ggGn5LfJ_BGFjDQY';

  // Get current metrics based on mode
  const metrics = riskMode === 'risk' ? riskMetrics : apexMaeMetrics;

  // Scroll to top when page changes & persist current page
  useEffect(() => {
    window.scrollTo(0, 0);
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  // Persist risk mode
  useEffect(() => {
    localStorage.setItem('riskMode', riskMode);
  }, [riskMode]);

  // Apply theme to body
  useEffect(() => {
    const root = document.body;
    root.classList.remove('light-mode', 'dark-mode');
    root.classList.add(`${theme}-mode`);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Check URL parameters on mount for direct navigation (for Google verification)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    if (page) {
      setCurrentPage(page);
    }
  }, []);

  // Allow components like Footer to navigate via a simple global event
  useEffect(() => {
    const handler = (e) => {
      const page = e?.detail;
      if (typeof page === 'string' && page.length > 0) {
        setCurrentPage(page);
      }
    };
    window.addEventListener('navigate', handler);
    return () => window.removeEventListener('navigate', handler);
  }, []);

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

  const fetchSheetNames = useCallback(async () => {
    setLoadingSheets(true);
    setSheetsConnectUrl(null);

    try {
      const url = user?.email
        ? `${API_ENDPOINTS.sheets}?email=${encodeURIComponent(user.email)}`
        : API_ENDPOINTS.sheets;

      console.log('Fetching from:', url);
      const response = await fetch(url);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Special handling for user-based OAuth gating
        if (data?.requiresOAuth) {
          setSheetNames(data.sampleSheets || []);
          setSheetsConnectUrl(data.authUrl || null);
          setError(data.error || 'Connect Google to load strategies from the Results Spreadsheet.');
          return;
        }
        throw new Error(data?.error || `Server returned ${response.status}: ${response.statusText}`);
      }

      if (data.success) {
        setSheetNames(data.sheets || []);
        if ((data.sheets || []).length === 0) {
          setError('No strategies found.');
        } else {
          setError(null);
        }
      } else {
        setError(data.error || 'Failed to load strategies');
      }
    } catch (err) {
      console.error('Failed to fetch sheet names:', err);
      console.error('API URL:', API_ENDPOINTS.sheets);
      console.error('Hostname:', window.location.hostname);

      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        setError(`Failed to connect to server at ${API_ENDPOINTS.sheets}. Make sure the backend is running and accessible from your network.`);
      } else {
        setError(err.message || 'Failed to connect to server. Make sure the backend is running.');
      }
    } finally {
      setLoadingSheets(false);
    }
  }, [user?.email]);

  // Auto-start the Sheets connect flow once per session after sign-in (if needed)
  // Skip if user already has strategies loaded (file ID already stored on backend)
  useEffect(() => {
    if (!user?.email) return;
    if (!sheetsConnectUrl) return;
    
    // CRITICAL: If we already have more than just the "Sample Strategy", 
    // it means we are already successfully connected to a real sheet.
    // DO NOT show the picker or redirect in this case.
    if (sheetNames.length > 1) {
      console.log('✅ Strategies already loaded, skipping auto-connect/picker');
      return;
    }

    const key = `risklo_sheets_autoconnect_${user.email}`;
    if (sessionStorage.getItem(key) === 'true') return;
    sessionStorage.setItem(key, 'true');

    const fullUrl = sheetsConnectUrl.startsWith('http')
      ? sheetsConnectUrl
      : `${API_BASE_URL}${sheetsConnectUrl}`;

    // Full page redirect is allowed; this is the cleanest "automatic" flow.
    window.location.href = fullUrl;
  }, [user?.email, sheetsConnectUrl, sheetNames.length]);

  // Fetch sheet names on mount and when signed-in user changes
  useEffect(() => {
    fetchSheetNames();
  }, [fetchSheetNames]);

  // Handle combined sign-in + Sheets OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const signIn = params.get('signIn');
    const connect = params.get('sheetsConnect');
    const showPickerParam = params.get('showPicker');
    const email = params.get('email');
    const userInfoStr = params.get('userInfo');

    // If this was a combined sign-in + Sheets flow with picker (drive.file scope)
    if (signIn === 'success' && connect === 'success' && showPickerParam === 'true' && userInfoStr && email && !pickerShownRef.current) {
      console.log('🔐 OAuth callback: Combined sign-in + picker flow detected');
      pickerShownRef.current = true; // prevent duplicate
      try {
        const userInfo = JSON.parse(decodeURIComponent(userInfoStr));
        // FIRST: sign the user in
        handleGoogleSignIn(userInfo);
        // THEN: show picker after a short delay
        setTimeout(() => {
          console.log('🎨 Showing picker for email:', email);
          setPickerEmail(email);
          setShowPicker(true);
        }, 100);
      } catch (err) {
        console.error('Error parsing user info from OAuth callback:', err);
        // Still show picker even if parse fails
        console.log('🎨 Showing picker (fallback) for email:', email);
        setPickerEmail(email);
        setShowPicker(true);
      }
      // Clear query params
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    // If picker should be shown (after OAuth with drive.file scope, no sign-in info)
    if (showPickerParam === 'true' && email && !pickerShownRef.current) {
      console.log('🎨 OAuth callback: Picker-only flow detected for email:', email);
      pickerShownRef.current = true; // prevent duplicate
      setPickerEmail(email);
      setShowPicker(true);
      // Clear query params
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    // If this was a combined sign-in + Sheets flow (legacy flow without picker)
    if (signIn === 'success' && connect === 'success' && userInfoStr && !showPickerParam) {
      try {
        const userInfo = JSON.parse(decodeURIComponent(userInfoStr));
        // Set user in AuthContext (this will trigger Pro status check)
        handleGoogleSignIn(userInfo); // Pass as object
        // Refresh strategies
        fetchSheetNames();
        // Clear query params
        window.history.replaceState({}, '', window.location.pathname);
      } catch (err) {
        console.error('Error parsing user info from OAuth callback:', err);
        // Still refresh strategies if Sheets connected
        fetchSheetNames();
        window.history.replaceState({}, '', window.location.pathname);
      }
      return;
    }

    // If user just finished Google Sheets connect flow (separate flow)
    if (connect === 'success' && !signIn && !showPickerParam) {
      // Refresh strategies and clear query params
      fetchSheetNames();
      params.delete('sheetsConnect');
      params.delete('email');
      const newQuery = params.toString();
      const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ''}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [fetchSheetNames, handleGoogleSignIn]);

  // Handle file selection from Google Picker
  const handleFileSelected = useCallback((fileId) => {
    console.log('🎯 handleFileSelected called with fileId:', fileId);
    // Reset picker flag
    pickerShownRef.current = false;
    console.log('🔒 Reset pickerShownRef to false');
    
    // Immediately hide the picker component to unblock UI
    setShowPicker(false);
    setPickerEmail(null);
    console.log('👻 Hidden picker, set showPicker=false, pickerEmail=null');
    
    // Small delay to ensure picker is fully closed before refreshing
    setTimeout(() => {
      console.log('⏰ Timeout elapsed, calling fetchSheetNames...');
      fetchSheetNames().catch(err => {
        console.error('Error refreshing sheet names:', err);
      });
    }, 300);
  }, [fetchSheetNames]);

  const handlePickerCancel = useCallback(() => {
    console.log('❌ handlePickerCancel called');
    pickerShownRef.current = false;
    // Delay hiding to let the picker close gracefully
    setTimeout(() => {
      setShowPicker(false);
      setPickerEmail(null);
      console.log('👻 Picker cancelled and hidden');
    }, 500);
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
          userEmail: user?.email || null,
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
    setCurrentPage('home');
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
      case 'privacy-policy':
        return <PrivacyPolicy onNavigate={setCurrentPage} />;
      case 'results':
        return (
          <ResultsDashboard 
            onNavigate={setCurrentPage} 
            user={user}
            sheetNames={sheetNames}
            loadingSheets={loadingSheets}
            sheetsConnectUrl={sheetsConnectUrl}
            error={error}
          />
        );
      case 'home':
      default:
        return (
          <>
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <InputForm 
              onSubmit={handleAnalyze} 
              loading={loading}
              sheetNames={sheetNames}
              loadingSheets={loadingSheets}
              error={error && sheetNames.length === 0 ? error : null}
              riskMode={riskMode}
              onNavigate={setCurrentPage}
              sheetsConnectUrl={sheetsConnectUrl}
              userEmail={user?.email || null}
            />
            
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
                sheetsConnectUrl={sheetsConnectUrl}
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
      {showPicker && pickerEmail && (
        <GooglePicker
          userEmail={pickerEmail}
          spreadsheetId={RESULTS_SPREADSHEET_ID}
          onFileSelected={handleFileSelected}
          onCancel={handlePickerCancel}
        />
      )}
      {showDisclaimer && (
        <DisclaimerModal onAccept={handleDisclaimerAccept} />
      )}
      
      <HamburgerMenu 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        onUpgrade={() => setShowUpgradeModal(true)}
        isPro={isPro}
        isDevMode={isDevMode}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />
      
      {(currentPage === 'home' || currentPage === 'results') && (
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
                  className={`mode-toggle-btn ${currentPage === 'home' && riskMode === 'risk' ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentPage('home');
                    handleModeChange('risk');
                  }}
                >
                  Drawdown Risk
                </button>
                <button
                  className={`mode-toggle-btn ${currentPage === 'home' && riskMode === 'apexMae' ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentPage('home');
                    handleModeChange('apexMae');
                  }}
                >
                  30% Rule
                </button>
                <button
                  className={`mode-toggle-btn ${currentPage === 'results' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('results')}
                >
                  Results
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
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
