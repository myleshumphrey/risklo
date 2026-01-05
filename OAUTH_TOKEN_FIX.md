# OAuth Token Invalid Grant Fix

## Problem

Production (Railway) was showing `invalid_grant` errors when trying to access Google Sheets API. This happened because:

1. The stored refresh token on Railway became invalid
2. This occurs when:
   - You revoke access to the app in your Google account settings
   - OAuth credentials are changed in Google Cloud Console
   - The token expires or becomes corrupted
   - You re-authorized with different scopes

## Error Logs

```
GaxiosError: invalid_grant
  at OAuth2Client.refreshTokenNoCache
  status: 400
```

The backend was trying to use an expired/revoked refresh token, causing all API calls to fail.

## Solution

### Part 1: Auto-clear invalid tokens
Added automatic token cleanup when `invalid_grant` errors are detected in `server/index.js`.

### Part 2: Fix reconnection flow
The OAuth flow was missing `prompt: 'consent'`, causing Google to NOT return a refresh token on subsequent authorizations. This caused:

```
OAuth callback error: Error: No refresh token received. 
Try again with prompt=consent and ensure you are not reusing 
an already-consented app without revoking.
```

**Fixed in `server/services/googleSheetsUserOAuth.js`:**

```javascript
const url = oauth2.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent', // Force consent screen to always get refresh token
  scope: scopes,
  state,
});
```

## Changes Made

### 1. Auto-clear Invalid Tokens (server/index.js)

Added try-catch blocks to all OAuth-protected endpoints:

- `/api/current-results`
- `/api/strategy-sheet`
- `/api/sheets`
- `/api/google-sheets/oauth/access-token`

Each endpoint now:
1. Detects `invalid_grant` errors
2. Automatically deletes the stored token
3. Returns 401 with `requiresOAuth: true` to prompt re-authentication

### 2. Force Consent Screen (server/services/googleSheetsUserOAuth.js)

Added `prompt: 'consent'` to the OAuth URL generation to ensure Google ALWAYS returns a refresh token, even on subsequent authorizations.

## How to Fix Production Now

1. **Code is already deployed** - Both fixes pushed to `fix/devLabel` branch
2. **Railway will auto-deploy** if connected to this branch
3. **User experience**: 
   - Visit risklo.io
   - You'll see: "Vector Algorithmics strategies are available to members only. Sign in with Google to continue"
   - Click "Connect Google"
   - **You'll now see the Google consent screen** (this is expected and required)
   - Approve permissions
   - Complete the file picker selection
   - App should work normally

## Why You Need to Approve Again

With `prompt: 'consent'`, you'll always see the Google approval screen when connecting. This is necessary because:
- Google doesn't return refresh tokens on subsequent auth flows without it
- The refresh token is required for the backend to access sheets on your behalf
- This is a one-time setup per account

## Prevention

This fix makes the system **self-healing**:
- Invalid tokens are automatically detected and cleared
- Users are prompted to re-authenticate with proper consent
- Refresh tokens are guaranteed to be returned and stored
- The app gracefully handles token expiration/revocation

## Testing

### Dev (localhost)
✅ Already tested - OAuth flow works correctly

### Production (risklo.io)
After Railway deploys:
1. Visit https://risklo.io
2. Sign in with Google → See "Connect to Google Sheets"
3. Click connect → See Google consent screen
4. Approve permissions
5. Select file in picker
6. App should work normally

## Related Files

- `server/index.js` - Auto-clear invalid tokens
- `server/services/googleSheetsUserOAuth.js` - Force consent screen
- `client/src/config.js` - API configuration (fixed port issue for dev)

## Commits

### Commit 1: Auto-clear invalid tokens
```
Fix: Auto-clear invalid OAuth tokens on invalid_grant error

- Added automatic token cleanup when Google returns invalid_grant error
- This happens when tokens expire or are revoked
- Now gracefully prompts users to reconnect instead of showing 500 errors
- Applied to all OAuth-protected endpoints
```

### Commit 2: Force consent screen
```
Fix: Add prompt=consent to OAuth flow to ensure refresh token

- Google doesn't return refresh token on subsequent OAuth flows without prompt=consent
- This was causing 'No refresh token received' errors on reconnection
- Now forces consent screen every time to guarantee refresh token is returned
- Fixes production reconnection issue after token expiration
```

Branch: `fix/devLabel`
Commits: bb7360b, 9b7b825

