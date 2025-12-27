# Migration to `drive.file` Scope - Implementation Plan

## Overview
Google has recommended switching from `spreadsheets.readonly` (restricted scope) to `drive.file` (non-sensitive scope) to avoid verification requirements and CASA security assessments.

## Benefits of `drive.file` Scope
- ✅ **Non-sensitive** - No Google verification required
- ✅ **No CASA assessment** - No annual security recertification needed
- ✅ **Better user control** - Users explicitly select which files to share
- ✅ **Pre-selection support** - Can use `setFileIds()` to pre-select specific spreadsheet

## Implementation Steps

### 1. Update OAuth Scopes
Change from:
- `https://www.googleapis.com/auth/spreadsheets.readonly`

To:
- `https://www.googleapis.com/auth/drive.file`

### 2. Implement Google Picker API
- Add Google Picker API to frontend
- Use `setFileIds()` to pre-select the specific spreadsheet ID (`RESULTS_SPREADSHEET_ID`)
- Show picker on first connection, then store file access permission

### 3. Update Backend
- Change OAuth scope in `googleSheetsUserOAuth.js`
- After file selection via picker, app can use Sheets API to read the file
- Store file ID along with OAuth tokens

### 4. Update Frontend
- Add Google Picker API script loading
- Create file picker component that pre-selects the Vector Results spreadsheet
- Handle file selection callback and trigger OAuth flow

## Technical Details

### Google Picker API Setup
```javascript
// Load Google Picker API
const script = document.createElement('script');
script.src = 'https://apis.google.com/js/api.js';
script.onload = () => {
  gapi.load('picker', initializePicker);
};

// Initialize picker with pre-selected file
function initializePicker() {
  const picker = new google.picker.PickerBuilder()
    .setOAuthToken(accessToken)
    .addView(google.picker.ViewId.SPREADSHEETS)
    .setFileIds([RESULTS_SPREADSHEET_ID]) // Pre-select specific file
    .setCallback(pickerCallback)
    .build();
  picker.setVisible(true);
}
```

### OAuth Flow Changes
1. User clicks "Sign in with Google"
2. OAuth requests `drive.file` scope (not `spreadsheets.readonly`)
3. After OAuth, show Google Picker with pre-selected spreadsheet
4. User confirms file selection
5. App stores file ID and can now access it via Sheets API

## Response to Google

**Option 1: Confirm narrower scopes** (Recommended)
Reply: "Confirming narrower scopes"

Then implement the changes above.

## References
- [Drive API Scopes](https://developers.google.com/workspace/drive/api/guides/api-specific-auth#benefits)
- [Google Picker API](https://developers.google.com/workspace/drive/picker/guides/overview)
- [setFileIds() Method](https://workspaceupdates.googleblog.com/2024/11/new-file-picker-method-for-pre-selecting-google-drive-files.html)
- [Workspace API User Data Policy](https://developers.google.com/workspace/workspace-api-user-data-developer-policy)

