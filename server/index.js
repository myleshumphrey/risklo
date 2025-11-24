const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Hardcoded spreadsheet ID
const SPREADSHEET_ID = '1PCU-1ZjBEkAF1LE3Z1tbajCg3hOBzpKxx--z9QU8sAE';

// CORS configuration - allow requests from Netlify domain and localhost
app.use(cors({
  origin: process.env.FRONTEND_URL || true, // Allow all origins if FRONTEND_URL not set
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
async function getSheetNames() {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    return response.data.sheets.map(sheet => sheet.properties.title);
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
function calculateRiskMetrics(data, accountSize, contracts, maxDrawdown, contractType = 'NQ', startOfDayProfit = null, safetyNet = null) {
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
    if (!isSafe) {
      // Worst loss exceeds max drawdown
      blowAccountStatus = 'NO GO';
      blowAccountColor = '#ef4444'; // red
      const excess = Math.abs(bufferToMaxDrawdown);
      blowAccountMessage = `⚠️ HIGH RISK: With your current contract size (${numContracts}), the worst historical loss ($${scaledWorstLoss.toFixed(2)}) exceeds your max drawdown by $${excess.toFixed(2)}. Account blowout risk is HIGH.`;
      blowAccountProbability = 100;
    } else if (breachProbability > 5) {
      blowAccountStatus = 'NO GO';
      blowAccountColor = '#ef4444'; // red
      blowAccountMessage = `⚠️ HIGH RISK: Historical data shows ${breaches} days (${breachProbability.toFixed(1)}%) exceeded your max drawdown with ${numContracts} contract(s). Account blowout risk is HIGH.`;
      blowAccountProbability = breachProbability;
    } else if (breachProbability > 1) {
      blowAccountStatus = 'CAUTION';
      blowAccountColor = '#f59e0b'; // amber
      blowAccountMessage = `⚠️ MODERATE RISK: Historical data shows ${breaches} day(s) (${breachProbability.toFixed(1)}%) exceeded your max drawdown with ${numContracts} contract(s). Monitor closely.`;
      blowAccountProbability = breachProbability;
    } else if (breaches === 0) {
      blowAccountStatus = 'GO';
      blowAccountColor = '#10b981'; // green
      blowAccountMessage = `✅ SAFE: No historical losses (with your current contract size of ${numContracts}) exceeded your max drawdown. You have $${bufferToMaxDrawdown.toFixed(2)} buffer above highest loss.`;
      blowAccountProbability = 0;
    } else {
      blowAccountStatus = 'GO';
      blowAccountColor = '#10b981'; // green
      blowAccountMessage = `✅ SAFE: Very low probability (${breachProbability.toFixed(2)}%) of exceeding max drawdown based on historical data with ${numContracts} contract(s).`;
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
    apexMaeComparison = {
      ...apexMae,
      exceedsMae,
      maeBuffer: maeBuffer.toFixed(2),
      worstLossForSize,
      maeStatus: exceedsMae ? 'EXCEEDS' : 'SAFE',
      maeMessage: exceedsMae
        ? `⚠️ Historical worst loss ($${worstLossForSize.toFixed(2)}) exceeds Apex MAE limit ($${apexMae.maxMaePerTrade.toFixed(2)}) by $${Math.abs(maeBuffer).toFixed(2)}`
        : `✅ Historical worst loss ($${worstLossForSize.toFixed(2)}) is within Apex MAE limit ($${apexMae.maxMaePerTrade.toFixed(2)}). Buffer: $${maeBuffer.toFixed(2)}`
    };
  }

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
    
    const data = await getSheetData(sheetName);
    
    // If metrics has an error, include debug info
    const metrics = calculateRiskMetrics(data, parseFloat(accountSize), parseFloat(contracts), maxDrawdown, contractType, startOfDayProfit, safetyNet);
    
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

