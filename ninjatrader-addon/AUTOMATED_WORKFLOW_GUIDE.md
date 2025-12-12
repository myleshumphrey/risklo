# RiskLo Automated Workflow - Complete Guide

## Overview
This automated workflow eliminates manual steps. Users simply export CSVs from NinjaTrader, and everything else happens automatically:

1. ✅ User exports Account & Strategy CSVs from NinjaTrader
2. ✅ Auto Uploader detects new files
3. ✅ Automatically uploads to RiskLo
4. ✅ RiskLo processes and calculates risk
5. ✅ Email summary sent automatically

**No website visits. No drag-and-drop. Fully automated!**

---

## Installation

### Step 1: Install the Auto Uploader AddOn

1. Copy `RiskLoAutoUploader.cs` to:
   ```
   Documents\NinjaTrader 8\bin\Custom\AddOns\
   ```

2. In NinjaTrader, go to: **Tools → Compile**

3. Restart NinjaTrader

4. The Auto Uploader window will open automatically

---

## Daily Workflow (Super Simple!)

### Step 1: Export from NinjaTrader (as you normally do)

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

### Step 2: That's it!

The Auto Uploader will:
- Detect both files automatically
- Upload them to RiskLo
- Show "Upload successful!" in the status window

### Step 3: Check your email

Within a few minutes, you'll receive an email with:
- Risk summary for all accounts
- High-risk accounts highlighted
- Full analysis table
- Link to view details on RiskLo

---

## Auto Uploader Window

The status window shows:
- **Status**: Current activity (watching, uploading, success/error)
- **Upload History**: Last 10 uploads with timestamps
- **Manual Upload Button**: Click to upload latest CSVs immediately

---

## File Naming Rules

For automatic detection:

**Account CSV** - filename must contain "account" (case-insensitive):
- ✓ `account_export.csv`
- ✓ `NT_Accounts_20250112.csv`
- ✓ `my_accounts.csv`
- ✗ `acct.csv` (doesn't contain "account")

**Strategy CSV** - filename must contain "strat" (case-insensitive):
- ✓ `strategy_export.csv`
- ✓ `NT_Strategies_20250112.csv`
- ✓ `my_strats.csv`
- ✗ `performance.csv` (doesn't contain "strat")

---

## Troubleshooting

### Auto Uploader window doesn't appear
- Go to: **Tools → NinjaScript Editor**
- Find **RiskLoAutoUploader** in the AddOns folder
- Double-click to open it

### Files not uploading automatically
1. Check both files are in `C:\RiskLoExports\`
2. Verify filenames contain "account" and "strat"
3. Check the status window for error messages
4. Try clicking "Upload Latest CSVs Now" manually

### Upload fails
1. Check internet connection
2. Verify RiskLo is accessible: https://risklo.io
3. Check upload history for error details
4. Contact support if issue persists

### No email received
1. Check spam/junk folder
2. Verify you're signed in to RiskLo (email goes to your account email)
3. Check RiskLo website for results

---

## Advanced: Manual Upload

If you want to upload immediately without waiting for auto-detection:

1. Click **"Upload Latest CSVs Now"** in the Auto Uploader window
2. It will find the most recent account and strategy CSVs
3. Upload them immediately

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

## Benefits of This Workflow

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

### After (Automated):
1. Export CSVs from NinjaTrader
2. Done!

**Total time: ~30 seconds**

Email arrives automatically with full analysis.

---

## Support

For issues or questions:
- Visit: https://risklo.io
- Email: support@risklo.io

---

## Technical Details

### How It Works

1. **File Watcher**: The AddOn uses .NET's `FileSystemWatcher` to monitor `C:\RiskLoExports\`
2. **Detection**: When both account and strategy CSVs are detected, it waits 2 seconds for files to finish writing
3. **Upload**: Sends CSV contents as JSON to RiskLo API endpoint
4. **Processing**: RiskLo backend parses CSVs, calculates risk metrics
5. **Email**: SendGrid API sends formatted email summary

### API Endpoint

```
POST https://risklo-production.up.railway.app/api/upload-csv-auto
Content-Type: application/json

{
  "accountCsv": "Display name,Net liquidation,...",
  "strategyCsv": "Strategy,Instrument,..."
}
```

### Security

- All communication uses HTTPS
- No credentials stored in AddOn
- CSV data is processed and discarded after analysis
- Email sent only to authenticated RiskLo users

---

## Future Enhancements

Planned features:
- [ ] Auto-export on schedule (daily at market close)
- [ ] Multiple watch directories
- [ ] Slack/Discord notifications
- [ ] Real-time risk alerts
- [ ] Historical trend tracking

---

## Changelog

### Version 1.0 (January 2025)
- Initial release
- File watcher for automatic detection
- Auto-upload to RiskLo
- Status window with upload history
- Manual upload button

