# Railway Environment Variables for Production

## Required Variables

Copy these to Railway → Your Project → Variables:

```bash
# Google OAuth (User-based Sheets Access)
GOOGLE_OAUTH_CLIENT_ID=906472782182-lramraac6lj5o37r9vckfhad19hll4in.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=<your-secret-from-google-cloud-console>
GOOGLE_OAUTH_REDIRECT_URI=https://risklo-production.up.railway.app/api/google-sheets/oauth/callback

# OAuth Security
TOKEN_ENCRYPTION_KEY=<32-byte-base64-key>  # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
OAUTH_STATE_SECRET=<random-string>  # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Google Sheets Configuration
RESULTS_SPREADSHEET_ID=1rqGGpl5SJ_34L72yCCcSZIoUrD_ggGn5LfJ_BGFjDQY
USE_USER_SHEETS_OAUTH=true

# Persistent Storage (IMPORTANT!)
RISKLO_DATA_DIR=/data

# Frontend URL
FRONTEND_URL=https://risklo.io

# Stripe (Production Keys)
STRIPE_SECRET_KEY=sk_live_...  # Your live Stripe secret key
STRIPE_PRICE_RISKLO_PRO=price_...  # Your live Stripe price ID

# Email (SendGrid)
EMAIL_FROM=noreply@risklo.io
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<your-sendgrid-api-key>

# Dev Mode (optional - for testing Pro features)
DEV_MODE_PRO_EMAILS=myles2595@gmail.com

# App Base URL (for Stripe redirects)
APP_BASE_URL=https://risklo.io
```

---

## Railway Volume Setup (CRITICAL!)

OAuth tokens need persistent storage or they'll be lost on every deploy.

### Steps:

1. **Railway Dashboard** → Your Project → **Settings**
2. Click **"+ New Volume"**
3. **Mount Path**: `/data`
4. **Size**: 1GB (minimum)
5. Click **"Add"**

This ensures `RISKLO_DATA_DIR=/data` persists across deploys, keeping your OAuth tokens safe.

---

## Generating Secrets

Run these commands locally to generate secure random values:

```bash
# Token Encryption Key (32 bytes, base64)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# OAuth State Secret (random hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Verification Checklist

After setting variables in Railway:

- [ ] All environment variables are set
- [ ] Railway volume is mounted at `/data`
- [ ] `GOOGLE_OAUTH_REDIRECT_URI` matches what's in Google Cloud Console
- [ ] `FRONTEND_URL` is set to `https://risklo.io`
- [ ] Stripe keys are **LIVE** (not test) keys
- [ ] SendGrid API key is valid
- [ ] `RESULTS_SPREADSHEET_ID` is the correct live sheet ID

---

## Testing Production OAuth

1. Deploy to Railway (with volume attached)
2. Go to `https://risklo.io`
3. Sign in with Google
4. Click "Connect Google to View" on Results tab
5. Select the Vector Results Spreadsheet
6. Verify strategies load correctly

If tokens are lost after deploy, check:
- Railway volume is attached
- `RISKLO_DATA_DIR=/data` is set
- Volume mount path is `/data` (not `/app/data`)

---

## Troubleshooting

### "redirect_uri_mismatch"
- Ensure `GOOGLE_OAUTH_REDIRECT_URI` in Railway exactly matches what's in Google Cloud Console
- Check for http vs https
- Check for trailing slashes

### "Spreadsheet not found" (404)
- Ensure user's Google account has view access to the spreadsheet
- Verify `RESULTS_SPREADSHEET_ID` is correct
- Check that Google Sheets API is enabled in Cloud Console

### Tokens lost after deploy
- Railway volume must be attached and mounted at `/data`
- `RISKLO_DATA_DIR=/data` must be set
- Check Railway logs for volume mount confirmation

### "Access blocked: This app is blocked"
- OAuth consent screen is still in "Testing" mode
- Add test user emails OR publish the app (after verification)

---

## Next Steps

1. ✅ Set all environment variables in Railway
2. ✅ Attach persistent volume at `/data`
3. ✅ Deploy and test production OAuth flow
4. ✅ Update Google Cloud Console with production redirect URI
5. ✅ Submit verification request using `GOOGLE_VERIFICATION_RESPONSE.md`

