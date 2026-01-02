# OAuth Migration Complete - Final Summary

## ✅ What We Accomplished

### 1. **Switched from Service Account to User OAuth**
- **Before**: Hardcoded service account credentials with access to a copy of the Vector spreadsheet
- **After**: Each user authenticates with their own Google account and connects to the **live** Vector Results Spreadsheet

### 2. **Implemented Google Picker API**
- Users explicitly select the spreadsheet they want to grant access to
- Uses `setFileIds()` method to pre-navigate to the Results Spreadsheet
- Provides clear user visibility and control

### 3. **Tested Scope Requirements**
- ❌ Tested `drive.file` only → Failed (404 from Sheets API)
- ✅ Using `drive.file` + `spreadsheets.readonly` → Works correctly

### 4. **Per-User Token Storage**
- Tokens encrypted at rest using `TOKEN_ENCRYPTION_KEY`
- Stored in Railway persistent volume (`/data`)
- Tied to user's email address
- Automatically refreshed when expired

---

## 🎯 Current Implementation

### Frontend Flow:
1. User signs in with Google → Gets profile info (email, name, picture)
2. User navigates to Results tab → Backend checks for OAuth token
3. If no token → Shows "Connect Google to View" button
4. User clicks → Redirects to Google OAuth consent
5. User grants permissions → Google Picker automatically appears
6. User selects Results Spreadsheet → File ID stored
7. Strategies load from the selected spreadsheet

### Backend Architecture:
```
┌─────────────────┐
│   User Signs    │
│   In (Google)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│  OAuth Callback │────▶│  Store Refresh   │
│   (Backend)     │     │  Token (Encrypted)│
└────────┬────────┘     └──────────────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│  Google Picker  │────▶│   Store File ID  │
│   (Frontend)    │     │   (Per User)     │
└────────┬────────┘     └──────────────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│  Load Strategies│◀────│  Use User's      │
│  (Sheets API)   │     │  OAuth Client    │
└─────────────────┘     └──────────────────┘
```

### Key Files:
- **Backend OAuth Logic**: `server/services/googleSheetsUserOAuth.js`
- **Backend API**: `server/index.js` (OAuth endpoints + Sheets access)
- **Frontend Picker**: `client/src/components/GooglePicker.js`
- **Frontend Config**: `client/src/config.js`
- **Token Storage**: `server/data/google_oauth_tokens.json` (or `/data/` in production)

---

## 📝 Scopes Explained

| Scope | Purpose | Sensitive? | Verification Required? |
|-------|---------|-----------|----------------------|
| `openid` | User sign-in | No | No |
| `userinfo.profile` | User name/picture | No | No |
| `userinfo.email` | User email | No | No |
| `drive.file` | Picker visibility | No | No |
| `spreadsheets.readonly` | Read sheet content | **Yes** | **Yes** |

**Why we need `spreadsheets.readonly`**:
- The Sheets API requires this scope to read cell data
- `drive.file` alone returns 404 errors when calling `spreadsheets.get()` or `spreadsheets.values.get()`
- This is a Google API limitation, not a developer choice
- We tested the narrower scope and documented the technical limitation for Google's verification team

---

## 🔐 Security & Privacy

### What RiskLo Can Access:
- ✅ User's profile info (name, email, picture)
- ✅ The specific spreadsheet the user selects via Picker
- ✅ All spreadsheets (due to `spreadsheets.readonly` scope requirement)

### What RiskLo Actually Accesses:
- ✅ Only the file ID stored for the user
- ✅ Only the Vector Results Spreadsheet (1rqGGpl5SJ_34L72yCCcSZIoUrD_ggGn5LfJ_BGFjDQY)
- ❌ We do NOT list, access, or store data from other spreadsheets

### Data Storage:
- **OAuth Tokens**: Encrypted, stored in `/data/google_oauth_tokens.json`
- **File ID**: Stored per user in the same JSON file
- **Spreadsheet Data**: NOT stored; fetched in real-time for each analysis

