# Google OAuth Verification Response

## Email Subject
Re: Verification Request - RiskLo - spreadsheets.readonly scope

---

## Email Body

Hello Google Developer Support,

**Unable to use narrower scopes**

I have implemented and thoroughly tested the recommended `drive.file` scope approach as outlined in your guidance. Unfortunately, this approach does not work for my application's use case due to a technical limitation of the Google Sheets API.

### Technical Testing Results

I followed the recommended implementation:

1. **OAuth Configuration**: Requested only the `drive.file` scope (no `spreadsheets.readonly`)
2. **User Experience**: Implemented Google Picker API with `setFileIds()` method to pre-navigate to the specific spreadsheet
3. **User Authorization**: Users explicitly select the target spreadsheet via the Picker, granting access to that specific file
4. **File ID Storage**: The selected file ID is stored and used consistently for all subsequent API calls

**Result**: The Google Sheets API returns `404 "Requested entity was not found"` when attempting to call `spreadsheets.get()` or `spreadsheets.values.get()`, even though:
- The user explicitly granted access to the file via the Picker
- The file ID is correct and stored properly
- The OAuth token is valid with `drive.file` scope

### Technical Analysis

The `drive.file` scope works correctly for Drive API operations (e.g., `files.get`, `files.export`) but does **not** grant the necessary permissions for Google Sheets API operations. This appears to be a known architectural limitation where different Google APIs require their specific scopes, even when accessing the same underlying file.

### Current Implementation

I am using `spreadsheets.readonly` scope, which is the minimum scope required by the Sheets API to read spreadsheet content. To provide users with transparency and control, I have implemented:

- **Google Picker API** with `setFileIds()` to pre-select and highlight the specific spreadsheet
- **Clear user messaging** explaining which file the application needs to access
- **File ID validation** to ensure we only access the user-selected spreadsheet
- **Minimal data access**: Reading only the necessary columns (daily P&L data organized by strategy and date)

### Application Use Case

**RiskLo** is a risk assessment dashboard for day traders. The application helps users:

1. **Analyze trading risk** based on historical performance data
2. **Calculate probability** of exceeding drawdown limits
3. **Assess compliance** with Apex Trader Funding's 30% rules (MAE and Windfall)

**Data Source**: Users access a shared Google Spreadsheet maintained by Vector Algorithmics (their trading education provider). The spreadsheet contains:
- Daily P&L performance by trading strategy
- Historical drawdown data
- Strategy-specific metrics

**Why Sheets API is Required**: The data is organized in a structured format across multiple sheets (one per strategy), requiring the Sheets API to:
- List available strategy sheets by name
- Read specific cell ranges for date and P&L columns
- Parse multi-week historical data efficiently

**User Benefit**: By connecting to the shared Vector spreadsheet, users get real-time risk analysis based on the latest strategy performance data without manual CSV exports or data entry.

### Privacy & Security Measures

- Users must be signed in with a Google account that already has view access to the Vector Results Spreadsheet (shared with Vector Algorithmics members)
- The application does not store spreadsheet data; analysis is performed in real-time
- File ID is tied to the user's OAuth token; no cross-user data access
- No write operations are performed on any spreadsheets

### Request

I respectfully request approval for the `spreadsheets.readonly` scope, as it is the minimum scope required for my application to function with the Google Sheets API. The implementation includes the Google Picker for user transparency, even though the technical limitation prevents narrowing the scope to `drive.file` alone.

Thank you for your consideration.

Best regards,
Myles Humphrey
RiskLo Developer
myles2595@gmail.com

---

## Additional Information for Your Records

### Testing Evidence
- Tested `drive.file` only: ❌ Returns 404 on Sheets API calls
- Tested `drive.file` + `spreadsheets.readonly`: ✅ Works as expected
- Picker implementation: ✅ `setFileIds()` method used
- File ID validation: ✅ Stored and used consistently

### Scopes Requested
- `openid` (sign-in)
- `userinfo.profile` (user name/avatar)
- `userinfo.email` (user identification)
- `drive.file` (user visibility/control via Picker)
- `spreadsheets.readonly` (Sheets API requirement)

### Documentation References
- Google Picker API: https://developers.google.com/drive/picker
- Drive API Scopes: https://developers.google.com/drive/api/guides/api-specific-auth
- Workspace API Policy: https://developers.google.com/workspace/workspace-api-user-data-developer-policy

