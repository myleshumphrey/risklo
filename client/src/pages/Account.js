import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/PageHeader';
import './Account.css';
import { IconPro, IconChart, IconCheck, IconAlert } from '../components/Icons';

function Account({ onNavigate, onUpgrade }) {
  const { user, isPro, isDevMode, signOut } = useAuth();

  const handleSignInClick = () => {
    // Redirect to backend OAuth endpoint with includeSignIn=true
    // This will request both sign-in scopes AND Sheets scope in one flow
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    const oauthUrl = `${API_BASE_URL}/api/google-sheets/oauth/start?includeSignIn=true`;
    window.location.href = oauthUrl;
  };

  if (!user) {
    return (
      <div className="account-page">
        <PageHeader onNavigate={onNavigate} />
        <div className="account-content">
          <div className="account-card">
            <h2>Please Sign In</h2>
            <p>You need to sign in to view your account details.</p>
            <div className="account-sign-in-container" style={{ marginTop: '2rem' }}>
              <button 
                className="account-sign-in-button"
                onClick={handleSignInClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#fff',
                  color: '#000',
                  border: '1px solid #dadce0',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <g fillRule="evenodd">
                    <path d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z" fill="#EA4335"/>
                    <path d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.21 1.18-.84 2.18-1.79 2.85l2.75 2.13c1.66-1.52 2.72-3.76 2.72-6.48z" fill="#4285F4"/>
                    <path d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9.008 9.008 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z" fill="#FBBC05"/>
                    <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.75-2.13c-.76.53-1.78.9-3.21.9-2.38 0-4.4-1.57-5.12-3.74L.96 13.04C2.45 15.98 5.48 18 9 18z" fill="#34A853"/>
                  </g>
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="account-page">
      <PageHeader onNavigate={onNavigate} />
      <div className="account-content">
        <div className="account-card">
          <h1>Account</h1>
          
          <div className="account-profile-section">
            <div className="account-avatar">
              <span className="account-initials">{initials}</span>
            </div>
            <div className="account-profile-info">
              <h2>{user.name}</h2>
              <p className="account-email">{user.email}</p>
            </div>
          </div>

          <div className="account-plan-section">
            <h3>Current Plan</h3>
            <div className={`plan-badge-large ${isPro ? 'pro-plan' : 'basic-plan'} ${isDevMode ? 'dev-plan' : ''}`}>
              <span className="plan-icon">{isPro ? <IconPro size={20} /> : <IconChart size={20} />}</span>
              <span className="plan-name">{isPro ? 'RiskLo Pro' : 'RiskLo Basic'}</span>
            </div>

            {/* Terms Acceptance Status */}
            {(() => {
              const acceptanceKey = `disclaimer_accepted_${user.email}`;
              const dateKey = `disclaimer_accepted_date_${user.email}`;
              const hasAccepted = localStorage.getItem(acceptanceKey) === 'true';
              const acceptanceDate = localStorage.getItem(dateKey);
              
              if (hasAccepted) {
                return (
                  <div className="terms-acceptance-section" style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(76, 175, 80, 0.1)',
                    border: '1px solid rgba(76, 175, 80, 0.3)',
                    borderRadius: '8px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span><IconCheck size={16} /></span>
                      <strong>
                        <a 
                          href="#terms" 
                          onClick={(e) => {
                            e.preventDefault();
                            if (onNavigate) onNavigate('terms-and-conditions');
                          }}
                          style={{
                            color: 'inherit',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            transition: 'opacity 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                          onMouseLeave={(e) => e.target.style.opacity = '1'}
                        >
                          Terms & Conditions Accepted
                        </a>
                      </strong>
                    </div>
                    {acceptanceDate && (
                      <div style={{ fontSize: '0.85rem', opacity: 0.8, marginLeft: '1.5rem' }}>
                        Accepted on {new Date(acceptanceDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })()}
            
            {!isPro && (
              <div className="upgrade-section">
                <p className="upgrade-description">
                  Unlock advanced features like Bulk Risk Calculator and CSV uploads.
                </p>
                <button className="upgrade-button" onClick={onUpgrade}>
                  Upgrade to RiskLo Pro
                </button>
              </div>
            )}

            {isPro && (
              <div className="pro-features">
                <h4>Pro Features Active:</h4>
                <ul>
                  <li><IconCheck size={14} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} /> Bulk Risk Calculator (up to 20 accounts)</li>
                  <li><IconCheck size={14} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} /> NinjaTrader CSV Upload</li>
                  <li><IconCheck size={14} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} /> Advanced risk analysis</li>
                </ul>
              </div>
            )}
          </div>

          <div className="account-actions">
            <button className="sign-out-button" onClick={signOut}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Account;

