import React from 'react';
import './SummaryCards.css';

const formatCurrency = (n) => {
  const num = Number(n) || 0;
  const sign = num < 0 ? '-' : '';
  const abs = Math.abs(num);
  return `${sign}$${abs.toLocaleString()}`;
};

function SummaryCards({ summary }) {
  if (!summary) return null;
  const { total, winners, losers, largestWin, largestLoss } = summary;

  const cards = [
    {
      title: 'Weekly Total PnL',
      value: formatCurrency(total),
      tone: total >= 0 ? 'positive' : 'negative',
      subtitle: '',
    },
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
      value: largestWin ? formatCurrency(largestWin.weeklyTotal) : '$0',
      tone: 'positive',
      subtitle: largestWin?.strategyName || '—',
    },
    {
      title: 'Largest Loss',
      value: largestLoss ? formatCurrency(largestLoss.weeklyTotal) : '$0',
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

