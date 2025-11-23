import React, { useState } from 'react';
import './InputForm.css';

function InputForm({ onSubmit, loading, sheetNames, loadingSheets, error }) {
  const [formData, setFormData] = useState({
    sheetName: '',
    contractType: 'NQ', // Default to NQ
    accountSize: '',
    contracts: '',
    maxDrawdown: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="input-form-container">
      <form onSubmit={handleSubmit} className="input-form">
        <div className="form-section">
          <h2 className="form-title">Algorithm Risk Assessment</h2>
          <p className="form-description">
            Select an algorithm and configure your trading parameters to assess risk
          </p>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="sheetName" className="form-label">
              Algorithm <span className="required">*</span>
            </label>
            <select
              id="sheetName"
              name="sheetName"
              value={formData.sheetName}
              onChange={handleChange}
              className="form-input form-select"
              required
              disabled={loadingSheets}
            >
              <option value="">{loadingSheets ? 'Loading algorithms...' : sheetNames.length === 0 ? 'No algorithms found' : 'Select an algorithm'}</option>
              {sheetNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <small className="form-hint">
              {error ? (
                <span style={{ color: '#ef4444' }}>{error}</span>
              ) : (
                'Select the algorithm you want to analyze'
              )}
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="contractType" className="form-label">
              Contract Type <span className="required">*</span>
            </label>
            <select
              id="contractType"
              name="contractType"
              value={formData.contractType}
              onChange={handleChange}
              className="form-input form-select"
              required
            >
              <option value="NQ">NQ (Full-size)</option>
              <option value="MNQ">MNQ (Micro - 1/10th value)</option>
            </select>
            <small className="form-hint">
              Select NQ if sheet data is for full-size contracts, or MNQ if it's for micro contracts
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="accountSize" className="form-label">
              Account Size ($) <span className="required">*</span>
            </label>
            <input
              type="number"
              id="accountSize"
              name="accountSize"
              value={formData.accountSize}
              onChange={handleChange}
              placeholder="100000"
              className="form-input"
              required
              min="1"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label htmlFor="contracts" className="form-label">
              Number of Contracts <span className="required">*</span>
            </label>
            <input
              type="number"
              id="contracts"
              name="contracts"
              value={formData.contracts}
              onChange={handleChange}
              placeholder="10"
              className="form-input"
              required
              min="1"
              step="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="maxDrawdown" className="form-label">
              Max Trailing Drawdown ($) <span className="required">*</span>
            </label>
            <input
              type="number"
              id="maxDrawdown"
              name="maxDrawdown"
              value={formData.maxDrawdown}
              onChange={handleChange}
              placeholder="2500"
              className="form-input"
              required
              min="1"
              step="0.01"
            />
            <small className="form-hint">
              Your account's maximum trailing drawdown limit (from NinjaTrader/Apex)
            </small>
          </div>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Analyze Risk'}
        </button>
      </form>
    </div>
  );
}

export default InputForm;

