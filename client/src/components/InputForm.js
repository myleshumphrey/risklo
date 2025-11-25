import React, { useState, useEffect } from 'react';
import './InputForm.css';
import { ACCOUNT_SIZE_PRESETS, DEFAULT_ACCOUNT_SIZE, DEFAULT_THRESHOLD, getThresholdForAccountSize } from '../utils/accountSizes';
import { sortStrategies } from '../utils/strategySort';

function InputForm({ onSubmit, loading, sheetNames, loadingSheets, error, riskMode, onNavigate }) {
  const [formData, setFormData] = useState({
    sheetName: '',
    contractType: 'MNQ', // Default to MNQ
    accountSize: DEFAULT_ACCOUNT_SIZE, // Default to 50K for both modes
    contracts: '',
    maxDrawdown: '',
    currentBalance: '', // For apexMae mode
    startOfDayProfit: '',
    profitSinceLastPayout: '', // Optional: profit since last payout for Windfall Rule
    safetyNet: riskMode === 'apexMae' ? DEFAULT_THRESHOLD : '',
  });

  // Set default account size and safety net when switching to apexMae mode
  useEffect(() => {
    if (riskMode === 'apexMae') {
      setFormData(prev => ({
        ...prev,
        accountSize: prev.accountSize || DEFAULT_ACCOUNT_SIZE,
        safetyNet: prev.safetyNet || DEFAULT_THRESHOLD
      }));
    }
  }, [riskMode]);

  // Update safety net when account size changes in apexMae mode
  useEffect(() => {
    if (riskMode === 'apexMae' && formData.accountSize) {
      const threshold = getThresholdForAccountSize(Number(formData.accountSize));
      if (threshold) {
        setFormData(prev => ({ ...prev, safetyNet: threshold }));
      }
    }
  }, [formData.accountSize, riskMode]);

  // Calculate start-of-day profit when current balance changes
  useEffect(() => {
    if (riskMode === 'apexMae' && formData.currentBalance && formData.accountSize) {
      const currentBalance = Number(formData.currentBalance);
      const accountSize = Number(formData.accountSize);
      const profit = Math.max(0, currentBalance - accountSize);
      setFormData(prev => ({ ...prev, startOfDayProfit: profit }));
    }
  }, [formData.currentBalance, formData.accountSize, riskMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Only send relevant fields based on mode
    const submitData = {
      ...formData,
      maxDrawdown: riskMode === 'risk' ? formData.maxDrawdown : null,
      startOfDayProfit: riskMode === 'apexMae' ? formData.startOfDayProfit : null,
      safetyNet: riskMode === 'apexMae' ? formData.safetyNet : null,
      profitSinceLastPayout: riskMode === 'apexMae' && formData.profitSinceLastPayout ? formData.profitSinceLastPayout : null,
      // Remove currentBalance from submission (it's only for calculation)
      currentBalance: undefined,
    };
    onSubmit(submitData);
  };

  return (
    <>
      {riskMode === 'apexMae' && (
        <div className="apex-rule-link-container">
          <button 
            className="learn-apex-rule-btn"
            onClick={() => onNavigate && onNavigate('apex-30-percent-rule')}
          >
            📚 Learn How the Apex 30% Rule Works
          </button>
        </div>
      )}
      <div className="input-form-container">
        <form onSubmit={handleSubmit} className="input-form">
          <div className="form-section">
            <h2 className="form-title">Strategy Risk Assessment</h2>
            <p className="form-description">
              Select a strategy and configure your trading parameters to assess risk
            </p>
          </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="sheetName" className="form-label">
              Strategy <span className="required">*</span>
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
              <option value="">{loadingSheets ? 'Loading strategies...' : sheetNames.length === 0 ? 'No strategies found' : 'Select a strategy'}</option>
              {sortStrategies(sheetNames).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <small className="form-hint">
              {error ? (
                <span style={{ color: '#ef4444' }}>{error}</span>
              ) : (
                'Select the strategy you want to analyze'
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
              Account Size <span className="required">*</span>
            </label>
            <select
              id="accountSize"
              name="accountSize"
              value={formData.accountSize || DEFAULT_ACCOUNT_SIZE}
              onChange={handleChange}
              className="form-input form-select"
              required
            >
              {ACCOUNT_SIZE_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label} (${preset.value.toLocaleString()})
                </option>
              ))}
            </select>
            <small className="form-hint">
              {riskMode === 'apexMae' 
                ? 'Select your Apex Trader Funding account size.'
                : 'Select your original account size (starting capital). Risk percentages are calculated relative to this amount.'}
            </small>
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

          {riskMode === 'risk' && (
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
          )}

          {riskMode === 'apexMae' && (
            <>
              <div className="form-group">
                <label htmlFor="currentBalance" className="form-label">
                  Current Account Balance ($) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="currentBalance"
                  name="currentBalance"
                  value={formData.currentBalance}
                  onChange={handleChange}
                  placeholder="52500"
                  className="form-input"
                  required={riskMode === 'apexMae'}
                  min="0"
                  step="0.01"
                />
                <small className="form-hint">
                  Your current account balance (e.g., if you started with $50k and now have $52,500, enter 52500)
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="startOfDayProfit" className="form-label">
                  Start-of-Day Profit Balance ($)
                </label>
                <input
                  type="number"
                  id="startOfDayProfit"
                  name="startOfDayProfit"
                  value={formData.startOfDayProfit}
                  readOnly
                  className="form-input"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', cursor: 'not-allowed' }}
                />
                <small className="form-hint">
                  Automatically calculated: Current Balance - Account Size = ${formData.startOfDayProfit || '0.00'}
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="safetyNet" className="form-label">
                  Trailing Threshold / Safety Net ($)
                </label>
                <input
                  type="number"
                  id="safetyNet"
                  name="safetyNet"
                  value={formData.safetyNet}
                  readOnly
                  className="form-input"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', cursor: 'not-allowed' }}
                />
                <small className="form-hint">
                  Automatically set based on your account size (${formData.safetyNet || '0.00'} for {formData.accountSize ? `$${Number(formData.accountSize).toLocaleString()}` : 'selected account'})
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="profitSinceLastPayout" className="form-label">
                  Profit Since Last Payout ($) <span className="optional">(Optional)</span>
                </label>
                <input
                  type="number"
                  id="profitSinceLastPayout"
                  name="profitSinceLastPayout"
                  value={formData.profitSinceLastPayout}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Leave empty to use start-of-day profit"
                  step="0.01"
                  min="0"
                />
                <small className="form-hint">
                  For more accurate Windfall Rule calculation, enter your profit accumulated since your last approved payout. 
                  If left empty, RiskLo will use your start-of-day profit balance.
                </small>
              </div>
            </>
          )}
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
    </>
  );
}

export default InputForm;

