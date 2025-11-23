# Quick Setup - Google Sheets API Credentials

## The Problem
If you see "No algorithms found" or an empty dropdown, the app can't access your Google Sheet because the credentials aren't set up.

## Quick Fix (5 minutes)

### 1. Get Your Credentials File

**Option A: If you already have a credentials.json file somewhere:**
```bash
# Copy it to the server directory
cp /path/to/your/credentials.json server/credentials.json
```

**Option B: Create new credentials (recommended):**

1. Go to: https://console.cloud.google.com/
2. Create a new project (or select existing)
3. Enable "Google Sheets API" (APIs & Services > Library > search "Google Sheets API")
4. Create Service Account:
   - IAM & Admin > Service Accounts > Create Service Account
   - Name it "risklo" > Create > Skip optional steps > Done
5. Create Key:
   - Click on the service account > Keys tab > Add Key > Create new key > JSON
   - This downloads a JSON file
6. Move the file:
   ```bash
   # Replace with your actual downloaded filename
   mv ~/Downloads/your-project-xxxxx.json server/credentials.json
   ```

### 2. Share Your Google Sheet

**CRITICAL STEP - This is why it's not working!**

1. Open your credentials.json file
2. Find the `client_email` field (looks like: `xxxxx@xxxxx.iam.gserviceaccount.com`)
3. Copy that email
4. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1PCU-1ZjBEkAF1LE3Z1tbajCg3hOBzpKxx--z9QU8sAE/edit
5. Click "Share" (top right)
6. Paste the service account email
7. Give it "Viewer" access
8. Uncheck "Notify people"
9. Click "Share"

### 3. Restart the Server

```bash
# Stop the server (Ctrl+C) and restart:
cd server
npm start
```

### 4. Refresh Your Browser

The algorithms should now appear in the dropdown!

## Verify It's Working

Check the server terminal - you should see:
- No error messages
- Server running on port 5000

Check the browser console (F12):
- No red errors
- The `/api/sheets` request should return 200 OK

## Still Not Working?

1. **Check credentials.json exists:**
   ```bash
   ls -la server/credentials.json
   ```

2. **Check the service account email has access:**
   - Open Google Sheet > Share button
   - Make sure the service account email is listed

3. **Check server logs:**
   - Look for error messages in the terminal where you ran `npm start`

4. **Test the API directly:**
   ```bash
   curl http://localhost:5000/api/sheets
   ```

## Need More Help?

See `GOOGLE_SETUP.md` for detailed step-by-step instructions with screenshots guidance.

