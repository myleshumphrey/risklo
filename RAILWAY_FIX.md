# Railway Build Fix - Manual Configuration Required

## Problem
Railway is detecting the C# desktop-app project and trying to build it, causing build failures.

## Solution: Configure Root Directory in Railway Dashboard

Railway needs to be configured to only build from the `server` directory.

### Steps:

1. **Go to Railway Dashboard**
   - Navigate to your `risklo` service

2. **Open Settings**
   - Click on "Settings" tab

3. **Set Root Directory**
   - Find "Root Directory" setting
   - Set it to: `server`
   - This tells Railway to only look in the `server` folder for build files

4. **Save and Redeploy**
   - Save the settings
   - Railway will automatically trigger a new deployment
   - The build should now only see Node.js files, not C# files

## Alternative: If Root Directory Setting Doesn't Exist

If Railway doesn't have a "Root Directory" setting, you can:

1. **Use Railway's Service Settings**
   - Go to Service → Settings
   - Look for "Build" or "Deploy" settings
   - Set "Working Directory" or "Build Path" to `server`

2. **Or Contact Railway Support**
   - They can help configure the service to ignore certain directories

## Current railway.toml

The `railway.toml` file is configured correctly, but Railway's auto-detection is still finding the C# project. The dashboard configuration is needed to override this.

