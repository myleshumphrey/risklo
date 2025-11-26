# RiskLo Pro Dev Mode Setup

## What is Dev Mode?

Dev Mode allows you to grant RiskLo Pro access to specific testers without requiring them to pay through Stripe. This is perfect for:
- Testing Pro features before launch
- Allowing beta testers to try Pro features
- Development and QA testing
- Demo accounts

## How to Set Up Dev Mode

### Step 1: Add Tester Emails to Environment Variable

Add the `DEV_MODE_PRO_EMAILS` environment variable with a comma-separated list of email addresses that should get Pro access.

#### For Local Development:

Edit `server/.env`:
```bash
DEV_MODE_PRO_EMAILS=test1@example.com,test2@example.com,myles2595@gmail.com
```

#### For Production (Railway):

1. Go to your Railway project → Backend service → Variables tab
2. Add a new variable:
   - **Name:** `DEV_MODE_PRO_EMAILS`
   - **Value:** `test1@example.com,test2@example.com,myles2595@gmail.com`
3. Railway will automatically redeploy

### Step 2: Restart Your Backend Server

After adding the environment variable, restart your backend server to pick up the changes.

### Step 3: Test It

1. Have your testers sign in with Google using one of the emails you added
2. They should automatically get Pro access
3. The UI will show "Pro (Dev)" badge to indicate dev mode

## How It Works

- When a user signs in, the backend checks if their email is in the `DEV_MODE_PRO_EMAILS` list
- If found, they get `isPro: true` and `devMode: true` in the response
- The frontend shows "Pro (Dev)" badge to distinguish from real Pro subscriptions
- All Pro features are unlocked (Bulk Calculator, CSV Upload, etc.)

## Important Notes

- **Case-insensitive:** Email matching is case-insensitive
- **No Stripe required:** Dev mode works even if Stripe isn't configured
- **Easy to disable:** Just remove the environment variable or empty it
- **Production ready:** You can keep dev mode active in production for specific testers
- **Visual indicator:** Users see "(Dev)" next to Pro badge so they know it's dev mode

## Removing Dev Mode Access

To remove a tester's Pro access:
1. Remove their email from `DEV_MODE_PRO_EMAILS`
2. Restart the backend server
3. They'll need to sign out and sign back in for changes to take effect

## Example Configuration

```bash
# Single tester
DEV_MODE_PRO_EMAILS=myles2595@gmail.com

# Multiple testers
DEV_MODE_PRO_EMAILS=test1@example.com,test2@example.com,beta@example.com

# Empty (dev mode disabled)
DEV_MODE_PRO_EMAILS=
```

## Security Considerations

- Only add emails you trust
- Don't commit `.env` files with real email addresses to Git
- Consider using a separate environment variable for production vs development
- Review the list periodically and remove inactive testers

