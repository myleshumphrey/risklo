# Fix "API developer key is invalid" Error

## 🔧 Quick Fix (3 steps):

### Step 1: Enable Required APIs

Go to: https://console.cloud.google.com/apis/library

Search for and **ENABLE** these APIs:
1. ✅ **Google Drive API** - Click "Enable"
2. ✅ **Google Picker API** - Click "Enable" (might already be enabled)
3. ✅ **Google Sheets API** - Click "Enable" (should already be enabled)

---

### Step 2: Edit Your API Key

Go to: https://console.cloud.google.com/apis/credentials

1. Find your API key: **RiskLoApi1**
2. Click the **pencil icon** to edit
3. Under **"Application restrictions"**:
   - Select: **"HTTP referrers (web sites)"**
   - Click **"ADD AN ITEM"**
   - Add: `http://localhost:3000/*`
   - Add: `https://risklo.io/*`
   - Add: `http://localhost:*/*` (for any local port)
4. Under **"API restrictions"**:
   - Select: **"Restrict key"**
   - Check these boxes:
     - ✅ **Google Drive API**
     - ✅ **Google Sheets API**
     - (Google Picker is part of Drive API)
5. Click **"SAVE"**

---

### Step 3: Wait 1 Minute

API keys can take 30-60 seconds to activate after creation/modification.

---

## Then Test Again:

1. Refresh browser at `http://localhost:3000`
2. Sign in with Google
3. Picker should now work without the "invalid key" error

---

## Alternative: Test Without Developer Key First

If you want to test quickly, I can temporarily make the developer key optional in the code (it's recommended but not always required). Let me know if you want to try that while waiting for the API key to activate.

