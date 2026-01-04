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

Added automatic token cleanup when `invalid_grant` errors are detected:

### Changes Made (server/index.js)

1. **Current Results Endpoint** (`/api/current-results`)
   - Wraps the API call in a try-catch
   - Detects `invalid_grant` errors
   - Automatically deletes the stored token
   - Returns 401 with `requiresOAuth: true` to prompt re-authentication

2. **Strategy Sheet Endpoint** (`/api/strategy-sheet`)
   - Same pattern as above

3. **Sheet Names Endpoint** (`/api/sheets`)
   - Same pattern as above

4. **Access Token Endpoint** (`/api/google-sheets/oauth/access-token`)
   - Used by Google Picker
   - Returns `requiresReauth: true` on invalid token

### How It Works

```javascript
try {
  const data = await getCurrentResultsSheet(userClient, fileId);
  return res.json({ success: true, ...data });
} catch (sheetError) {
  // Check if it's an invalid_grant error (token revoked/expired)
  if (sheetError.message && sheetError.message.includes('invalid_grant')) {
    console.log(`🔄 Detected invalid_grant for ${email}, clearing stored token`);
    deleteRefreshToken(email);
    return res.status(401).json({
      success: false,
      requiresOAuth: true,
      authUrl: buildSheetsConnectUrl(req, email),
      error: 'Your Google authentication has expired. Please reconnect your account.',
    });
  }
  throw sheetError; // Re-throw other errors
}
```

## How to Fix Production Now

1. **Code is already deployed** - Push was made to `fix/devLabel` branch
2. **Railway will auto-deploy** if connected to this branch
3. **User experience**: 
   - When you visit risklo.io now, you'll see: "Your Google authentication has expired. Please reconnect your account."
   - Click to reconnect with Google
   - Complete the OAuth flow
   - New valid token will be stored

## Prevention

This fix makes the system **self-healing**:
- No more manual token cleanup needed
- Users are automatically prompted to re-authenticate
- The app gracefully handles token expiration/revocation

## Testing

### Dev (localhost)
✅ Already tested - OAuth flow works correctly

### Production (risklo.io)
After Railway deploys:
1. Visit https://risklo.io
2. Sign in with Google
3. Should see prompt to reconnect
4. Complete OAuth flow
5. App should work normally

## Related Files

- `server/index.js` - Main server file with OAuth endpoints
- `server/services/googleSheetsUserOAuth.js` - Token storage/management
- `client/src/config.js` - API configuration (fixed port issue for dev)

## Commit

```
Fix: Auto-clear invalid OAuth tokens on invalid_grant error

- Added automatic token cleanup when Google returns invalid_grant error
- This happens when tokens expire or are revoked
- Now gracefully prompts users to reconnect instead of showing 500 errors
- Applied to all OAuth-protected endpoints
```

Branch: `fix/devLabel`
Commit: bb7360b

