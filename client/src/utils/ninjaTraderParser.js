import { ACCOUNT_SIZE_PRESETS, getThresholdForAccountSize } from './accountSizes';

/**
 * Parses NinjaTrader Accounts CSV file
 * Expected columns: ConnectionStatus, Connection, Display name, Cash value, Net liquidation, 
 *                   Gross realized PnL, Realized PnL, Unrealized PnL, Total PnL, Trailing max drawdown, Close
 */
export function parseAccountsCsv(csvText) {
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
    const netLiquidation = parseFloat(values[netLiquidationIdx]?.replace(/[^0-9.-]/g, '') || '0');
    const cashValue = cashValueIdx >= 0 ? parseFloat(values[cashValueIdx]?.replace(/[^0-9.-]/g, '') || '0') : netLiquidation;
    const trailingDrawdown = trailingDrawdownIdx >= 0 ? parseFloat(values[trailingDrawdownIdx]?.replace(/[^0-9.-]/g, '') || '0') : 0;

    if (!displayName || displayName === '' || isNaN(netLiquidation) || netLiquidation <= 0) {
      continue; // Skip invalid rows
    }

    // Determine account size by finding closest preset
    const accountSize = findClosestAccountSize(netLiquidation);
    const safetyNet = getThresholdForAccountSize(accountSize) || 0;

    accounts.push({
      displayName,
      netLiquidation,
      cashValue,
      trailingDrawdown,
      accountSize,
      safetyNet,
      startOfDayProfit: netLiquidation - accountSize
    });
  }

  return accounts;
}

/**
 * Parses NinjaTrader Strategies CSV file
 * Expected columns: Strategy, Instrument, Data series, Parameters, Position, Acct. position, 
 *                   Sync, Avg. price, Unrealized, Realized, Account display name, Connection, Enabled
 */
export function parseStrategiesCsv(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV file appears to be empty or invalid');
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const strategies = [];

  // Find column indices
  const strategyIdx = headers.findIndex(h => h.toLowerCase() === 'strategy');
  const instrumentIdx = headers.findIndex(h => h.toLowerCase() === 'instrument');
  const parametersIdx = headers.findIndex(h => h.toLowerCase() === 'parameters');
  const accountDisplayNameIdx = headers.findIndex(h => 
    h.toLowerCase().includes('account display name') || 
    h.toLowerCase().includes('account display') ||
    h.toLowerCase() === 'account display name'
  );

  if (strategyIdx === -1 || instrumentIdx === -1 || accountDisplayNameIdx === -1) {
    throw new Error('CSV file missing required columns (Strategy, Instrument, Account display name)');
  }

  // Parse each strategy row
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length < Math.max(strategyIdx, instrumentIdx, accountDisplayNameIdx) + 1) continue;

    const strategy = values[strategyIdx]?.trim();
    const instrument = values[instrumentIdx]?.trim();
    const accountDisplayName = values[accountDisplayNameIdx]?.trim();
    const parameters = parametersIdx >= 0 ? values[parametersIdx]?.trim() : '';

    if (!strategy || !instrument || !accountDisplayName) {
      continue; // Skip invalid rows
    }

    // Determine contract type from instrument (NQ = NQ, MNQ = MNQ)
    const contractType = instrument.toUpperCase().includes('MNQ') ? 'MNQ' : 'NQ';

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
      contractType,
      accountDisplayName,
      contracts,
      instrument
    });
  }

  return strategies;
}

/**
 * Matches accounts with strategies and creates bulk calculator rows
 */
