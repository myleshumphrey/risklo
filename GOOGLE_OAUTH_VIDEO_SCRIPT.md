# Google OAuth Verification - Demo Video Script

## Video Requirements
- **Length:** 2-3 minutes
- **Format:** Screen recording with voiceover
- **What to show:** User sign-in, Google Sheets authorization, data access, and risk calculation

---

## Script (2-3 minutes)

### **Opening (0:00 - 0:15)**

**[Screen: Show RiskLo homepage at risklo.io]**

> "Hi, I'm demonstrating RiskLo, a trading risk assessment tool. RiskLo helps traders analyze the risk of their trading strategies using historical performance data."

**[Screen: Scroll to show the sign-in area]**

> "To use RiskLo, users must sign in with their Google account. This allows us to securely authenticate users and access their authorized Google Sheets."

---

### **Part 1: Google Sign-In (0:15 - 0:45)**

**[Screen: Click "Sign in with Google" button]**

> "When a user clicks 'Sign in with Google', they're redirected to Google's secure authentication page."

**[Screen: Show Google OAuth consent screen]**

> "Google shows the user what permissions RiskLo is requesting. We only request three permissions:"

**[Screen: Point to each permission as you mention it]**

> "First, we request access to the user's email address. This is used for account creation and to send risk analysis results via email."

> "Second, we request access to the user's basic profile information - their name and profile picture. This is used to personalize their experience in the app."

> "Third, we request read-only access to Google Sheets. This allows users to connect their Vector Algorithmics strategy performance spreadsheets."

**[Screen: Click "Allow" or "Continue"]**

> "The user can review these permissions and choose to allow or deny access. If they allow, they're redirected back to RiskLo."

---

### **Part 2: Google Sheets Authorization (0:45 - 1:30)**

**[Screen: Show RiskLo dashboard after sign-in]**

> "After signing in, the user sees the RiskLo dashboard. To analyze strategies, they need to connect their Google Sheets containing strategy performance data."

**[Screen: Click "Connect Results Spreadsheet" or navigate to strategy selection]**

> "When the user tries to select a strategy, if they haven't connected their Google Sheets yet, they'll see a prompt to connect."

**[Screen: Click to connect Google Sheets]**

> "Clicking this button initiates the Google Sheets OAuth flow."

**[Screen: Show Google OAuth consent screen for Sheets]**

> "Google shows another consent screen, this time specifically for Google Sheets access. Notice that we're requesting read-only access - we can only read data, never write or modify anything."

**[Screen: Point to the scope description]**

> "The permission clearly states: 'See all your Google Sheets spreadsheets' - this is read-only access. Users can see exactly what we're requesting."

**[Screen: Click "Allow"]**

> "Once the user authorizes, RiskLo can access only the specific Google Sheets that the user has explicitly shared with us or authorized us to access."

---

### **Part 3: Data Access & Risk Calculation (1:30 - 2:30)**

**[Screen: Show strategy dropdown populated with strategies from Google Sheets]**

> "After authorization, RiskLo can read the user's authorized Google Sheets. Here you can see the strategy names loaded from the connected spreadsheet."

**[Screen: Select a strategy from the dropdown]**

> "The user selects a strategy they want to analyze. RiskLo reads the historical performance data for this strategy from the Google Sheet."

**[Screen: Fill in account details (contracts, drawdown, etc.)]**

> "The user enters their trading parameters - account size, number of contracts, and maximum drawdown limit."

**[Screen: Click "Analyze Risk"]**

> "When the user clicks 'Analyze Risk', RiskLo reads the strategy's historical loss data from the Google Sheet - things like maximum historical losses, average losses, and drawdowns."

**[Screen: Show results dashboard with risk metrics]**

> "Based on this historical data, RiskLo calculates risk metrics like the probability of exceeding the user's drawdown limit, risk scores, and safety recommendations."

> "All of this data comes from the Google Sheet that the user authorized us to access. We only read the data - we never write back to the sheet or modify anything."

---

### **Part 4: Summary (2:30 - 2:45)**

**[Screen: Show the full RiskLo interface]**

> "In summary, RiskLo uses Google OAuth to:"

> "One - Authenticate users securely with their Google account."

> "Two - Access read-only Google Sheets data that users explicitly authorize, containing strategy performance history."

> "Three - Calculate risk assessments based on this historical data to help traders make informed decisions."

> "All data access is transparent, user-controlled, and read-only. Users can revoke access at any time through their Google Account settings."

**[Screen: Fade to RiskLo logo]**

> "Thank you for reviewing RiskLo's OAuth implementation."

---

## Recording Tips

### **Before Recording:**
1. **Clear your browser cache** - Fresh sign-in looks better
2. **Use a test Google account** - Don't use your personal account
3. **Prepare test data** - Have a Google Sheet with sample strategy data ready
4. **Close unnecessary tabs** - Clean browser window
5. **Test the flow first** - Do a dry run to ensure everything works

### **During Recording:**
1. **Speak clearly and slowly** - Google reviewers need to understand
2. **Pause at important moments** - Let viewers see what's happening
3. **Use cursor highlights** - Make it clear where you're clicking
4. **Show the full screen** - Don't crop important UI elements
5. **Keep it under 3 minutes** - Google prefers concise videos

### **Recording Tools:**
- **Mac:** QuickTime Player (built-in) or ScreenFlow
- **Windows:** OBS Studio (free) or Windows Game Bar (Win+G)
- **Online:** Loom (free, easy to use)

### **What NOT to Include:**
- ❌ Personal information (real account balances, real names)
- ❌ Sensitive data (actual trading strategies, account numbers)
- ❌ Long pauses or dead air
- ❌ Background noise or distractions

### **What TO Include:**
- ✅ Clear view of OAuth consent screens
- ✅ Explicit mention of "read-only" access
- ✅ Show that users control what sheets are accessed
- ✅ Demonstrate the actual data flow (sign-in → authorize → use data)
- ✅ Professional, clear narration

---

## Post-Recording Checklist

1. **Review the video:**
   - Is the audio clear?
   - Can you see all the important UI elements?
   - Does it show the complete OAuth flow?
   - Is it under 3 minutes?

2. **Upload to YouTube:**
   - Set visibility to "Unlisted" (not public, but accessible via link)
   - Add title: "RiskLo OAuth Demo - Google Sheets Read-Only Access"
   - Add description: Brief explanation of what the video shows

3. **Submit to Google:**
   - Copy the YouTube link
   - Paste it in the "Video link" field in Google Cloud Console
   - Submit for verification

---

## Alternative: Text-Only Justification (If Video is Optional)

If Google allows it, you can try submitting with just detailed text justifications first. But since they're asking for a video, you'll likely need to provide one.

---

## Quick Reference: Key Points to Emphasize

1. ✅ **Read-only access** - We never write to sheets
2. ✅ **User-controlled** - Users choose which sheets to share
3. ✅ **Transparent** - Google shows exactly what we're requesting
4. ✅ **Secure** - Uses Google's OAuth 2.0 standard
5. ✅ **Revocable** - Users can remove access anytime

Good luck! 🎬

