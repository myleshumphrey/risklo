const parseNumber = (value) => {
  if (value === undefined || value === null) return 0;
  const cleaned = value.toString().replace(/[$,]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

export function computeStrategySheetMetrics(rows = []) {
  // Dynamically detect weekday columns from header (row index 1)
  const headerRow = rows[1] || [];
  const idxMonday = headerRow.findIndex((c) => c?.toLowerCase() === 'monday');
  const idxTuesday = headerRow.findIndex((c) => c?.toLowerCase() === 'tuesday');
  const idxWednesday = headerRow.findIndex((c) => c?.toLowerCase() === 'wednesday');
  const idxThursday = headerRow.findIndex((c) => c?.toLowerCase() === 'thursday');
  const idxFriday = headerRow.findIndex((c) => c?.toLowerCase() === 'friday');

  const mondayCol = idxMonday >= 0 ? idxMonday : 1;
  const tuesdayCol = idxTuesday >= 0 ? idxTuesday : 2;
  const wednesdayCol = idxWednesday >= 0 ? idxWednesday : 3;
  const thursdayCol = idxThursday >= 0 ? idxThursday : 4;
  const fridayCol = idxFriday >= 0 ? idxFriday : 5;

  const dayCols = [mondayCol, tuesdayCol, wednesdayCol, thursdayCol, fridayCol];

  const dataRows = rows.slice(2); // skip top headers
  let bestDayVal = -Infinity;
  let bestDay = null;
  let worstDayVal = Infinity;
  let worstDay = null;
  let bestWeekVal = -Infinity;
  let bestWeekDate = null;
  let worstWeekVal = Infinity;
  let worstWeekDate = null;
  let winningWeeks = 0;
  let losingWeeks = 0;
  const monthTotals = new Map(); // key: mm.yyyy -> sum
  const weekdayWinCounts = {
    Mon: { wins: 0, total: 0 },
    Tue: { wins: 0, total: 0 },
    Wed: { wins: 0, total: 0 },
    Thu: { wins: 0, total: 0 },
    Fri: { wins: 0, total: 0 },
  };

  dataRows.forEach((row) => {
    const date = row[0];
    const days = dayCols.map((colIdx) => parseNumber(row[colIdx]));

    // Track weekday win/loss counts
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    labels.forEach((label, idx) => {
      const val = days[idx] ?? 0;
      if (val !== 0) {
        weekdayWinCounts[label].total += 1;
        if (val > 0) weekdayWinCounts[label].wins += 1;
      }
    });

    // Total for the week
    const total = days.reduce((a, b) => a + b, 0);

    // Track month totals
    if (date) {
      const parts = date.split('.');
      if (parts.length === 3) {
        const mm = parts[0];
        const yyyy = parts[2];
        const monthKey = `${mm}.${yyyy}`;
        monthTotals.set(monthKey, (monthTotals.get(monthKey) || 0) + total);
      }
    }

    // track day extremes
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].forEach((label, idx) => {
      const val = days[idx] ?? 0;
      if (val > bestDayVal) {
        bestDayVal = val;
        bestDay = { label, value: val, date };
      }
      if (val < worstDayVal) {
        worstDayVal = val;
        worstDay = { label, value: val, date };
      }
    });

    // track week extremes
    if (total > bestWeekVal) {
      bestWeekVal = total;
      bestWeekDate = date;
    }
    if (total < worstWeekVal) {
      worstWeekVal = total;
      worstWeekDate = date;
    }
    if (total > 0) winningWeeks += 1;
    if (total < 0) losingWeeks += 1;
  });

  // Compute best/worst month
  let bestMonth = null;
  let worstMonth = null;
  monthTotals.forEach((sum, key) => {
    if (!bestMonth || sum > bestMonth.value) bestMonth = { month: key, value: sum };
    if (!worstMonth || sum < worstMonth.value) worstMonth = { month: key, value: sum };
  });

  // Totals across all days
  let totalWinsSum = 0;
  let totalLossSum = 0;
  dataRows.forEach((row) => {
    const days = dayCols.map((colIdx) => parseNumber(row[colIdx]));
    days.forEach((val) => {
      if (val > 0) totalWinsSum += val;
      if (val < 0) totalLossSum += val; // negative sum
    });
  });

  // Compute weekday win percentages
  const weekdayWinRates = {};
  Object.entries(weekdayWinCounts).forEach(([label, stats]) => {
    const pct = stats.total === 0 ? 0 : (stats.wins / stats.total) * 100;
    weekdayWinRates[label] = Math.round(pct * 10) / 10; // one decimal
  });

  return {
    bestDay,
    worstDay,
    bestWeek: { date: bestWeekDate, value: bestWeekVal },
    worstWeek: { date: worstWeekDate, value: worstWeekVal },
    winningWeeks,
    losingWeeks,
    bestMonth,
    worstMonth,
    weekdayWinRates,
    totalWinsSum,
    totalLossSum,
  };
}


