# RiskLo Auto Uploader - Installation & Usage Guide

## Overview
The RiskLo Auto Uploader automatically detects when you export CSVs from NinjaTrader and uploads them to RiskLo for analysis. No more manual drag-and-drop!

## How It Works
1. You export your Account and Strategy CSVs from NinjaTrader (as you normally do)
2. Save them to: `C:\RiskLoExports\`
3. The Auto Uploader detects the new files
4. Automatically uploads them to RiskLo
5. RiskLo processes and emails you the results

## Installation

### Step 1: Install the AddOn
1. Copy `RiskLoAutoUploader.cs` to:
   ```
   Documents\NinjaTrader 8\bin\Custom\AddOns\
   ```

2. In NinjaTrader, go to: **Tools → Compile**

3. Restart NinjaTrader

### Step 2: The AddOn Starts Automatically
- When NinjaTrader starts, the Auto Uploader window will open automatically
- You'll see a status window showing:
  - Watch directory
  - Current status
  - Upload history

## Usage

### Automatic Upload (Recommended)
1. In NinjaTrader, right-click on your **Account** tab → **Export**
2. Save to: `C:\RiskLoExports\` with a filename containing "account" (e.g., `account_export.csv`)

3. Right-click on your **Strategy Performance** tab → **Export**
4. Save to: `C:\RiskLoExports\` with a filename containing "strat" (e.g., `strategy_export.csv`)

5. The Auto Uploader will detect both files and upload them automatically!

### Manual Upload
If you want to upload immediately:
1. Click the **"Upload Latest CSVs Now"** button in the Auto Uploader window
2. It will find the most recent account and strategy CSVs and upload them

## File Naming Requirements
For automatic detection, your CSV filenames must contain:
- Account CSV: must contain "account" (case-insensitive)
  - ✓ `account_export.csv`
  - ✓ `NT_Accounts_20250112.csv`
  - ✓ `my_accounts.csv`
  
- Strategy CSV: must contain "strat" (case-insensitive)
  - ✓ `strategy_export.csv`
  - ✓ `NT_Strategies_20250112.csv`
  - ✓ `my_strats.csv`

## Troubleshooting

### AddOn doesn't start automatically
- Go to: **Tools → NinjaScript Editor**
- Find **RiskLoAutoUploader** in the AddOns folder
- Double-click to open it
- The window should appear

### Files not uploading
- Check that both files are in `C:\RiskLoExports\`
- Check that filenames contain "account" and "strat"
- Check the status window for error messages
- Try clicking "Upload Latest CSVs Now" manually

### Upload fails
- Check your internet connection
- Verify RiskLo website is accessible: https://risklo.io
- Check the upload history in the status window for error details

## What Happens After Upload
1. RiskLo receives your CSVs
2. Processes all accounts and strategies
3. Calculates risk metrics
4. Sends you an email summary with:
   - High-risk accounts highlighted
   - Full risk analysis table
   - Link to view details on RiskLo

## Tips
- Keep the Auto Uploader window open while trading
- Export your CSVs at the end of each trading day
- The AddOn will automatically upload them
- Check your email for the risk summary

## Support
For issues or questions, visit: https://risklo.io

