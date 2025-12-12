# RiskLoExporter - NinjaTrader 8 AddOn Installation Guide

## Overview
RiskLoExporter is a NinjaTrader 8 AddOn that automatically exports account and strategy data to CSV files compatible with RiskLo's risk analysis tool.

## Quick Installation (Recommended) ⚡

### Option 1: Automated Installer (Easiest - Just 2 Clicks!)

1. **Download** `RiskLoExporter.zip` from the RiskLo website

2. **Extract** the ZIP file (right-click → Extract All)

3. **Run the installer:**
   - **Windows Batch:** Double-click `INSTALL_RiskLoExporter.bat` (right-click → Run as administrator if needed)
   - **PowerShell:** Right-click `INSTALL_RiskLoExporter.ps1` → Run with PowerShell (as Administrator)

4. **Follow the prompts** - The installer will:
   - ✅ Automatically extract files
   - ✅ Copy to the correct NinjaTrader folder
   - ✅ Check for Newtonsoft.Json
   - ✅ Optionally download Newtonsoft.Json automatically (PowerShell version)

5. **Open NinjaTrader 8** → **Tools → Compile**

6. **Access the AddOn** → **Tools → NinjaScript Editor → Open RiskLoExporter.cs**

**That's it!** The installer handles everything automatically. No manual file copying needed!

---

## Manual Installation (Alternative)

If you prefer to install manually or the automated installer doesn't work:

### 1. Download the AddOn
- Download `RiskLoExporter.zip` from the RiskLo website
- Extract the ZIP file

### 2. Install the AddOn File
1. Navigate to: `Documents\NinjaTrader 8\bin\Custom\AddOns\`
2. Create a folder named `RiskLoExporter` if it doesn't exist
3. Copy `RiskLoExporter.cs` into this folder:
   ```
   Documents\NinjaTrader 8\bin\Custom\AddOns\RiskLoExporter\RiskLoExporter.cs
   ```

### 3. Install Required NuGet Package
The AddOn requires `Newtonsoft.Json` for settings persistence.

**Option A: Using NuGet Package Manager (Recommended)**
1. In NinjaTrader, go to: Tools → Options → AddOns
2. Right-click on the AddOns list and select "Manage NuGet Packages"
3. Search for "Newtonsoft.Json" and install version 13.0.1 or later

**Option B: Manual Installation**
1. Download `Newtonsoft.Json.dll` from NuGet: https://www.nuget.org/packages/Newtonsoft.Json/
2. Extract the DLL from the .nupkg file (it's a ZIP file)
3. Place `Newtonsoft.Json.dll` in: `Documents\NinjaTrader 8\bin\Custom\`

### 4. Compile the AddOn
1. In NinjaTrader, go to: **Tools → Compile**
2. Check for any compilation errors
3. If successful, you should see: "Compilation successful"

### 5. Access the AddOn
1. In NinjaTrader, go to: **Tools → NinjaScript Editor**
2. Open: `RiskLoExporter.cs`
3. The AddOn window should be accessible from the editor

## First-Time Setup

### 1. Select an Account
- Use the dropdown to select the account you want to export

### 2. Enter Trailing Max Drawdown
- For each account, enter the trailing max drawdown value
- This value will be saved and reused for future exports

### 3. Configure Strategies
- Click "Add Row" to add a strategy
- Enter the strategy name
- Select the instrument (NQ or MNQ)
- The account display name will be auto-filled from your selected account

### 4. Export CSVs
- Click "Export CSVs Now" to generate the CSV files
- Files will be saved to: `C:\RiskLoExports\`
- Filenames will be:
  - `RiskLo_Accounts_YYYYMMDD_HHMMSS.csv`
  - `RiskLo_Strategies_YYYYMMDD_HHMMSS.csv`

### 5. (Optional) Enable Auto-Export
- Check "Auto export daily at:" and set your preferred time (default: 17:05)
- The AddOn will automatically export CSVs once per day at the specified time

## Export Directory
All CSV files are exported to: `C:\RiskLoExports\`

Settings are saved to: `C:\RiskLoExports\risklo_exporter_settings.json`

## CSV File Format

### Accounts CSV (`RiskLo_Accounts_*.csv`)
Required columns:
- `Display name` - Account display name from NinjaTrader
- `Net liquidation` - Account net liquidation value
- `Trailing max drawdown` - User-entered trailing max drawdown value

### Strategies CSV (`RiskLo_Strategies_*.csv`)
Required columns:
- `Strategy` - Strategy name
- `Instrument` - Either "NQ" or "MNQ"
- `Account display name` - Must match the Display name from Accounts CSV

## Troubleshooting

### Installer doesn't work
- Make sure you're running as Administrator
- Try the PowerShell version (`INSTALL_RiskLoExporter.ps1`) - it has better error handling
- If both fail, use the manual installation steps above

### AddOn doesn't appear in menu
- The AddOn may not appear in the "New" menu automatically
- Access it via: **Tools → NinjaScript Editor → Open RiskLoExporter.cs**
- After compilation, you can create a shortcut or access it from the editor

### Compilation errors
- Ensure `Newtonsoft.Json.dll` is installed in `Documents\NinjaTrader 8\bin\Custom\`
- Check that all required NinjaTrader references are available
- Make sure you're using NinjaTrader 8 (not version 7)

### Export directory not found
- The AddOn will automatically create `C:\RiskLoExports\` if it doesn't exist
- Ensure you have write permissions to the C: drive

### Net Liquidation value is blank
- Some account connections may not provide Net Liquidation
- The AddOn will log a warning and use Cash Value as a fallback
- Check the Status section in the AddOn window for details

## Support
For issues or questions, visit: https://risklo.io
