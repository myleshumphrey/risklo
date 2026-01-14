import React, { useState, useMemo } from 'react';
import './StrategyRowCard.css';

const formatCurrency = (n, contractType = 'NQ') => {
  let num = Number(n) || 0;
  // Convert to MNQ if needed (divide by 10)
  if (contractType === 'MNQ') {
    num = num / 10;
  }
  const sign = num < 0 ? '-' : '';
  const abs = Math.abs(num);
  // For MNQ, show 2 decimal places; for NQ, show whole numbers
  const formatted = contractType === 'MNQ' 
    ? abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : abs.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return `${sign}$${formatted}`;
};

const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function StrategyRowCard({ strategy, category, contractType = 'NQ' }) {
  const [open, setOpen] = useState(false);
  const weeklyTotal = strategy.weeklyTotal || 0;
  const status = weeklyTotal > 0 ? 'WIN' : weeklyTotal < 0 ? 'LOSS' : 'FLAT';

  const dayValues = dayOrder.map((d) => strategy.dailyPnL?.[d] ?? 0);
  const worstDay = Math.min(...dayValues);

  const interpretation = useMemo(() => {
    // Adjust thresholds based on contract type (MNQ is 1/10th of NQ)
    const volatilityThreshold = contractType === 'MNQ' ? -50 : -500;
    const stabilityThreshold = contractType === 'MNQ' ? -30 : -300;
    
    if (weeklyTotal < 0 && worstDay <= volatilityThreshold) {
      return 'High volatility week. Consider reducing contracts or avoiding this strategy.';
    }
    if (weeklyTotal > 0 && worstDay > stabilityThreshold) {
      return 'Stable week. Risk appears controlled.';
    }
    return 'Mixed performance. Review position sizing and entries.';
  }, [weeklyTotal, worstDay, contractType]);

  return (
    <div className="strategy-card">
      <div className="strategy-card-top" onClick={() => setOpen((o) => !o)}>
        <div className="left">
          <p className="strategy-name">{strategy.strategyName}</p>
          {category && <span className="category-pill">{category}</span>}
          <span className={`badge ${status.toLowerCase()}`}>{status}</span>
        </div>
        <div className="right">
          <span className={`weekly ${weeklyTotal >= 0 ? 'pos' : 'neg'}`}>{formatCurrency(weeklyTotal, contractType)}</span>
          <span className="chevron">{open ? '▴' : '▾'}</span>
        </div>
      </div>

      <div className="day-chips">
        {dayOrder.map((d) => {
          const val = strategy.dailyPnL?.[d] ?? 0;
          const tone = val > 0 ? 'pos' : val < 0 ? 'neg' : 'flat';
          return (
            <span key={d} className={`day-chip ${tone}`} title={`${d}: ${formatCurrency(val, contractType)}`}>
              {d.slice(0, 3)} {val !== 0 ? formatCurrency(val, contractType) : ''}
            </span>
          );
        })}
      </div>

      {open && (
        <div className="strategy-details">
          <div className="details-grid">
            {dayOrder.map((d) => (
              <div key={d} className="detail-row">
                <span>{d}</span>
                <span className={strategy.dailyPnL?.[d] >= 0 ? 'pos' : 'neg'}>
                  {formatCurrency(strategy.dailyPnL?.[d] ?? 0, contractType)}
                </span>
              </div>
            ))}
            <div className="detail-row total">
              <span>Total</span>
              <span className={weeklyTotal >= 0 ? 'pos' : 'neg'}>{formatCurrency(weeklyTotal, contractType)}</span>
            </div>
          </div>
          {strategy.notes && <p className="notes">Notes: {strategy.notes}</p>}
          <p className="interpretation">{interpretation}</p>
        </div>
      )}
    </div>
  );
}

export default StrategyRowCard;

