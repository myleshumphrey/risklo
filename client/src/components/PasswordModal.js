import React, { useState } from 'react';
import './PasswordModal.css';
import { IconLock } from './Icons';

function PasswordModal({ isOpen, onPasswordCorrect }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Check password
    if (password === 'risk2025Lo') {
      // Store in sessionStorage so it persists during the session
      sessionStorage.setItem('risklo_authenticated', 'true');
      setIsSubmitting(false);
      onPasswordCorrect();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="password-modal-overlay">
      <div className="password-modal">
        <div className="password-modal-header">
          <div className="password-lock-icon">
            <IconLock size={32} />
          </div>
          <h2>Password Protected</h2>
          <p className="password-subtitle">Please enter the password to access RiskLo</p>
        </div>

        <form onSubmit={handleSubmit} className="password-form">
          <div className="password-input-group">
            <label htmlFor="password-input">Password</label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              placeholder="Enter password"
              autoFocus
              disabled={isSubmitting}
              className={error ? 'password-input-error' : ''}
            />
            {error && (
              <div className="password-error-message">
                {error}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="password-submit-btn"
            disabled={isSubmitting || !password.trim()}
          >
            {isSubmitting ? 'Verifying...' : 'Access RiskLo'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PasswordModal;

