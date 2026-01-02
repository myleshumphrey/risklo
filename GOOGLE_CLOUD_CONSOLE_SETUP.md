# Google Cloud Console Setup Checklist

## ✅ Final Configuration for OAuth Verification

### 1. OAuth Consent Screen
Navigate to: **Google Cloud Console → APIs & Services → OAuth consent screen**

#### App Information
- **App name**: RiskLo
- **User support email**: myles2595@gmail.com
- **App logo**: Upload `RiskLo_LogoOnly.png`
- **App domain**:
  - Homepage: `https://risklo.io`
  - Privacy Policy: `https://risklo.io/privacy-policy.html`
  - Terms of Service: `https://risklo.io/terms-and-conditions.html`
- **Developer contact**: myles2595@gmail.com

#### Scopes
Add these **exact** scopes (in this order):
1. `openid`
2. `https://www.googleapis.com/auth/userinfo.profile`
3. `https://www.googleapis.com/auth/userinfo.email`
4. `https://www.googleapis.com/auth/drive.file`
5. `https://www.googleapis.com/auth/spreadsheets.readonly`

**⚠️ IMPORTANT**: Do NOT remove any previously approved scopes!

#### Test Users (if still in Testing mode)
- `myles2595@gmail.com`
- Add any other testers

---

### 2. Credentials
Navigate to: **APIs & Services → Credentials**

#### OAuth 2.0 Client ID
**Authorized JavaScript origins**:
- `http://localhost:3000` (local dev)
- `https://risklo.io` (production)

**Authorized redirect URIs**:
- `http://localhost:5001/api/google-sheets/oauth/callback` (local backend)
- `https://risklo-production.up.railway.app/api/google-sheets/oauth/callback` (production backend)

---

### 3. Enabled APIs
Navigate to: **APIs & Services → Library**

Ensure these are **enabled**:
- ✅ Google Drive API
- ✅ Google Sheets API
- ✅ Google Picker API (auto-enabled with Drive API)

---

### 4. Domain Verification
Navigate to: **Google Search Console** (separate from Cloud Console)

Verify ownership of:
- ✅ `risklo.io`

**How to verify**:
1. Go to https://search.google.com/search-console
2. Add property: `https://risklo.io`
3. Choose verification method (HTML tag recommended)
4. Add meta tag to your site's `<head>` or upload HTML file
5. Click "Verify"

---

### 5. Branding Verification (Optional but Recommended)
Navigate to: **Google Cloud Console → OAuth consent screen → Brand verification**

Upload:
- Logo: `RiskLo_LogoOnly.png`
- Banner: (optional)

This removes the "unverified app" warning for users.

---

## 📋 Pre-Submission Checklist

Before submitting verification request, ensure:

- [ ] Privacy Policy page is live at `https://risklo.io/privacy-policy.html`
- [ ] Terms & Conditions page is live at `https://risklo.io/terms-and-conditions.html`
- [ ] Homepage clearly describes what data RiskLo accesses and why
- [ ] OAuth consent screen shows correct scopes (including drive.file + spreadsheets.readonly)
- [ ] Test user flow works end-to-end on production
- [ ] All links on OAuth consent screen are valid and publicly accessible
- [ ] Domain ownership is verified in Google Search Console

---

## 🚀 Submitting for Verification

1. **Navigate to**: APIs & Services → OAuth consent screen
2. Click **"Publish App"** button
3. Click **"Prepare for verification"**
4. Fill out the verification form:
   - Select scopes requiring verification: `spreadsheets.readonly`
   - Provide justification (use text from `GOOGLE_VERIFICATION_RESPONSE.md`)
5. Submit

**Expected Timeline**:
- Initial review: 3-5 business days
- Follow-up questions: 1-2 weeks
- Total time: 2-6 weeks (average)

---

## ⚠️ Common Rejection Reasons (How We've Addressed Them)

| Rejection Reason | How RiskLo Addresses It |
|-----------------|------------------------|
| "Use narrower scopes" | Tested drive.file alone; doesn't work with Sheets API. Documented in response. |
| "Privacy Policy incomplete" | Includes data access, storage, sharing, retention, and user rights. |
| "Unclear use case" | Clear explanation: trading risk analysis from shared education provider spreadsheet. |
| "Domain not verified" | Verified via Google Search Console. |
| "Branding issues" | Logo uploaded, app name is trademarked (RiskLo). |

---

## 📧 Response to Google's Email

When you receive the verification email, reply with the content from:
**`GOOGLE_VERIFICATION_RESPONSE.md`**

Copy/paste the "Email Body" section directly into your reply.

---

## 🔒 Security Notes for Verification

Google may ask about:

**Q: Why do you need spreadsheets.readonly?**
A: The Google Sheets API requires this scope to read cell data. We tested drive.file alone and it returns 404 errors.

**Q: Can users control what data you access?**
A: Yes, users select the specific spreadsheet via Google Picker. Only users with existing view access (Vector members) can connect.

**Q: Do you store spreadsheet data?**
A: No, all analysis is real-time. We only store the file ID and user's refresh token (encrypted).

**Q: How do you protect user data?**
A: OAuth tokens are encrypted at rest, stored on Railway persistent volume, and tied to user sessions. No cross-user data access.

---

## 📞 Support Resources

If verification is delayed or rejected:
- Google Workspace Developer Support: https://developers.google.com/workspace/support
- Stack Overflow: https://stackoverflow.com/questions/tagged/google-oauth
- Cloud Support (paid plans): https://cloud.google.com/support

