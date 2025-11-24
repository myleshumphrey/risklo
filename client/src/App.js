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
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [loadingSheets, setLoadingSheets] = useState(true);

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

      setMetrics(data.metrics);
    } catch (err) {
      setError(err.message);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
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
            
            {metrics && <Dashboard metrics={metrics} riskMode={riskMode} onNavigate={setCurrentPage} />}

            <BulkRiskCalculator 
              isPro={isPro}
              sheetNames={sheetNames}
              riskMode={riskMode}
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
      <HamburgerMenu currentPage={currentPage} onNavigate={setCurrentPage} />
      
      {currentPage === 'home' && (
        <header className="app-header">
          <div className="header-content">
            <div className="header-left">
              <h1 className="app-title">RiskLo</h1>
              <p className="app-subtitle">Strategy Risk Assessment Dashboard</p>
            </div>
            <div className="header-center">
              <div className="mode-toggle-container">
                <button
                  className={`mode-toggle-btn ${riskMode === 'risk' ? 'active' : ''}`}
                  onClick={() => setRiskMode('risk')}
                >
                  Risk
                </button>
                <button
                  className={`mode-toggle-btn ${riskMode === 'apexMae' ? 'active' : ''}`}
                  onClick={() => setRiskMode('apexMae')}
                >
                  30% Drawdown
                </button>
              </div>
            </div>
            <div className="header-right">
              {isPro ? (
                <span className="pro-badge">RiskLo Pro</span>
              ) : (
                <button 
                  className="upgrade-header-btn"
                  onClick={() => setShowUpgradeModal(true)}
                >
                  Upgrade to RiskLo Pro
                </button>
              )}
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
