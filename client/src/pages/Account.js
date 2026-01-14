import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/PageHeader';
import './Account.css';
import { IconPro, IconChart, IconCheck, IconAlert } from '../components/Icons';
import { API_ENDPOINTS } from '../config';

function Account({ onNavigate, onUpgrade }) {
  const { user, isPro, isDevMode, signOut, refreshProStatus } = useAuth();
  const [canceling, setCanceling] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const handleSignInClick = () => {
    // Redirect to backend OAuth endpoint with includeSignIn=true
    // This will request both sign-in scopes AND Sheets scope in one flow
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    // Pass the current frontend URL so the backend knows where to redirect back to (for mobile support)
    const frontendUrl = window.location.origin;
    const oauthUrl = `${API_BASE_URL}/api/google-sheets/oauth/start?includeSignIn=true&frontendUrl=${encodeURIComponent(frontendUrl)}`;
    window.location.href = oauthUrl;
  };

  // Fetch payment history when user is Pro
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!user || !user.email || !isPro || isDevMode) {
        return;
      }

      setLoadingPayments(true);
      setPaymentError(null);

      try {
        const response = await fetch(API_ENDPOINTS.paymentHistory(user.email));
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON response from payment history:', text.substring(0, 200));
          if (response.status === 404) {
            throw new Error('Payment history endpoint not found. Server may need to be restarted.');
          }
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch payment history');
        }

        setPaymentHistory(data.payments || []);
      } catch (error) {
        console.error('Error fetching payment history:', error);
        setPaymentError(error.message || 'Failed to load payment history');
      } finally {
        setLoadingPayments(false);
      }
    };

    fetchPaymentHistory();
  }, [user, isPro, isDevMode]);

  const handleCancelSubscription = async () => {
    if (!user || !user.email) {
      setCancelError('You must be signed in to cancel your subscription');
      return;
    }

    if (isDevMode) {
      setCancelError('Dev mode subscriptions cannot be canceled. This is a test account.');
      return;
    }

    setCanceling(true);
    setCancelError(null);
    setCancelSuccess(false);

    try {
      const response = await fetch(API_ENDPOINTS.cancelSubscription, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response from cancel subscription:', text.substring(0, 200));
        throw new Error(`Server error: Received ${response.status} ${response.statusText}. The endpoint may not exist or the server may need to be restarted.`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      setCancelSuccess(true);
      setShowCancelConfirm(false);
      
      // Refresh Pro status after a delay to allow Stripe webhook to process
      setTimeout(() => {
        if (refreshProStatus) {
          refreshProStatus();
        }
      }, 2000);
    } catch (error) {
      console.error('Error canceling subscription:', error);
      setCancelError(error.message || 'Failed to cancel subscription. Please try again.');
    } finally {
      setCanceling(false);
    }
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
              <>
                <div className="pro-features">
                  <h4>Pro Features Active:</h4>
                  <ul>
                    <li><IconCheck size={14} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} /> Bulk Risk Calculator (up to 40 accounts)</li>
                    <li><IconCheck size={14} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} /> NinjaTrader CSV Upload</li>
                    <li><IconCheck size={14} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} /> Advanced risk analysis</li>
                  </ul>
                </div>

                {!isDevMode && (
                  <div className="cancel-subscription-section" style={{
                    marginTop: '2rem',
                    padding: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px'
                  }}>
                    <h4 style={{ marginTop: 0, marginBottom: '0.75rem' }}>Subscription Management</h4>
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                      Cancel your RiskLo Pro subscription at any time. You'll retain access until the end of your current billing period.
                    </p>
                    
                    {cancelSuccess && (
                      <div style={{
                        padding: '0.75rem',
                        background: 'rgba(76, 175, 80, 0.1)',
                        border: '1px solid rgba(76, 175, 80, 0.3)',
                        borderRadius: '6px',
                        color: 'rgba(255, 255, 255, 0.9)',
                        marginBottom: '1rem',
                        fontSize: '0.9rem'
                      }}>
                        <IconCheck size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                        Your subscription has been canceled. You'll retain access until the end of your current billing period.
                      </div>
                    )}

                    {cancelError && (
                      <div style={{
                        padding: '0.75rem',
                        background: 'rgba(244, 67, 54, 0.1)',
                        border: '1px solid rgba(244, 67, 54, 0.3)',
                        borderRadius: '6px',
                        color: 'rgba(255, 255, 255, 0.9)',
                        marginBottom: '1rem',
                        fontSize: '0.9rem'
                      }}>
                        <IconAlert size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                        {cancelError}
                      </div>
                    )}

                    {!showCancelConfirm && !cancelSuccess && (
                      <button
                        className="cancel-subscription-button"
                        onClick={() => setShowCancelConfirm(true)}
                        disabled={canceling}
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(244, 67, 54, 0.5)',
                          color: '#f44336',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(244, 67, 54, 0.1)';
                          e.target.style.borderColor = 'rgba(244, 67, 54, 0.7)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.borderColor = 'rgba(244, 67, 54, 0.5)';
                        }}
                      >
                        Cancel Subscription
                      </button>
                    )}

                    {showCancelConfirm && !cancelSuccess && (
                      <div style={{
                        padding: '1rem',
                        background: 'rgba(244, 67, 54, 0.05)',
                        border: '1px solid rgba(244, 67, 54, 0.2)',
                        borderRadius: '6px'
                      }}>
                        <p style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                          Are you sure you want to cancel your subscription? You'll retain access until the end of your current billing period.
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button
                            onClick={handleCancelSubscription}
                            disabled={canceling}
                            style={{
                              background: '#f44336',
                              border: 'none',
                              color: '#ffffff',
                              padding: '0.75rem 1.5rem',
                              borderRadius: '6px',
                              cursor: canceling ? 'not-allowed' : 'pointer',
                              fontSize: '0.9rem',
                              fontWeight: 500,
                              opacity: canceling ? 0.6 : 1,
                              transition: 'opacity 0.2s ease'
                            }}
                          >
                            {canceling ? 'Canceling...' : 'Yes, Cancel Subscription'}
                          </button>
                          <button
                            onClick={() => {
                              setShowCancelConfirm(false);
                              setCancelError(null);
                            }}
                            disabled={canceling}
                            style={{
                              background: 'transparent',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              color: 'rgba(255, 255, 255, 0.9)',
                              padding: '0.75rem 1.5rem',
                              borderRadius: '6px',
                              cursor: canceling ? 'not-allowed' : 'pointer',
                              fontSize: '0.9rem',
                              fontWeight: 500
                            }}
                          >
                            Keep Subscription
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Payment History Section */}
                {!isDevMode && (
                  <div className="payment-history-section" style={{
                    marginTop: '2rem',
                    padding: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px'
                  }}>
                    <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>Payment History</h4>
                    
                    {loadingPayments && (
                      <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>Loading payment history...</p>
                    )}

                    {paymentError && (
                      <div style={{
                        padding: '0.75rem',
                        background: 'rgba(244, 67, 54, 0.1)',
                        border: '1px solid rgba(244, 67, 54, 0.3)',
                        borderRadius: '6px',
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '0.9rem',
                        marginBottom: '1rem'
                      }}>
                        <IconAlert size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                        {paymentError}
                      </div>
                    )}

                    {!loadingPayments && !paymentError && paymentHistory.length === 0 && (
                      <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>No payment history found.</p>
                    )}

                    {!loadingPayments && !paymentError && paymentHistory.length > 0 && (
                      <div className="payment-history-list" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}>
                        {paymentHistory.map((payment) => (
                          <div key={payment.id} style={{
                            padding: '1rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '0.5rem'
                          }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                              <div style={{ 
                                color: '#ffffff', 
                                fontWeight: 600, 
                                marginBottom: '0.25rem',
                                fontSize: '0.95rem'
                              }}>
                                {payment.description}
                              </div>
                              <div style={{ 
                                color: 'rgba(255, 255, 255, 0.6)', 
                                fontSize: '0.85rem' 
                              }}>
                                {new Date(payment.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </div>
                              {payment.periodStart && payment.periodEnd && (
                                <div style={{ 
                                  color: 'rgba(255, 255, 255, 0.5)', 
                                  fontSize: '0.75rem',
                                  marginTop: '0.25rem'
                                }}>
                                  {new Date(payment.periodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(payment.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                              )}
                            </div>
                            <div style={{ 
                              textAlign: 'right',
                              minWidth: '100px'
                            }}>
                              <div style={{ 
                                color: '#10b981', 
                                fontWeight: 600, 
                                fontSize: '1.1rem',
                                marginBottom: '0.25rem'
                              }}>
                                ${payment.amount.toFixed(2)} {payment.currency}
                              </div>
                              {payment.invoiceUrl && (
                                <a
                                  href={payment.invoiceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: 'rgba(102, 126, 234, 0.9)',
                                    fontSize: '0.85rem',
                                    textDecoration: 'none',
                                    transition: 'opacity 0.2s'
                                  }}
                                  onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                                >
                                  View Invoice →
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
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

