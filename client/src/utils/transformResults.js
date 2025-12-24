// Utility to normalize the Current Results sheet rows into a dashboard-friendly model

const parseNumber = (value) => {
  if (value === undefined || value === null) return 0;
  const cleaned = value.toString().replace(/[$,]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

export function transformSheetToResultsDashboardModel(rows = []) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      weekLabel: '',
      groups: [],
      summary: { total: 0, winners: 0, losers: 0, largestWin: null, largestLoss: null },
    };
  }

  // Attempt to find a week label (first non-empty string that looks like a date or label)
  const weekLabel =
    rows.find((r) => r && r[0] && r[0].toString().trim().length > 0)?.[0]?.toString() || '';

  const datePattern = /^\d{1,2}\.\d{1,2}\.\d{4}$/; // e.g., 12.22.2025
  const weekdayLabels = new Set(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'mon', 'tue', 'wed', 'thu', 'fri']);

  const groups = [];
  const groupByStrategy = new Map();
  let currentGroup = { name: 'Uncategorized', strategies: [] };

  const flushGroup = () => {
    if (currentGroup && currentGroup.strategies.length > 0) {
      groups.push(currentGroup);
    }
  };

  for (const row of rows) {
    if (!row || row.length === 0) continue;
    const first = (row[0] || '').toString().trim();
    const others = row.slice(1).filter((c) => (c || '').toString().trim() !== '');

    // If this row is a date label, capture weekLabel and skip
    if (first && datePattern.test(first)) {
      if (!weekLabel) weekLabel = first;
      continue;
    }

    // Skip rows with no name or obvious non-strategy markers
    if (!first || first === '/' || first.toLowerCase() === 'total') {
      continue;
    }

    // Detect if row contains any numeric value (currency or number)
    const hasNumeric = others.some((cell) => {
      const s = (cell || '').toString().replace(/[$,]/g, '').trim();
      if (!s) return false;
      return !isNaN(parseFloat(s));
    });

    const hasWeekdayLabel = others.some((cell) => weekdayLabels.has((cell || '').toString().trim().toLowerCase()));
    const allNonNumeric = !hasNumeric;
    const allEmptyOrSlash = others.length > 0 && others.every((cell) => {
      const s = (cell || '').toString().trim();
      return s === '' || s === '/';
    });

    // Detect group header:
    // 1) Non-empty first cell and all others empty or '/'
    // 2) Non-empty first cell, no numeric values in the rest, and at least one weekday label (header row)
    if ((first && allEmptyOrSlash) || (first && allNonNumeric && hasWeekdayLabel)) {
      flushGroup();
      currentGroup = { name: first, strategies: [] };
      continue;
    }

    // Strategy row if it has at least one daily or total value
    // Column mapping: A=name(0), B=spacing(1), C=Mon(2), D=Tue(3), E=Wed(4), F=Thu(5), G=Fri(6), H=Total(7), I/J notes
    const days = {
      Monday: parseNumber(row[2]),
      Tuesday: parseNumber(row[3]),
      Wednesday: parseNumber(row[4]),
      Thursday: parseNumber(row[5]),
      Friday: parseNumber(row[6]),
    };
    const rawTotal = row[7];
    const hasTotal =
      rawTotal !== undefined &&
      rawTotal !== null &&
      rawTotal.toString().trim() !== '';
    const hasAnyDay = Object.values(days).some((v) => v !== 0);

    if (!hasTotal && !hasAnyDay) {
      // nothing meaningful here
      continue;
    }

    const weeklyTotal = hasTotal
      ? parseNumber(rawTotal)
      : Object.values(days).reduce((a, b) => a + b, 0);
    const notes = row[8] || row[9] || '';

    const strategyObj = {
      strategyName: first,
      dailyPnL: days,
      weeklyTotal,
      notes: notes ? notes.toString() : '',
    };
    currentGroup.strategies.push(strategyObj);
    groupByStrategy.set(first, currentGroup.name);
  }

  flushGroup();

  // Compute summary
  const allStrategies = groups.flatMap((g) => g.strategies);
  const total = allStrategies.reduce((sum, s) => sum + s.weeklyTotal, 0);
  const winners = allStrategies.filter((s) => s.weeklyTotal > 0).length;
  const losers = allStrategies.filter((s) => s.weeklyTotal < 0).length;
  const largestWin =
    allStrategies.length > 0
      ? allStrategies.reduce((max, s) => (s.weeklyTotal > (max?.weeklyTotal ?? -Infinity) ? s : max), null)
      : null;
  const largestLoss =
    allStrategies.length > 0
      ? allStrategies.reduce((min, s) => (s.weeklyTotal < (min?.weeklyTotal ?? Infinity) ? s : min), null)
      : null;

  return {
    weekLabel,
    groups,
    summary: { total, winners, losers, largestWin, largestLoss },
    groupByStrategy,
  };
}

