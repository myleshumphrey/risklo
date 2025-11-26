# Fix Google OAuth "origin_mismatch" Error on Mobile

## The Problem
When accessing from mobile at `http://192.168.183.203:3000`, Google OAuth shows:
- **Error 400: origin_mismatch**
- "You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy"
- **Google doesn't allow IP addresses** - it requires domain names

## The Solution Options

### ❌ IP Addresses Don't Work
Google OAuth **does not accept IP addresses** like `http://192.168.183.203:3000`. You'll get an error: "must end with a public top-level domain".

### ✅ Use One of These Solutions:

**Option 1: Test on Production Site (Easiest)**
- Just use `https://risklo.io` from mobile
- OAuth already configured! ✅

**Option 2: Use ngrok (For Local Development)**
- Creates a public HTTPS URL that tunnels to your local server
- See `MOBILE_OAUTH_SOLUTIONS.md` for detailed instructions

## Step-by-Step Fix:

### 1. Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Make sure you're in the correct project

### 2. Navigate to OAuth Credentials
- Go to: **APIs & Services** → **Credentials**
- Find your OAuth 2.0 Client ID (the one for RiskLo)
- Click on it to edit

### 3. Add Authorized JavaScript Origins
- Scroll to **"Authorized JavaScript origins"**
- Click **"+ Add URI"**
- Add: `http://192.168.183.203:3000`
- Click **"Save"**

### 4. Add Authorized Redirect URIs
- Scroll to **"Authorized redirect URIs"**
- Click **"+ Add URI"**
- Add: `http://192.168.183.203:3000`
- Click **"Save"**

### 5. Wait for Changes to Propagate
- Google says it can take **5 minutes to a few hours**
- Usually works within 5-10 minutes
- Try refreshing and signing in again

## Important Notes:

⚠️ **Your IP Address May Change**
- If you reconnect to WiFi, your IP might change
- If it changes, you'll need to update Google Cloud Console again
- Check your IP: `ifconfig | grep "inet " | grep -v 127.0.0.1`

✅ **For Production**
- Use your domain: `https://risklo.io`
- Don't use IP addresses in production

## Current Setup:
- **Your IP:** `192.168.183.203`
- **Frontend URL:** `http://192.168.183.203:3000`
- **Backend URL:** `http://192.168.183.203:5001`

## After Adding to Google Cloud Console:

1. Wait 5-10 minutes
2. Hard refresh your mobile browser
3. Try signing in again
4. Should work now! ✅

