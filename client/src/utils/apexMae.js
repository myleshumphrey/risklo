/**
 * Calculate Apex Trader Funding's Maximum Adverse Excursion (MAE) limit
 * Based on the 30% Negative P&L Rule
 */

/**
 * @param {Object} params
 * @param {number} params.startOfDayProfit - Profit above original account size at start of day
 * @param {number} params.safetyNet - Trailing threshold / safety net amount
 * @returns {Object|null} MAE calculation result or null if insufficient data
 */
export function computeApexMaeLimit({ startOfDayProfit, safetyNet }) {
  const profit = Number(startOfDayProfit) || 0;
  const net = Number(safetyNet) || 0;

  if (!profit && !net) {
    return null;
  }

  // 1) Decide base amount:
  // - For new / low profit accounts, rule is based on trailing threshold.
  // - Otherwise use profit. A simple heuristic:
  //    - if profit <= net and net > 0 -> base = net
  //    - else -> base = profit
  let baseAmount;
  if (profit <= net && net > 0) {
    baseAmount = net;
  } else {
    baseAmount = profit || net;
  }

  // 2) Decide percent (30% vs 50%):
  // - Default: 30% (0.3)
  // - If profit >= 2 * net (roughly doubled the safety net) and net > 0 -> 50% (0.5).
  let limitPercent = 0.3;
  if (profit >= 2 * net && net > 0) {
    limitPercent = 0.5;
  }

  const maxMaePerTrade = baseAmount * limitPercent;

  return {
    baseAmount,
    limitPercent,
    maxMaePerTrade,
  };
}

