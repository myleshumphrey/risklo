# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm run install-all
```

## Step 2: Google Sheets API Setup

1. **Create a Google Cloud Project**
   - Go to https://console.cloud.google.com/
   - Create a new project or select existing

2. **Enable Google Sheets API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

3. **Create Service Account**
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Name it (e.g., "risklo-service")
   - Click "Create and Continue"
   - Skip role assignment, click "Done"

4. **Generate Credentials**
   - Click on your newly created service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose "JSON" format
   - Download the file

5. **Share Your Google Sheet**
   - Open your Google Sheet with trading data
   - Click "Share" button
   - Add the service account email (found in the JSON file, looks like: `xxx@xxx.iam.gserviceaccount.com`)
   - Give it "Viewer" permissions
   - Click "Send"

6. **Place Credentials File**
   - Rename the downloaded JSON file to `credentials.json`
   - Place it in the `server/` directory

## Step 3: Configure Environment

Create a `.env` file in the `server/` directory:

```bash
cd server
touch .env
```

Add the following content:

```
PORT=5000
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
```

## Step 4: Prepare Your Google Sheet

Your Google Sheet should have this structure:

| Date       | P&L    | Drawdown |
|------------|--------|----------|
| 2024-01-01 | 1500   | 0        |
| 2024-01-02 | -500   | 500      |
| 2024-01-03 | 200    | 300      |

- **Column A**: Date
- **Column B**: P&L (Profit & Loss)
- **Column C**: Drawdown

## Step 5: Run the Application

```bash
npm run dev
```

This starts both frontend (http://localhost:3000) and backend (http://localhost:5000).

## Step 6: Use the Application

1. Open http://localhost:3000 in your browser
2. Enter your Google Sheet ID (found in the URL: `docs.google.com/spreadsheets/d/[SHEET_ID]/edit`)
3. Enter your account size and number of contracts
4. Click "Analyze Risk"
5. View your risk metrics!

## Troubleshooting

### "Failed to fetch or process sheet data"
- Make sure the service account email has access to your sheet
- Verify the Sheet ID is correct
- Check that the range matches your data structure

### "Insufficient data"
- Ensure your sheet has at least 2 rows (header + data)
- Verify the data range includes your data

### "Cannot find module 'googleapis'"
- Run `cd server && npm install`

### Port already in use
- Change PORT in `server/.env` to a different number
- Update proxy in `client/package.json` if needed

