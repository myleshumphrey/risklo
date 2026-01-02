const { google } = require('googleapis');

// Spreadsheet ID (fallback). Override via env if needed.
const SPREADSHEET_ID = process.env.RESULTS_SPREADSHEET_ID || '1rqGGpl5SJ_34L72yCCcSZIoUrD_ggGn5LfJ_BGFjDQY';

// Initialize Google Sheets API
let auth;
if (process.env.GOOGLE_CREDENTIALS_JSON) {
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
  auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/drive.readonly',
    ],
  });
} else {
  return { statusCode: 500, body: JSON.stringify({ error: 'Google credentials not configured' }) };
}

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    const sheetNames = response.data.sheets.map(sheet => sheet.properties.title);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, sheets: sheetNames }),
    };
  } catch (error) {
    console.error('Error fetching sheet names:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};

