# Fix: Stripe Showing "Sandbox" Instead of Live Mode

## Problem
You're seeing "Sandbox" in Stripe Checkout, which means Stripe is still using test mode keys instead of live keys.

## Solution Steps

### Step 1: Verify Railway Has LIVE Keys

1. Go to **Railway Dashboard** → Your Backend Service
2. Click on **"Variables"** tab
3. Check `STRIPE_SECRET_KEY`:
   - Should start with `sk_live_...` (NOT `sk_test_...`)
   - If it starts with `sk_test_...`, you need to update it

4. Check `STRIPE_PRICE_RISKLO_PRO`:
   - Should be from a LIVE mode product
   - If you created the product in test mode, create it again in LIVE mode

### Step 2: Get Your LIVE Stripe Keys

1. Go to **Stripe Dashboard**
2. Make sure you're in **LIVE mode** (toggle in top right)
3. Go to **Developers → API keys**
4. Copy the **Secret key** (starts with `sk_live_...`)

### Step 3: Create LIVE Product (if needed)

If your product was created in test mode:

1. In Stripe Dashboard (LIVE mode):
   - Go to **Products → Add product**
   - Name: "RiskLo Pro"
   - Set as Recurring, Monthly
   - Set your price
   - Save and copy the **Price ID** (starts with `price_...`)

### Step 4: Update Railway Variables

1. In Railway → Variables tab:
   - Update `STRIPE_SECRET_KEY` = `sk_live_...` (your LIVE secret key)
   - Update `STRIPE_PRICE_RISKLO_PRO` = `price_...` (your LIVE Price ID)

2. **Important:** Railway will automatically redeploy when you save variables

3. Wait for deployment to complete (check Deployments tab)

### Step 5: Verify Deployment

1. Check Railway logs to ensure server started successfully
2. Test the checkout flow on your live site
3. You should now see your actual business name instead of "Sandbox"

### Step 6: Update Local .env (Optional - for local testing)

If you want to test locally with live keys (not recommended for testing):

```bash
# In server/.env
STRIPE_SECRET_KEY=sk_live_...your_live_key...
STRIPE_PRICE_RISKLO_PRO=price_...your_live_price_id...
```

**Note:** For local development, it's better to keep test keys and only use live keys in Railway production.

## Quick Checklist

- [ ] Stripe Dashboard is in LIVE mode
- [ ] Got LIVE secret key (`sk_live_...`)
- [ ] Created RiskLo Pro product in LIVE mode (if needed)
- [ ] Got LIVE Price ID (`price_...`)
- [ ] Updated `STRIPE_SECRET_KEY` in Railway to LIVE key
- [ ] Updated `STRIPE_PRICE_RISKLO_PRO` in Railway to LIVE Price ID
- [ ] Railway redeployed successfully
- [ ] Tested checkout - no longer shows "Sandbox"

## Common Issues

**Issue:** Still seeing "Sandbox" after updating Railway
- **Solution:** Make sure Railway finished redeploying (check Deployments tab)
- **Solution:** Hard refresh your browser (Cmd+Shift+R or Ctrl+Shift+R)
- **Solution:** Clear browser cache

**Issue:** Can't find LIVE secret key
- **Solution:** Make sure you're in LIVE mode (not test mode) in Stripe Dashboard
- **Solution:** The toggle is in the top right of Stripe Dashboard

**Issue:** Price ID doesn't work
- **Solution:** Make sure the product was created in LIVE mode
- **Solution:** Test mode and Live mode have different Price IDs

## Important Notes

- ⚠️ **Never use LIVE keys for testing** - use test keys locally
- ⚠️ **LIVE keys charge real money** - be careful!
- ✅ **Test mode keys** start with `sk_test_...`
- ✅ **Live mode keys** start with `sk_live_...`

