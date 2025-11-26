# Production Deployment Checklist for RiskLo

## Overview
This guide covers everything you need to update to deploy RiskLo to production (risklo.io).

---

## 1. Railway (Backend) Environment Variables

Go to **Railway Dashboard → Your Backend Service → Variables** and set/verify:

### Required Variables:

1. **`FRONTEND_URL`**
   - **Value:** `https://risklo.io`
   - **Purpose:** Allows CORS requests from your production domain

2. **`APP_BASE_URL`**
   - **Value:** `https://risklo.io`
   - **Purpose:** Used for Stripe Checkout redirect URLs

3. **`STRIPE_SECRET_KEY`** ⚠️ **IMPORTANT: Switch to LIVE key**
   - **Value:** `sk_live_...` (your Stripe LIVE secret key)
   - **Purpose:** Stripe API authentication
   - **Note:** You MUST use the LIVE key (not test key) for production!

4. **`STRIPE_PRICE_RISKLO_PRO`**
   - **Value:** Your Stripe Price ID (e.g., `price_1SXkxtKzZOqIhRTuKereTBwb`)
   - **Purpose:** Identifies which subscription product to charge for
   - **Note:** If you created the product in test mode, you may need to create it again in live mode and get a new Price ID

5. **`GOOGLE_CREDENTIALS_JSON`**
   - **Value:** Your Google Service Account JSON (should already be set)
   - **Purpose:** Google Sheets API access

### Optional Variables:

6. **`DEV_MODE_PRO_EMAILS`** (Optional - for testers)
   - **Value:** `tester1@example.com,tester2@example.com`
   - **Purpose:** Grant Pro access to specific emails without Stripe payment
   - **Note:** You can keep this for beta testers or remove it entirely

7. **`PORT`**
   - **Value:** Usually auto-set by Railway (e.g., `8080` or `5000`)
   - **Purpose:** Port the server listens on
   - **Note:** Railway usually sets this automatically

---

## 2. Netlify (Frontend) Environment Variables

Go to **Netlify Dashboard → Your Site → Site Settings → Environment Variables** and set/verify:

### Required Variables:

1. **`REACT_APP_API_URL`**
   - **Value:** Your Railway backend URL (e.g., `https://risklo-production.up.railway.app`)
   - **Purpose:** Frontend needs to know where to send API requests
   - **Note:** Get this from Railway → Your Service → Settings → Networking → Public Domain

2. **`REACT_APP_GOOGLE_CLIENT_ID`**
   - **Value:** Your Google OAuth Client ID (e.g., `906472782182-lramraac6lj5o37r9vckfhad19hll4in.apps.googleusercontent.com`)
   - **Purpose:** Google Sign-In authentication
   - **Note:** Same Client ID works for both test and production

---

## 3. Google Cloud Console Configuration

Go to **Google Cloud Console → APIs & Services → Credentials → Your OAuth Client**

### Authorized JavaScript Origins:
Make sure these are added:
- `https://risklo.io`
- `http://localhost:3000` (for local development)

### Authorized Redirect URIs:
Make sure these are added:
- `https://risklo.io`
- `http://localhost:3000` (for local development)

---

## 4. Stripe Configuration

### Switch to Live Mode:

1. Go to **Stripe Dashboard**
2. Toggle from **"Test mode"** to **"Live mode"** (top right)
3. Get your **Live Secret Key**:
   - Go to **Developers → API keys**
   - Copy the **Secret key** (starts with `sk_live_...`)
   - Add this to Railway as `STRIPE_SECRET_KEY`

### Create Live Product (if needed):

If you created your RiskLo Pro product in test mode, you need to create it again in live mode:

1. Make sure you're in **Live mode**
2. Go to **Products → Add product**
3. Create "RiskLo Pro" with the same settings as test mode
4. Copy the new **Price ID** (starts with `price_...`)
5. Update Railway `STRIPE_PRICE_RISKLO_PRO` with the live Price ID

---

## 5. Deployment Steps

### Backend (Railway):

1. **Verify all environment variables are set** (see section 1)
2. **Push your latest code to GitHub** (if using GitHub integration)
3. Railway will automatically deploy when you push
4. **Or manually trigger deploy** from Railway dashboard
5. **Check logs** to ensure server starts successfully

### Frontend (Netlify):

1. **Verify all environment variables are set** (see section 2)
2. **Push your latest code to GitHub** (main branch)
3. Netlify will automatically build and deploy
4. **Or manually trigger deploy** from Netlify dashboard
5. **Check build logs** to ensure build succeeds

