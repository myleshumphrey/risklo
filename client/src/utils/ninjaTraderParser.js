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
    // Round down to 2 decimal places: Math.floor(value * 100) / 100
    const netLiquidation = Math.floor(parseFloat(values[netLiquidationIdx]?.replace(/[^0-9.-]/g, '') || '0') * 100) / 100;
    const cashValue = cashValueIdx >= 0 ? Math.floor(parseFloat(values[cashValueIdx]?.replace(/[^0-9.-]/g, '') || '0') * 100) / 100 : netLiquidation;
    const trailingDrawdown = trailingDrawdownIdx >= 0 ? Math.floor(parseFloat(values[trailingDrawdownIdx]?.replace(/[^0-9.-]/g, '') || '0') * 100) / 100 : 0;

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
      startOfDayProfit: Math.floor((netLiquidation - accountSize) * 100) / 100 // Round down to 2 decimal places
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
    // Prioritize: 1) Exact match, 2) Version-aware match, 3) Base name match
    let matchedSheetName = null;
    let bestVersionMatch = null;
    let bestBaseMatch = null;
    let bestVersionScore = 0;
    let bestBaseScore = 0;
    
    const stratLower = strat.strategy.toLowerCase();
    
    // Extract version number from CSV strategy (e.g., "2.0", "2.1", "3.0")
    const versionMatch = strat.strategy.match(/(\d+\.\d+)$/);
    const csvVersion = versionMatch ? versionMatch[1] : null;
    const baseName = csvVersion ? strat.strategy.substring(0, strat.strategy.length - csvVersion.length - 1).trim() : strat.strategy;
    // Normalize base name: remove spaces and convert to lowercase for comparison
    // This allows "Grassfed Primebeef" to match "Grass Fed Prime Beef"
    const baseNameNormalized = baseName.toLowerCase().replace(/\s+/g, '');
    
    for (const sheetName of availableSheetNames) {
      const sheetLower = sheetName.toLowerCase();
      const sheetLength = sheetName.length;
      
      // 1. Exact match - highest priority
      if (sheetLower === stratLower) {
        matchedSheetName = sheetName;
        break;
      }
      
      // 2. Extract version from sheet name
      const sheetVersionMatch = sheetName.match(/(\d+\.\d+)$/);
      const sheetVersion = sheetVersionMatch ? sheetVersionMatch[1] : null;
      const sheetBaseName = sheetVersion ? sheetName.substring(0, sheetName.length - sheetVersion.length - 1).trim() : sheetName;
      // Normalize sheet base name: remove spaces and convert to lowercase for comparison
      const sheetBaseNameNormalized = sheetBaseName.toLowerCase().replace(/\s+/g, '');
      
      // 3. Check if normalized base names match (handles spacing and case differences)
      const baseNamesMatch = baseNameNormalized === sheetBaseNameNormalized;
      
      if (baseNamesMatch) {
        // Base names match - check version compatibility
        if (csvVersion && sheetVersion) {
          // Both have versions - only match if versions are the same
          if (csvVersion === sheetVersion) {
            // Exact version match - highest priority for versioned strategies
            if (!bestVersionMatch || sheetLength > bestVersionMatch.length) {
              bestVersionMatch = sheetName;
              bestVersionScore = 1000 + sheetLength; // High score for exact version match
            }
          }
          // Different versions (e.g., 2.0 vs 2.1) - don't match
        } else if (!csvVersion && !sheetVersion) {
          // Both are base names (no versions) - exact base match
          bestBaseMatch = sheetName;
          bestBaseScore = 500 + sheetLength;
        } else if (csvVersion && !sheetVersion) {
          // CSV has version but sheet doesn't - match to base sheet (version might be deprecated)
          if (sheetLength > (bestBaseMatch ? bestBaseMatch.length : 0)) {
            bestBaseMatch = sheetName;
            bestBaseScore = 300 + sheetLength;
          }
        } else if (!csvVersion && sheetVersion) {
          // Sheet has version but CSV doesn't - prefer versioned sheet if it's the only match
          if (sheetLength > (bestBaseMatch ? bestBaseMatch.length : 0)) {
            bestBaseMatch = sheetName;
            bestBaseScore = 200 + sheetLength;
          }
        }
      }
    }
    
    // Use best match: version match > base match
    if (!matchedSheetName) {
      if (bestVersionMatch && bestVersionScore > 0) {
        matchedSheetName = bestVersionMatch;
        console.info(`Matched CSV strategy "${strat.strategy}" to versioned Google Sheet "${bestVersionMatch}"`);
      } else if (bestBaseMatch && bestBaseScore > 0) {
        matchedSheetName = bestBaseMatch;
        if (csvVersion) {
          console.info(`Matched CSV strategy "${strat.strategy}" (version ${csvVersion}) to base Google Sheet "${bestBaseMatch}" (version may be deprecated or using base sheet)`);
        } else {
          console.info(`Matched CSV strategy "${strat.strategy}" to Google Sheet "${bestBaseMatch}"`);
        }
      }
    }

    // If no match found, use the strategy name from CSV directly
    // This allows users to analyze strategies even if they're not in Google Sheets
    if (!matchedSheetName) {
      matchedSheetName = strat.strategy; // Use CSV strategy name directly
      if (availableSheetNames.length > 0) {
        console.warn(`No matching sheet found for strategy: ${strat.strategy}. Using CSV strategy name (may fail if sheet doesn't exist).`);
      }
    }

    matchedAccounts.add(account.displayName);

    rows.push({
      id: Date.now() + rows.length, // Unique ID
      accountName: account.displayName, // Auto-populate from CSV
      strategy: matchedSheetName || strat.strategy,
      contractType: strat.contractType,
      accountSize: account.accountSize,
      contracts: strat.contracts,
      maxDrawdown: Math.floor((account.trailingDrawdown || 0) * 100) / 100, // Round down to 2 decimal places
      currentBalance: Math.floor(account.netLiquidation * 100) / 100, // Round down to 2 decimal places
      startOfDayProfit: Math.floor(account.startOfDayProfit * 100) / 100, // Round down to 2 decimal places
      safetyNet: Math.floor(account.safetyNet * 100) / 100, // Round down to 2 decimal places
      profitSinceLastPayout: '' // Not available in CSV
    });
  });

  // Add accounts that don't have strategies (with empty strategy to be selected by user)
  accounts.forEach(account => {
    if (!matchedAccounts.has(account.displayName)) {
      console.info(`Account ${account.displayName} has no matching strategy, adding with blank strategy`);
      rows.push({
        id: Date.now() + rows.length, // Unique ID
        accountName: account.displayName,
        strategy: '', // Empty - user can select from dropdown
        contractType: 'MNQ', // Default to MNQ
        accountSize: account.accountSize,
        contracts: 1, // Default
        maxDrawdown: Math.floor((account.trailingDrawdown || 0) * 100) / 100,
        currentBalance: Math.floor(account.netLiquidation * 100) / 100,
        startOfDayProfit: Math.floor(account.startOfDayProfit * 100) / 100,
        safetyNet: Math.floor(account.safetyNet * 100) / 100,
        profitSinceLastPayout: ''
      });
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

