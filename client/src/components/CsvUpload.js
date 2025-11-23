import React, { useState } from 'react';
import './CsvUpload.css';

function CsvUpload({ isPro }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      alert('Please select a CSV file');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setUploading(true);
    
    // Placeholder for future CSV parsing logic
    setTimeout(() => {
      alert('CSV upload feature coming soon! This will parse NinjaTrader exports and automatically analyze multiple accounts.');
      setUploading(false);
      setFile(null);
    }, 1000);
  };

  if (!isPro) {
    return (
      <div className="csv-upload-gated">
        <div className="gate-overlay">
          <div className="gate-content">
            <div className="lock-icon">🔒</div>
            <h3>NinjaTrader CSV Upload</h3>
            <p>This feature is available in RiskLo Pro</p>
            <p className="gate-subtext">Upload NinjaTrader exports for instant multi-account risk checks</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="csv-upload">
      <div className="csv-header">
        <h2 className="csv-title">NinjaTrader CSV Upload (RiskLo Pro)</h2>
        <p className="csv-subtitle">Upload your NinjaTrader account export for bulk analysis</p>
      </div>

      <div className="csv-upload-area">
        <div className="upload-box">
          <div className="upload-icon">📁</div>
          <p className="upload-text">
            {file ? file.name : 'Drop your CSV file here or click to browse'}
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="file-input"
            id="csv-file-input"
          />
          <label htmlFor="csv-file-input" className="browse-button">
            Browse Files
          </label>
        </div>

        {file && (
          <div className="file-info">
            <span className="file-name">{file.name}</span>
            <span className="file-size">{(file.size / 1024).toFixed(2)} KB</span>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="upload-button"
        >
          {uploading ? 'Processing...' : 'Upload & Analyze'}
        </button>

        <div className="csv-note">
          <p>📝 <strong>Coming Soon:</strong> This will automatically parse your NinjaTrader account export and analyze risk for all accounts in the file.</p>
        </div>
      </div>
    </div>
  );
}

export default CsvUpload;

