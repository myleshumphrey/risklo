import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import InputForm from './components/InputForm';
import UpgradeModal from './components/UpgradeModal';
import BulkRiskCalculator from './components/BulkRiskCalculator';
import CsvUpload from './components/CsvUpload';

function App() {
  const [isPro, setIsPro] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [loadingSheets, setLoadingSheets] = useState(true);

  useEffect(() => {
    // Fetch sheet names on component mount
    const fetchSheetNames = async () => {
      try {
        const response = await fetch('/api/sheets');
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
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-title">RiskLo</h1>
            <p className="app-subtitle">Strategy Risk Assessment Dashboard</p>
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
      
      <main className="app-main">
        <div className="container">
          <InputForm 
            onSubmit={handleAnalyze} 
            loading={loading}
            sheetNames={sheetNames}
            loadingSheets={loadingSheets}
            error={error && sheetNames.length === 0 ? error : null}
          />
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {metrics && <Dashboard metrics={metrics} />}

          <BulkRiskCalculator 
            isPro={isPro}
            sheetNames={sheetNames}
          />

          <CsvUpload isPro={isPro} />
        </div>
      </main>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}

export default App;
