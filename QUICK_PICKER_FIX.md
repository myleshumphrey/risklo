# Quick Start: Get API Key and Project Number

## 🎯 What You Need to Do RIGHT NOW:

### 1. Get Google API Key (2 minutes)

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **"+ CREATE CREDENTIALS"** → **"API key"**
3. **Copy the key** (starts with `AIza...`)
4. (Optional) Click "Edit API key" and restrict it:
   - **Application restrictions**: HTTP referrers
   - Add: `https://risklo.io/*` and `http://localhost:3000/*`
   - **API restrictions**: Google Drive API, Google Picker API
5. **Paste into your terminal:**

```bash
cd /Users/myleshumphrey/repos/risklo/client
echo "REACT_APP_GOOGLE_API_KEY=YOUR_KEY_HERE" >> .env
```

---

### 2. Get Google Cloud Project Number (1 minute)

1. Go to: https://console.cloud.google.com/
2. Look at the **"Project info"** card on the dashboard
3. Find **"Project number"** (12-digit number like `123456789012`)
4. **Paste into your terminal:**

```bash
cd /Users/myleshumphrey/repos/risklo/client
echo "REACT_APP_GOOGLE_PROJECT_NUMBER=YOUR_NUMBER_HERE" >> .env
```

---

### 3. Restart Servers

```bash
cd /Users/myleshumphrey/repos/risklo
# Stop everything
pkill -f "npm start"
pkill -f "react-scripts"

# Start backend
cd server && npm start &

# Start frontend (separate terminal or background)
cd ../client && npm start
```

---

### 4. Test (1 minute)

1. Go to: http://localhost:3000
2. Sign out
3. Delete old token:
   ```bash
   rm /Users/myleshumphrey/repos/risklo/server/data/google_oauth_tokens.json
   ```
4. Sign back in
5. Use the Picker to select Results Spreadsheet
6. **Check console for:** `✅ App ID set` and `✅ Developer key set`

---

## 🧪 Then Test Drive API Access:

Open in browser:
```
http://localhost:5001/api/test-drive-access?email=myles2595@gmail.com&fileId=1rqGGpl5SJ_34L72yCCcSZIoUrD_ggGn5LfJ_BGFjDQY
```

**Expected if working correctly:**
```json
{
  "driveApiWorks": true,
  "file": {
    "name": "Results Spreadsheet",
    "mimeType": "application/vnd.google-apps.spreadsheet"
  },
  "message": "✅ Drive API can access this file with drive.file scope"
}
```

**If you see this**, then we can test removing `spreadsheets.readonly` and using only `drive.file`!

---

## 🎉 What This Will Unlock:

If this works, you can:
- ✅ Use ONLY `drive.file` scope (no sensitive scopes)
- ✅ No Google verification required
- ✅ No annual security audits
- ✅ Users see "See files you use with this app" instead of "See all spreadsheets"
- ✅ Faster approval process

---

## 📞 Need Help?

If you can't find these values:
1. Share a screenshot of your Google Cloud Console dashboard
2. I'll point you to the exact location

**Do this now and let me know what happens!** 🚀

