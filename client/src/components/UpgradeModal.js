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
            <p className="sign-in-prompt" style={{ 
              color: 'rgba(255, 255, 255, 0.7)', 
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              Please sign in with Google to upgrade
            </p>
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

