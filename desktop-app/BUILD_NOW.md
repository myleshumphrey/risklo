# Build RiskLo Watcher Desktop App

## Quick Build Instructions

### Prerequisites
- Windows 10/11
- .NET 6.0 SDK ([Download here](https://dotnet.microsoft.com/download/dotnet/6.0))

### Build Steps

**Option 1: Use the Build Script (Easiest)**
1. Open the `desktop-app` folder in File Explorer
2. Double-click `build.bat`
3. Wait for build to complete
4. Copy `bin\Release\net6.0-windows\win-x64\publish\RiskLoWatcher.exe`
5. Place it in `client\public\downloads\RiskLoWatcher.exe`

**Option 2: Manual Build**
1. Open Command Prompt in the `desktop-app` folder
2. Run:
   ```cmd
   dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true
   ```
3. Copy `bin\Release\net6.0-windows\win-x64\publish\RiskLoWatcher.exe`
4. Place it in `client\public\downloads\RiskLoWatcher.exe`

### After Building

1. Test the app locally:
   - Run `RiskLoWatcher.exe`
   - Check system tray for icon
   - Right-click → Set Email Address
   - Create test CSVs in `C:\RiskLoExports\`
   - Verify upload works

2. Deploy to website:
   - The file is already in `client/public/downloads/`
   - Netlify will serve it automatically
   - Users can download from https://risklo.io/downloads/RiskLoWatcher.exe

### File Size
The compiled .exe will be approximately 15-20 MB (includes .NET runtime).

### Troubleshooting

**Error: .NET SDK not found**
- Install .NET 6.0 SDK from https://dotnet.microsoft.com/download/dotnet/6.0

**Error: Build failed**
- Make sure you're in the `desktop-app` folder
- Check that all files are present (RiskLoWatcher.cs, RiskLoWatcher.csproj)
- Try running as Administrator

**App doesn't run**
- Make sure you're on Windows 10 or later
- Try running as Administrator
- Check Windows Defender didn't block it

