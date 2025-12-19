import React, { useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/PageHeader';
import './Account.css';
import { IconPro, IconChart, IconCheck, IconAlert } from '../components/Icons';

function Account({ onNavigate, onUpgrade }) {
  const { user, isPro, isDevMode, signOut, handleGoogleSignIn } = useAuth();
  const signInButtonRef = useRef(null);
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  // Initialize Google Sign-In button if user is not signed in
  useEffect(() => {
    if (!user && clientId && signInButtonRef.current) {
      const initGoogleSignIn = () => {
        if (!window.google?.accounts) {
          setTimeout(initGoogleSignIn, 100);
          return;
        }

        try {
          if (signInButtonRef.current) {
            signInButtonRef.current.innerHTML = '';
          }

          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
              handleGoogleSignIn(response.credential);
              // Immediate cleanup to prevent the Google-rendered button from lingering after first sign-in
              if (signInButtonRef.current) {
                signInButtonRef.current.innerHTML = '';
              }
            },
          });

          window.google.accounts.id.renderButton(signInButtonRef.current, {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            width: '100%',
          });
        } catch (error) {
          console.error('Error rendering Google Sign-In button:', error);
        }
      };

      if (window.google?.accounts) {
        initGoogleSignIn();
      } else {
        initGoogleSignIn();
      }
    }

    // Cleanup: once signed in, ensure the old rendered Google button is removed
    if (user && signInButtonRef.current) {
      signInButtonRef.current.innerHTML = '';
    }
  }, [user, clientId, handleGoogleSignIn]);

  if (!user) {
    return (
      <div className="account-page">
        <PageHeader onNavigate={onNavigate} />
        <div className="account-content">
          <div className="account-card">
            <h2>Please Sign In</h2>
            <p>You need to sign in to view your account details.</p>
            <div className="account-sign-in-container" style={{ marginTop: '2rem' }}>
              <div ref={signInButtonRef} className="account-google-sign-in-button"></div>
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
              <span className="plan-name">{isPro ? (isDevMode ? 'RiskLo Pro (Dev Mode)' : 'RiskLo Pro') : 'RiskLo Basic'}</span>
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
            
            {isDevMode && (
              <div className="dev-mode-notice" style={{
                background: 'rgba(255, 193, 7, 0.1)',
                border: '1px solid rgba(255, 193, 7, 0.3)',
                borderRadius: '8px',
                padding: '1rem',
                marginTop: '1rem',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '0.9rem'
              }}>
                <IconAlert size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} /> <strong>Dev Mode Active:</strong> You have Pro access for testing purposes. This is not a paid subscription.
              </div>
            )}
            
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

