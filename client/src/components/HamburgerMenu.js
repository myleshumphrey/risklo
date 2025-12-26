import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './HamburgerMenu.css';
import { IconStar, IconHome, IconBook, IconCalculator, IconHelp, IconFile, IconUpload, IconUser, IconLogOut } from './Icons';

function HamburgerMenu({ currentPage, onNavigate, onUpgrade, isPro, isDevMode, theme = 'dark', onToggleTheme }) {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

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

  const handleSignInClick = () => {
    // Redirect to backend OAuth endpoint with includeSignIn=true
    // This will request both sign-in scopes AND Sheets scope in one flow
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    const oauthUrl = `${API_BASE_URL}/api/google-sheets/oauth/start?includeSignIn=true`;
    window.location.href = oauthUrl;
  };

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
            {/* Light mode toggle hidden for now */}
            {false && (
              <div className="menu-theme-toggle">
                <span className="menu-theme-label">Light mode</span>
                <label className="menu-switch">
                  <input
                    type="checkbox"
                    checked={theme === 'light'}
                    onChange={onToggleTheme}
                  />
                  <span className="menu-switch-slider"></span>
                </label>
              </div>
            )}
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
            <li>
              <button
                className={`menu-item ${currentPage === 'privacy-policy' ? 'active' : ''}`}
                onClick={() => handleNavigate('privacy-policy')}
              >
                <span className="menu-icon"><IconFile size={18} /></span>
                <span>Privacy Policy</span>
              </button>
            </li>
            <li>
              <button
                className={`menu-item ${currentPage === 'results' ? 'active' : ''}`}
                onClick={() => handleNavigate('results')}
              >
                <span className="menu-icon"><IconFile size={18} /></span>
                <span>Results</span>
              </button>
            </li>
            {!user && (
              <li>
                <button className="menu-item" onClick={handleSignInClick}>
                  <span className="menu-icon">
                    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                      <g fill="#fff" fillRule="evenodd">
                        <path d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z" fill="#EA4335"/>
                        <path d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.21 1.18-.84 2.18-1.79 2.85l2.75 2.13c1.66-1.52 2.72-3.76 2.72-6.48z" fill="#4285F4"/>
                        <path d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9.008 9.008 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z" fill="#FBBC05"/>
                        <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.75-2.13c-.76.53-1.78.9-3.21.9-2.38 0-4.4-1.57-5.12-3.74L.96 13.04C2.45 15.98 5.48 18 9 18z" fill="#34A853"/>
                      </g>
                    </svg>
                  </span>
                  <span>Sign in with Google</span>
                </button>
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

