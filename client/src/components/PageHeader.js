import React from 'react';
import './PageHeader.css';

function PageHeader({ onNavigate }) {
  return (
    <header className="page-header-simple">
      <div className="page-header-simple-content">
        <button 
          className="page-header-title-btn"
          onClick={() => onNavigate && onNavigate('home')}
        >
          <h1 className="page-header-title">RiskLo</h1>
        </button>
      </div>
    </header>
  );
}

export default PageHeader;

