import React, { useEffect, useMemo, useState } from 'react';
import './ResultsDashboard.css';
import { API_ENDPOINTS } from '../config';
import { transformSheetToResultsDashboardModel } from '../utils/transformResults';
import SummaryCards from '../components/SummaryCards.js';
import InsightsPanel from '../components/InsightsPanel.js';
import ResultsControls from '../components/ResultsControls.js';
import StrategyRowCard from '../components/StrategyRowCard.js';
import { sortStrategies } from '../utils/strategySort';
import StrategyDetailsView from '../components/StrategyDetailsView.js';
import { computeStrategySheetMetrics } from '../utils/strategySheetMetrics';

function formatWeekLabel(label) {
  if (!label) return '';
  // Try to parse known formats like MM.DD.YYYY without using Date (avoid TZ shifts)
  const dotParts = label.split('.');
  if (dotParts.length === 3) {
    const [mm, dd, yyyy] = dotParts;
    const mIdx = parseInt(mm, 10) - 1;
    const d = parseInt(dd, 10);
    const y = parseInt(yyyy, 10);
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    if (
      !isNaN(mIdx) &&
      mIdx >= 0 &&
      mIdx < 12 &&
      !isNaN(d) &&
      d >= 1 &&
      d <= 31 &&
      !isNaN(y)
    ) {
      return `${months[mIdx]} ${d}, ${y}`;
    }
  }
  return label; // fallback
}

