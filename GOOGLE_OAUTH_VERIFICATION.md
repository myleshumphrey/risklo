# Google OAuth Verification Guide for RiskLo

## What I've Added

✅ **Privacy Policy** - Comprehensive privacy policy at `/privacy-policy`  
✅ **Updated Terms & Conditions** - Added contact information  
✅ **Footer Links** - Privacy Policy and Terms & Conditions linked in footer  
✅ **Hamburger Menu** - Privacy Policy added to navigation  

---

## Information for Google OAuth Verification

### 1. Application Information

**Application Name:** RiskLo  
**Homepage URL:** https://risklo.io  
**Privacy Policy URL:** https://risklo.io?page=privacy-policy  
**Terms of Service URL:** https://risklo.io?page=terms-and-conditions  

### 2. OAuth Scopes Requested

- `https://www.googleapis.com/auth/userinfo.email` - User's email address
- `https://www.googleapis.com/auth/userinfo.profile` - User's basic profile info (name, picture)
- `https://www.googleapis.com/auth/spreadsheets.readonly` - Read-only access to Google Sheets

### 3. Why We Need These Scopes

**Email & Profile:**
- To authenticate users and create accounts
- To send risk analysis results via email
- To display user information in the app

**Google Sheets (Read-Only):**
- To access Vector Algorithmics strategy performance data
- Users explicitly authorize which sheets we can access
- We only read strategy historical performance data (losses, profits, drawdowns)
- We never write to or modify any Google Sheets
- We never access other Google Drive files

### 4. Data Usage & Retention

**What we collect:**
- Google account info (email, name, profile picture)
- Trading parameters users input (account size, contracts, drawdowns)
- Strategy performance data from authorized Google Sheets (read-only)

**How we use it:**
- Calculate risk metrics and probabilities
- Send email notifications with analysis results
- Improve our risk assessment algorithms

**How long we keep it:**
- Active user data: Retained while account is active
- OAuth tokens: Encrypted and stored until user disconnects or deletes account
- Analysis history: Retained for service improvement, deleted upon account deletion

**We do NOT:**
- Sell or share user data with third parties
- Access Google Sheets without explicit user authorization
- Store credit card information (handled by Stripe)

### 5. Contact Information

**Developer Email:** myles2595@gmail.com  
**Support Email:** myles2595@gmail.com  
**Website:** https://risklo.io  

---

## Steps to Submit for Verification

### 0. Verify Domain Ownership (REQUIRED FIRST)

Before submitting for OAuth verification, you **must** verify you own `risklo.io`:

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click **"Add Property"**
3. Enter: `risklo.io`
4. Choose verification method:
   
   **Option A: DNS Verification (Recommended)**
   - Google will give you a TXT record
   - Log in to GoDaddy
   - Go to DNS settings for risklo.io
   - Add the TXT record Google provides
   - Wait a few minutes, then click "Verify" in Search Console
   
   **Option B: HTML File Upload**
   - Download the verification file from Google
   - Upload it to your Netlify site's `public` folder
   - Deploy to production
   - Click "Verify" in Search Console
   
   **Option C: HTML Meta Tag**
   - Copy the meta tag Google provides
   - Add it to `client/public/index.html` in the `<head>` section
   - Deploy to production
   - Click "Verify" in Search Console

5. Once verified, proceed to OAuth verification below

---

### 1. Go to Google Cloud Console
https://console.cloud.google.com

### 2. Navigate to OAuth Consent Screen
- Select your project
- Go to **APIs & Services** → **OAuth consent screen**

### 3. Fill Out Required Information

**App Information:**
- App name: RiskLo
- User support email: myles2595@gmail.com
- App logo: Upload a 120x120px logo (you'll need to create/upload this)

**App Domain:**
- Application home page: https://risklo.io
- Application privacy policy link: https://risklo.io?page=privacy-policy
- Application terms of service link: https://risklo.io?page=terms-and-conditions

**Authorized Domains:**
- risklo.io
- up.railway.app (if using Railway backend)
- netlify.app (if using Netlify frontend)

**Developer Contact Information:**
- Email: myles2595@gmail.com

### 4. Scopes Configuration
Add these scopes:
- `.../auth/userinfo.email`
- `.../auth/userinfo.profile`
- `.../auth/spreadsheets.readonly`

For each scope, explain:
- **Email/Profile:** "Used for user authentication and to send risk analysis results via email"
- **Sheets (readonly):** "Read-only access to Vector Algorithmics strategy performance data that users explicitly authorize. Used to calculate trading risk metrics."

### 5. Test Users (if still in Testing mode)
Add test users who need access before verification completes:
- myles2595@gmail.com
- cultivateddynamics@gmail.com
- (any other testers)

### 6. Submit for Verification
Click **"Submit for Verification"** or **"Publish App"**

---

## Video Requirement

**Good News:** You likely **won't need a video** because:
- You're only requesting **non-sensitive scopes**
- Email/profile are basic scopes
- Sheets **readonly** is non-sensitive (write access would require video)

**If Google does request a video**, it should show:
1. User signing in with Google
2. User authorizing Google Sheets access
3. App reading strategy data from an authorized sheet
4. Risk calculation being performed
5. Results being displayed

Keep it simple, 2-3 minutes max.

---

## Timeline

- **Non-sensitive scopes:** Usually approved within 1-2 weeks
- **Sensitive scopes:** Can take 4-6 weeks and may require video

---

## After Verification

Once approved:
- The warning screen will be removed
- All Google users can sign in without "Advanced" → "Continue" steps
- Your app will show "Verified by Google" badge

---

## Temporary Solution (Until Verified)

Users can still use your app by:
1. Click **"Advanced"** on the warning screen
2. Click **"Go to risklo-production.up.railway.app (unsafe)"**
3. Proceed with sign-in

This is completely safe - Google just hasn't reviewed your app yet.

---

## Notes

- Make sure your Privacy Policy and Terms & Conditions pages are publicly accessible (no login required)
- Keep your contact email responsive - Google may reach out with questions
- If verification is denied, they'll provide specific reasons and you can resubmit after addressing them

