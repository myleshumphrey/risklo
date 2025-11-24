# Deployment Guide for RiskLo

This guide will help you deploy both the frontend (Netlify) and backend (Railway/Render) for RiskLo.

## Frontend Deployment (Netlify) ✅ Already Done

Your frontend is already deployed on Netlify at `risklo.io`.

## Backend Deployment

You need to deploy the backend server to a service that can run Node.js. Here are two recommended options:

### Option 1: Railway (Recommended - Easiest)

1. **Sign up/Login**: Go to [railway.app](https://railway.app) and sign up with GitHub
2. **Create New Project**: Click "New Project" → "Deploy from GitHub repo"
3. **Select Repository**: Choose your `risklo` repository
4. **Configure Service**:
   - Railway will detect it's a Node.js project
   - Set the **Root Directory** to `server`
   - Set the **Start Command** to `npm start`
5. **Set Environment Variables**:
   - Go to the service → Variables tab
   - Add these variables:
     ```
     PORT=5000
     GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
     FRONTEND_URL=https://risklo.io
     ```
6. **Upload Credentials**:
   - Go to the service → Settings → "Add Variable"
   - Create a variable named `GOOGLE_CREDENTIALS` (or similar)
   - Copy the entire contents of your `server/credentials.json` file
   - Paste it as the value (Railway will handle it as a secret)
   - Update your code to read from environment variable instead of file (see below)
7. **Deploy**: Railway will automatically deploy
8. **Get Backend URL**: After deployment, Railway will give you a URL like `https://your-app.railway.app`
9. **Update Netlify Environment Variable**:
   - Go to Netlify → Site settings → Environment variables
   - Add: `REACT_APP_API_URL` = `https://your-app.railway.app`
   - Redeploy your Netlify site

### Option 2: Render

1. **Sign up/Login**: Go to [render.com](https://render.com) and sign up
2. **Create New Web Service**: Click "New +" → "Web Service"
3. **Connect Repository**: Connect your GitHub repo
4. **Configure**:
   - **Name**: `risklo-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **Set Environment Variables**:
   ```
   PORT=5000
   GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
   FRONTEND_URL=https://risklo.io
   ```
6. **Upload Credentials**: Similar to Railway, you'll need to handle the credentials file
7. **Deploy**: Click "Create Web Service"
8. **Get Backend URL**: Render will give you a URL like `https://risklo-backend.onrender.com`
9. **Update Netlify**: Add `REACT_APP_API_URL` environment variable pointing to your Render URL

## Updating Backend to Use Environment Variable for Credentials

Since most hosting services prefer environment variables over files, update your backend:

### Update `server/index.js`:

Replace the Google Auth initialization:

```javascript
// Instead of:
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

// Use:
let auth;
if (process.env.GOOGLE_CREDENTIALS_JSON) {
  // Use JSON from environment variable
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
  auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
} else {
  // Fallback to file (for local development)
  auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
}
```

Then in your hosting service, add the entire `credentials.json` content as `GOOGLE_CREDENTIALS_JSON` environment variable.

## Quick Setup Checklist

- [ ] Deploy backend to Railway or Render
- [ ] Set environment variables in backend service
- [ ] Get backend URL
- [ ] Add `REACT_APP_API_URL` to Netlify environment variables
- [ ] Redeploy Netlify site
- [ ] Test the connection

## Testing

After deployment, visit `https://risklo.io` and check:
1. The strategies dropdown should populate (no "Failed to connect" error)
2. You should be able to analyze risk successfully