function ResultsDashboard({ user, sheetNames, loadingSheets, sheetsConnectUrl, error: sheetError }) {
  const [rows, setRows] = useState([]);
  const [sheetOptions, setSheetOptions] = useState(['Current Results']);
  const [selectedSheet, setSelectedSheet] = useState(() => localStorage.getItem('results.selectedSheet') || 'Current Results');
  const [strategySheetRows, setStrategySheetRows] = useState([]);
  const [strategyMetrics, setStrategyMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectUrl, setConnectUrl] = useState(null);
  const [showRaw, setShowRaw] = useState(false);

  const [search, setSearch] = useState(() => localStorage.getItem('results.search') || '');
  const [showLosersOnly, setShowLosersOnly] = useState(() => localStorage.getItem('results.showLosersOnly') === 'true');
  const [sortBy, setSortBy] = useState(() => localStorage.getItem('results.sortBy') || 'priority');
  const [category, setCategory] = useState(() => {
    const stored = localStorage.getItem('results.category');
    return stored && stored !== 'null' ? stored : null;
  });
  const [contractType, setContractType] = useState(() => localStorage.getItem('results.contractType') || 'NQ');

  // Persist selections / filters
  useEffect(() => {
    localStorage.setItem('results.selectedSheet', selectedSheet);
  }, [selectedSheet]);

  useEffect(() => {
    localStorage.setItem('results.search', search);
  }, [search]);

  useEffect(() => {
    localStorage.setItem('results.sortBy', sortBy);
  }, [sortBy]);

  useEffect(() => {
    localStorage.setItem('results.category', category ?? 'null');
  }, [category]);

  useEffect(() => {
    localStorage.setItem('results.showLosersOnly', showLosersOnly);
  }, [showLosersOnly]);

  useEffect(() => {
    localStorage.setItem('results.contractType', contractType);
  }, [contractType]);

  // Update sheet options when sheetNames changes from App.js
  useEffect(() => {
    if (sheetNames && sheetNames.length > 0) {
      // Filter out "Sample Strategy (Demo)" and "Current Results" from the list, then sort
      const filteredSheets = sheetNames.filter(
        name => name !== 'Sample Strategy (Demo)' && name !== 'Current Results'
      );
      const sortedSheets = sortStrategies(filteredSheets);
      setSheetOptions(['Current Results', ...sortedSheets]);
    }
  }, [sheetNames]);

  // Pass through connectUrl from App.js
  useEffect(() => {
    if (sheetsConnectUrl) {
      setConnectUrl(sheetsConnectUrl);
    }
  }, [sheetsConnectUrl]);

  // Pass through error from App.js
  useEffect(() => {
    if (sheetError) {
      setError(sheetError);
    }
  }, [sheetError]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      setConnectUrl(null);
      try {
        if (selectedSheet === 'Current Results') {
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

          setConnectUrl(null);
          setError(null);
          setRows(Array.isArray(data.rows) ? data.rows : []);
          setStrategySheetRows([]);
          setStrategyMetrics(null);
          return;
        }

        // fetch specific sheet
        const resp = await fetch(API_ENDPOINTS.strategySheet(selectedSheet, user?.email || ''));
        const contentType = resp.headers.get('content-type') || '';
        const isJson = contentType.toLowerCase().includes('application/json');
        const data = isJson ? await resp.json() : { success: false, error: await resp.text() };

        if (resp.status === 401 && data.requiresOAuth) {
          setConnectUrl(data.authUrl || null);
          setError(data.error || 'Connect Google to view this sheet.');
          return;
        }

        if (!data.success) {
          throw new Error(data.error || 'Failed to load sheet');
        }

        setConnectUrl(null);
        setError(null);
        setStrategySheetRows(Array.isArray(data.rows) ? data.rows : []);
        setStrategyMetrics(computeStrategySheetMetrics(data.rows));
        setRows([]);
      } catch (err) {
        setError(err.message || 'Failed to load Current Results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user, selectedSheet]);

  const model = useMemo(() => transformSheetToResultsDashboardModel(rows), [rows]);

  const allStrategies = useMemo(() => model.groups.flatMap((g) => g.strategies), [model.groups]);
  const categoryOptions = useMemo(() => {
    const set = new Set(model.groups.map((g) => g.name));
    return Array.from(set).sort();
  }, [model.groups]);

  const insights = useMemo(() => {
    if (!allStrategies.length) return [];
    const worst = [...allStrategies].sort((a, b) => a.weeklyTotal - b.weeklyTotal).slice(0, 3);
    const consistent = allStrategies.filter((s) => {
      const days = Object.values(s.dailyPnL || {});
      const positives = days.filter((v) => v > 0).length;
      return s.weeklyTotal > 0 && positives >= 2;
    });
    const out = [];
    if (worst.length > 0) {
      out.push(`Top drawdown contributors: ${worst.map((s) => s.strategyName).join(', ')}`);
    }
    if (consistent.length > 0) {
      out.push(`Most consistent winners: ${consistent.map((s) => s.strategyName).join(', ')}`);
    }
    return out;
  }, [allStrategies]);

  const filteredSortedGroups = useMemo(() => {
    const matchSearch = (name) =>
      !search || name.toLowerCase().includes(search.trim().toLowerCase());

    const norm = (s) => (s || '').toString().trim().toLowerCase();

    const strategies = allStrategies
      .filter((s) => matchSearch(s.strategyName))
      .filter((s) => (showLosersOnly ? s.weeklyTotal < 0 : true))
      .filter((s) => {
        if (!category) return true;
        const groupName = model.groupByStrategy.get(s.strategyName) || 'Uncategorized';
        return norm(groupName) === norm(category);
      });

    const withComputed = strategies.map((s) => {
      const dayValues = Object.values(s.dailyPnL || {});
      return {
        ...s,
        worstDay: Math.min(...dayValues),
        positiveCount: dayValues.filter((v) => v > 0).length,
      };
    });

    if (sortBy === 'priority') {
      const orderedNames = sortStrategies(withComputed.map((s) => s.strategyName));
      const orderMap = new Map();
      orderedNames.forEach((n, i) => orderMap.set(n, i));
      withComputed.sort((a, b) => {
        const ao = orderMap.has(a.strategyName) ? orderMap.get(a.strategyName) : 999;
        const bo = orderMap.has(b.strategyName) ? orderMap.get(b.strategyName) : 999;
        if (ao !== bo) return ao - bo;
        return b.weeklyTotal - a.weeklyTotal;
      });
    } else switch (sortBy) {
      case 'totalAsc':
        withComputed.sort((a, b) => a.weeklyTotal - b.weeklyTotal);
        break;
      case 'worstDayDesc':
        withComputed.sort((a, b) => (a.worstDay || 0) - (b.worstDay || 0));
        break;
      case 'consistencyDesc':
        withComputed.sort((a, b) => (b.positiveCount || 0) - (a.positiveCount || 0));
        break;
      case 'totalDesc':
      default:
        withComputed.sort((a, b) => b.weeklyTotal - a.weeklyTotal);
        break;
    }

    // Rebuild into groups using name->group map
    const groupsMap = new Map();
    for (const s of withComputed) {
      const key = model.groupByStrategy.get(s.strategyName) || 'Uncategorized';
      if (!groupsMap.has(key)) groupsMap.set(key, []);
      groupsMap.get(key).push(s);
    }

    return Array.from(groupsMap.entries())
      .map(([name, strategies]) => ({ name, strategies }))
      .filter((g) => g.strategies.length > 0);
  }, [allStrategies, model.groupByStrategy, search, showLosersOnly, sortBy, category]);

  const isCurrent = selectedSheet === 'Current Results';

  return (
    <div className="results-dash-page">
      <div className="results-dash-header">
        <div>
          <p className="results-dash-kicker">Vector Results Spreadsheet</p>
          <div className="results-title-row">
            <h2 className="results-dash-title">{isCurrent ? 'Current Results' : selectedSheet}</h2>
            <select
              className="results-sheet-select-inline"
              aria-label="Select sheet"
              value={selectedSheet}
              onChange={(e) => setSelectedSheet(e.target.value)}
            >
              {sheetOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          {isCurrent && model.weekLabel && (
            <p className="results-dash-week">Week of {formatWeekLabel(model.weekLabel)}</p>
          )}
          {!isCurrent && (
            <p className="results-dash-week">Historical Performance Data</p>
          )}
          <p className="results-dash-subtitle">
            {isCurrent 
              ? 'Current weekly results pulled directly from the Google Sheet for easy, fast viewing.'
              : 'View detailed performance metrics and weekly breakdown for this strategy.'
            }
          </p>
          {isCurrent && (
            <div className="results-data-notice">
              <span className="results-data-notice-icon">ℹ️</span>
              <span className="results-data-notice-text">
                Data updates automatically from Google Results Spreadsheet. If you don't see the latest data, the spreadsheet owners need to update it first.
              </span>
            </div>
          )}
        </div>
        <div className="results-dash-actions">
          {isCurrent && (
            <button className="secondary" type="button" onClick={() => setShowRaw((v) => !v)}>
              {showRaw ? 'Hide raw data' : 'View raw data'}
            </button>
          )}
          {connectUrl && (
            <button
              className="primary"
              type="button"
              onClick={() => {
                if (connectUrl) {
                  const target = connectUrl.startsWith('http')
                    ? connectUrl
                    : `${API_ENDPOINTS.sheetsOAuthStart(user?.email || '')}`;
                  window.location.href = target;
                } else if (user?.email) {
                  window.location.href = API_ENDPOINTS.sheetsOAuthStart(user.email);
                } else {
                  setError('Sign in with Google first to connect.');
                }
              }}
            >
              Connect Google to View
            </button>
          )}
        </div>
      </div>

      {connectUrl && user && !loading && (
        <div className="results-dash-card warning">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <span>Connect your Google Results Spreadsheet to view data.</span>
            <button
              className="primary"
              type="button"
              onClick={() => {
                const target = connectUrl.startsWith('http')
                  ? connectUrl
                  : `${API_ENDPOINTS.sheetsOAuthStart(user?.email || '')}`;
                window.location.href = target;
              }}
            >
              Connect Google
            </button>
          </div>
        </div>
      )}

      {loading && <div className="results-dash-card">Loading current results…</div>}
      {error && !loading && (
        <div className="results-dash-card error">
          Vector Algorithmics strategies are available to members only. Sign in with Google to continue.
        </div>
      )}

      {!loading && !error && isCurrent && !showRaw && (
        <>
          <SummaryCards summary={model.summary} contractType={contractType} />
          <InsightsPanel insights={insights} />

          <ResultsControls
            search={search}
            onSearch={setSearch}
            showLosersOnly={showLosersOnly}
            onToggleLosers={setShowLosersOnly}
            sortBy={sortBy}
            onSortChange={setSortBy}
            categoryOptions={categoryOptions}
            selectedCategory={category}
            onCategoryChange={setCategory}
            contractType={contractType}
            onContractTypeChange={setContractType}
          hideLosersToggle={isCurrent}
          />

          {filteredSortedGroups.map((group) => (
            <div key={group.name} className="results-group">
              <div className="results-group-list">
                {group.strategies.map((s) => (
                  <StrategyRowCard key={s.strategyName} strategy={s} category={group.name} contractType={contractType} />
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {!loading && !error && showRaw && isCurrent && (
        <div className="results-dash-card raw">
          <div className="results-raw-wrapper">
            <table className="results-raw-table">
              <tbody>
                {rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && !isCurrent && (
        <StrategyDetailsView 
          sheetName={selectedSheet}
          metrics={strategyMetrics}
          rawRows={strategySheetRows}
        />
      )}
    </div>
  );
}

export default ResultsDashboard;

