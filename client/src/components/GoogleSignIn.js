import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './GoogleSignIn.css';

function GoogleSignIn({ onNavigate }) {
  const { user, isPro, isDevMode, handleGoogleSignIn } = useAuth();
  const buttonRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  // Debug: log to console (remove in production)
  useEffect(() => {
    console.log('Google Client ID:', clientId ? `Found: ${clientId.substring(0, 20)}...` : 'Missing');
    console.log('Window location:', window.location.origin);
  }, [clientId]);

  useEffect(() => {
    // Only initialize if client ID exists
    if (!clientId) return;

    // Load Google Identity Services script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.head.appendChild(script);
    } else {
      initializeGoogleSignIn();
    }

    function initializeGoogleSignIn() {
      if (!window.google?.accounts) return;

      if (!clientId) {
        console.error('REACT_APP_GOOGLE_CLIENT_ID is not set. Please add it to your .env file.');
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        setIsInitialized(true);
        
        // Render hidden Google button for custom button to trigger
        if (!user && buttonRef.current) {
          setTimeout(() => {
            if (buttonRef.current) {
              window.google.accounts.id.renderButton(buttonRef.current, {
                theme: 'outline',
                size: 'large',
                text: 'signin_with',
              });
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error initializing Google Identity Services:', error);
      }
    }

    function handleCredentialResponse(response) {
      handleGoogleSignIn(response.credential);
    }
  }, [handleGoogleSignIn, clientId, user]);


  if (user) {
    // Show user info only (sign out is in hamburger menu)
    const initials = user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <div 
        className="user-info clickable-user-info" 
        onClick={() => onNavigate && onNavigate('account')}
        style={{ cursor: 'pointer' }}
      >
        <div className="user-avatar">
          <span className="user-initials">{initials}</span>
        </div>
        <div className="user-details">
          <div className="user-name">{user.name}</div>
          <div className={`user-badge ${isPro ? 'pro-badge' : 'basic-badge'} ${isDevMode ? 'dev-badge' : ''}`}>
            {isPro ? (isDevMode ? 'Pro (Dev)' : 'Pro') : 'Basic'}
          </div>
        </div>
      </div>
    );
  }

  // Show error message if client ID is missing
  if (!clientId) {
    return (
      <div className="google-sign-in-container">
        <div style={{ 
          color: '#ef4444', 
          fontSize: '0.75rem',
          padding: '0.5rem',
          textAlign: 'center',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '6px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          maxWidth: '200px'
        }}>
          Google Sign-In not configured. Add REACT_APP_GOOGLE_CLIENT_ID to .env
        </div>
      </div>
    );
  }

  // Custom compact button - render hidden Google button and trigger it
  // This should only render when user is null (already checked above, but double-check)
  if (user) {
    // This should never happen due to early return above, but safety check
    return null;
  }

  return (
    <div className="google-sign-in-wrapper">
      {/* Hidden Google button that we'll trigger */}
      <div ref={buttonRef} style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}></div>
      
      {/* Custom compact button */}
      <button 
        className="custom-google-sign-in-btn"
        onClick={() => {
          if (window.google?.accounts && isInitialized && buttonRef.current) {
            // Find the Google button and click it
            const googleButton = buttonRef.current.querySelector('div[role="button"]');
            if (googleButton) {
              googleButton.click();
            } else {
              // If button not rendered yet, render it first
              window.google.accounts.id.renderButton(buttonRef.current, {
                theme: 'outline',
                size: 'large',
                text: 'signin_with',
              });
              setTimeout(() => {
                const btn = buttonRef.current.querySelector('div[role="button"]');
                if (btn) btn.click();
              }, 100);
            }
          }
        }}
        disabled={!isInitialized}
      >
        <svg className="google-icon" width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <g fill="#000" fillRule="evenodd">
            <path d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z" fill="#EA4335"/>
            <path d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.21 1.18-.84 2.18-1.79 2.85l2.75 2.13c1.66-1.52 2.72-3.76 2.72-6.48z" fill="#4285F4"/>
            <path d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9.008 9.008 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z" fill="#FBBC05"/>
            <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.75-2.13c-.76.53-1.78.9-3.21.9-2.38 0-4.4-1.57-5.12-3.74L.96 13.04C2.45 15.98 5.48 18 9 18z" fill="#34A853"/>
          </g>
        </svg>
        <span className="sign-in-text">Sign in</span>
      </button>
    </div>
  );
}

export default GoogleSignIn;

