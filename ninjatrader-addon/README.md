# RiskLoExporter - NinjaTrader 8 AddOn

## Overview
RiskLoExporter is a NinjaTrader 8 AddOn that automatically exports account and strategy data to CSV files compatible with RiskLo's risk analysis platform.

## Features
- **Account Export**: Exports account display names, net liquidation values, and trailing max drawdown
- **Strategy Export**: Exports strategy names, instruments (NQ/MNQ), and associated account display names
- **Persistent Settings**: Saves trailing drawdown values and strategy configurations
- **Auto-Export**: Optional daily automatic export at a specified time
- **User-Friendly UI**: Clean WPF interface integrated into NinjaTrader Control Center

## CSV Output Format

### Accounts CSV (`RiskLo_Accounts_YYYYMMDD_HHMMSS.csv`)
```
Display name,Net liquidation,Trailing max drawdown
PAAPEX3982600000022,52500.00,1500.00
PAAPEX3982600000021,51000.00,1500.00
```

### Strategies CSV (`RiskLo_Strategies_YYYYMMDD_HHMMSS.csv`)
```
Strategy,Instrument,Account display name
Grass Fed Prime Beef 2.0,NQ,PAAPEX3982600000022
PrimeBeef,MNQ,PAAPEX3982600000021
```

## Installation
See [INSTALLATION.md](./INSTALLATION.md) for detailed installation instructions.

## Usage

### Manual Export
1. Open RiskLo Exporter from Control Center → New → RiskLo Exporter
2. Select an account from the dropdown
3. Enter the trailing max drawdown for that account
4. Add strategy rows (Strategy name, Instrument, Account display name)
5. Click "Export CSVs Now"
6. Files will be saved to `C:\RiskLoExports\`

### Auto-Export
1. Check "Auto export daily at:"
2. Set your preferred time (e.g., 17:05)
3. The AddOn will automatically export CSVs once per day at the specified time

## Requirements
- NinjaTrader 8
- Newtonsoft.Json NuGet package (for settings persistence)
- Write permissions to `C:\RiskLoExports\`

## File Locations
- **Export Directory**: `C:\RiskLoExports\`
- **Settings File**: `C:\RiskLoExports\risklo_exporter_settings.json`
- **AddOn File**: `Documents\NinjaTrader 8\bin\Custom\AddOns\RiskLoExporter\RiskLoExporter.cs`

## Notes
- Net Liquidation values are rounded down to 2 decimal places
- Trailing Max Drawdown values are user-entered and persisted per account
- Instrument values are normalized to "NQ" or "MNQ" (case-insensitive)
- Account Display Names must match exactly between Accounts and Strategies CSVs for RiskLo to join them

## Support
For issues or questions, visit: https://risklo.io

