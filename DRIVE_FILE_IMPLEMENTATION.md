# `drive.file` Scope Implementation - Complete

## ✅ Implementation Summary

Successfully migrated from `spreadsheets.readonly` (restricted scope) to `drive.file` (non-sensitive scope) as recommended by Google.

## Changes Made

### Backend (`server/`)

1. **Updated OAuth Scopes** (`server/services/googleSheetsUserOAuth.js`):
   - Changed from `spreadsheets.readonly` to `drive.file`
   - Added `storeFileId()` and `getFileId()` functions to store selected file ID
   - Added `getAccessTokenForEmail()` for Google Picker API

2. **New API Endpoints** (`server/index.js`):
   - `GET /api/google-sheets/oauth/access-token` - Get access token for Google Picker
   - `POST /api/google-sheets/oauth/file-id` - Store file ID after picker selection
   - `GET /api/google-sheets/oauth/file-id` - Get file ID status

3. **Updated OAuth Callback**:
   - Redirects with `showPicker=true` parameter to trigger file picker

4. **Updated Sheet Access Endpoints**:
   - `/api/sheets` - Now uses stored file ID
   - `/api/current-results` - Now uses stored file ID
   - `/api/strategy-sheet` - Now uses stored file ID
   - `/api/analyze` - Now uses stored file ID

### Frontend (`client/src/`)

1. **New Component** (`client/src/components/GooglePicker.js`):
   - Loads Google Picker API
   - Pre-selects Vector Results Spreadsheet using `setFileIds()`
   - Handles file selection and stores file ID

2. **Updated App.js**:
   - Detects `showPicker=true` URL parameter after OAuth
   - Shows Google Picker overlay
   - Handles file selection and refreshes strategies

3. **Updated Config** (`client/src/config.js`):
   - Added new API endpoints for picker and file ID management

## How It Works

1. **User Signs In**: OAuth flow requests `drive.file` scope (non-sensitive)
2. **OAuth Callback**: Redirects to frontend with `showPicker=true`
3. **Google Picker**: Automatically shows with Vector Results Spreadsheet pre-selected
4. **File Selection**: User confirms selection (file is already pre-selected)
5. **File ID Stored**: Backend stores the file ID for future API calls
6. **Sheet Access**: All subsequent API calls use the stored file ID

## Benefits

- ✅ **No Verification Required** - `drive.file` is non-sensitive
- ✅ **No CASA Assessment** - No annual security recertification
- ✅ **Better UX** - File is pre-selected, user just confirms
- ✅ **More Secure** - Users explicitly grant access to specific file
- ✅ **No Checkbox Issue** - Permissions are automatic after file selection

## Next Steps

1. **Reply to Google**: Send "Confirming narrower scopes" email
2. **Update Google Cloud Console**: Add `drive.file` scope to OAuth consent screen
3. **Test**: Verify the picker appears and file selection works
4. **Remove Old Scope**: After confirming `drive.file` works, remove `spreadsheets.readonly` from codebase

## Testing

1. Sign in with Google
2. OAuth should complete and redirect with `showPicker=true`
3. Google Picker should appear with Vector Results Spreadsheet pre-selected
4. Confirm selection
5. Strategies should load automatically
6. All sheet access should work normally

## Environment Variables

No new environment variables needed. The spreadsheet ID is hardcoded in:
- Backend: `RESULTS_SPREADSHEET_ID` (from env or default)
- Frontend: `RESULTS_SPREADSHEET_ID` constant in `App.js`

## Notes

- The file ID is stored per-user in `google_oauth_tokens.json`
- If a user doesn't have a file ID stored, they'll be prompted to select the file
- The picker uses Google's `setFileIds()` method (introduced Jan 2025) to pre-select the file

