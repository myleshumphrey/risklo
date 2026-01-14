// CSV Parser for NinjaTrader exports (backend version)

const ACCOUNT_SIZE_PRESETS = [25000, 50000, 100000, 150000, 250000];

const SAFETY_NET_RULES = {
  25000: 750,
  50000: 1500,
  100000: 3000,
  150000: 4500,
  250000: 7500,
};

function getThresholdForAccountSize(accountSize) {
  return SAFETY_NET_RULES[accountSize] || 0;
}

function findClosestAccountSize(netLiquidation) {
  let closest = ACCOUNT_SIZE_PRESETS[0];
  let minDiff = Math.abs(netLiquidation - closest);

  for (const preset of ACCOUNT_SIZE_PRESETS) {
    const diff = Math.abs(netLiquidation - preset);
    if (diff < minDiff) {
      minDiff = diff;
      closest = preset;
    }
  }

  return closest;
}

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

/**
 * Parses NinjaTrader Accounts CSV file
 */
function parseAccountsCsv(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV file appears to be empty or invalid');
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const accounts = [];

  // Find column indices
  const displayNameIdx = headers.findIndex(h => h.toLowerCase().includes('display name') || h.toLowerCase() === 'display name');
  const netLiquidationIdx = headers.findIndex(h => h.toLowerCase().includes('net liquidation') || h.toLowerCase() === 'net liquidation');
  const cashValueIdx = headers.findIndex(h => h.toLowerCase().includes('cash value') || h.toLowerCase() === 'cash value');
  const trailingDrawdownIdx = headers.findIndex(h => h.toLowerCase().includes('trailing max drawdown') || h.toLowerCase().includes('trailing max'));

  if (displayNameIdx === -1 || netLiquidationIdx === -1) {
    throw new Error('CSV file missing required columns (Display name, Net liquidation)');
  }

  // Parse each account row
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length < Math.max(displayNameIdx, netLiquidationIdx) + 1) continue;

    const displayName = values[displayNameIdx]?.trim();
    const netLiquidation = Math.floor(parseFloat(values[netLiquidationIdx]?.replace(/[^0-9.-]/g, '') || '0') * 100) / 100;
    const cashValue = cashValueIdx >= 0 ? Math.floor(parseFloat(values[cashValueIdx]?.replace(/[^0-9.-]/g, '') || '0') * 100) / 100 : netLiquidation;
    const trailingDrawdown = trailingDrawdownIdx >= 0 ? Math.floor(parseFloat(values[trailingDrawdownIdx]?.replace(/[^0-9.-]/g, '') || '0') * 100) / 100 : 0;

    if (!displayName || displayName === '' || isNaN(netLiquidation) || netLiquidation <= 0) {
      continue;
    }

    const accountSize = findClosestAccountSize(netLiquidation);
    const safetyNet = getThresholdForAccountSize(accountSize) || 0;

    accounts.push({
      displayName,
      netLiquidation,
      cashValue,
      trailingDrawdown,
      accountSize,
      safetyNet,
      startOfDayProfit: Math.floor((netLiquidation - accountSize) * 100) / 100
    });
  }

  return accounts;
}

/**
 * Parses NinjaTrader Strategies CSV file
 */
function parseStrategiesCsv(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV file appears to be empty or invalid');
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const strategies = [];

  // Find column indices
  const strategyIdx = headers.findIndex(h => h.toLowerCase().includes('strategy'));
  const instrumentIdx = headers.findIndex(h => h.toLowerCase().includes('instrument'));
  const parametersIdx = headers.findIndex(h => h.toLowerCase().includes('parameters'));
  const accountIdx = headers.findIndex(h => h.toLowerCase().includes('account'));

  if (strategyIdx === -1 || instrumentIdx === -1 || accountIdx === -1) {
    throw new Error('CSV file missing required columns (Strategy, Instrument, Account display name)');
  }

  // Parse each strategy row
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length < Math.max(strategyIdx, instrumentIdx, accountIdx) + 1) continue;

    const strategy = values[strategyIdx]?.trim();
    let instrument = values[instrumentIdx]?.trim().toUpperCase();
    const accountDisplayName = values[accountIdx]?.trim();
    const parameters = parametersIdx >= 0 ? values[parametersIdx]?.trim() : '';

    if (!strategy || !instrument || !accountDisplayName) {
      continue;
    }

    // Normalize instrument to NQ or MNQ
    if (instrument.includes('MNQ')) {
      instrument = 'MNQ';
    } else if (instrument.includes('NQ')) {
      instrument = 'NQ';
    }

    // Try to extract number of contracts from parameters
    // Parameters format: "3/3/10/50/0.6 (q1/q2/rr1/rr2/sl1)" or similar
    // First number often represents contracts/quantity
    let contracts = 1; // Default
    if (parameters) {
      const match = parameters.match(/^(\d+)/);
      if (match) {
        contracts = parseInt(match[1], 10) || 1;
      }
    }

    strategies.push({
      strategy,
      instrument,
      accountDisplayName,
      contracts
    });
  }

  return strategies;
}

/**
 * Matches accounts to strategies and creates bulk calculator rows
 */
function matchAccountsToStrategies(accounts, strategies, availableSheetNames) {
  const rows = [];
  let accountNumber = 1;

  // Group strategies by account
  const strategyByAccount = {};
  strategies.forEach(strat => {
    if (!strategyByAccount[strat.accountDisplayName]) {
      strategyByAccount[strat.accountDisplayName] = [];
    }
    strategyByAccount[strat.accountDisplayName].push(strat);
  });

  // Match each account
  accounts.forEach(account => {
    const accountStrategies = strategyByAccount[account.displayName] || [];

    if (accountStrategies.length === 0) {
      // No strategies for this account - create a row with empty strategy
      rows.push({
        accountNumber: accountNumber++,
        accountName: account.displayName,
        strategy: '',
        contractType: 'MNQ',
        numContracts: 1,
        // Keep net liquidation for calculations, but also carry cash value for email/display.
        currentBalance: account.netLiquidation,
        cashValue: account.cashValue,
        maxDrawdown: account.trailingDrawdown || 1500,
        accountSize: account.accountSize,
        startOfDayProfit: account.startOfDayProfit,
        safetyNet: account.safetyNet
      });
    } else {
      // Create a row for each strategy
      accountStrategies.forEach(strat => {
        // Try to match strategy name to available sheet names
        let matchedStrategy = strat.strategy;
        const stratLower = strat.strategy.toLowerCase();
        
        // Find best match in available sheet names
        const match = availableSheetNames.find(name => 
          name.toLowerCase() === stratLower ||
          name.toLowerCase().includes(stratLower) ||
          stratLower.includes(name.toLowerCase())
        );
        
        if (match) {
          matchedStrategy = match;
        }

        rows.push({
          accountNumber: accountNumber++,
          accountName: account.displayName,
          strategy: matchedStrategy,
          contractType: strat.instrument,
          numContracts: strat.contracts || 1,
          currentBalance: account.netLiquidation,
          cashValue: account.cashValue,
          maxDrawdown: Math.floor((account.trailingDrawdown || 1500) * 100) / 100,
          accountSize: account.accountSize,
          startOfDayProfit: Math.floor(account.startOfDayProfit * 100) / 100,
          safetyNet: Math.floor(account.safetyNet * 100) / 100
        });
      });
    }
  });

  return rows;
}

module.exports = {
  parseAccountsCsv,
  parseStrategiesCsv,
  matchAccountsToStrategies
};

