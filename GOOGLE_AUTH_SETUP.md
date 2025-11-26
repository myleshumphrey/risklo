# Google Sign-In Setup Guide

## Quick Fix for "Missing client_id" Error

You need to create a `.env` file in the `client` directory with your Google OAuth Client ID.

## Steps:

1. **Create `.env` file in `client` directory:**
   ```bash
   cd client
   touch .env
   ```

2. **Add your Google Client ID to the `.env` file:**
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   REACT_APP_API_URL=http://localhost:5001
   ```

3. **Get your Google Client ID:**

   a. Go to [Google Cloud Console](https://console.cloud.google.com/)
   
   b. Select your project (or create a new one)
   
   c. Go to **APIs & Services** → **Credentials**
   
   d. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
   
   e. If prompted, configure the OAuth consent screen first:
      - Choose "External" (unless you have Google Workspace)
      - Fill in app name: "RiskLo"
      - Add your email as support email
      - Add your domain to authorized domains
      - Save and continue through scopes (you can skip for now)
      - Add test users if needed
   
   f. Create OAuth Client ID:
      - Application type: **Web application**
      - Name: "RiskLo Web Client"
      - Authorized JavaScript origins:
        - `http://localhost:3000` (for local development)
        - `https://risklo.io` (your production domain)
      - Authorized redirect URIs:
        - `http://localhost:3000` (for local development)
        - `https://risklo.io` (your production domain)
   
   g. Click **Create**
   
   h. Copy the **Client ID** (looks like: `123456789-abc123def456.apps.googleusercontent.com`)
   
   i. Paste it into your `client/.env` file

4. **Restart your React dev server:**
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   npm start
   ```

5. **For Production (Netlify):**
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add: `REACT_APP_GOOGLE_CLIENT_ID` = `your-client-id.apps.googleusercontent.com`
   - Redeploy your site

## Troubleshooting

- **Error persists after adding .env?** 
  - Make sure the file is named exactly `.env` (not `.env.local` or `.env.development`)
  - Restart your dev server completely
  - Check that the variable name is exactly `REACT_APP_GOOGLE_CLIENT_ID`

- **Still getting "invalid_request"?**
  - Make sure your authorized JavaScript origins include the exact URL you're using
  - For localhost, use `http://localhost:3000` (not `http://127.0.0.1:3000`)
  - Wait a few minutes after updating Google Cloud Console settings

