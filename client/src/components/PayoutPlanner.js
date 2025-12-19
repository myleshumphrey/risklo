import React, { useMemo, useState } from 'react';
import './PayoutPlanner.css';
import { addUsTradingDays, isUsTradingDay, nextUsTradingDay } from '../utils/usMarketCalendar';

function fmtMoney(n) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—';
  return `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDateUTC(d) {
  if (!d) return '—';
  // d is UTC date-only
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function PayoutPlanner({ metrics }) {
  const windfall = metrics?.windfallRule || null;

  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const [tradingDaysRequired, setTradingDaysRequired] = useState(15);

  const parsed = useMemo(() => {
    const highestProfitDay = windfall?.maxProfitDay != null ? Number(windfall.maxProfitDay) : null;
    const minTotalProfitRequired = windfall?.minTotalProfitRequired != null ? Number(windfall.minTotalProfitRequired) : null;
    const profitBalance = windfall?.profitBalanceForWindfall != null ? Number(windfall.profitBalanceForWindfall) : null;
    const remainingProfitNeeded =
      profitBalance != null && minTotalProfitRequired != null
        ? Math.max(0, minTotalProfitRequired - profitBalance)
        : null;

    const maxProfitTodayAllowed = windfall?.maxProfitTodayAllowed != null ? Number(windfall.maxProfitTodayAllowed) : null;
    const maxDailyProfitAt30Pct = profitBalance != null ? profitBalance * 0.3 : null;

    const start = new Date(`${startDate}T00:00:00`);
    const startIsTradingDay = isUsTradingDay(start);
    const firstTradingDay = startIsTradingDay ? nextUsTradingDay(start) : nextUsTradingDay(start);
    const payoutDate = addUsTradingDays(start, tradingDaysRequired, { includeStart: true });

    const profitPerDay =
      remainingProfitNeeded != null && tradingDaysRequired > 0
        ? remainingProfitNeeded / Number(tradingDaysRequired)
        : null;

    return {
      highestProfitDay,
      minTotalProfitRequired,
      profitBalance,
      remainingProfitNeeded,
      maxProfitTodayAllowed,
      maxDailyProfitAt30Pct,
      startIsTradingDay,
      firstTradingDay,
      payoutDate,
      profitPerDay,
    };
  }, [windfall, startDate, tradingDaysRequired]);

  // If we don't have profit history for the strategy, don't show planner.
  if (!windfall || !windfall.minTotalProfitRequired) return null;

  return (
    <div className="payout-planner">
      <div className="payout-planner-header">
        <div>
          <div className="payout-planner-title">Payout Planner (30% Consistency)</div>
          <div className="payout-planner-subtitle">
            Calendar uses US trading days (excludes weekends + US market holidays).
          </div>
        </div>
      </div>

      <div className="payout-planner-grid">
        <div className="payout-planner-card">
          <div className="payout-label">Highest Profit Day (Strategy History)</div>
          <div className="payout-value">{fmtMoney(parsed.highestProfitDay)}</div>
        </div>

        <div className="payout-planner-card">
          <div className="payout-label">Minimum Total Profit Required</div>
          <div className="payout-value">{fmtMoney(parsed.minTotalProfitRequired)}</div>
          <div className="payout-subtext">Highest Profit Day ÷ 0.30</div>
        </div>

        <div className="payout-planner-card">
          <div className="payout-label">Remaining Profit Needed</div>
          <div className="payout-value">{fmtMoney(parsed.remainingProfitNeeded)}</div>
          <div className="payout-subtext">
            Based on your Profit Since Last Payout (if entered), otherwise your Start-of-Day Profit Balance.
          </div>
        </div>
      </div>

      <div className="payout-planner-grid payout-planner-grid-2">
        <div className="payout-planner-card">
          <div className="payout-label">Max Profit You Can Make Today (Stays Compliant)</div>
          <div className="payout-value">{fmtMoney(parsed.maxProfitTodayAllowed)}</div>
          <div className="payout-subtext">
            Reference: 30% of current profit = {fmtMoney(parsed.maxDailyProfitAt30Pct)}
          </div>
        </div>

        <div className="payout-planner-card">
          <div className="payout-label">Profit Per Day Target</div>
          <div className="payout-value">{fmtMoney(parsed.profitPerDay)}</div>
          <div className="payout-subtext">Remaining ÷ Trading Days Required</div>
        </div>
      </div>

      <div className="payout-planner-controls">
        <div className="payout-control">
          <label className="payout-control-label">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="payout-control-input"
          />
          {!parsed.startIsTradingDay && (
            <div className="payout-control-hint">
              Start date is not a US trading day. Counting will begin on {fmtDateUTC(parsed.firstTradingDay)}.
            </div>
          )}
        </div>

        <div className="payout-control">
          <label className="payout-control-label">Trading Days Required</label>
          <input
            type="number"
            min="1"
            max="30"
            value={tradingDaysRequired}
            onChange={(e) => setTradingDaysRequired(Number(e.target.value || 15))}
            className="payout-control-input"
          />
          <div className="payout-control-hint">Common values: 10 or 15</div>
        </div>

        <div className="payout-control payout-control-result">
          <label className="payout-control-label">Earliest Payout Request Date</label>
          <div className="payout-date">{fmtDateUTC(parsed.payoutDate)}</div>
          <div className="payout-control-hint">Counts US trading days and excludes US market holidays.</div>
        </div>
      </div>
    </div>
  );
}


