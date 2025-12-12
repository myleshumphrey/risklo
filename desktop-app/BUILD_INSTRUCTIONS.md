# RiskLo Watcher - Build Instructions

## What This Is
A simple Windows desktop app that sits in your system tray and watches for CSV exports from NinjaTrader. When it detects both account and strategy CSVs, it automatically uploads them to RiskLo.

**No NinjaTrader integration needed. Just a standalone .exe file.**

---

## Building the App

### Prerequisites
- Windows 10/11
- .NET 6.0 SDK or later ([Download here](https://dotnet.microsoft.com/download))

### Build Steps

1. **Open Command Prompt** in the `desktop-app` folder

2. **Build the application:**
   ```cmd
   dotnet build -c Release
   ```

3. **Publish as a single executable:**
   ```cmd
   dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true
   ```

4. **Find the executable:**
   ```
   desktop-app\bin\Release\net6.0-windows\win-x64\publish\RiskLoWatcher.exe
   ```

---

## Distribution

### Option 1: Simple ZIP
1. Copy `RiskLoWatcher.exe` from the publish folder
2. Create a ZIP file with:
   - `RiskLoWatcher.exe`
   - `README.md` (user instructions)
3. Upload to RiskLo website for download

### Option 2: Installer (Recommended)
Use a tool like **Inno Setup** to create a proper installer:
- Installs to `C:\Program Files\RiskLo Watcher\`
- Creates Start Menu shortcut
- Adds to Windows startup (optional)
- Includes uninstaller

---

## User Installation

### Simple Method:
1. Download `RiskLoWatcher.exe`
2. Double-click to run
3. App appears in system tray
4. That's it!

### Auto-Start on Windows Boot (Optional):
1. Press `Win + R`
2. Type `shell:startup` and press Enter
3. Copy `RiskLoWatcher.exe` or create a shortcut to it in this folder
4. App will start automatically when Windows boots

---

## How It Works

1. **App starts** → Appears in system tray
2. **Watches** `C:\RiskLoExports\` for CSV files
3. **Detects** files with "account" and "strat" in filename
4. **Uploads** automatically to RiskLo API
5. **Notifies** user via balloon tooltip
6. **User receives** email with risk analysis

---

## User Instructions

### Daily Workflow:
1. Export from NinjaTrader:
   - Account tab → Right-click → Export → Save to `C:\RiskLoExports\accounts.csv`
   - Strategy Performance tab → Right-click → Export → Save to `C:\RiskLoExports\strategies.csv`

2. Done! The app automatically:
   - Detects the files
   - Uploads to RiskLo
   - Shows "Upload Successful!" notification

3. Check email for risk analysis results

### System Tray Menu:
- **Upload Latest CSVs Now** - Manual upload
- **View Upload History** - See last 10 uploads
- **Open Watch Folder** - Opens `C:\RiskLoExports\`
- **Exit** - Close the app

---

## Advantages Over NinjaTrader AddOn

✅ **Simpler** - Just a standalone .exe, no NinjaTrader integration
✅ **Easier to install** - Double-click and run
✅ **Works anywhere** - Doesn't require NinjaTrader to be running
✅ **Easier to update** - Just replace the .exe
✅ **More flexible** - Can watch any folder, not just NinjaTrader's
✅ **Lighter weight** - Minimal resource usage
✅ **No compilation** - Users don't need to compile anything

---

## File Size
- Single .exe file: ~15-20 MB (includes .NET runtime)
- No dependencies needed

---

## Customization

### Change Watch Directory:
Edit line 13 in `RiskLoWatcher.cs`:
```csharp
private const string WATCH_DIRECTORY = @"C:\YourFolder\";
```

### Change File Patterns:
Edit lines 64-65 in `RiskLoWatcher.cs`:
```csharp
Filter = "*account*.csv",  // Change to your pattern
Filter = "*strat*.csv",    // Change to your pattern
```

### Add Custom Icon:
1. Create `risklo-icon.ico` (256x256 recommended)
2. Place in `desktop-app` folder
3. Rebuild

---

## Testing

1. Run `RiskLoWatcher.exe`
2. Check system tray for icon
3. Create test files:
   - `C:\RiskLoExports\test_account.csv`
   - `C:\RiskLoExports\test_strat.csv`
4. Watch for balloon notification
5. Check upload history (right-click tray icon)

---

## Troubleshooting

### App doesn't start:
- Install .NET 6.0 Desktop Runtime
- Run as Administrator

### Files not detected:
- Check filenames contain "account" and "strat"
- Check files are in `C:\RiskLoExports\`
- Right-click tray icon → "Open Watch Folder"

### Upload fails:
- Check internet connection
- Right-click tray icon → "View Upload History" for error details

---

## Distribution on RiskLo Website

Add download link to Footer:

```jsx
<a href="/downloads/RiskLoWatcher.exe" download>
  Download RiskLo Watcher (Windows)
</a>
```

Or create an installer and link to that:

```jsx
<a href="/downloads/RiskLoWatcher-Setup.exe" download>
  Download RiskLo Watcher Installer
</a>
```

---

## Future Enhancements

- [ ] macOS version
- [ ] Settings UI (change watch folder, API URL)
- [ ] Auto-update functionality
- [ ] Multiple folder monitoring
- [ ] Scheduled exports
- [ ] Real-time notifications

