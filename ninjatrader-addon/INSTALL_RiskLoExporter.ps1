# RiskLoExporter Installer for NinjaTrader 8 (PowerShell)
# Run this script: Right-click -> Run with PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RiskLoExporter Installer for NinjaTrader 8" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This installer must be run as Administrator." -ForegroundColor Red
    Write-Host "Right-click and select 'Run with PowerShell' as Administrator" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$zipFile = Join-Path $scriptDir "RiskLoExporter.zip"
$csFile = Join-Path $scriptDir "RiskLoExporter.cs"

# Check if ZIP file exists OR if files are already extracted
$useExtracted = $false
if (Test-Path $csFile) {
    Write-Host "Found extracted files. Using them directly..." -ForegroundColor Green
    $useExtracted = $true
    $sourceFolder = $scriptDir
} elseif (Test-Path $zipFile) {
    Write-Host "Found ZIP file. Will extract and install..." -ForegroundColor Green
    $useExtracted = $false
} else {
    Write-Host "ERROR: Neither RiskLoExporter.zip nor RiskLoExporter.cs found." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please either:" -ForegroundColor Yellow
    Write-Host "  1. Place RiskLoExporter.zip in the same folder as this installer, OR" -ForegroundColor Yellow
    Write-Host "  2. Extract the ZIP and run this installer from the extracted folder" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Get NinjaTrader paths
$ntDocuments = Join-Path $env:USERPROFILE "Documents\NinjaTrader 8"
$ntAddOns = Join-Path $ntDocuments "bin\Custom\AddOns"
$ntCustom = Join-Path $ntDocuments "bin\Custom"
$targetFolder = Join-Path $ntAddOns "RiskLoExporter"

Write-Host "Checking NinjaTrader installation..." -ForegroundColor Yellow
if (-not (Test-Path $ntDocuments)) {
    Write-Host "ERROR: NinjaTrader 8 documents folder not found at:" -ForegroundColor Red
    Write-Host $ntDocuments -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please make sure NinjaTrader 8 is installed." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "NinjaTrader found!" -ForegroundColor Green
Write-Host ""

# Create target folder
Write-Host "Creating AddOn folder..." -ForegroundColor Yellow
if (-not (Test-Path $ntAddOns)) {
    New-Item -ItemType Directory -Path $ntAddOns -Force | Out-Null
}
if (-not (Test-Path $targetFolder)) {
    New-Item -ItemType Directory -Path $targetFolder -Force | Out-Null
}

# Handle extraction or use existing files
if ($useExtracted) {
    Write-Host "Using extracted files from current folder..." -ForegroundColor Yellow
    $sourceFile = $csFile
} else {
    Write-Host "Extracting ZIP file..." -ForegroundColor Yellow
    $tempExtract = Join-Path $env:TEMP "RiskLoExporter_Extract"
    if (Test-Path $tempExtract) {
        Remove-Item -Path $tempExtract -Recurse -Force
    }
    New-Item -ItemType Directory -Path $tempExtract -Force | Out-Null
    
    try {
        Expand-Archive -Path $zipFile -DestinationPath $tempExtract -Force
        Write-Host "Files extracted successfully!" -ForegroundColor Green
        $sourceFile = Join-Path $tempExtract "RiskLoExporter.cs"
    } catch {
        Write-Host "ERROR: Failed to extract ZIP file." -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Copy RiskLoExporter.cs
Write-Host "Installing AddOn file..." -ForegroundColor Yellow
if (Test-Path $sourceFile) {
    Copy-Item -Path $sourceFile -Destination (Join-Path $targetFolder "RiskLoExporter.cs") -Force
    Write-Host "RiskLoExporter.cs installed successfully!" -ForegroundColor Green
} else {
    Write-Host "ERROR: RiskLoExporter.cs not found." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Cleanup temp folder if we extracted
if (-not $useExtracted) {
    Remove-Item -Path $tempExtract -Recurse -Force
}

# Check for Newtonsoft.Json
Write-Host ""
Write-Host "Checking for Newtonsoft.Json..." -ForegroundColor Yellow
$newtonsoftDll = Join-Path $ntCustom "Newtonsoft.Json.dll"
if (Test-Path $newtonsoftDll) {
    Write-Host "Newtonsoft.Json.dll found!" -ForegroundColor Green
} else {
    Write-Host "Newtonsoft.Json.dll not found. Installing from package..." -ForegroundColor Yellow
    
    # Check if DLL is in the installer folder (from ZIP)
    $sourceDll = Join-Path $scriptDir "Newtonsoft.Json.dll"
    
    # Debug: Show what we're looking for
    Write-Host "Looking for DLL at: $sourceDll" -ForegroundColor Gray
    
    if (Test-Path $sourceDll) {
        Write-Host "Found Newtonsoft.Json.dll! Copying..." -ForegroundColor Green
        try {
            Copy-Item -Path $sourceDll -Destination $newtonsoftDll -Force
            Write-Host "Newtonsoft.Json.dll installed successfully!" -ForegroundColor Green
        } catch {
            Write-Host "ERROR: Failed to copy DLL. $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "WARNING: Newtonsoft.Json.dll not found in installer package." -ForegroundColor Yellow
        Write-Host "Expected location: $sourceDll" -ForegroundColor Gray
        Write-Host "Current directory: $(Get-Location)" -ForegroundColor Gray
        Write-Host "Script directory: $scriptDir" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Please ensure the ZIP file includes Newtonsoft.Json.dll" -ForegroundColor Yellow
        Write-Host "You can download it manually from:" -ForegroundColor Yellow
        Write-Host "https://www.nuget.org/packages/Newtonsoft.Json/" -ForegroundColor Cyan
        Write-Host "Place Newtonsoft.Json.dll in: $ntCustom" -ForegroundColor Yellow
    }
}

# Cleanup already handled above

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open NinjaTrader 8" -ForegroundColor White
Write-Host "2. Go to Tools > Compile" -ForegroundColor White
Write-Host "3. After successful compilation, access the AddOn via:" -ForegroundColor White
Write-Host "   Tools > NinjaScript Editor > Open RiskLoExporter.cs" -ForegroundColor White
Write-Host ""
Write-Host "The AddOn file is located at:" -ForegroundColor Cyan
Write-Host $targetFolder -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"

