import React, { useEffect, useMemo, useState } from 'react';
import './ResultsDashboard.css';
import { API_ENDPOINTS } from '../config';
import { transformSheetToResultsDashboardModel } from '../utils/transformResults';
import SummaryCards from '../components/SummaryCards';
import InsightsPanel from '../components/InsightsPanel';
import ResultsControls from '../components/ResultsControls';
import StrategyRowCard from '../components/StrategyRowCard';
import { sortStrategies } from '../utils/strategySort';

function ResultsDashboard({ user }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectUrl, setConnectUrl] = useState(null);
  const [showRaw, setShowRaw] = useState(false);

  const [search, setSearch] = useState('');
  const [showLosersOnly, setShowLosersOnly] = useState(false);
  const [sortBy, setSortBy] = useState('priority');
  const [category, setCategory] = useState(null);

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
      } catch (err) {
        setError(err.message || 'Failed to load Current Results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user]);

  const model = useMemo(() => transformSheetToResultsDashboardModel(rows), [rows]);

  const allStrategies = useMemo(() => model.groups.flatMap((g) => g.strategies), [model.groups]);
  const categoryOptions = useMemo(() => {
    const set = new Set(model.groups.map((g) => g.name));
    return Array.from(set).sort();
  }, [model.groups]);

  const insights = useMemo(() => {
    if (!allStrategies.length) return [];
    const bigLosers = allStrategies.filter((s) => s.weeklyTotal < -500);
    const worst = [...allStrategies].sort((a, b) => a.weeklyTotal - b.weeklyTotal).slice(0, 3);
    const consistent = allStrategies.filter((s) => {
      const days = Object.values(s.dailyPnL || {});
      const positives = days.filter((v) => v > 0).length;
      return s.weeklyTotal > 0 && positives >= 2;
    });
    const out = [];
    if (bigLosers.length > 0) {
      out.push(`${bigLosers.length} strategies had losses worse than -$500 this week.`);
    }
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

  return (
    <div className="results-dash-page">
      <div className="results-dash-header">
        <div>
          <p className="results-dash-kicker">Vector Results Spreadsheet</p>
          <h2 className="results-dash-title">Current Results</h2>
          <p className="results-dash-subtitle">
            Current weekly results pulled directly from the Google Sheet for easy, fast viewing.
          </p>
        </div>
        <div className="results-dash-actions">
          <button className="secondary" type="button" onClick={() => setShowRaw((v) => !v)}>
            {showRaw ? 'Hide raw data' : 'View raw data'}
          </button>
          {connectUrl && (
            <button
              className="primary"
              type="button"
              onClick={() => {
                if (connectUrl) {
                  window.location.href = connectUrl;
                } else if (user?.email) {
                  window.location.href = `/api/google-sheets/oauth/start?email=${encodeURIComponent(user.email)}`;
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

      {loading && <div className="results-dash-card">Loading current results…</div>}
      {error && !loading && <div className="results-dash-card error">{error}</div>}

      {!loading && !error && !showRaw && (
        <>
          <SummaryCards summary={model.summary} />
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
          />

          {filteredSortedGroups.map((group) => (
            <div key={group.name} className="results-group">
              <div className="results-group-list">
                {group.strategies.map((s) => (
                  <StrategyRowCard key={s.strategyName} strategy={s} category={group.name} />
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {!loading && !error && showRaw && (
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
    </div>
  );
}

export default ResultsDashboard;

