RiskLo Watcher Desktop App
===========================

IMPORTANT: The actual RiskLoWatcher.exe file needs to be built on a Windows machine.

To build the app:
1. On a Windows computer with .NET 6.0 SDK installed
2. Navigate to the desktop-app folder
3. Run: build.bat
   OR
   Run: dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true
4. Copy the resulting RiskLoWatcher.exe from:
   desktop-app\bin\Release\net6.0-windows\win-x64\publish\RiskLoWatcher.exe
5. Place it in this directory (client/public/downloads/RiskLoWatcher.exe)

Once built, users can download it from:
https://risklo.io/downloads/RiskLoWatcher.exe

See desktop-app/BUILD_NOW.md for detailed instructions.

