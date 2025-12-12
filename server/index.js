const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const Stripe = require('stripe');
require('dotenv').config();

// Initialize Stripe (only if secret key is provided)
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });
} else {
  console.warn('WARNING: STRIPE_SECRET_KEY not set. Stripe features will be disabled.');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Email service uses SendGrid API (not SMTP) for better reliability in cloud environments

// Hardcoded spreadsheet ID
const SPREADSHEET_ID = '1PCU-1ZjBEkAF1LE3Z1tbajCg3hOBzpKxx--z9QU8sAE';

// CORS configuration - allow requests from Netlify domain, localhost, and local network IPs
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://192.168.183.203:3000', // Local network IP for mobile testing
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    console.log('CORS: Checking origin:', origin);
    
    // Check if origin is in allowed list, or allow all if FRONTEND_URL not set
    if (process.env.FRONTEND_URL && !allowedOrigins.includes(origin)) {
      // For local network IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x), allow them
      if (/^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(origin)) {
        console.log('CORS: Allowing local network IP:', origin);
        return callback(null, true);
      }
      console.log('CORS: Blocking origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
    console.log('CORS: Allowing origin:', origin);
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

// Initialize Google Sheets API
// Support both environment variable (for production) and file (for local dev)
let auth;
if (process.env.GOOGLE_CREDENTIALS_JSON) {
  // Use JSON from environment variable (production)
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
  auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
} else {
  // Fallback to file (local development)
  auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
}

// Helper function to get all sheet names
/**
 * Filters out unwanted sheet names (date sheets, current results, etc.)
 * @param {string[]} sheetNames - Array of sheet names from Google Sheets
 * @returns {string[]} - Filtered array with only strategy sheets
 */
function filterSheetNames(sheetNames) {
  if (!sheetNames || !Array.isArray(sheetNames)) {
    return [];
  }

  // Patterns to exclude:
  // 1. Date sheets in format MM.YYYY (e.g., "01.2025", "12.2024")
  // 2. "Current results" and "Current results (Hidden)"
  const datePattern = /^\d{2}\.\d{4}$/; // Matches MM.YYYY format
  const excludedNames = new Set([
    'Current results',
    'Current results (Hidden)'
  ]);

  return sheetNames.filter(name => {
    // Skip if name is empty or null
    if (!name || typeof name !== 'string') {
      return false;
    }

    // Skip if it matches date pattern
    if (datePattern.test(name.trim())) {
      return false;
    }

    // Skip if it's in the excluded names list (case-insensitive)
    const normalizedName = name.trim();
    for (const excluded of excludedNames) {
      if (normalizedName.toLowerCase() === excluded.toLowerCase()) {
        return false;
      }
    }

    return true;
  });
}

async function getSheetNames() {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    
    const allSheetNames = response.data.sheets
      .map(sheet => sheet.properties?.title)
      .filter(title => title != null); // Filter out null/undefined titles
    
    // Filter out unwanted sheets (date sheets, current results, etc.)
    return filterSheetNames(allSheetNames);
  } catch (error) {
    console.error('Error fetching sheet names:', error);
    throw error;
  }
}

// Helper function to get sheet data
async function getSheetData(sheetName) {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    // Get all data from the sheet (assuming data starts from row 3 based on the image)
    const range = `${sheetName}!A:Z`;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });
    return response.data.values;
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    // Handle case where sheet doesn't exist (may have been deleted)
    if (error.message && (error.message.includes('Unable to parse range') || error.message.includes('400'))) {
      throw new Error(`Sheet "${sheetName}" not found. It may have been deleted or renamed.`);
    }
    throw error;
  }
}

// Helper function to parse numeric values, handling currency formatting
function parseNumericValue(cellValue) {
  if (cellValue === null || cellValue === undefined || cellValue === '') {
    return NaN;
  }
  
  // Convert to string
  const str = String(cellValue).trim();
  if (str === '') return NaN;
  
  // Check for negative sign first (before removing $)
  const isNegative = str.startsWith('-');
  
  // Remove currency symbols, commas, and whitespace
  const cleaned = str.replace(/[\$,\s()]/g, '').trim();
  
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) return NaN;
  
  // Apply negative sign if present
  return isNegative ? -Math.abs(parsed) : parsed;
}

