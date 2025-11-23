import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import InputForm from './components/InputForm';

function App() {
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
            setError('No algorithms found. Make sure the Google Sheet is shared with the service account.');
          }
        } else {
          setError(data.error || 'Failed to load algorithms');
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

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">RiskLo</h1>
          <p className="app-subtitle">Algorithm Risk Assessment Dashboard</p>
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
        </div>
      </main>
    </div>
  );
}

export default App;
