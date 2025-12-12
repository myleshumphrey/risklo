#!/bin/bash
# Netlify build script to ensure RiskLoWatcher.exe is available
# This script runs during Netlify build

# The .exe file should be in client/public/downloads/ but is gitignored
# If it doesn't exist, we'll need to download it or copy it from somewhere
# For now, this is a placeholder - you'll need to either:
# 1. Store the .exe in cloud storage and download it here
# 2. Or manually upload it via Netlify CLI after each build

echo "Netlify build script running..."
echo "Checking for RiskLoWatcher.exe..."

if [ ! -f "client/public/downloads/RiskLoWatcher.exe" ]; then
    echo "Warning: RiskLoWatcher.exe not found in client/public/downloads/"
    echo "The file needs to be uploaded separately or downloaded from cloud storage"
    echo "For now, users can download it from an alternative location"
fi

# Continue with normal build
cd client && npm install && npm run build

