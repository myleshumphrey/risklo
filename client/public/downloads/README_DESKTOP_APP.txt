RiskLo Watcher Desktop App (Windows)
===================================

What it does
------------
RiskLoWatcher.exe runs in your system tray and automatically uploads your NinjaTrader CSV exports to RiskLo for analysis.

One-time setup
--------------
1) Download RiskLoWatcher.exe from:
   https://risklo.io/downloads/RiskLoWatcher.exe

2) Run it (double-click).

3) Set your email:
   Right-click the tray icon -> Set Email Address

Daily use
---------
Export BOTH CSVs from NinjaTrader into:
  C:\RiskLoExports\

- Accounts CSV: filename contains "account"
- Strategies CSV: filename contains "strat"

RiskLoWatcher will detect the exports, upload automatically, and email your results.

Windows SmartScreen warning (Unrecognized app)
----------------------------------------------
You may see a blue dialog:
  "Windows protected your PC"

This is expected for new/uncommon apps that aren’t yet code-signed.

To run it:
1) Click "More info"
2) Click "Run anyway"

Safety notes (to help you feel comfortable)
-------------------------------------------
- RiskLoWatcher only monitors ONE folder: C:\RiskLoExports\
- It only reads CSVs you export and uploads them to RiskLo over HTTPS
- It does NOT place trades, connect to your broker, or control NinjaTrader
- It does NOT read other folders or collect passwords/Google credentials

Troubleshooting
---------------
- If it won't open, install the .NET 6 Desktop Runtime:
  https://dotnet.microsoft.com/download

For support, use the Help/FAQ pages inside RiskLo.

----------------------------------------------
Developer/build note:
The RiskLoWatcher.exe is built on Windows from the /desktop-app project.
See desktop-app/BUILD_NOW.md for build details.

