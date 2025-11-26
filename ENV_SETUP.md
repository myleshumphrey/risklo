# Environment Variables Setup

## Backend (Railway/Render)

Add these environment variables to your backend deployment:

```
STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for testing)
STRIPE_PRICE_RISKLO_PRO=price_... (your Stripe Price ID for RiskLo Pro)
APP_BASE_URL=https://risklo.io (or your production URL)
FRONTEND_URL=https://risklo.io (or your production URL)
GOOGLE_CREDENTIALS_JSON={...} (your Google service account JSON)
```

## Frontend (Netlify)

Add these environment variables in Netlify:

```
REACT_APP_API_URL=https://your-backend-url.railway.app (or your backend URL)
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google Identity Services API"
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (for local dev)
   - `https://risklo.io` (your production domain)
7. Copy the Client ID and add it to `REACT_APP_GOOGLE_CLIENT_ID`

## Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create a Product: "RiskLo Pro"
3. Add a Price (recurring monthly or yearly)
4. Copy the Price ID (starts with `price_...`)
5. Add it to `STRIPE_PRICE_RISKLO_PRO` in backend env vars
6. Copy your Secret Key (starts with `sk_live_...` or `sk_test_...`)
7. Add it to `STRIPE_SECRET_KEY` in backend env vars

## Testing

- Use Stripe test mode keys (`sk_test_...`) for development
- Use test card: `4242 4242 4242 4242` with any future expiry date
- After successful payment, user will be redirected back with `?checkout=success&session_id=...`
- The app will automatically verify and upgrade the user to Pro

