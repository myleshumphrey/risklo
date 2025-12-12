# RiskLo Watcher - User Guide

## What is RiskLo Watcher?

RiskLo Watcher is a simple Windows app that automatically uploads your NinjaTrader CSV exports to RiskLo for risk analysis. No more manual drag-and-drop!

---

## Installation

### Step 1: Download
Download `RiskLoWatcher.exe` from https://risklo.io

### Step 2: Run
Double-click `RiskLoWatcher.exe` to start the app.

### Step 3: Done!
The app will appear in your system tray (bottom-right corner of Windows taskbar).

---

## Daily Usage

### Step 1: Export from NinjaTrader

**Export Accounts:**
1. In NinjaTrader, go to the **Account** tab
2. Right-click anywhere → **Export**
3. Save to: `C:\RiskLoExports\`
4. Filename must contain "account" (e.g., `accounts_jan12.csv`)

**Export Strategies:**
1. In NinjaTrader, go to the **Strategy Performance** tab
2. Right-click anywhere → **Export**
3. Save to: `C:\RiskLoExports\`
4. Filename must contain "strat" (e.g., `strategies_jan12.csv`)

### Step 2: Wait for Notification
Within a few seconds, you'll see a balloon notification:
- "Upload Successful! RiskLo is processing your data."

### Step 3: Check Your Email
Within a few minutes, you'll receive an email with:
- Risk summary for all accounts
- High-risk accounts highlighted
- Full analysis table
- Link to view details on RiskLo

---

## System Tray Menu

Right-click the RiskLo Watcher icon in your system tray to access:

- **Upload Latest CSVs Now** - Manually upload the most recent CSVs
- **View Upload History** - See your last 10 uploads
- **Open Watch Folder** - Opens `C:\RiskLoExports\` in File Explorer
- **Exit** - Close the app

---

## File Naming Rules

For automatic detection, your CSV filenames must contain:

**Account CSV** - must contain "account" (case-insensitive):
- ✓ `account_export.csv`
- ✓ `NT_Accounts_20250112.csv`
- ✓ `my_accounts.csv`
- ✗ `acct.csv` (doesn't contain "account")

**Strategy CSV** - must contain "strat" (case-insensitive):
- ✓ `strategy_export.csv`
- ✓ `NT_Strategies_20250112.csv`
- ✓ `my_strats.csv`
- ✗ `performance.csv` (doesn't contain "strat")

---

## Auto-Start on Windows Boot (Optional)

To have RiskLo Watcher start automatically when Windows boots:

1. Press `Win + R` on your keyboard
2. Type `shell:startup` and press Enter
3. Copy `RiskLoWatcher.exe` to this folder (or create a shortcut)
4. Done! The app will start automatically when Windows boots

---

## Troubleshooting

### App doesn't start
- Make sure you have Windows 10 or later
- Try running as Administrator (right-click → Run as administrator)
- Download and install [.NET 6.0 Desktop Runtime](https://dotnet.microsoft.com/download)

### Files not uploading automatically
1. Check both files are in `C:\RiskLoExports\`
2. Verify filenames contain "account" and "strat"
3. Right-click tray icon → "View Upload History" for error messages
4. Try "Upload Latest CSVs Now" manually

### No notification appears
- Check Windows notification settings
- Right-click tray icon → "View Upload History" to see if upload succeeded

### Upload fails
1. Check your internet connection
2. Verify RiskLo is accessible: https://risklo.io
3. Right-click tray icon → "View Upload History" for error details
4. Contact support if issue persists

### No email received
1. Check your spam/junk folder
2. Verify you're signed in to RiskLo (email goes to your account email)
3. Visit https://risklo.io to see results

---

## What Data is Sent?

Only the CSV file contents are sent to RiskLo:
- Account display names
- Net liquidation values
- Trailing max drawdown (if in CSV)
- Strategy names
- Instruments (NQ/MNQ)
- Account associations

**No trading strategies, code, or proprietary data is sent.**

---

## Benefits

### Before (Manual):
1. Export CSVs from NinjaTrader
2. Open browser
3. Navigate to RiskLo
4. Sign in
5. Find CSV upload page
6. Drag and drop files
7. Wait for processing
8. Check results

**Total time: ~3-5 minutes**

### After (With RiskLo Watcher):
1. Export CSVs from NinjaTrader
2. Done!

**Total time: ~30 seconds**

Email arrives automatically with full analysis.

---

## Support

For help or questions:
- Visit: https://risklo.io
- Email: support@risklo.io

---

## Privacy & Security

- All communication uses HTTPS encryption
- No credentials are stored on your computer
- CSV data is processed and discarded after analysis
- Email sent only to your RiskLo account email
- The app only reads files from `C:\RiskLoExports\`
- No other files or folders are accessed

