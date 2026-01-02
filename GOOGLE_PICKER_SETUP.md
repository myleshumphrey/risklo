# Google Picker Setup - Required Configuration

## 🔑 Missing Configuration Discovered!

ChatGPT identified the issue: Google Picker requires **two additional values** to properly establish per-file authorization with `drive.file` scope:

1. **Google API Key** (Developer Key)
2. **Google Cloud Project Number** (App ID)

Without these, the Picker selection doesn't actually authorize the file for API access, causing the 404 errors.

---

## 📋 Step-by-Step Setup

### 1. Get Your Google API Key

#### Go to Google Cloud Console:
https://console.cloud.google.com/

#### Navigate to:
**APIs & Services → Credentials**

#### Create API Key:
1. Click **"+ CREATE CREDENTIALS"** at the top
2. Select **"API key"**
3. Copy the generated key (starts with `AIza...`)
4. Click **"Edit API key"** (optional but recommended):
   - **Name**: "RiskLo Picker API Key"
   - **Application restrictions**: 
     - HTTP referrers (websites)
     - Add: `https://risklo.io/*`
     - Add: `http://localhost:3000/*` (for local dev)
   - **API restrictions**: 
     - Restrict key
     - Select: "Google Drive API" and "Google Picker API"
   - Click **"Save"**

#### Add to Environment Variables:
```bash
# Local (.env)
REACT_APP_GOOGLE_API_KEY=AIza...your-key-here

# Netlify
Site settings → Environment variables → Add:
REACT_APP_GOOGLE_API_KEY = AIza...your-key-here
```

---

### 2. Get Your Google Cloud Project Number

#### Go to Google Cloud Console:
https://console.cloud.google.com/

#### Navigate to:
**Dashboard** (should be the home page)

#### Find Project Number:
Look for the "Project Info" card on the dashboard:
- **Project name**: RiskLo (or whatever you named it)
- **Project number**: `123456789012` (12-digit number)
- **Project ID**: `risklo-...` (text ID)

**You need the NUMERIC "Project number"** (not the text Project ID)

#### Add to Environment Variables:
```bash
# Local (.env)
REACT_APP_GOOGLE_PROJECT_NUMBER=123456789012

# Netlify
Site settings → Environment variables → Add:
REACT_APP_GOOGLE_PROJECT_NUMBER = 123456789012
```

---

### 3. Verify Authorized JavaScript Origins

#### Go to Google Cloud Console:
**APIs & Services → Credentials**

#### Click on your OAuth 2.0 Client ID

#### Verify "Authorized JavaScript origins":
Must include:
- ✅ `http://localhost:3000` (local dev)
- ✅ `https://risklo.io` (production)

**DO NOT** include port numbers in production URLs (e.g., `:5001`)

---

### 4. Update Local .env File

Add these two new variables to `client/.env`:

```bash
# Existing variables (keep these)
REACT_APP_API_URL=http://localhost:5001
REACT_APP_GOOGLE_CLIENT_ID=906472782182-lramraac6lj5o37r9vckfhad19hll4in.apps.googleusercontent.com

# NEW: Required for Google Picker per-file authorization
REACT_APP_GOOGLE_API_KEY=AIza...your-key-here
REACT_APP_GOOGLE_PROJECT_NUMBER=123456789012
```

---

### 5. Update Netlify Environment Variables

Go to: **Netlify → Site settings → Environment variables**

Add:
- `REACT_APP_GOOGLE_API_KEY` = `AIza...`
- `REACT_APP_GOOGLE_PROJECT_NUMBER` = `123456789012`

---

## 🧪 Testing After Setup

### Test the Drive API First:

I've added a test endpoint. After setting up the API key and project number:

1. Restart servers (frontend + backend)
2. Sign in and complete Picker selection
3. Call this URL in browser:
   ```
   http://localhost:5001/api/test-drive-access?email=YOUR_EMAIL&fileId=1rqGGpl5SJ_34L72yCCcSZIoUrD_ggGn5LfJ_BGFjDQY
   ```

**Expected Result with `drive.file` ONLY:**
- ✅ Drive API returns file metadata (id, name, mimeType)
- ✅ Confirms per-file authorization is working

**If Drive works, then we can test Sheets API with `drive.file` only!**

---

## 🎯 Expected Outcome

With `setAppId()` and `setDeveloperKey()` correctly configured:

1. User selects file via Picker
2. Google registers: "This file is now authorized for App ID [project-number]"
3. Backend calls Sheets API with `drive.file` scope
4. ✅ Sheets API should work (no 404)
5. ✅ No need for `spreadsheets.readonly`
6. ✅ No Google verification required (non-sensitive scope)

---

## 📞 Quick Checklist

Before testing:
- [ ] Google API Key created and restricted
- [ ] API Key added to `REACT_APP_GOOGLE_API_KEY` (local + Netlify)
- [ ] Project Number obtained from Cloud Console dashboard
- [ ] Project Number added to `REACT_APP_GOOGLE_PROJECT_NUMBER` (local + Netlify)
- [ ] Authorized JavaScript origins verified
- [ ] Frontend restarted (to load new env vars)
- [ ] Backend restarted

---

## 🚨 Common Mistakes

1. **Using Project ID instead of Project Number**
   - ❌ Project ID: `risklo-123456` (text)
   - ✅ Project Number: `123456789012` (numeric)

2. **Wrong API Key restrictions**
   - Key must allow Google Drive API and Google Picker API
   - Key must allow your domain/localhost

3. **Missing trailing `/*` in referrer restrictions**
   - ❌ `https://risklo.io`
   - ✅ `https://risklo.io/*`

4. **Port numbers in production origins**
   - ❌ `https://risklo.io:443`
   - ✅ `https://risklo.io`

---

## 📚 References

- Stack Overflow: How to use Picker with drive.file scope: https://stackoverflow.com/questions/17508212
- Google Sheets API Scopes: https://developers.google.com/workspace/sheets/api/scopes
- Google Picker Overview: https://developers.google.com/workspace/drive/picker/guides/overview
- Workspace Update (setFileIds): https://workspaceupdates.googleblog.com/2024/11/new-file-picker-method-for-pre-selecting-google-drive-files.html

