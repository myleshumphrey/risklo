import React from 'react';
import './ResultsControls.css';

function ResultsControls({
  search,
  onSearch,
  showLosersOnly,
  onToggleLosers,
  sortBy,
  onSortChange,
  categoryOptions = [],
  selectedCategory,
  onCategoryChange,
  hideLosersToggle = false,
}) {
  return (
    <div className="results-controls">
      <input
        type="text"
        placeholder="Search strategies..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
      {categoryOptions.length > 0 && (
        <select
          value={selectedCategory || 'all'}
          onChange={(e) => onCategoryChange(e.target.value === 'all' ? null : e.target.value)}
        >
          <option value="all">All categories</option>
          {categoryOptions.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      )}
      {!hideLosersToggle && (
        <label className="toggle">
          <input
            type="checkbox"
            checked={showLosersOnly}
            onChange={(e) => onToggleLosers(e.target.checked)}
          />
          Show losers only
        </label>
      )}
      <select value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
        <option value="priority">Strategy priority (default)</option>
        <option value="totalDesc">Weekly Total (desc)</option>
        <option value="totalAsc">Weekly Total (asc)</option>
        <option value="worstDayDesc">Largest single-day loss</option>
        <option value="consistencyDesc">Most consistent</option>
      </select>
    </div>
  );
}

export default ResultsControls;

