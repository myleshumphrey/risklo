# Build & Deploy RiskLo Watcher Desktop App

## ✅ Website Changes Complete

The website has been updated with:
- ✅ New "Download Desktop App" button in footer (with green "Recommended" badge)
- ✅ Desktop App Guide page (`/desktopAppGuide`)
- ✅ NinjaTrader AddOn download still available
- ✅ Both download options visible in footer

## 🔨 Build the Desktop App (Windows Required)

### Prerequisites
- Windows 10/11 computer
- .NET 6.0 SDK ([Download here](https://dotnet.microsoft.com/download/dotnet/6.0))

### Build Steps

**Option 1: Use the Build Script (Easiest)**
1. On your Windows computer, navigate to: `desktop-app` folder
2. Double-click `build.bat`
3. Wait for build to complete
4. Find the output: `desktop-app\bin\Release\net6.0-windows\win-x64\publish\RiskLoWatcher.exe`

**Option 2: Manual Command**
```cmd
cd desktop-app
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true
```

Output: `desktop-app\bin\Release\net6.0-windows\win-x64\publish\RiskLoWatcher.exe`

### After Building

1. **Copy the .exe file:**
   ```
   Copy: desktop-app\bin\Release\net6.0-windows\win-x64\publish\RiskLoWatcher.exe
   To: client\public\downloads\RiskLoWatcher.exe
   ```

2. **Test locally:**
   - Run `RiskLoWatcher.exe`
   - Check system tray for icon
   - Right-click → Set Email Address
   - Create test CSVs in `C:\RiskLoExports\`
   - Verify upload works

3. **Deploy:**
   - Commit and push to GitHub
   - Netlify will automatically deploy
   - Users can download from: `https://risklo.io/downloads/RiskLoWatcher.exe`

## 📝 What's in the Footer Now

### Desktop App Section (Recommended)
- **Title:** "RiskLo Watcher (Desktop App)" with green "Recommended" badge
- **Description:** "Simple Windows app that automatically uploads your NinjaTrader CSV exports to RiskLo. Just export your CSVs and get instant email results - no website login needed!"
- **Buttons:**
  - "Download Desktop App" (green primary button)
  - "User Guide" (links to `/desktopAppGuide` page)

### NinjaTrader AddOn Section (Alternative)
- **Title:** "RiskLoExporter (NinjaTrader AddOn)"
- **Description:** "Alternative: NinjaTrader AddOn for exporting account and strategy data to CSV files."
- **Buttons:**
  - "Download AddOn" (blue button)
  - "Setup Instructions" (links to CSV upload page)

## 📄 Files Created/Modified

### Desktop App Files
- ✅ `desktop-app/RiskLoWatcher.cs` - Main app code (with email config)
- ✅ `desktop-app/RiskLoWatcher.csproj` - Build configuration
- ✅ `desktop-app/build.bat` - Build script for Windows
- ✅ `desktop-app/BUILD_NOW.md` - Build instructions
- ✅ `desktop-app/USER_GUIDE.md` - End-user documentation
- ✅ `desktop-app/README.md` - Technical overview

### Website Files
- ✅ `client/src/components/Footer.js` - Added desktop app download section
- ✅ `client/src/components/Footer.css` - Styled desktop app section
- ✅ `client/src/pages/DesktopAppGuide.js` - New guide page
- ✅ `client/src/App.js` - Added route for desktop app guide
- ✅ `client/public/downloads/README_DESKTOP_APP.txt` - Placeholder/instructions

### Backend Files
- ✅ `server/utils/csvParser.js` - CSV parsing logic
- ✅ `server/index.js` - Complete `/api/upload-csv-auto` endpoint

## 🧪 Testing Checklist

### Backend Testing
- [ ] Deploy backend to Railway
- [ ] Test `/api/upload-csv-auto` endpoint with sample CSVs
- [ ] Verify email sending works

### Desktop App Testing
- [ ] Build app on Windows
- [ ] Run `RiskLoWatcher.exe`
- [ ] Set email address
- [ ] Create test CSVs in `C:\RiskLoExports\`
- [ ] Verify upload notification
- [ ] Check backend logs
- [ ] Verify email received

### Website Testing
- [ ] Deploy frontend to Netlify
- [ ] Verify download button works
- [ ] Check desktop app guide page loads
- [ ] Verify both download options are visible
- [ ] Test on mobile

### End-to-End Testing
- [ ] Export real CSVs from NinjaTrader
- [ ] Save to `C:\RiskLoExports\`
- [ ] Verify auto-upload
- [ ] Check email for risk summary
- [ ] Verify all metrics are correct

## 🚀 Deployment Steps

1. **Build Desktop App** (Windows required)
   ```cmd
   cd desktop-app
   build.bat
   ```

2. **Copy to downloads folder**
   ```cmd
   copy bin\Release\net6.0-windows\win-x64\publish\RiskLoWatcher.exe ..\client\public\downloads\
   ```

3. **Commit and push**
   ```bash
   git add .
   git commit -m "Add RiskLo Watcher desktop app"
   git push
   ```

4. **Deploy backend** (if not already deployed)
   - Railway will auto-deploy from GitHub

5. **Netlify auto-deploys**
   - Frontend will be live automatically

6. **Test live site**
   - Download app from https://risklo.io
   - Test full workflow

## 📧 User Workflow (After Deployment)

1. User visits https://risklo.io
2. Scrolls to footer
3. Clicks "Download Desktop App"
4. Runs `RiskLoWatcher.exe`
5. Sets email address
6. Exports CSVs from NinjaTrader to `C:\RiskLoExports\`
7. Gets "Upload Successful!" notification
8. Receives email with risk analysis

**Total user effort: 30 seconds to export CSVs!**

## 💡 Key Features

### Desktop App
- ✅ System tray app (runs in background)
- ✅ File watcher (auto-detects CSVs)
- ✅ Auto-upload to RiskLo API
- ✅ Email configuration (persisted)
- ✅ Upload history tracking
- ✅ Manual upload button
- ✅ Balloon notifications

### Backend API
- ✅ CSV parsing (accounts + strategies)
- ✅ Google Sheets integration (fetch strategy data)
- ✅ Risk calculation (all metrics)
- ✅ Email summary (SendGrid)
- ✅ Error handling

### Website
- ✅ Desktop app download
- ✅ User guide page
- ✅ NinjaTrader AddOn download (still available)
- ✅ Both options clearly labeled

## 🎯 Next Steps

1. **Build the app on Windows** (requires .NET 6.0 SDK)
2. **Test locally**
3. **Copy to downloads folder**
4. **Deploy to website**
5. **Test end-to-end**
6. **Launch!** 🚀

## 📞 Support

For issues:
- Check `desktop-app/BUILD_NOW.md` for detailed build instructions
- Check `desktop-app/USER_GUIDE.md` for end-user documentation
- Check `AUTOMATED_WORKFLOW_COMPLETE.md` for full technical details