export function matchAccountsToStrategies(accounts, strategies, availableSheetNames) {
  const rows = [];
  const matchedAccounts = new Set();

  // Create a map of account display names to account data
  const accountMap = {};
  accounts.forEach(acc => {
    accountMap[acc.displayName] = acc;
  });

  // Match strategies to accounts
  strategies.forEach(strat => {
    const account = accountMap[strat.accountDisplayName];
    if (!account) return; // No matching account found

    // Try to match strategy name to available sheet names
    // Prioritize exact matches, then longer matches
    let matchedSheetName = null;
    let bestMatch = null;
    let bestMatchScore = 0;
    
    const stratLower = strat.strategy.toLowerCase();
    
    for (const sheetName of availableSheetNames) {
      const sheetLower = sheetName.toLowerCase();
      
      // Exact match - highest priority
      if (sheetLower === stratLower) {
        matchedSheetName = sheetName;
        break;
      }
      
      // Calculate match score (prefer longer, more specific matches)
      let score = 0;
      if (sheetLower.includes(stratLower)) {
        // Sheet name contains strategy name (e.g., "Grass Fed Prime Beef 2.0" contains "Grass Fed Prime Beef")
        score = stratLower.length; // Prefer longer strategy names
      } else if (stratLower.includes(sheetLower)) {
        // Strategy name contains sheet name (e.g., "Grass Fed Prime Beef" contains "Grass Fed Prime Beef 2.0")
        score = sheetLower.length; // Prefer longer sheet names
      }
      
      // Prefer matches where both contain each other (more specific)
      if (sheetLower.includes(stratLower) && stratLower.includes(sheetLower)) {
        score += 1000; // Boost for mutual inclusion
      }
      
      if (score > bestMatchScore) {
        bestMatchScore = score;
        bestMatch = sheetName;
      }
    }
    
    // Use best match if no exact match found
    if (!matchedSheetName && bestMatch) {
      matchedSheetName = bestMatch;
    }

    // If no match found, try to use the strategy name as-is
    if (!matchedSheetName && availableSheetNames.length > 0) {
      // Could prompt user or use first available, but for now skip
      console.warn(`No matching sheet found for strategy: ${strat.strategy}`);
      return;
    }

    matchedAccounts.add(account.displayName);

    rows.push({
      id: Date.now() + rows.length, // Unique ID
      accountName: account.displayName, // Auto-populate from CSV
      strategy: matchedSheetName || strat.strategy,
      contractType: strat.contractType,
      accountSize: account.accountSize,
      contracts: strat.contracts,
      maxDrawdown: account.trailingDrawdown || 0,
      currentBalance: account.netLiquidation,
      startOfDayProfit: account.startOfDayProfit,
      safetyNet: account.safetyNet,
      profitSinceLastPayout: '' // Not available in CSV
    });
  });

  // Add accounts that don't have strategies (with default values)
  accounts.forEach(account => {
    if (!matchedAccounts.has(account.displayName)) {
      // Could add a row with empty strategy, but for now skip
      console.warn(`Account ${account.displayName} has no matching strategy`);
    }
  });

  return rows;
}

/**
 * Helper function to parse CSV line handling quoted values
 */
function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim()); // Push last value

  return values;
}

/**
 * Finds the closest account size preset to the given value
 */
function findClosestAccountSize(balance) {
  const presets = ACCOUNT_SIZE_PRESETS.map(p => p.value);
  
  // If balance is very close to a preset (within 5%), use that preset
  for (const preset of presets) {
    const diff = Math.abs(balance - preset);
    const percentDiff = (diff / preset) * 100;
    if (percentDiff <= 5) {
      return preset;
    }
  }

  // Otherwise, find the closest preset
  let closest = presets[0];
  let minDiff = Math.abs(balance - closest);

  for (const preset of presets) {
    const diff = Math.abs(balance - preset);
    if (diff < minDiff) {
      minDiff = diff;
      closest = preset;
    }
  }

  return closest;
}

/**
 * Detects CSV file type (accounts or strategies) based on headers
 */
export function detectCsvType(csvText) {
  const firstLine = csvText.split('\n')[0].toLowerCase();
  
  if (firstLine.includes('display name') && firstLine.includes('net liquidation')) {
    return 'accounts';
  } else if (firstLine.includes('strategy') && firstLine.includes('instrument')) {
    return 'strategies';
  }
  
  return 'unknown';
}

