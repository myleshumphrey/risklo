// Account size presets with their corresponding trailing thresholds
export const ACCOUNT_SIZE_PRESETS = [
  { value: 25000, label: '25K FULL', threshold: 1500 },
  { value: 50000, label: '50K FULL', threshold: 2500 },
  { value: 100000, label: '100K FULL', threshold: 3000 },
  { value: 150000, label: '150K FULL', threshold: 5000 },
  { value: 250000, label: '250K FULL', threshold: 6500 },
  { value: 300000, label: '300K FULL', threshold: 7500 },
  { value: 100000, label: '100K STATIC', threshold: 625 }, // Special case for static accounts
];

// Get threshold for a given account size
export function getThresholdForAccountSize(accountSize) {
  const preset = ACCOUNT_SIZE_PRESETS.find(p => p.value === accountSize);
  return preset ? preset.threshold : null;
}

// Get default account size (50k)
export const DEFAULT_ACCOUNT_SIZE = 50000;
export const DEFAULT_THRESHOLD = 2500;