---

## 6. Post-Deployment Verification

### Test These Features:

1. **Google Sign-In:**
   - Visit https://risklo.io
   - Click "Sign in with Google"
   - Should redirect to Google and back successfully

2. **Pro Status Check:**
   - Sign in with a dev mode email (if configured)
   - Should see "Pro (Dev)" badge
   - Sign in with a regular email
   - Should see "Basic" badge

3. **Stripe Checkout:**
   - Click "Upgrade to RiskLo Pro"
   - Should redirect to Stripe Checkout
   - Use a test card: `4242 4242 4242 4242`
   - Complete checkout
   - Should redirect back and show Pro status

4. **API Endpoints:**
   - Test that strategies load from Google Sheets
   - Test risk analysis calculations
   - Test bulk calculator (if Pro)

---

## 7. Common Issues & Solutions

### Issue: "Cannot connect to backend"
- **Solution:** Check `REACT_APP_API_URL` in Netlify matches Railway public domain
- **Solution:** Verify Railway service is running and accessible

### Issue: "OAuth client not found"
- **Solution:** Check `REACT_APP_GOOGLE_CLIENT_ID` in Netlify
- **Solution:** Verify authorized origins include `https://risklo.io` in Google Cloud Console

### Issue: "Stripe checkout fails"
- **Solution:** Verify `STRIPE_SECRET_KEY` is LIVE key (not test key)
- **Solution:** Verify `STRIPE_PRICE_RISKLO_PRO` is from LIVE mode product
- **Solution:** Check `APP_BASE_URL` is set to `https://risklo.io`

### Issue: "CORS errors"
- **Solution:** Verify `FRONTEND_URL` in Railway is set to `https://risklo.io`
- **Solution:** Check Railway networking settings allow public access

### Issue: "Google Sheets not loading"
- **Solution:** Verify `GOOGLE_CREDENTIALS_JSON` is set in Railway
- **Solution:** Check that the service account email has access to the Google Sheet

---

## 8. Environment Variable Summary

### Railway Variables:
```bash
FRONTEND_URL=https://risklo.io
APP_BASE_URL=https://risklo.io
STRIPE_SECRET_KEY=sk_live_... (LIVE KEY!)
STRIPE_PRICE_RISKLO_PRO=price_... (LIVE Price ID)
GOOGLE_CREDENTIALS_JSON={...your JSON...}
DEV_MODE_PRO_EMAILS=email1@example.com,email2@example.com (optional)
```

### Netlify Variables:
```bash
REACT_APP_API_URL=https://your-railway-app.up.railway.app
REACT_APP_GOOGLE_CLIENT_ID=906472782182-...your-client-id...
```

---

## 9. Quick Checklist

- [ ] Railway: `FRONTEND_URL` = `https://risklo.io`
- [ ] Railway: `APP_BASE_URL` = `https://risklo.io`
- [ ] Railway: `STRIPE_SECRET_KEY` = LIVE key (`sk_live_...`)
- [ ] Railway: `STRIPE_PRICE_RISKLO_PRO` = LIVE Price ID
- [ ] Railway: `GOOGLE_CREDENTIALS_JSON` = Set
- [ ] Netlify: `REACT_APP_API_URL` = Railway backend URL
- [ ] Netlify: `REACT_APP_GOOGLE_CLIENT_ID` = Set
- [ ] Google Cloud: Authorized origins include `https://risklo.io`
- [ ] Google Cloud: Authorized redirect URIs include `https://risklo.io`
- [ ] Stripe: Created product in LIVE mode
- [ ] Stripe: Got LIVE secret key
- [ ] Both services deployed successfully
- [ ] Tested sign-in flow
- [ ] Tested Pro upgrade flow

---

## 10. Security Notes

- ✅ Never commit `.env` files to Git
- ✅ Use LIVE Stripe keys only in production
- ✅ Keep test keys separate from production
- ✅ Regularly rotate API keys
- ✅ Monitor Stripe dashboard for suspicious activity
- ✅ Review Railway logs for errors

---

## Need Help?

If you encounter issues:
1. Check Railway logs: Railway → Your Service → Deployments → View Logs
2. Check Netlify logs: Netlify → Your Site → Deploys → View Logs
3. Check browser console: F12 → Console tab
4. Verify all environment variables are set correctly
5. Test API endpoints directly: `curl https://your-railway-url/api/health`

