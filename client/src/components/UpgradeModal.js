import React, { useState } from 'react';
import './UpgradeModal.css';
import { API_ENDPOINTS } from '../config';
import { IconChart } from './Icons';

function UpgradeModal({ isOpen, onClose, user, isPro }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [billingPeriod, setBillingPeriod] = useState('annual'); // 'monthly' or 'annual'

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    if (!user) {
      setError('Please sign in with Google to upgrade to RiskLo Pro');
      return;
    }

    if (isPro) {
      setError('You already have RiskLo Pro!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Creating checkout session for:', user.email);
      console.log('API URL:', API_ENDPOINTS.createCheckoutSession);
      console.log('Billing period:', billingPeriod);
      
      // First, test if backend is reachable
      try {
        const healthCheck = await fetch(API_ENDPOINTS.health);
        if (!healthCheck.ok) {
          throw new Error(`Backend health check failed: ${healthCheck.status} ${healthCheck.statusText}`);
        }
      } catch (healthError) {
        console.error('Backend health check failed:', healthError);
        throw new Error(`Cannot connect to backend server. Please ensure the backend is running at ${API_ENDPOINTS.health}`);
      }
      
      const response = await fetch(API_ENDPOINTS.createCheckoutSession, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          billingPeriod: billingPeriod, // Send selected billing period
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error(`Server error: Received ${response.status} ${response.statusText}. Endpoint may not exist. Check backend logs.`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Upgrade error:', err);
      setError(err.message || 'Failed to create checkout session. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2 className="modal-title">Upgrade to RiskLo Pro</h2>
          <p className="modal-subtitle">Unlock powerful bulk analysis features</p>
        </div>

        {/* Pricing Toggle */}
        <div className="pricing-toggle-container">
          <button
            className={`pricing-option ${billingPeriod === 'monthly' ? 'active' : ''}`}
            onClick={() => setBillingPeriod('monthly')}
          >
            <div className="pricing-option-content">
              <div className="pricing-option-header">
                <span className="pricing-label">Monthly</span>
              </div>
              <div className="pricing-amount">
                <span className="price-value">$29</span>
                <span className="price-period">/month</span>
              </div>
              <div className="pricing-billing">Billed monthly</div>
            </div>
          </button>

          <button
            className={`pricing-option ${billingPeriod === 'annual' ? 'active' : ''}`}
            onClick={() => setBillingPeriod('annual')}
          >
            <div className="pricing-badge">Save $264</div>
            <div className="pricing-option-content">
              <div className="pricing-option-header">
                <span className="pricing-label">Annual</span>
              </div>
              <div className="pricing-amount">
                <span className="price-value">$7</span>
                <span className="price-period">/month</span>
              </div>
              <div className="pricing-billing">Billed annually at $84</div>
            </div>
          </button>
        </div>

        <div className="modal-features">
          <div className="feature-item">
            <span className="feature-icon"><IconChart size={20} /></span>
            <div>
              <h3>Bulk Risk Calculator</h3>
              <p>Analyze up to 40 account + strategy combinations at once</p>
            </div>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <div>
              <h3>Quick Comparison</h3>
              <p>Bulk risk comparison to quickly see which setups are safe</p>
            </div>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">📁</div>
            <div>
              <h3>NinjaTrader Integration</h3>
              <p>Upload NinjaTrader exports (CSV) for instant multi-account risk checks</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="modal-error" style={{ 
            color: '#ef4444', 
            padding: '1rem', 
            background: 'rgba(239, 68, 68, 0.1)', 
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <div className="modal-actions">
          {!user ? (
            <div style={{ textAlign: 'center' }}>
              <p className="sign-in-prompt" style={{ 
                color: 'rgba(255, 255, 255, 0.7)', 
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                Please sign in with Google to upgrade
              </p>
              <button 
                className="modal-sign-in-button"
                onClick={() => {
                  // Redirect to backend OAuth endpoint with includeSignIn=true
                  // This will request both sign-in scopes AND Sheets scope in one flow
                  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
                  // Pass the current frontend URL so the backend knows where to redirect back to (for mobile support)
                  const frontendUrl = window.location.origin;
                  const oauthUrl = `${API_BASE_URL}/api/google-sheets/oauth/start?includeSignIn=true&frontendUrl=${encodeURIComponent(frontendUrl)}`;
                  window.location.href = oauthUrl;
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.875rem 1.5rem',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  border: '1px solid #dadce0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f8f9fa';
                  e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <g fill="#000" fillRule="evenodd">
                    <path d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z" fill="#EA4335"/>
                    <path d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.21 1.18-.84 2.18-1.79 2.85l2.75 2.13c1.66-1.52 2.72-3.76 2.72-6.48z" fill="#4285F4"/>
                    <path d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9.008 9.008 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z" fill="#FBBC05"/>
                    <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.75-2.13c-.76.53-1.78.9-3.21.9-2.38 0-4.4-1.57-5.12-3.74L.96 13.04C2.45 15.98 5.48 18 9 18z" fill="#34A853"/>
                  </g>
                </svg>
                <span>Sign in with Google</span>
              </button>
            </div>
          ) : isPro ? (
            <p className="already-pro" style={{ 
              color: '#10b981', 
              marginBottom: '1rem',
              textAlign: 'center',
              fontWeight: '600'
            }}>
              ✓ You already have RiskLo Pro!
            </p>
          ) : (
            <button 
              className="upgrade-button" 
              onClick={handleUpgrade}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Subscribe to RiskLo Pro'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default UpgradeModal;

