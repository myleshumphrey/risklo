# Google Sheets API Setup Guide

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Name it (e.g., "RiskLo") and click "Create"

## Step 2: Enable Google Sheets API

1. In your project, go to **"APIs & Services"** > **"Library"**
2. Search for **"Google Sheets API"**
3. Click on it and press **"Enable"**

## Step 3: Create a Service Account

1. Go to **"IAM & Admin"** > **"Service Accounts"**
2. Click **"Create Service Account"**
3. Fill in:
   - **Service account name**: `risklo-service` (or any name)
   - **Service account ID**: Will auto-fill
   - Click **"Create and Continue"**
4. Skip the optional steps (Grant access, Grant users access)
5. Click **"Done"**

## Step 4: Create and Download Credentials

1. Click on your newly created service account
2. Go to the **"Keys"** tab
3. Click **"Add Key"** > **"Create new key"**
4. Choose **"JSON"** format
5. Click **"Create"** - this will download a JSON file

## Step 5: Place the Credentials File

1. Rename the downloaded file to `credentials.json`
2. Move it to the `server/` directory:
   ```bash
   # If you downloaded it to Downloads:
   mv ~/Downloads/your-project-name-xxxxx.json server/credentials.json
   ```

## Step 6: Share Your Google Sheet with the Service Account

**THIS IS CRITICAL - The service account needs access to your sheet!**

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1PCU-1ZjBEkAF1LE3Z1tbajCg3hOBzpKxx--z9QU8sAE/edit
2. Click the **"Share"** button (top right)
3. Open the `credentials.json` file you just downloaded
4. Find the `client_email` field (it looks like: `xxxxx@xxxxx.iam.gserviceaccount.com`)
5. Copy that email address
6. Paste it into the "Share" dialog in Google Sheets
7. Make sure it has **"Viewer"** permissions (or at least "Viewer")
8. **Uncheck** "Notify people" (you don't need to notify a service account)
9. Click **"Share"**

## Step 7: Verify Setup

The `.env` file should already be configured. Your `server/.env` should contain:
```
PORT=5000
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
```

## Troubleshooting

### "No algorithms found" or empty dropdown
- Make sure `credentials.json` is in the `server/` directory
- Verify the service account email has access to the Google Sheet
- Check the browser console (F12) for error messages
- Check the backend terminal for error messages

### "Permission denied" errors
- Make sure you shared the sheet with the service account email
- Verify the service account email is correct (check credentials.json)

### "API not enabled" errors
- Go back to Google Cloud Console and make sure Google Sheets API is enabled

