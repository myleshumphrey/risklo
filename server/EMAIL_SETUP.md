# Email Service Configuration

The RiskLo email service sends automated risk summary emails to users after they upload and analyze CSV files.

## How It Works

1. **CSV Upload Flow**: When a user uploads account and strategy CSV files, the frontend parses them and populates the Bulk Risk Calculator.

2. **Analysis**: After the user clicks "Analyze", the frontend calls `/api/analyze` for each account/strategy configuration.

3. **Email Sending**: Once all analyses complete successfully, the frontend automatically calls `/api/send-risk-summary` with:
   - User's email (from Google OAuth)
   - Array of analysis results
   - Risk mode ('risk' or 'apexMae')

4. **Email Content**: The email includes a formatted HTML table with:
   - Account name
   - Strategy
   - Contracts (e.g., "3 × NQ")
   - Account size
   - Max trailing drawdown (Risk mode) or Safety net (30% Drawdown mode)
   - Risk level (LOW/MEDIUM/HIGH/NO GO)
   - Risk score (0-100)
   - GO/NO-GO status

## Environment Variables

Set these environment variables in your backend deployment (Railway, Heroku, etc.):

### Required Variables

- `EMAIL_FROM`: Sender email address (e.g., `noreply@risklo.io` or `risklo@yourdomain.com`)
- `SMTP_HOST`: SMTP server hostname (e.g., `smtp.gmail.com`, `smtp.sendgrid.net`)
- `SMTP_USER`: SMTP username/email (usually the same as `EMAIL_FROM`)
- `SMTP_PASS`: SMTP password or app password

### Optional Variables

- `SMTP_PORT`: SMTP port (default: `587` for TLS, use `465` for SSL)
- `APP_BASE_URL`: Base URL for email links (defaults to `FRONTEND_URL` or `https://risklo.io`)

## Email Provider Setup

### Gmail

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "RiskLo" as the name
   - Copy the generated 16-character password
3. Set environment variables:
   ```
   EMAIL_FROM=your-email@gmail.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=<16-character-app-password>
   ```

### SendGrid

1. Create a SendGrid account and verify your sender email
2. Create an API key with "Mail Send" permissions
3. Set environment variables:
   ```
   EMAIL_FROM=verified-email@yourdomain.com
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=<your-sendgrid-api-key>
   ```

### Other SMTP Providers

Check your provider's SMTP settings and configure accordingly. Common providers:
- **Mailgun**: `smtp.mailgun.org` (port 587)
- **Amazon SES**: `email-smtp.us-east-1.amazonaws.com` (port 587)
- **Outlook/Office365**: `smtp-mail.outlook.com` (port 587)

## Testing

To test the email service:

1. Ensure all environment variables are set
2. Restart your backend server
3. Upload CSV files and run analysis
4. Check the server logs for email sending status
5. Check the user's email inbox

## Error Handling

- If email configuration is missing, the service logs a warning but doesn't crash
- If email sending fails, the analysis still completes successfully
- The frontend shows a confirmation message if email was sent, or a warning if it failed
- Email errors are logged to the server console but don't affect the API response

## Code Locations

- **Email Service**: `server/services/emailService.js`
- **Email Endpoint**: `server/index.js` (POST `/api/send-risk-summary`)
- **Frontend Call**: `client/src/components/BulkRiskCalculator.js` (in `handleSubmit` function)
- **Email Confirmation UI**: `client/src/components/BulkRiskCalculator.js` (in results section)

