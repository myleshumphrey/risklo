import React from 'react';
import './UpgradeModal.css';

function UpgradeModal({ isOpen, onClose, onUpgrade }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2 className="modal-title">Upgrade to RiskLo Pro</h2>
          <p className="modal-subtitle">Unlock powerful bulk analysis features</p>
        </div>

        <div className="modal-features">
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <div>
              <h3>Bulk Risk Calculator</h3>
              <p>Analyze up to 20 account + strategy combinations at once</p>
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
              <p>Upload NinjaTrader exports (CSV) for instant multi-account risk checks (coming soon)</p>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="upgrade-button" onClick={onUpgrade}>
            Unlock RiskLo Pro (Dev Mode)
          </button>
          <p className="dev-note">
            Billing integration coming later – this toggle is just for development.
          </p>
        </div>
      </div>
    </div>
  );
}

export default UpgradeModal;