### User Control:
- Users can revoke access at any time: https://myaccount.google.com/permissions
- Revoking access removes RiskLo's ability to read any spreadsheets
- Users must have existing view access to the Vector spreadsheet (shared with Vector members)

---

## 📋 Google Verification To-Do

### 1. Update Google Cloud Console
Follow: `GOOGLE_CLOUD_CONSOLE_SETUP.md`

Key items:
- [ ] Add all 5 scopes to OAuth consent screen
- [ ] Verify domain ownership (risklo.io)
- [ ] Upload app logo
- [ ] Ensure Privacy Policy and Terms are live
- [ ] Add production redirect URI

### 2. Deploy to Production
Follow: `RAILWAY_PRODUCTION_SETUP.md`

Key items:
- [ ] Set all environment variables in Railway
- [ ] Attach persistent volume at `/data`
- [ ] Test end-to-end OAuth flow on production
- [ ] Verify tokens persist across deploys

### 3. Submit Verification Request
Use: `GOOGLE_VERIFICATION_RESPONSE.md`

Timeline:
- Submit verification request in Google Cloud Console
- Reply to Google's email with the prepared response
- Expected review time: 2-6 weeks
- May require follow-up questions/documentation

### 4. While Waiting for Verification
- App works in "Testing" mode
- Add test users to OAuth consent screen
- All Vector members can test by being added as test users
- Consider soft-launching to gather feedback

---

## 🚀 Production Checklist

Before going live:

### Backend (Railway)
- [ ] All environment variables set
- [ ] Persistent volume attached and mounted
- [ ] OAuth redirect URI matches Google Cloud Console
- [ ] Live Stripe keys configured
- [ ] SendGrid API key valid
- [ ] `RESULTS_SPREADSHEET_ID` is correct live sheet

### Frontend (Netlify)
- [ ] `REACT_APP_API_URL` points to Railway backend
- [ ] `REACT_APP_GOOGLE_CLIENT_ID` matches Google Cloud Console
- [ ] Privacy Policy page is live
- [ ] Terms & Conditions page is live
- [ ] All links work (no 404s)

### Google Cloud Console
- [ ] OAuth consent screen published (or test users added)
- [ ] All 5 scopes added
- [ ] Domain verified
- [ ] Logo uploaded
- [ ] Production redirect URI added
- [ ] Google Sheets API enabled
- [ ] Google Drive API enabled

### Testing
- [ ] Sign in with Google works
- [ ] OAuth consent shows correct permissions
- [ ] Google Picker appears and works
- [ ] Strategies load from live Vector spreadsheet
- [ ] Risk analysis calculations work
- [ ] Results dashboard displays correctly
- [ ] Tokens persist across server restarts

---

## 🎉 You're All Set!

### Local Development:
```bash
# Start backend
cd server
npm start

# Start frontend (separate terminal)
cd client
npm start

# Access at http://localhost:3000
```

### Production:
- Frontend: https://risklo.io
- Backend: https://risklo-production.up.railway.app

### Documentation:
- Google verification response: `GOOGLE_VERIFICATION_RESPONSE.md`
- Cloud Console setup: `GOOGLE_CLOUD_CONSOLE_SETUP.md`
- Railway setup: `RAILWAY_PRODUCTION_SETUP.md`

---

## 📞 Support

If you encounter issues:
1. Check server logs: `tail -f /tmp/risklo-server.log` (local)
2. Check Railway logs: Railway Dashboard → Deployments → View Logs
3. Check browser console: F12 → Console tab
4. Review this documentation

Common issues:
- **404 on Sheets API**: User needs to re-authenticate with correct scopes
- **Tokens lost**: Railway volume not attached or `RISKLO_DATA_DIR` not set
- **Redirect mismatch**: Check `GOOGLE_OAUTH_REDIRECT_URI` matches Cloud Console exactly
- **Access blocked**: OAuth in Testing mode, need to add test users or publish

---

**Good luck with the Google verification process! 🚀**

