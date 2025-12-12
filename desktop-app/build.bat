@echo off
echo ========================================
echo Building RiskLo Watcher Desktop App
echo ========================================
echo.

REM Check if .NET SDK is installed
dotnet --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: .NET SDK not found!
    echo Please install .NET 6.0 SDK from: https://dotnet.microsoft.com/download
    pause
    exit /b 1
)

echo .NET SDK found. Building...
echo.

REM Build the application
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true

if errorlevel 1 (
    echo.
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Build successful!
echo ========================================
echo.
echo Output location:
echo bin\Release\net6.0-windows\win-x64\publish\RiskLoWatcher.exe
echo.
echo Next steps:
echo 1. Copy RiskLoWatcher.exe from the publish folder
echo 2. Place it in: ..\client\public\downloads\RiskLoWatcher.exe
echo 3. Test the app locally
echo 4. Deploy to website
echo.
pause

