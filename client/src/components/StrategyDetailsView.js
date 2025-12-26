import React, { useState } from 'react';
import './StrategyDetailsView.css';

const parseNumber = (value) => {
  if (value === undefined || value === null) return 0;
  const cleaned = value.toString().replace(/[$,]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

const formatCurrency = (val) => {
  if (val === undefined || val === null || isNaN(val)) return '$0';
  const sign = val < 0 ? '-' : '';
  return `${sign}$${Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const ordinalSuffix = (n) => {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
};

const formatWeekLabel = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('.');
  if (parts.length !== 3) return dateStr;
  const [mm, dd, yyyy] = parts.map((p) => parseInt(p, 10));
  if (isNaN(mm) || isNaN(dd) || isNaN(yyyy)) return dateStr;
  const months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];
  const month = months[mm - 1] || '';
  return `Week of ${month} ${ordinalSuffix(dd)}, ${yyyy}`;
};

const formatMonthLabel = (monthKey) => {
  if (!monthKey) return '--';
  const parts = monthKey.split('.');
  if (parts.length !== 2) return monthKey;
  const [mm, yyyy] = parts.map((p) => parseInt(p, 10));
  if (isNaN(mm) || isNaN(yyyy)) return monthKey;
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = months[mm - 1] || '';
  return `${month} ${yyyy}`;
};

function StrategyDetailsView({ sheetName, metrics, rawRows }) {
  const [showRaw, setShowRaw] = useState(false);

  // Determine column indexes dynamically based on header row (row index 1)
  const headerRow = rawRows[1] || [];
  const idxMonday = headerRow.findIndex((c) => c?.toLowerCase() === 'monday');
  const idxTuesday = headerRow.findIndex((c) => c?.toLowerCase() === 'tuesday');
  const idxWednesday = headerRow.findIndex((c) => c?.toLowerCase() === 'wednesday');
  const idxThursday = headerRow.findIndex((c) => c?.toLowerCase() === 'thursday');
  const idxFriday = headerRow.findIndex((c) => c?.toLowerCase() === 'friday');

  // Fallbacks if headers are not found
  const mondayCol = idxMonday >= 0 ? idxMonday : 1;
  const tuesdayCol = idxTuesday >= 0 ? idxTuesday : 2;
  const wednesdayCol = idxWednesday >= 0 ? idxWednesday : 3;
  const thursdayCol = idxThursday >= 0 ? idxThursday : 4;
  const fridayCol = idxFriday >= 0 ? idxFriday : 5;

  // Parse the raw data to extract weekly performance
  const parseDateValue = (value) => {
    if (!value) return 0;
    const parts = value.split('.');
    if (parts.length !== 3) return 0;
    const [mm, dd, yyyy] = parts.map((p) => parseInt(p, 10));
    if (isNaN(mm) || isNaN(dd) || isNaN(yyyy)) return 0;
    // Create sortable number: YYYYMMDD
    return yyyy * 10000 + mm * 100 + dd;
  };

  const dataRows = rawRows.slice(2); // Skip header rows
  const weeklyData = dataRows
    .map((row) => {
      const date = row[0];
      const monday = parseNumber(row[mondayCol]);
      const tuesday = parseNumber(row[tuesdayCol]);
      const wednesday = parseNumber(row[wednesdayCol]);
      const thursday = parseNumber(row[thursdayCol]);
      const friday = parseNumber(row[fridayCol]);

      // Always compute total as sum of Mon-Fri to avoid label rows
      const total = monday + tuesday + wednesday + thursday + friday;

      return {
        date,
        days: {
          Mon: monday,
          Tue: tuesday,
          Wed: wednesday,
          Thu: thursday,
          Fri: friday,
        },
        total,
      };
    })
    .filter((w) => w.date) // Filter out empty rows
    .sort((a, b) => parseDateValue(b.date) - parseDateValue(a.date)); // Most recent first

  return (
    <div className="strategy-details-view">
      {/* Summary Cards */}
      <div className="strategy-summary-cards">
        <div className="strategy-summary-card">
          <div className="strategy-summary-label">Best / Worst Day</div>
          <div className="strategy-summary-value stacked-values">
            <div className="stacked-line positive-inline">
              {formatCurrency(metrics?.bestDay?.value || 0)}
            </div>
            <div className="stacked-line negative-inline">
              {formatCurrency(metrics?.worstDay?.value || 0)}
            </div>
          </div>
          <div className="strategy-summary-meta stacked-meta">
            <div className="positive-inline">
              Best: {metrics?.bestDay?.label} ({metrics?.bestDay?.date})
            </div>
            <div className="negative-inline">
              Worst: {metrics?.worstDay?.label} ({metrics?.worstDay?.date})
            </div>
          </div>
        </div>

        <div className="strategy-summary-card">
          <div className="strategy-summary-label">Best Month</div>
          <div className={`strategy-summary-value ${metrics?.bestMonth?.value >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(metrics?.bestMonth?.value || 0)}
          </div>
          <div className="strategy-summary-meta">
            {formatMonthLabel(metrics?.bestMonth?.month)}
          </div>
        </div>

        <div className="strategy-summary-card">
          <div className="strategy-summary-label">Worst Month</div>
          <div className={`strategy-summary-value ${metrics?.worstMonth?.value >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(metrics?.worstMonth?.value || 0)}
          </div>
          <div className="strategy-summary-meta">
            {formatMonthLabel(metrics?.worstMonth?.month)}
          </div>
        </div>

        <div className="strategy-summary-card">
          <div className="strategy-summary-label">Winning / Losing Weeks</div>
          <div className="strategy-summary-value">
            <span className="positive-inline">{metrics?.winningWeeks || 0}</span>
            <span className="slash-inline">/</span>
            <span className="negative-inline">{metrics?.losingWeeks || 0}</span>
          </div>
          <div className="strategy-summary-meta">
            Totals &gt; 0 / Totals &lt; 0
          </div>
        </div>

        <div className="strategy-summary-card">
          <div className="strategy-summary-label">Total Wins / Losses</div>
          <div className="strategy-summary-value stacked-values">
            <div className="stacked-line positive-inline">
              {formatCurrency(metrics?.totalWinsSum || 0)}
            </div>
            <div className="stacked-line negative-inline">
              {formatCurrency(metrics?.totalLossSum || 0)}
            </div>
          </div>
          <div className="strategy-summary-meta">
            Sum of all winning / losing days
          </div>
        </div>
      </div>

      {/* Weekday Win Rates */}
      <div className="strategy-summary-cards weekday-cards">
        {[
          { key: 'Mon', label: 'Monday' },
          { key: 'Tue', label: 'Tuesday' },
          { key: 'Wed', label: 'Wednesday' },
          { key: 'Thu', label: 'Thursday' },
          { key: 'Fri', label: 'Friday' },
        ].map(({ key, label }) => {
          const pct = metrics?.weekdayWinRates?.[key] ?? 0;
          return (
            <div key={key} className="strategy-summary-card">
              <div className="strategy-summary-label">{label} Win Rate</div>
              <div className={`strategy-summary-value ${pct >= 50 ? 'positive' : 'negative'}`}>
                {pct.toFixed(1)}%
              </div>
              <div className="strategy-summary-meta">
                Wins / total days with data
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Performance Table */}
      <div className="strategy-weekly-performance">
        <div className="strategy-section-header">
          <h3>Weekly Performance</h3>
          <button 
            className="toggle-raw-btn"
            onClick={() => setShowRaw(!showRaw)}
          >
            {showRaw ? 'Hide' : 'View'} raw data
          </button>
        </div>

        {!showRaw ? (
          <div className="strategy-weeks-grid">
            {weeklyData.map((week, idx) => (
              <div key={idx} className={`strategy-week-card ${week.total >= 0 ? 'win' : 'loss'}`}>
                <div className="strategy-week-header">
                  <span className="strategy-week-date">{formatWeekLabel(week.date)}</span>
                  <span className={`strategy-week-total ${week.total >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(week.total)}
                  </span>
                </div>
                <div className="strategy-week-days">
                  {Object.entries(week.days).map(([day, value]) => (
                    <div key={day} className="strategy-day-item">
                      <span className="strategy-day-label">{day}</span>
                      <span className={`strategy-day-value ${value >= 0 ? 'positive' : 'negative'}`}>
                        {formatCurrency(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="results-raw-wrapper">
            <table className="results-raw-table">
              <tbody>
                {rawRows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default StrategyDetailsView;

