# RiskLo - Algorithm Risk Assessment Dashboard

A clean, modern web application for analyzing trading algorithm risk metrics from Google Sheets data. Inspired by Robinhood's simple and intuitive design.

## Features

- 📊 Connect to Google Sheets containing algorithm performance data
- 📉 Display maximum historical drawdown
- 💰 Show average loss on bad trading days
- ⚠️ Risk level indicator (Low/Moderate/High)
- 🎯 Risk assessment based on account size and contract count
- 🎨 Clean, modern UI with dark theme

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Cloud Project with Sheets API enabled
- Google Service Account credentials (JSON file)

## Setup Instructions

### 1. Install Dependencies

```bash
npm run install-all
```

### 2. Google Sheets API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API
4. Create a Service Account:
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Give it a name and create
   - Click on the service account and go to "Keys" tab
   - Click "Add Key" > "Create new key" > Choose JSON
   - Download the JSON file

5. Share your Google Sheet with the service account email (found in the JSON file)
   - Open your Google Sheet
   - Click "Share" button
   - Add the service account email with "Viewer" permissions

6. Place the credentials JSON file in the `server` directory

### 3. Configure Environment Variables

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit `.env` and set:
```
PORT=5000
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
```

Make sure `credentials.json` is in the `server` directory.

### 4. Google Sheet Format

Your Google Sheet should have the following structure:

| Date | P&L | Drawdown | ... |
|------|-----|----------|-----|
| 2024-01-01 | 1500 | 0 | ... |
| 2024-01-02 | -500 | 500 | ... |
| ... | ... | ... | ... |

- Column A: Date
- Column B: P&L (Profit & Loss)
- Column C: Drawdown
- Additional columns are ignored

## Running the Application

### Development Mode

Start both frontend and backend:

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Usage

1. Open the application in your browser (http://localhost:3000)
2. Enter your Google Sheet ID (found in the sheet URL)
3. Optionally specify the data range (default: `Sheet1!A:D`)
4. Enter your account size in dollars
5. Enter the number of contracts you're trading
6. Click "Analyze Risk"
7. View your risk metrics and assessment

## Risk Assessment Logic

The application calculates risk levels based on:

- **Low Risk**: Max drawdown < 10% AND average loss < 2.5%
- **Moderate Risk**: Max drawdown 10-20% OR average loss 2.5-5%
- **High Risk**: Max drawdown > 20% OR average loss > 5%

## Project Structure

```
risklo/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js
│   │   │   ├── InputForm.js
│   │   │   ├── MetricCard.js
│   │   │   └── RiskIndicator.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/          # Express backend
│   ├── index.js
│   ├── .env
│   └── package.json
└── README.md
```

## Technologies Used

- **Frontend**: React, CSS3
- **Backend**: Node.js, Express
- **API**: Google Sheets API v4
- **Styling**: Custom CSS with modern design principles

## License

MIT

