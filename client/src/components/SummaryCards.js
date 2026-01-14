import React from 'react';
import './SummaryCards.css';

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

function SummaryCards({ summary, contractType = 'NQ' }) {
  if (!summary) return null;
  const { winners, losers, largestWin, largestLoss } = summary;

  const cards = [
    {
      title: 'Winning Strategies',
      value: winners,
      tone: 'positive',
      subtitle: 'Weekly total > 0',
    },
    {
      title: 'Losing Strategies',
      value: losers,
      tone: 'negative',
      subtitle: 'Weekly total < 0',
    },
    {
      title: 'Largest Win',
      value: largestWin ? formatCurrency(largestWin.weeklyTotal, contractType) : '$0',
      tone: 'positive',
      subtitle: largestWin?.strategyName || '—',
    },
    {
      title: 'Largest Loss',
      value: largestLoss ? formatCurrency(largestLoss.weeklyTotal, contractType) : '$0',
      tone: 'negative',
      subtitle: largestLoss?.strategyName || '—',
    },
  ];

  return (
    <div className="summary-cards">
      {cards.map((card, idx) => (
        <div key={idx} className={`summary-card ${card.tone}`}>
          <p className="summary-card-title">{card.title}</p>
          <p className="summary-card-value">{card.value}</p>
          {card.subtitle && <p className="summary-card-subtitle">{card.subtitle}</p>}
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;

