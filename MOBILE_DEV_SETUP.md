# Mobile Development Setup Guide

## The Problem
Google OAuth **does not accept IP addresses** (like `192.168.183.203:3000`) in authorized origins. It requires domain names. This is why mobile sign-in fails when accessing via local network IP.

## Solution: Use ngrok for Mobile Development

ngrok creates a public HTTPS URL that tunnels to your local server, allowing Google OAuth to work.

### Step 1: Install ngrok

```bash
# macOS
brew install ngrok

# Or download from: https://ngrok.com/download
# Sign up for a free account at https://dashboard.ngrok.com/get-started/your-authtoken
```

### Step 2: Set up ngrok (First Time Only)

```bash
# Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### Step 3: Start Your Servers

**Terminal 1: Start Backend**
```bash
cd server
PORT=5001 node index.js
```

**Terminal 2: Start ngrok for Backend**
```bash
ngrok http 5001
```
Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

**Terminal 3: Start Frontend with Backend URL**
```bash
cd client
REACT_APP_API_URL=https://abc123.ngrok-free.app npm start
```

**Terminal 4: Start ngrok for Frontend**
```bash
ngrok http 3000
```
Copy the HTTPS URL (e.g., `https://xyz789.ngrok-free.app`)

### Step 4: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID (RiskLo)
4. **Fix the typo first:**
   - In "Authorized redirect URIs", change:
     - `https://risklo-production.up.railway.app/api/google-sheets/oauth/callt` 
     - To: `https://risklo-production.up.railway.app/api/google-sheets/oauth/callback`
5. **Add ngrok URLs:**
   - In "Authorized JavaScript origins", click "+ Add URI" and add:
     - `https://xyz789.ngrok-free.app` (your frontend ngrok URL)
   - In "Authorized redirect URIs", click "+ Add URI" and add:
     - `https://abc123.ngrok-free.app/api/google-sheets/oauth/callback` (your backend ngrok URL)
6. Click **Save**

### Step 5: Update Backend Environment Variable

In your local `server/.env` file (or wherever you set environment variables):

```bash
GOOGLE_OAUTH_REDIRECT_URI=https://abc123.ngrok-free.app/api/google-sheets/oauth/callback
```

### Step 6: Access from Mobile

1. Open the frontend ngrok URL on your phone: `https://xyz789.ngrok-free.app`
2. Try signing in - it should work now! ✅

## Important Notes

⚠️ **ngrok URLs Change Each Time**
- Free ngrok URLs change every time you restart ngrok
- You'll need to update Google Cloud Console each time
- Consider ngrok's paid plan for static domains

✅ **Alternative: Use Production Site**
- For quick testing, just use `https://risklo.io` from mobile
- OAuth is already configured there!

## Quick Reference

```bash
# Terminal 1: Backend
cd server && PORT=5001 node index.js

# Terminal 2: ngrok for backend
ngrok http 5001
# Copy HTTPS URL → use in GOOGLE_OAUTH_REDIRECT_URI and Google Console

# Terminal 3: Frontend
cd client
REACT_APP_API_URL=<backend-ngrok-url> npm start

# Terminal 4: ngrok for frontend  
ngrok http 3000
# Copy HTTPS URL → use in Google Console Authorized JavaScript origins
```

## Troubleshooting

**"origin_mismatch" error:**
- Make sure you added the ngrok URLs to Google Cloud Console
- Wait 5-10 minutes for changes to propagate
- Check that the URLs match exactly (including https://)

**"redirect_uri_mismatch" error:**
- Make sure `GOOGLE_OAUTH_REDIRECT_URI` in backend matches the ngrok backend URL
- Make sure it's added to Google Cloud Console "Authorized redirect URIs"

**Connection refused:**
- Make sure both backend and frontend servers are running
- Make sure both ngrok tunnels are active
