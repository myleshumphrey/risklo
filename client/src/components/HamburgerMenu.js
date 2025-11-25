import React, { useState } from 'react';
import './HamburgerMenu.css';

function HamburgerMenu({ currentPage, onNavigate, onUpgrade, isPro }) {
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
            <h2 className="menu-title">RiskLo</h2>
          </div>
          
          {!isPro && onUpgrade && (
            <div className="menu-upgrade-section">
              <button className="menu-upgrade-btn" onClick={handleUpgrade}>
                <span className="menu-icon">⭐</span>
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
                <span className="menu-icon">🏠</span>
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button
                className={`menu-item ${currentPage === 'about' ? 'active' : ''}`}
                onClick={() => handleNavigate('about')}
              >
                <span className="menu-icon">📖</span>
                <span>About</span>
              </button>
            </li>
            <li>
              <button
                className={`menu-item ${currentPage === 'how-we-calculate' ? 'active' : ''}`}
                onClick={() => handleNavigate('how-we-calculate')}
              >
                <span className="menu-icon">🧮</span>
                <span>How We Calculate</span>
              </button>
            </li>
            <li>
              <button
                className={`menu-item ${currentPage === 'faq' ? 'active' : ''}`}
                onClick={() => handleNavigate('faq')}
              >
                <span className="menu-icon">❓</span>
                <span>FAQ</span>
              </button>
            </li>
            <li>
              <button
                className={`menu-item ${currentPage === 'apex-30-percent-rule' ? 'active' : ''}`}
                onClick={() => handleNavigate('apex-30-percent-rule')}
              >
                <span className="menu-icon">📋</span>
                <span>Apex 30% Rules</span>
              </button>
            </li>
            <li>
              <button
                className={`menu-item ${currentPage === 'how-to-export-csv' ? 'active' : ''}`}
                onClick={() => handleNavigate('how-to-export-csv')}
              >
                <span className="menu-icon">📤</span>
                <span>How to Export CSV</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}

export default HamburgerMenu;