// Calculate Apex MAE limit
function computeApexMaeLimit(startOfDayProfit, safetyNet) {
  const profit = Number(startOfDayProfit) || 0;
  const net = Number(safetyNet) || 0;

  if (!profit && !net) {
    return null;
  }

  // Decide base amount
  let baseAmount;
  if (profit <= net && net > 0) {
    baseAmount = net;
  } else {
    baseAmount = profit || net;
  }

  // Decide percent (30% vs 50%)
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

// Calculate risk metrics from data
// Based on the sheet structure: dates in column A, daily values in columns C-G (Mon-Fri)
function calculateRiskMetrics(data, accountSize, contracts, maxDrawdown, contractType = 'NQ', startOfDayProfit = null, safetyNet = null, profitSinceLastPayout = null) {
  if (!data || data.length < 3) {
    return { error: 'Insufficient data' };
  }

  // Skip header rows (rows 1-2), start from row 3 (index 2)
  const rows = data.slice(2);
  const allLosses = [];
  const allProfits = [];
  const dailyValues = [];

  // MNQ is 1/10th the value of NQ, so we need to divide by 10
  const contractMultiplier = contractType === 'MNQ' ? 0.1 : 1.0;

  rows.forEach((row, rowIndex) => {
    // Skip rows that are too short or appear to be summary/header rows
    if (!row || row.length < 3) return;
    
    // Columns C-G are Monday-Friday (indices 2-6)
    // Column A is date (index 0), Column B might be empty or have labels
    for (let i = 2; i <= 6 && i < row.length; i++) {
      const cellValue = row[i];
      const value = parseNumericValue(cellValue);
      
      if (!isNaN(value)) {
        // Apply contract multiplier (divide by 10 for MNQ)
        const adjustedValue = value * contractMultiplier;
        dailyValues.push(adjustedValue);
        if (adjustedValue < 0) {
          allLosses.push(Math.abs(adjustedValue));
        } else if (adjustedValue > 0) {
          allProfits.push(adjustedValue);
        }
      }
    }
  });

  // Check if we have any data at all (losses or profits)
  if (allLosses.length === 0 && allProfits.length === 0) {
    // Return debug info to help troubleshoot
    const sampleRows = rows.slice(0, 5).map((r, i) => ({
      rowIndex: i + 3,
      length: r ? r.length : 0,
      columns: r ? r.slice(0, 7) : []
    }));
    return { 
      error: 'No trading data found in the sheet',
      debug: {
        totalRows: rows.length,
        sampleRows: sampleRows
      }
    };
  }

  // All values from the sheet are per-contract (for 1 contract)
  // Scale by numContracts to get position-sized risk
  const numContracts = Number(contracts) || 1;
  
  // Per-contract values (from Google Sheet, already adjusted for contractType)
  const worstLossPerContract = allLosses.length > 0 ? Math.max(...allLosses) : 0;
  const avgLossPerContract = allLosses.length > 0 ? allLosses.reduce((a, b) => a + b, 0) / allLosses.length : 0;
  
  // Per-contract profit values
  const maxProfitPerContract = allProfits.length > 0 ? Math.max(...allProfits) : 0;
  const avgProfitPerContract = allProfits.length > 0 ? allProfits.reduce((a, b) => a + b, 0) / allProfits.length : 0;
  
  // Scale to position size
  const worstLossForSize = worstLossPerContract * numContracts;
  const avgLossForSize = avgLossPerContract * numContracts;
  const maxProfitForSize = maxProfitPerContract * numContracts;
  const avgProfitForSize = avgProfitPerContract * numContracts;
  
  // Calculate percentages based on scaled values
  const worstLossPercent = (worstLossForSize / accountSize) * 100;
  const avgLossPercent = (avgLossForSize / accountSize) * 100;
  
  // Calculate drawdown breach probability if maxDrawdown is provided
  let drawdownBreach = null;
  let blowAccountProbability = null;
  let blowAccountStatus = 'unknown';
  let blowAccountColor = '#6b7280'; // gray
  let blowAccountMessage = '';
  
  if (maxDrawdown && maxDrawdown > 0) {
    // Scale all losses by numContracts for comparison
    const scaledLosses = allLosses.map(loss => loss * numContracts);
    const scaledWorstLoss = worstLossForSize;
    
    // Count how many times scaled losses exceeded the max drawdown
    const breaches = scaledLosses.filter(loss => loss > maxDrawdown).length;
    const breachProbability = (breaches / dailyValues.length) * 100;
    
    // Check if worst loss (scaled) exceeds max drawdown
    const bufferToMaxDrawdown = maxDrawdown - scaledWorstLoss;
    const isSafe = scaledWorstLoss <= maxDrawdown && bufferToMaxDrawdown >= 0;
    
    drawdownBreach = {
      maxDrawdown,
      breaches,
      breachProbability: breachProbability.toFixed(2),
      highestExceeds: !isSafe,
      highestLoss: scaledWorstLoss,
      margin: bufferToMaxDrawdown.toFixed(2),
    };
    
    // Determine GO/NO GO status using scaled values
    // IMPORTANT: We're using end-of-day P&L, but trailing drawdown is based on intraday MAE
    // This means we may underestimate risk - a trade could close positive but still blow if it hit the limit intraday
    
    if (!isSafe) {
      // Worst loss exceeds max drawdown
      blowAccountStatus = 'NO GO';
      blowAccountColor = '#ef4444'; // red
      const excess = Math.abs(bufferToMaxDrawdown);
      blowAccountMessage = `⚠️ HIGH RISK: With your current contract size (${numContracts}), the worst historical end-of-day loss ($${scaledWorstLoss.toFixed(2)}) exceeds your max drawdown by $${excess.toFixed(2)}. ${breaches > 0 ? `Historical data shows ${breaches} day(s) (${breachProbability.toFixed(1)}%) had end-of-day losses exceeding your max drawdown. ` : ''}Account blowout risk is HIGH.`;
      blowAccountProbability = breachProbability; // Use actual breach probability, not 100%
    } else if (breachProbability > 5) {
      blowAccountStatus = 'NO GO';
      blowAccountColor = '#ef4444'; // red
      blowAccountMessage = `⚠️ HIGH RISK: Historical data shows ${breaches} days (${breachProbability.toFixed(1)}%) had end-of-day losses exceeding your max drawdown with ${numContracts} contract(s). Account blowout risk is HIGH.`;
      blowAccountProbability = breachProbability;
    } else if (breachProbability > 1) {
      blowAccountStatus = 'CAUTION';
      blowAccountColor = '#f59e0b'; // amber
      blowAccountMessage = `⚠️ MODERATE RISK: Historical data shows ${breaches} day(s) (${breachProbability.toFixed(1)}%) had end-of-day losses exceeding your max drawdown with ${numContracts} contract(s). Monitor closely.`;
      blowAccountProbability = breachProbability;
    } else if (breaches === 0) {
      blowAccountStatus = 'GO';
      blowAccountColor = '#10b981'; // green
      blowAccountMessage = `✅ SAFE: No historical end-of-day losses (with your current contract size of ${numContracts}) exceeded your max drawdown. You have $${bufferToMaxDrawdown.toFixed(2)} buffer above highest loss.`;
      blowAccountProbability = 0;
    } else {
      blowAccountStatus = 'GO';
      blowAccountColor = '#10b981'; // green
      blowAccountMessage = `✅ SAFE: Very low probability (${breachProbability.toFixed(2)}%) of end-of-day losses exceeding max drawdown based on historical data with ${numContracts} contract(s).`;
      blowAccountProbability = breachProbability;
    }
  }
  
  // Calculate risk score using scaled values
  // Combine % of account at risk and drawdown usage
  const worstLossPctOfAccount = worstLossForSize / accountSize;
  const drawdownUsagePct = maxDrawdown && maxDrawdown > 0 
    ? Math.min(worstLossForSize / maxDrawdown, 1.0) 
    : worstLossPctOfAccount;
  
  // Map to 0-100 where higher = more risk
  let riskScore = 0;
  riskScore += Math.min(worstLossPctOfAccount * 50, 50); // up to 50 points for % of account
  riskScore += Math.min(drawdownUsagePct * 50, 50); // up to 50 points for drawdown usage
  riskScore = Math.min(Math.round(riskScore), 100);
  
  // Determine risk level based on scaled values
  let riskLevel = 'low';
  let riskColor = '#10b981'; // green
  let riskMessage = 'Your current setup appears safe.';
  
  if (worstLossPercent > 20 || avgLossPercent > 5 || riskScore > 70) {
    riskLevel = 'high';
    riskColor = '#ef4444'; // red
    riskMessage = `Warning: Highest historical loss of $${worstLossForSize.toFixed(2)} (${worstLossPercent.toFixed(2)}% of account) with ${numContracts} contract(s) exceeds safe thresholds. Consider reducing position size.`;
  } else if (worstLossPercent > 10 || avgLossPercent > 2.5 || riskScore > 40) {
    riskLevel = 'moderate';
    riskColor = '#f59e0b'; // amber
    riskMessage = `Moderate risk detected. Highest loss was $${worstLossForSize.toFixed(2)} (${worstLossPercent.toFixed(2)}% of account) with ${numContracts} contract(s). Monitor your positions closely.`;
  } else {
    riskMessage = `Your current setup appears safe. Highest historical loss was $${worstLossForSize.toFixed(2)} (${worstLossPercent.toFixed(2)}% of account) with ${numContracts} contract(s).`;
  }

  // Calculate Apex MAE limit if provided
  const apexMae = computeApexMaeLimit(startOfDayProfit, safetyNet);
  let apexMaeComparison = null;
  
  if (apexMae) {
    const exceedsMae = worstLossForSize > apexMae.maxMaePerTrade;
    const maeBuffer = apexMae.maxMaePerTrade - worstLossForSize;
    
    // Calculate probability of exceeding MAE limit based on historical data
    // Count how many trading days had losses that exceeded the MAE limit
    const scaledLosses = allLosses.map(loss => loss * numContracts);
    const maeBreaches = scaledLosses.filter(loss => loss > apexMae.maxMaePerTrade).length;
    const maeBreachProbability = dailyValues.length > 0 ? (maeBreaches / dailyValues.length) * 100 : 0;
    
    apexMaeComparison = {
      ...apexMae,
      exceedsMae,
      maeBuffer: maeBuffer.toFixed(2),
      worstLossForSize,
      maeStatus: exceedsMae ? 'EXCEEDS' : 'SAFE',
      maeBreachProbability: parseFloat(maeBreachProbability.toFixed(2)),
      maeBreaches,
      totalTradingDays: dailyValues.length,
      maeMessage: exceedsMae
        ? `⚠️ Historical worst loss ($${worstLossForSize.toFixed(2)}) exceeds Apex MAE limit ($${apexMae.maxMaePerTrade.toFixed(2)}) by $${Math.abs(maeBuffer).toFixed(2)}`
        : `✅ Historical worst loss ($${worstLossForSize.toFixed(2)}) is within Apex MAE limit ($${apexMae.maxMaePerTrade.toFixed(2)}). Buffer: $${maeBuffer.toFixed(2)}`
    };
    
    // Set blowAccountStatus for 30% Drawdown mode based on Apex MAE
    if (maxDrawdown === null && apexMae) {
      if (exceedsMae) {
        blowAccountStatus = 'NO GO';
        blowAccountColor = '#ef4444'; // red
        blowAccountMessage = `⚠️ HIGH RISK: Historical worst loss ($${worstLossForSize.toFixed(2)}) exceeds Apex MAE limit ($${apexMae.maxMaePerTrade.toFixed(2)}) by $${Math.abs(maeBuffer).toFixed(2)}. ${maeBreaches > 0 ? `Historical data shows ${maeBreaches} day(s) (${maeBreachProbability.toFixed(1)}%) exceeded the MAE limit. ` : ''}Account blowout risk is HIGH.`;
        blowAccountProbability = maeBreachProbability; // Use actual breach probability, not 100%
      } else {
        blowAccountStatus = 'GO';
        blowAccountColor = '#10b981'; // green
        blowAccountMessage = `✅ SAFE: Historical worst loss ($${worstLossForSize.toFixed(2)}) is within Apex MAE limit ($${apexMae.maxMaePerTrade.toFixed(2)}). Buffer: $${maeBuffer.toFixed(2)}.`;
        blowAccountProbability = maeBreachProbability;
      }
    }
  }

  // Calculate Apex Windfall Rule (30% Consistency Rule)
  // Formula: Highest Profit Day ÷ 0.3 = Minimum Total Profit Required
  // If highest profit day exceeds 30% of total profit, it violates the windfall rule
  let windfallRule = null;
  
  // Always calculate windfall rule if there's profit data (maxProfitForSize > 0)
  // This should always show in 30% Drawdown mode to inform users about the windfall rule
  if (maxProfitForSize > 0) {
    // Calculate minimum total profit required based on highest profit day
    const minTotalProfitRequired = maxProfitForSize / 0.3;
    
    // Use profitSinceLastPayout if provided, otherwise fall back to startOfDayProfit
    // The Windfall Rule applies to profit since last payout, not start-of-day profit
    const profitBalanceForWindfall = (profitSinceLastPayout !== null && profitSinceLastPayout !== undefined && profitSinceLastPayout !== '') 
      ? Number(profitSinceLastPayout) 
      : (startOfDayProfit !== null && startOfDayProfit !== undefined ? Number(startOfDayProfit) : null);
    
    // Ensure it's a valid number
    const profitBalanceNum = profitBalanceForWindfall !== null && !isNaN(profitBalanceForWindfall) ? profitBalanceForWindfall : null;
    
    const usesProfitSincePayout = (profitSinceLastPayout !== null && profitSinceLastPayout !== undefined && profitSinceLastPayout !== '');
    
    if (profitBalanceNum !== null && profitBalanceNum > 0) {
      // Check if highest profit day exceeds 30% of profit balance (since last payout)
      const maxProfitPercentOfBalance = (maxProfitForSize / profitBalanceNum) * 100;
      const violatesWindfall = maxProfitPercentOfBalance > 30;
      
      // Calculate how much more profit is needed (if violating)
      const additionalProfitNeeded = violatesWindfall 
        ? Math.max(0, minTotalProfitRequired - profitBalanceNum)
        : 0;
      
      // Calculate maximum profit you can make TODAY without violating the windfall rule
      // If today's profit becomes the new highest day, it must be ≤ 30% of (current balance + today's profit)
      // So: todayProfit ≤ 0.3 × (currentBalance + todayProfit)
      // todayProfit ≤ 0.3 × currentBalance + 0.3 × todayProfit
      // todayProfit - 0.3 × todayProfit ≤ 0.3 × currentBalance
      // 0.7 × todayProfit ≤ 0.3 × currentBalance
      // todayProfit ≤ (0.3 / 0.7) × currentBalance
      // todayProfit ≤ 0.42857 × currentBalance ≈ 42.86% of current balance
      const maxProfitTodayAllowed = profitBalanceNum * (0.3 / 0.7);
      
      // However, if historical highest day is already higher, we need to ensure that day doesn't exceed 30% of new total
      // If historical highest > maxProfitTodayAllowed, then we need to calculate differently
      // We need: historicalHighest ≤ 0.3 × (currentBalance + todayProfit)
      // So: todayProfit ≥ (historicalHighest / 0.3) - currentBalance
      // But if this is negative or very small, it means we can't make enough today to satisfy the rule
      // Actually, if historical highest is already too high, we need to grow total balance first
      
      // The maximum profit today that keeps you safe:
      // If today becomes highest day: maxProfitTodayAllowed (calculated above)
      // But we also need to ensure historical highest doesn't violate: historicalHighest ≤ 0.3 × (currentBalance + todayProfit)
      // So: todayProfit ≥ (historicalHighest / 0.3) - currentBalance
      const minProfitTodayToSatisfyHistorical = (maxProfitForSize / 0.3) - profitBalanceNum;
      
      // Maximum profit today without violating rule:
      // - If historical highest is already too high, you can't make enough today to fix it (need negative profit, which doesn't make sense)
      // - Otherwise, you can make up to maxProfitTodayAllowed
      let maxProfitToday = maxProfitTodayAllowed;
      let maxProfitTodayMessage = '';
      
      if (violatesWindfall) {
        // Historical highest already violates, so making profit today won't help until you reach minTotalProfitRequired
        // But we can still calculate what you CAN make today without making it worse
        // If today becomes the new highest: todayProfit ≤ 0.3 × (currentBalance + todayProfit)
        maxProfitToday = maxProfitTodayAllowed;
        maxProfitTodayMessage = `You can make up to $${maxProfitToday.toFixed(2)} today without violating the rule (if today becomes your highest day). However, your historical highest day ($${maxProfitForSize.toFixed(2)}) already violates the rule, so you need $${additionalProfitNeeded.toFixed(2)} more total profit before requesting payout.`;
      } else {
        // Currently safe, calculate max profit today
        maxProfitToday = maxProfitTodayAllowed;
        maxProfitTodayMessage = `You can make up to $${maxProfitToday.toFixed(2)} today without violating the windfall rule (if today becomes your highest day).`;
      }
      
      windfallRule = {
        maxProfitDay: maxProfitForSize,
        profitBalanceForWindfall: profitBalanceNum.toFixed(2),
        minTotalProfitRequired: minTotalProfitRequired.toFixed(2),
        additionalProfitNeeded: additionalProfitNeeded.toFixed(2),
        maxProfitTodayAllowed: maxProfitToday.toFixed(2),
        maxProfitTodayMessage,
        maxProfitPercentOfBalance: maxProfitPercentOfBalance.toFixed(2),
        violatesWindfall,
        windfallStatus: violatesWindfall ? 'VIOLATES' : 'SAFE',
        usesProfitSincePayout,
        windfallMessage: violatesWindfall
          ? `⚠️ Highest profit day ($${maxProfitForSize.toFixed(2)}) exceeds 30% of ${usesProfitSincePayout ? 'profit since last payout' : 'profit balance'} (${maxProfitPercentOfBalance.toFixed(2)}%). To request payout, you need at least $${minTotalProfitRequired.toFixed(2)} total profit (need $${additionalProfitNeeded.toFixed(2)} more).`
          : `✅ Highest profit day ($${maxProfitForSize.toFixed(2)}) is within 30% of ${usesProfitSincePayout ? 'profit since last payout' : 'profit balance'} (${maxProfitPercentOfBalance.toFixed(2)}%). You can request payout once you reach $${minTotalProfitRequired.toFixed(2)} total profit.`
      };
    } else {
      // Calculate minimum total profit required even without profit balance
      windfallRule = {
        maxProfitDay: maxProfitForSize,
        profitBalanceForWindfall: null,
        minTotalProfitRequired: minTotalProfitRequired.toFixed(2),
        additionalProfitNeeded: null,
        maxProfitTodayAllowed: null, // Can't calculate without profit balance
        maxProfitTodayMessage: 'Enter your profit balance above to calculate maximum profit you can make today.',
        maxProfitPercentOfBalance: null,
        violatesWindfall: null,
        windfallStatus: 'INFO',
        usesProfitSincePayout: false,
        windfallMessage: `ℹ️ Highest profit day: $${maxProfitForSize.toFixed(2)}. To request payout, you need at least $${minTotalProfitRequired.toFixed(2)} total profit (${maxProfitForSize.toFixed(2)} ÷ 0.3). Enter your profit balance above for a more accurate check.`
      };
    }
  } else {
    // If there's no profit data, still show the windfall rule info box
    // This ensures users always see information about the windfall rule in 30% Drawdown mode
    windfallRule = {
      maxProfitDay: 0,
      minTotalProfitRequired: '0.00',
      maxProfitPercentOfBalance: null,
      violatesWindfall: false,
      windfallStatus: 'NO_DATA',
      usesProfitSincePayout: false,
      windfallMessage: `ℹ️ No profit data found in historical trading data. The windfall rule applies when you have profits - ensure no single day exceeds 30% of your total profit balance.`
    };
  }
  
  // Debug logging
  console.log('Windfall Rule calculation:', {
    maxProfitForSize,
    allProfitsCount: allProfits.length,
    allLossesCount: allLosses.length,
    startOfDayProfit,
    windfallRule: windfallRule ? 'EXISTS' : 'NULL',
    windfallStatus: windfallRule?.windfallStatus
  });

  // Calculate profit percentages
  const maxProfitPercent = maxProfitForSize > 0 ? ((maxProfitForSize / accountSize) * 100).toFixed(2) : '0.00';
  const avgProfitPercent = avgProfitForSize > 0 ? ((avgProfitForSize / accountSize) * 100).toFixed(2) : '0.00';

  // Debug logging (can be removed later)
  console.log('Profit calculation debug:', {
    allProfitsCount: allProfits.length,
    maxProfitPerContract,
    avgProfitPerContract,
    maxProfitForSize,
    avgProfitForSize,
    numContracts
  });

  return {
    // Return scaled values (for position size)
    highestLoss: worstLossForSize,
    highestLossPercent: worstLossPercent.toFixed(2),
    avgLoss: avgLossForSize,
    avgLossPercent: avgLossPercent.toFixed(2),
    // Profit values (scaled for position size)
    maxProfit: maxProfitForSize,
    maxProfitPercent: maxProfitPercent,
    avgProfit: avgProfitForSize,
    avgProfitPercent: avgProfitPercent,
    // Also include per-contract values for reference
    highestLossPerContract: worstLossPerContract,
    avgLossPerContract: avgLossPerContract,
    maxProfitPerContract: maxProfitPerContract,
    avgProfitPerContract: avgProfitPerContract,
    numContracts: numContracts,
    riskScore,
    riskLevel,
    riskColor,
    riskMessage,
    totalDays: dailyValues.length,
    losingDays: allLosses.length,
    winningDays: allProfits.length,
    drawdownBreach,
    blowAccountStatus,
    blowAccountColor,
    blowAccountMessage,
    blowAccountProbability: blowAccountProbability !== null ? parseFloat(blowAccountProbability.toFixed(2)) : null,
    contractType, // Include contract type in response
    apexMaeComparison, // Apex MAE comparison data
    windfallRule, // Apex Windfall Rule (30% Consistency Rule) data
  };
}

// Debug endpoint to see raw sheet data
app.get('/api/debug/:sheetName', async (req, res) => {
  try {
    const { sheetName } = req.params;
    const data = await getSheetData(sheetName);
    res.json({
      success: true,
      sheetName,
      totalRows: data ? data.length : 0,
      first10Rows: data ? data.slice(0, 10) : [],
      sampleRow: data && data.length > 2 ? data[2] : null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to fetch all sheet names
app.get('/api/sheets', async (req, res) => {
  try {
    const sheetNames = await getSheetNames();
    res.json({ success: true, sheets: sheetNames });
  } catch (error) {
    console.error('Error fetching sheet names:', error);
    
    // Provide more helpful error messages
    let errorMessage = 'Failed to fetch sheet names';
    if (error.message.includes('ENOENT') || error.message.includes('credentials')) {
      errorMessage = 'Credentials file not found. Please set up credentials.json (see GOOGLE_SETUP.md)';
    } else if (error.message.includes('permission') || error.message.includes('403')) {
      errorMessage = 'Permission denied. Make sure you shared the Google Sheet with the service account email.';
    } else if (error.message.includes('404') || error.message.includes('not found')) {
      errorMessage = 'Spreadsheet not found. Check that the spreadsheet ID is correct and the sheet is shared.';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      message: error.message,
      details: 'Check server logs for more information'
    });
  }
});

// API endpoint to fetch and process sheet data
app.post('/api/analyze', async (req, res) => {
  try {
    const { sheetName, accountSize, contracts } = req.body;

    if (!sheetName) {
      return res.status(400).json({ error: 'Sheet name is required' });
    }

    if (!accountSize || accountSize <= 0) {
      return res.status(400).json({ error: 'Account size must be greater than 0' });
    }

    if (!contracts || contracts <= 0) {
      return res.status(400).json({ error: 'Number of contracts must be greater than 0' });
    }

    const maxDrawdown = req.body.maxDrawdown ? parseFloat(req.body.maxDrawdown) : null;
    if (maxDrawdown !== null && maxDrawdown <= 0) {
      return res.status(400).json({ error: 'Max drawdown must be greater than 0' });
    }

    const contractType = req.body.contractType || 'NQ';
    if (contractType !== 'NQ' && contractType !== 'MNQ') {
      return res.status(400).json({ error: 'Contract type must be either NQ or MNQ' });
    }

    const startOfDayProfit = req.body.startOfDayProfit ? parseFloat(req.body.startOfDayProfit) : null;
    const safetyNet = req.body.safetyNet ? parseFloat(req.body.safetyNet) : null;
    const profitSinceLastPayout = req.body.profitSinceLastPayout ? parseFloat(req.body.profitSinceLastPayout) : null;
    
    const data = await getSheetData(sheetName);
    
    // If metrics has an error, include debug info
    const metrics = calculateRiskMetrics(data, parseFloat(accountSize), parseFloat(contracts), maxDrawdown, contractType, startOfDayProfit, safetyNet, profitSinceLastPayout);
    
    if (metrics.error) {
      // Include debug info to help troubleshoot
      return res.json({
        success: false,
        metrics,
        debug: {
          totalRows: data ? data.length : 0,
          first5Rows: data ? data.slice(0, 5) : [],
          sampleRow3: data && data.length > 2 ? data[2] : null,
          sampleRow4: data && data.length > 3 ? data[3] : null,
        }
      });
    }

    res.json({
      success: true,
      metrics,
    });
  } catch (error) {
    console.error('Error in /api/analyze:', error);
    res.status(500).json({ 
      error: 'Failed to fetch or process sheet data',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ============================================
// AUTH & STRIPE ENDPOINTS
// ============================================

/**
 * Check if a user has an active RiskLo Pro subscription
 * GET /api/auth/pro-status?email=user@example.com
 */
app.get('/api/auth/pro-status', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    // Check if email is in dev mode list (comma-separated from env var)
    const devModeEmails = process.env.DEV_MODE_PRO_EMAILS;
    if (devModeEmails) {
      const devEmails = devModeEmails.split(',').map(e => e.trim().toLowerCase());
      if (devEmails.includes(email.toLowerCase())) {
        return res.json({ isPro: true, devMode: true });
      }
    }

    // If Stripe is not configured, return false (not Pro)
    if (!stripe) {
      return res.json({ isPro: false });
    }

    // Search for customers by email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return res.json({ isPro: false });
    }

    const customer = customers.data[0];

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 10,
    });

    // Check if any active subscription is for RiskLo Pro
    const priceId = process.env.STRIPE_PRICE_RISKLO_PRO;
    const hasActiveProSubscription = subscriptions.data.some(sub => {
      return sub.items.data.some(item => item.price.id === priceId);
    });

    res.json({ isPro: hasActiveProSubscription });
  } catch (error) {
    console.error('Error checking Pro status:', error);
    res.status(500).json({ error: 'Failed to check Pro status', message: error.message });
  }
});

// Test route to verify Stripe routes are being registered
app.get('/api/stripe/test', (req, res) => {
  res.json({ message: 'Stripe routes are working', stripeConfigured: !!stripe });
});

/**
 * Create Stripe Checkout Session for RiskLo Pro subscription
 * POST /api/stripe/create-checkout-session
 * Body: { email: string }
 */
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.' });
    }

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const priceId = process.env.STRIPE_PRICE_RISKLO_PRO;
    if (!priceId) {
      return res.status(500).json({ error: 'Stripe price ID not configured. Please set STRIPE_PRICE_RISKLO_PRO environment variable.' });
    }

    const baseUrl = process.env.APP_BASE_URL || process.env.FRONTEND_URL || 'http://localhost:3000';

    // Create or retrieve customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: email,
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?checkout=canceled`,
      metadata: {
        email: email,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session', message: error.message });
  }
});

/**
 * Verify checkout session after payment
 * GET /api/stripe/verify-session?session_id=cs_xxx
 */
app.get('/api/stripe/verify-session', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.' });
    }

    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid' && session.status === 'complete') {
      // Get customer email from session
      const customer = await stripe.customers.retrieve(session.customer);
      
      res.json({
        success: true,
        email: customer.email,
        subscriptionId: session.subscription,
      });
    } else {
      res.json({
        success: false,
        status: session.status,
        paymentStatus: session.payment_status,
      });
    }
  } catch (error) {
    console.error('Error verifying session:', error);
    res.status(500).json({ error: 'Failed to verify session', message: error.message });
  }
});

// ============================================
// EMAIL SERVICE ENDPOINTS
// ============================================

const { sendRiskSummaryEmail } = require('./services/emailService');

/**
 * Send risk summary email after CSV analysis
 * POST /api/send-risk-summary
 * Body: { email: string, results: Array, riskMode: string }
 * 
 * This endpoint is called after the frontend completes bulk CSV analysis.
 * It sends a formatted email summary of all analyzed accounts to the user.
 * 
 * Email configuration (set via environment variables):
 * - EMAIL_FROM: Sender email address
 * - SMTP_HOST: SMTP server hostname (e.g., smtp.gmail.com)
 * - SMTP_PORT: SMTP port (default: 587)
 * - SMTP_USER: SMTP username/email
 * - SMTP_PASS: SMTP password or app password
 */
app.post('/api/send-risk-summary', async (req, res) => {
  try {
    const { email, results, riskMode } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!results || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ error: 'Results array is required and must not be empty' });
    }

    // Send email (don't fail the request if email fails)
    let emailSent = false;
    let emailErrorMessage = null;
    try {
      console.log('Sending risk summary email to:', email);
      console.log('Number of results:', results.length);
      await sendRiskSummaryEmail(email, results, riskMode || 'risk');
      emailSent = true;
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Failed to send risk summary email:', emailError);
      console.error('Email error stack:', emailError.stack);
      emailErrorMessage = emailError.message || 'Unknown error';
      
      // Log specific error types
      if (emailError.message && emailError.message.includes('not configured')) {
        console.error('EMAIL CONFIGURATION ERROR: Check Railway environment variables');
        console.error('Required variables: EMAIL_FROM, SMTP_HOST, SMTP_USER, SMTP_PASS');
      }
      
      // Log but don't fail - the analysis was successful
    }

    res.json({
      success: true,
      emailSent,
      message: emailSent 
        ? 'Risk summary email sent successfully' 
        : `Analysis completed but email could not be sent: ${emailErrorMessage || 'check server logs'}`,
      emailError: emailErrorMessage || null,
    });
  } catch (error) {
    console.error('Error in send-risk-summary endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to process request', 
      message: error.message 
    });
  }
});

// New endpoint: Auto-upload CSVs from Desktop App
app.post('/api/upload-csv-auto', express.json({ limit: '10mb' }), async (req, res) => {
  try {
    console.log('Received CSV auto-upload from RiskLo Watcher');
    
    const { accountCsv, strategyCsv, userEmail } = req.body;
    
    if (!accountCsv || !strategyCsv) {
      return res.status(400).json({ error: 'Both accountCsv and strategyCsv are required' });
    }
    
    console.log('Account CSV length:', accountCsv.length);
    console.log('Strategy CSV length:', strategyCsv.length);
    console.log('User email:', userEmail || 'not provided');
    
    // Parse CSVs
    const { parseAccountsCsv, parseStrategiesCsv, matchAccountsToStrategies } = require('./utils/csvParser');
    
    let accounts, strategies, rows;
    try {
      accounts = parseAccountsCsv(accountCsv);
      strategies = parseStrategiesCsv(strategyCsv);
      console.log(`Parsed ${accounts.length} accounts and ${strategies.length} strategies`);
    } catch (parseError) {
      console.error('CSV parsing error:', parseError);
      return res.status(400).json({ error: 'Failed to parse CSV files', details: parseError.message });
    }
    
    // Get available sheet names from Google Sheets
    let sheetNames = [];
    try {
      const sheets = google.sheets({ version: 'v4', auth });
      const sheetMetadata = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      });
      
      sheetNames = sheetMetadata.data.sheets
        .map(sheet => sheet.properties.title)
        .filter(name => {
          // Filter out date-formatted sheets (MM.YYYY) and "Current results" sheets
          const isDateFormat = /^\d{2}\.\d{4}$/.test(name);
          const isCurrentResults = name.toLowerCase().includes('current results');
          return !isDateFormat && !isCurrentResults;
        });
      
      console.log(`Found ${sheetNames.length} available strategies`);
    } catch (sheetError) {
      console.error('Error fetching sheet names:', sheetError);
      // Continue without sheet names - strategies will use exact names from CSV
    }
    
    // Match accounts to strategies
    rows = matchAccountsToStrategies(accounts, strategies, sheetNames);
    console.log(`Created ${rows.length} account/strategy combinations`);
    
    // Calculate risk for each row
    const results = [];
    for (const row of rows) {
      if (!row.strategy || row.strategy === '') {
        // No strategy assigned - skip risk calculation
        results.push({
          accountNumber: row.accountNumber,
          accountName: row.accountName,
          strategy: 'No strategy assigned',
          error: 'No strategy data available',
          ...row
        });
        continue;
      }
      
      try {
        // Fetch data from Google Sheets for this strategy
        const sheets = google.sheets({ version: 'v4', auth });
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: `'${row.strategy}'!A:G`,
        });
        
        const data = response.data.values;
        
        if (!data || data.length < 3) {
          results.push({
            accountNumber: row.accountNumber,
            accountName: row.accountName,
            strategy: row.strategy,
            error: 'Insufficient data in strategy sheet',
            ...row
          });
          continue;
        }
        
        // Calculate risk metrics
        const metrics = calculateRiskMetrics(
          data,
          row.currentBalance,
          row.numContracts,
          row.maxDrawdown,
          row.contractType,
          row.startOfDayProfit,
          row.safetyNet,
          row.startOfDayProfit // profitSinceLastPayout
        );
        
        if (metrics.error) {
          results.push({
            accountNumber: row.accountNumber,
            accountName: row.accountName,
            strategy: row.strategy,
            error: metrics.error,
            ...row
          });
          continue;
        }
        
        results.push({
          accountNumber: row.accountNumber,
          accountName: row.accountName,
          strategy: row.strategy,
          contractType: row.contractType,
          numContracts: row.numContracts,
          currentBalance: row.currentBalance,
          maxDrawdown: row.maxDrawdown,
          accountSize: row.accountSize,
          startOfDayProfit: row.startOfDayProfit,
          safetyNet: row.safetyNet,
          ...metrics
        });
        
      } catch (fetchError) {
        console.error(`Error fetching data for strategy ${row.strategy}:`, fetchError);
        results.push({
          accountNumber: row.accountNumber,
          accountName: row.accountName,
          strategy: row.strategy,
          error: `Failed to fetch strategy data: ${fetchError.message}`,
          ...row
        });
      }
    }
    
    console.log(`Calculated risk for ${results.length} accounts`);
    
    // Send email if userEmail is provided
    let emailSent = false;
    if (userEmail) {
      try {
        await sendRiskSummaryEmail(userEmail, results, 'risk');
        emailSent = true;
        console.log('Email sent successfully to:', userEmail);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Don't fail the request if email fails
      }
    }
    
    res.json({ 
      success: true, 
      message: emailSent 
        ? 'CSVs processed successfully. Risk summary email sent.'
        : 'CSVs processed successfully. Provide userEmail in request to receive email summary.',
      accountsProcessed: accounts.length,
      strategiesProcessed: strategies.length,
      resultsCalculated: results.length,
      emailSent,
      results: results.slice(0, 5) // Return first 5 results as preview
    });
    
  } catch (error) {
    console.error('Error processing CSV auto-upload:', error);
    res.status(500).json({ error: 'Failed to process CSV upload', details: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

