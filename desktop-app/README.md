# RiskLo Watcher - Standalone Desktop App

## Overview
A simple Windows desktop application that sits in your system tray and automatically uploads NinjaTrader CSV exports to RiskLo for risk analysis.

**No NinjaTrader integration needed. Just a standalone .exe file that watches a folder.**

---

## Key Benefits

✅ **Simpler than NinjaTrader AddOn** - Just a standalone .exe, no compilation needed  
✅ **Easy to install** - Double-click and run  
✅ **Works anywhere** - Doesn't require NinjaTrader to be running  
✅ **Easy to update** - Just replace the .exe  
✅ **Lightweight** - Minimal resource usage  
✅ **System tray app** - Runs in background, doesn't clutter desktop  

---

## How It Works

1. **User exports CSVs from NinjaTrader** (as they normally do)
2. **Saves to `C:\RiskLoExports\`**
3. **RiskLo Watcher detects the files** automatically (file watcher)
4. **Uploads to RiskLo** via API
5. **RiskLo processes** and calculates risk
6. **Email sent** automatically with results

**Total user effort: Just export the CSVs (30 seconds)**

---

## Files

- **`RiskLoWatcher.cs`** - Main application code
- **`RiskLoWatcher.csproj`** - Project file for building
- **`BUILD_INSTRUCTIONS.md`** - How to build the .exe
- **`USER_GUIDE.md`** - End-user instructions
- **`README.md`** - This file

---

## Building

### Prerequisites
- Windows 10/11
- .NET 6.0 SDK ([Download](https://dotnet.microsoft.com/download))

### Build Command
```cmd
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true
```

### Output
```
desktop-app\bin\Release\net6.0-windows\win-x64\publish\RiskLoWatcher.exe
```

Single .exe file (~15-20 MB), no dependencies needed.

---

## Distribution

### Option 1: Direct Download
Upload `RiskLoWatcher.exe` to RiskLo website:
```
/downloads/RiskLoWatcher.exe
```

### Option 2: Installer (Recommended)
Create an installer using [Inno Setup](https://jrsoftware.org/isinfo.php):
- Installs to Program Files
- Creates Start Menu shortcut
- Optional auto-start on Windows boot
- Includes uninstaller

---

## User Installation

1. Download `RiskLoWatcher.exe`
2. Double-click to run
3. App appears in system tray
4. Done!

---

## User Workflow

1. **Export from NinjaTrader:**
   - Account tab → Export → Save to `C:\RiskLoExports\accounts.csv`
   - Strategy Performance tab → Export → Save to `C:\RiskLoExports\strategies.csv`

2. **Wait for notification:**
   - "Upload Successful!" balloon appears

3. **Check email:**
   - Risk analysis results arrive automatically

---

## Features

### System Tray Menu
- Upload Latest CSVs Now (manual trigger)
- View Upload History (last 10 uploads)
- Open Watch Folder (opens `C:\RiskLoExports\`)
- Exit

### Automatic Detection
- Watches `C:\RiskLoExports\` for new files
- Detects files with "account" and "strat" in filename
- Uploads automatically when both files are present
- Prevents duplicate uploads (5-second cooldown)

### Notifications
- Balloon tooltips for upload status
- Success/error messages
- Upload history tracking

---

## Technical Details

### Technology
- C# / .NET 6.0
- Windows Forms (system tray)
- FileSystemWatcher (file detection)
- HttpClient (API upload)
- System.Text.Json (JSON serialization)

### API Endpoint
```
POST https://risklo-production.up.railway.app/api/upload-csv-auto
Content-Type: application/json

{
  "accountCsv": "...",
  "strategyCsv": "..."
}
```

### File Detection Rules
- Account CSV: filename must contain "account" (case-insensitive)
- Strategy CSV: filename must contain "strat" (case-insensitive)
- Both files must be present for upload
- 2-second delay after detection (ensures files are fully written)
- 5-second cooldown between uploads (prevents duplicates)

---

## Comparison: AddOn vs Standalone

| Feature | NinjaTrader AddOn | Standalone App |
|---------|-------------------|----------------|
| Installation | Copy to AddOns folder, compile | Double-click .exe |
| Dependencies | NinjaTrader 8 | None |
| Updates | Replace file, recompile | Replace .exe |
| User Experience | Opens window in NT | System tray icon |
| Resource Usage | Runs inside NT | Minimal standalone |
| Flexibility | NT-specific | Works anywhere |
| **Recommendation** | ❌ More complex | ✅ **Simpler & better** |

---

## Next Steps

1. **Build the .exe** (see BUILD_INSTRUCTIONS.md)
2. **Test locally**
3. **Create installer** (optional but recommended)
4. **Upload to RiskLo website**
5. **Update website** with download link
6. **Complete backend integration** (CSV parsing + email)

---

## Backend Integration Needed

The backend endpoint `/api/upload-csv-auto` currently just acknowledges receipt. It needs to:

1. Parse the CSV data (reuse existing `ninjaTraderParser.js` logic)
2. Match accounts to strategies
3. Fetch strategy data from Google Sheets
4. Calculate risk metrics
5. Send email summary

This is the same logic used by the bulk calculator, just triggered by the API endpoint instead of the frontend.

---

## Support

For issues or questions:
- Visit: https://risklo.io
- Email: support@risklo.io

