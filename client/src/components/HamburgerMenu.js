import React, { useState } from 'react';
import './HamburgerMenu.css';

function HamburgerMenu({ currentPage, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (page) => {
    onNavigate(page);
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
            <button className="menu-close" onClick={() => setIsOpen(false)}>×</button>
          </div>
          
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
                className={`menu-item ${currentPage === 'faq' ? 'active' : ''}`}
                onClick={() => handleNavigate('faq')}
              >
                <span className="menu-icon">❓</span>
                <span>FAQ</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}

export default HamburgerMenu;

