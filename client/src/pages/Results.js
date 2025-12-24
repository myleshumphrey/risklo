import React, { useEffect, useState } from 'react';
import './Results.css';
import { API_ENDPOINTS } from '../config';

function Results({ user }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectUrl, setConnectUrl] = useState(null);
  const [sheetName, setSheetName] = useState('Current Results');

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      setConnectUrl(null);
      try {
        const resp = await fetch(API_ENDPOINTS.currentResults(user?.email || ''));
        const contentType = resp.headers.get('content-type') || '';
        const isJson = contentType.toLowerCase().includes('application/json');
        const data = isJson ? await resp.json() : { success: false, error: await resp.text() };

        if (resp.status === 401 && data.requiresOAuth) {
          setConnectUrl(data.authUrl || null);
          setError(data.error || 'Connect Google to view the Current Results sheet.');
          return;
        }

        if (!data.success) {
          throw new Error(data.error || 'Failed to load Current Results');
        }

        setRows(Array.isArray(data.rows) ? data.rows : []);
        setSheetName(data.sheetName || 'Current Results');
      } catch (err) {
        setError(err.message || 'Failed to load Current Results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user]);

  const maxCols = rows.reduce((max, row) => Math.max(max, row.length), 0);

  const renderCell = (cell) => {
    const value = cell ?? '';
    const clean = value.toString();
    const num = parseFloat(clean.replace(/[^0-9.-]/g, ''));
    const isNumber = !isNaN(num) && clean !== '';
    const positive = isNumber && num > 0;
    const negative = isNumber && num < 0;

    return (
      <span className={`cell-value ${positive ? 'positive' : ''} ${negative ? 'negative' : ''}`}>
        {clean}
      </span>
    );
  };

  return (
    <div className="results-page">
      <div className="results-header">
        <div>
          <p className="results-kicker">Vector Results Spreadsheet</p>
          <h2 className="results-title">{sheetName}</h2>
          <p className="results-subtitle">
            Current weekly results pulled directly from the Google Sheet for easy, fast viewing.
          </p>
        </div>
        {connectUrl && (
          <button
            className="results-connect-btn"
            onClick={() => { window.location.href = connectUrl; }}
          >
            Connect Google to View
          </button>
        )}
      </div>

      {loading && (
        <div className="results-card">
          <div className="results-loading">Loading current results…</div>
        </div>
      )}

      {error && !loading && (
        <div className="results-card results-error">
          {error}
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="results-card results-empty">
          No data found in the Current Results sheet.
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="results-card">
          <div className="results-table-wrapper">
            <table className="results-table">
              <tbody>
                {rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {Array.from({ length: maxCols }).map((_, cIdx) => (
                      <td key={cIdx}>
                        {renderCell(row[cIdx] || '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="results-footnote">
            Negative numbers are highlighted in red, positives in green. Data is read-only from the Current Results tab in the Google Sheet.
          </p>
        </div>
      )}
    </div>
  );
}

export default Results;

