# Stripe Setup Guide for RiskLo Pro

## Step 1: Create a Stripe Account

1. Go to https://stripe.com
2. Click "Sign up" and create an account
3. Complete the account setup process

## Step 2: Get Your API Keys

1. Log in to your Stripe Dashboard
2. Click on **"Developers"** in the left sidebar
3. Click on **"API keys"**
4. You'll see two keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`) - Not needed for backend
   - **Secret key** (starts with `sk_test_` or `sk_live_`) - **This is what you need!**

5. **Important:** Make sure you're in **Test mode** (toggle in top right) for development
6. Copy the **Secret key** - you'll need this for `STRIPE_SECRET_KEY`

## Step 3: Create the RiskLo Pro Product

1. In Stripe Dashboard, click **"Products"** in the left sidebar
2. Click **"+ Add product"** button
3. Fill in the product details:
   - **Name:** `RiskLo Pro`
   - **Description:** `Premium subscription for RiskLo with bulk analysis features`
   - **Pricing model:** Select **"Recurring"**
   - **Price:** Enter your desired monthly price (e.g., `9.99`)
   - **Billing period:** Select **"Monthly"** (or "Yearly" if you prefer)
   - **Currency:** USD (or your preferred currency)
4. Click **"Save product"**

## Step 4: Get the Price ID

1. After creating the product, you'll see the product details page
2. Under **"Pricing"**, you'll see the price you just created
3. Click on the price to expand it
4. You'll see a **"Price ID"** that starts with `price_` (e.g., `price_1ABC123xyz...`)
5. Copy this Price ID - you'll need this for `STRIPE_PRICE_RISKLO_PRO`

## Step 5: Set Environment Variables

### For Local Development:

1. Open `server/.env` file
2. Add these lines:
   ```
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   STRIPE_PRICE_RISKLO_PRO=price_your_price_id_here
   ```
3. Replace the values with your actual keys from Stripe
4. Restart your backend server

### For Production (Railway):

1. Go to your Railway project dashboard
2. Click on your backend service
3. Go to **"Variables"** tab
4. Click **"+ New Variable"**
5. Add these two variables:
   - **Name:** `STRIPE_SECRET_KEY`
     **Value:** `sk_live_your_live_secret_key_here` (use live key for production!)
   - **Name:** `STRIPE_PRICE_RISKLO_PRO`
     **Value:** `price_your_price_id_here`
6. Railway will automatically redeploy your service

## Important Notes:

- **Test Mode vs Live Mode:**
  - Use `sk_test_...` keys for development/testing
  - Use `sk_live_...` keys for production (after you've tested everything)
  - You can toggle between test and live mode in Stripe Dashboard

- **Security:**
  - Never commit your secret keys to Git
  - Never share your secret keys publicly
  - The `.env` file should be in `.gitignore`

- **Testing:**
  - In test mode, you can use test card numbers:
    - Success: `4242 4242 4242 4242`
    - Decline: `4000 0000 0000 0002`
    - Use any future expiry date, any 3-digit CVC, any ZIP code

## Verify Setup:

After setting up, test the checkout flow:
1. Click "Subscribe to RiskLo Pro" in your app
2. You should be redirected to Stripe Checkout
3. Use a test card number to complete the payment
4. After successful payment, you should be redirected back to your app

## Troubleshooting:

- **"Stripe is not configured" error:** Check that environment variables are set correctly
- **"Stripe price ID not configured" error:** Make sure `STRIPE_PRICE_RISKLO_PRO` is set
- **404 errors:** Make sure your backend is running and has the latest code
- **CORS errors:** Make sure `FRONTEND_URL` is set in Railway to your Netlify domain

