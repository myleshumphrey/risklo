import React from 'react';
import './StrategySheetHeader.css';

const fmt = (n) => {
  if (n === null || n === undefined || isNaN(n)) return '$0';
  const num = Number(n);
  const sign = num < 0 ? '-' : '';
  const abs = Math.abs(num);
  return `${sign}$${abs.toLocaleString()}`;
};

function StrategySheetHeader({ sheetName, metrics }) {
  if (!sheetName || !metrics) return null;
  const { bestDay, worstDay, bestWeek, worstWeek, winningWeeks, losingWeeks } = metrics;

  const cards = [
    {
      title: 'Best Day',
      value: fmt(bestDay?.value),
      subtitle: bestDay ? `${bestDay.label} (${bestDay.date || '—'})` : '—',
    },
    {
      title: 'Worst Day',
      value: fmt(worstDay?.value),
      subtitle: worstDay ? `${worstDay.label} (${worstDay.date || '—'})` : '—',
    },
    {
      title: 'Best Week',
      value: fmt(bestWeek?.value),
      subtitle: bestWeek?.date || '—',
    },
    {
      title: 'Worst Week',
      value: fmt(worstWeek?.value),
      subtitle: worstWeek?.date || '—',
    },
    {
      title: 'Winning Weeks',
      value: winningWeeks ?? 0,
      subtitle: 'Totals > 0',
    },
    {
      title: 'Losing Weeks',
      value: losingWeeks ?? 0,
      subtitle: 'Totals < 0',
    },
  ];

  return (
    <div className="strategy-sheet-header">
      <div>
        <p className="results-dash-kicker">Vector Results Spreadsheet</p>
        <h2 className="results-dash-title">{sheetName}</h2>
      </div>
      <div className="strategy-sheet-cards">
        {cards.map((c, idx) => (
          <div key={idx} className="strategy-sheet-card">
            <p className="strategy-sheet-card-title">{c.title}</p>
            <p className="strategy-sheet-card-value">{c.value}</p>
            <p className="strategy-sheet-card-sub">{c.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StrategySheetHeader;

