import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import InputForm from './components/InputForm';
import UpgradeModal from './components/UpgradeModal';
import BulkRiskCalculator from './components/BulkRiskCalculator';
import CsvUpload from './components/CsvUpload';
import Footer from './components/Footer';
import HamburgerMenu from './components/HamburgerMenu';
import About from './pages/About';
import FAQ from './pages/FAQ';
import HowWeCalculate from './pages/HowWeCalculate';
import Apex30PercentRule from './pages/Apex30PercentRule';
import HowToExportCsv from './pages/HowToExportCsv';
import { API_ENDPOINTS } from './config';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isPro, setIsPro] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [riskMode, setRiskMode] = useState('risk'); // 'risk' or 'apexMae'
  const [riskMetrics, setRiskMetrics] = useState(null); // Metrics for Risk mode
  const [apexMaeMetrics, setApexMaeMetrics] = useState(null); // Metrics for 30% Drawdown mode
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [loadingSheets, setLoadingSheets] = useState(true);

  // Get current metrics based on mode
  const metrics = riskMode === 'risk' ? riskMetrics : apexMaeMetrics;

  useEffect(() => {
    // Fetch sheet names on component mount
    const fetchSheetNames = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.sheets);
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
        setError('Failed to connect to server. Make sure the backend is running.');
      } finally {
        setLoadingSheets(false);
      }
    };
    fetchSheetNames();
  }, []);

  const handleAnalyze = async (formData) => {
    setLoading(true);
    setError(null);
    
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

  const handleUpgrade = () => {
    setIsPro(true);
    setShowUpgradeModal(false);
  };

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
              <Dashboard metrics={metrics} riskMode={riskMode} onNavigate={setCurrentPage} />
            ) : (
              <div className="no-results-message">
                <div className="no-results-content">
                  <div className="no-results-icon">📊</div>
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

            <BulkRiskCalculator 
              isPro={isPro}
              sheetNames={sheetNames}
              riskMode={riskMode}
              onUpgrade={() => setShowUpgradeModal(true)}
              onPopulateRows={(setRowsFn) => {
                // Store the setRows function so CsvUpload can use it
                window.bulkCalculatorSetRows = setRowsFn;
              }}
            />

            <CsvUpload 
              isPro={isPro}
              sheetNames={sheetNames}
              riskMode={riskMode}
              onNavigate={setCurrentPage}
              onUpgrade={() => setShowUpgradeModal(true)}
              onPopulateBulkRows={(rows) => {
                // Populate bulk calculator rows
                if (window.bulkCalculatorSetRows) {
                  window.bulkCalculatorSetRows(rows);
                }
              }}
            />
          </>
        );
    }
  };

  return (
    <div className="App">
      <HamburgerMenu 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        onUpgrade={() => setShowUpgradeModal(true)}
        isPro={isPro}
      />
      
      {currentPage === 'home' && (
        <header className="app-header">
          <div className="header-content">
            <div className="header-left">
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
                  Risk
                </button>
                <button
                  className={`mode-toggle-btn ${riskMode === 'apexMae' ? 'active' : ''}`}
                  onClick={() => handleModeChange('apexMae')}
                >
                  30% Drawdown
                </button>
              </div>
            </div>
            <div className="header-right">
              {/* Empty - badge moved to header-left */}
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
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}

export default App;
