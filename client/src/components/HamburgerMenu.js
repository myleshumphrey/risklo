import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './HamburgerMenu.css';
import { IconStar, IconHome, IconBook, IconCalculator, IconHelp, IconFile, IconUpload, IconUser, IconLogOut } from './Icons';

function HamburgerMenu({ currentPage, onNavigate, onUpgrade, isPro, isDevMode }) {
  const { user, signOut, handleGoogleSignIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const signInButtonRef = useRef(null);
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  const handleNavigate = (page) => {
    onNavigate(page);
    setIsOpen(false);
  };

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    }
    setIsOpen(false);
  };

  const handleSignOut = () => {
    signOut();
    setIsOpen(false);
  };

  // Initialize Google Sign-In button in menu if user is not signed in
  useEffect(() => {
    if (!user && clientId && isOpen && signInButtonRef.current) {
      // Wait for Google Identity Services to load
      const initGoogleSignIn = () => {
        if (!window.google?.accounts) {
          setTimeout(initGoogleSignIn, 100);
          return;
        }

        try {
          // Clear any existing button
          if (signInButtonRef.current) {
            signInButtonRef.current.innerHTML = '';
          }

          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
              handleGoogleSignIn(response.credential);
              // Immediate cleanup to prevent the Google-rendered button from "flashing" after first sign-in
              if (signInButtonRef.current) {
                signInButtonRef.current.innerHTML = '';
              }
              setIsOpen(false);
            },
          });

          window.google.accounts.id.renderButton(signInButtonRef.current, {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            width: '100%',
          });
        } catch (error) {
          console.error('Error rendering Google Sign-In button in menu:', error);
        }
      };

      // If Google script is already loaded, initialize immediately
      if (window.google?.accounts) {
        initGoogleSignIn();
      } else {
        // Otherwise wait for it to load
        initGoogleSignIn();
      }
    }

    // Cleanup: if the menu closes or the user signs in, remove any rendered Google button
    if ((user || !isOpen) && signInButtonRef.current) {
      signInButtonRef.current.innerHTML = '';
    }
  }, [user, clientId, isOpen, handleGoogleSignIn]);

  return (
    <>
      <button 
        className="hamburger-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
      >
        <span className={`hamburger-icon ${isOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      <div className={`hamburger-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)}>
        <nav className={`hamburger-menu ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="menu-header">
            <div className="menu-title-with-badge">
              <h2 className="menu-title">RiskLo</h2>
              <span className={`menu-header-badge ${isPro ? 'menu-pro-badge' : 'menu-basic-badge'} ${isDevMode ? 'menu-dev-badge' : ''}`}>
                {isPro ? (isDevMode ? 'Pro (Dev)' : 'Pro') : 'Basic'}
              </span>
            </div>
          </div>
          
          {!isPro && onUpgrade && (
            <div className="menu-upgrade-section">
              <button className="menu-upgrade-btn" onClick={handleUpgrade}>
                <span className="menu-icon"><IconStar size={18} /></span>
                <span>Upgrade to RiskLo Pro</span>
              </button>
            </div>
          )}
          
          <ul className="menu-items">
            <li>
              <button
                className={`menu-item ${currentPage === 'home' ? 'active' : ''}`}
                onClick={() => handleNavigate('home')}
              >
                <span className="menu-icon"><IconHome size={18} /></span>
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button
                className={`menu-item ${currentPage === 'about' ? 'active' : ''}`}
                onClick={() => handleNavigate('about')}
              >
                <span className="menu-icon"><IconBook size={18} /></span>
                <span>About</span>
              </button>
            </li>
            <li>
              <button
                className={`menu-item ${currentPage === 'how-we-calculate' ? 'active' : ''}`}
                onClick={() => handleNavigate('how-we-calculate')}
              >
                <span className="menu-icon"><IconCalculator size={18} /></span>
                <span>How We Calculate</span>
              </button>
            </li>
            <li>
              <button
                className={`menu-item ${currentPage === 'faq' ? 'active' : ''}`}
                onClick={() => handleNavigate('faq')}
              >
                <span className="menu-icon"><IconHelp size={18} /></span>
                <span>FAQ</span>
              </button>
            </li>
            <li>
              <button
                className={`menu-item ${currentPage === 'apex-30-percent-rule' ? 'active' : ''}`}
                onClick={() => handleNavigate('apex-30-percent-rule')}
              >
                <span className="menu-icon"><IconFile size={18} /></span>
                <span>Apex 30% Rules</span>
              </button>
            </li>
            <li>
              <button
                className={`menu-item ${currentPage === 'how-to-export-csv' ? 'active' : ''}`}
                onClick={() => handleNavigate('how-to-export-csv')}
              >
                <span className="menu-icon"><IconUpload size={18} /></span>
                <span>How to Export CSV</span>
              </button>
            </li>
            <li>
              <button
                className={`menu-item ${currentPage === 'desktopAppGuide' ? 'active' : ''}`}
                onClick={() => handleNavigate('desktopAppGuide')}
              >
                <span className="menu-icon"><IconUpload size={18} /></span>
                <span>Desktop App Guide</span>
              </button>
            </li>
            <li>
              <button
                className={`menu-item ${currentPage === 'terms-and-conditions' ? 'active' : ''}`}
                onClick={() => handleNavigate('terms-and-conditions')}
              >
                <span className="menu-icon"><IconFile size={18} /></span>
                <span>Terms & Conditions</span>
              </button>
            </li>
            {!user && (
              <li>
                <div className="menu-sign-in-container">
                  <div ref={signInButtonRef} className="menu-google-sign-in-button"></div>
                </div>
              </li>
            )}
            {user && (
              <li>
                <button
                  className={`menu-item ${currentPage === 'account' ? 'active' : ''}`}
                  onClick={() => handleNavigate('account')}
                >
                  <span className="menu-icon"><IconUser size={18} /></span>
                  <span>Account</span>
                </button>
              </li>
            )}
            {user && (
              <li>
                <button className="menu-sign-out-btn" onClick={handleSignOut}>
                  <span className="menu-icon"><IconLogOut size={18} /></span>
                  <span>Sign Out</span>
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </>
  );
}

export default HamburgerMenu;

