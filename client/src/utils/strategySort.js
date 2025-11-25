/**
 * Priority order for strategies (most used first)
 */
const STRATEGY_PRIORITY = [
  'Grass Fed Prime Beef 2.0',
  'Grass Fed Prime Beef',
  'BeefBowl',
  'BeefBowl 1 micro 100 trigger',
  'PrimeBeef',
  'Meat Popsicle',
  'Genki',
  'Filet Mignon'
];

/**
 * Sorts strategy names with priority strategies first, then alphabetically
 * @param {string[]} strategies - Array of strategy names from Google Sheet
 * @returns {string[]} - Sorted array with priority strategies first
 */
export function sortStrategies(strategies) {
  if (!strategies || strategies.length === 0) {
    return [];
  }

  // Separate into priority and other strategies
  const priorityStrategies = [];
  const otherStrategies = [];
  const prioritySet = new Set(STRATEGY_PRIORITY.map(s => s.toLowerCase()));

  strategies.forEach(strategy => {
    if (prioritySet.has(strategy.toLowerCase())) {
      priorityStrategies.push(strategy);
    } else {
      otherStrategies.push(strategy);
    }
  });

  // Sort priority strategies by their order in STRATEGY_PRIORITY
  priorityStrategies.sort((a, b) => {
    const indexA = STRATEGY_PRIORITY.findIndex(p => p.toLowerCase() === a.toLowerCase());
    const indexB = STRATEGY_PRIORITY.findIndex(p => p.toLowerCase() === b.toLowerCase());
    return indexA - indexB;
  });

  // Sort other strategies alphabetically
  otherStrategies.sort((a, b) => a.localeCompare(b));

  // Combine: priority first, then others
  return [...priorityStrategies, ...otherStrategies];
}

