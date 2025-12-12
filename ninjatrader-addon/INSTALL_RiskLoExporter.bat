@echo off
echo ========================================
echo RiskLoExporter Installer for NinjaTrader 8
echo ========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This installer must be run as Administrator.
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

REM Get the script directory (where files are located)
set "SCRIPT_DIR=%~dp0"
set "ZIP_FILE=%SCRIPT_DIR%RiskLoExporter.zip"
set "CS_FILE=%SCRIPT_DIR%RiskLoExporter.cs"

REM Check if ZIP file exists OR if files are already extracted
if exist "%CS_FILE%" (
    echo Found extracted files. Using them directly...
    set "USE_EXTRACTED=1"
    set "SOURCE_FOLDER=%SCRIPT_DIR%"
) else if exist "%ZIP_FILE%" (
    echo Found ZIP file. Will extract and install...
    set "USE_EXTRACTED=0"
) else (
    echo ERROR: Neither RiskLoExporter.zip nor RiskLoExporter.cs found.
    echo.
    echo Please either:
    echo   1. Place RiskLoExporter.zip in the same folder as this installer, OR
    echo   2. Extract the ZIP and run this installer from the extracted folder
    pause
    exit /b 1
)

REM Get NinjaTrader documents folder
set "NT_DOCUMENTS=%USERPROFILE%\Documents\NinjaTrader 8"
set "NT_ADDONS=%NT_DOCUMENTS%\bin\Custom\AddOns"
set "NT_CUSTOM=%NT_DOCUMENTS%\bin\Custom"
set "TARGET_FOLDER=%NT_ADDONS%\RiskLoExporter"

echo Checking NinjaTrader installation...
if not exist "%NT_DOCUMENTS%" (
    echo ERROR: NinjaTrader 8 documents folder not found at:
    echo %NT_DOCUMENTS%
    echo.
    echo Please make sure NinjaTrader 8 is installed.
    pause
    exit /b 1
)

echo NinjaTrader found!
echo.

REM Create target folder
echo Creating AddOn folder...
if not exist "%NT_ADDONS%" mkdir "%NT_ADDONS%"
if not exist "%TARGET_FOLDER%" mkdir "%TARGET_FOLDER%"

REM Handle extraction or use existing files
if "%USE_EXTRACTED%"=="1" (
    echo Using extracted files from current folder...
    set "SOURCE_FILE=%CS_FILE%"
) else (
    echo Extracting ZIP file...
    set "TEMP_EXTRACT=%TEMP%\RiskLoExporter_Extract"
    if exist "%TEMP_EXTRACT%" rmdir /s /q "%TEMP_EXTRACT%"
    mkdir "%TEMP_EXTRACT%"
    
    REM Use PowerShell to extract ZIP (built into Windows 10+)
    powershell -Command "Expand-Archive -Path '%ZIP_FILE%' -DestinationPath '%TEMP_EXTRACT%' -Force"
    if %errorLevel% neq 0 (
        echo ERROR: Failed to extract ZIP file.
        echo Please extract RiskLoExporter.zip manually and copy RiskLoExporter.cs to:
        echo %TARGET_FOLDER%
        pause
        exit /b 1
    )
    set "SOURCE_FILE=%TEMP_EXTRACT%\RiskLoExporter.cs"
)

REM Copy RiskLoExporter.cs to AddOns folder
echo Installing AddOn file...
if exist "%SOURCE_FILE%" (
    copy /Y "%SOURCE_FILE%" "%TARGET_FOLDER%\RiskLoExporter.cs"
    echo RiskLoExporter.cs installed successfully!
) else (
    echo ERROR: RiskLoExporter.cs not found.
    pause
    exit /b 1
)

REM Cleanup temp folder if we extracted
if "%USE_EXTRACTED%"=="0" (
    rmdir /s /q "%TEMP_EXTRACT%"
)

REM Check for Newtonsoft.Json
echo.
echo Checking for Newtonsoft.Json...
set "NEWTONSOFT_DLL=%NT_CUSTOM%\Newtonsoft.Json.dll"
if exist "%NEWTONSOFT_DLL%" (
    echo Newtonsoft.Json.dll found!
) else (
    echo Newtonsoft.Json.dll not found. Installing from package...
    
    REM Check if DLL is in the installer folder (from ZIP)
    REM %~dp0 already includes trailing backslash, so no need to add one
    set "SOURCE_DLL=%~dp0Newtonsoft.Json.dll"
    
    REM Debug: Show what we're looking for
    echo Looking for DLL at: %SOURCE_DLL%
    
    if exist "%SOURCE_DLL%" (
        echo Found Newtonsoft.Json.dll! Copying...
        copy /Y "%SOURCE_DLL%" "%NEWTONSOFT_DLL%"
        if %errorLevel% equ 0 (
            echo Newtonsoft.Json.dll installed successfully!
        ) else (
            echo ERROR: Failed to copy DLL. Check permissions.
        )
    ) else (
        echo WARNING: Newtonsoft.Json.dll not found in installer package.
        echo Expected location: %SOURCE_DLL%
        echo Current directory: %CD%
        echo Script directory: %~dp0
        echo.
        echo Please ensure the ZIP file includes Newtonsoft.Json.dll
        echo You can download it manually from:
        echo https://www.nuget.org/packages/Newtonsoft.Json/
        echo Place Newtonsoft.Json.dll in: %NT_CUSTOM%
        echo.
        set /p CONTINUE="Press Enter to continue (you can install Newtonsoft.Json later)..."
    )
)

REM Cleanup already handled above

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Open NinjaTrader 8
echo 2. Go to Tools ^> Compile
echo 3. If you see errors about Newtonsoft.Json, install it from:
echo    https://www.nuget.org/packages/Newtonsoft.Json/
echo 4. After successful compilation, access the AddOn via:
echo    Tools ^> NinjaScript Editor ^> Open RiskLoExporter.cs
echo.
echo The AddOn file is located at:
echo %TARGET_FOLDER%\RiskLoExporter.cs
echo.
pause

