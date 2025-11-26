# Solutions for Mobile OAuth Testing

## Problem
Google OAuth doesn't allow IP addresses (like `http://192.168.183.203:3000`) - it requires a domain name.

## Solution Options:

### Option 1: Use ngrok (Recommended - Easiest)

ngrok creates a public URL that tunnels to your local server.

**Steps:**

1. **Install ngrok:**
   ```bash
   # macOS
   brew install ngrok
   
   # Or download from: https://ngrok.com/download
   ```

2. **Start your backend server:**
   ```bash
   cd server
   PORT=5001 node index.js
   ```

3. **Start ngrok tunnel for backend:**
   ```bash
   ngrok http 5001
   ```
   Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

4. **Start your React dev server:**
   ```bash
   cd client
   REACT_APP_API_URL=https://abc123.ngrok.io npm start
   ```

5. **Start ngrok tunnel for frontend:**
   ```bash
   # In a new terminal
   ngrok http 3000
   ```
   Copy the HTTPS URL (e.g., `https://xyz789.ngrok.io`)

6. **Add to Google Cloud Console:**
   - Authorized JavaScript origins: `https://xyz789.ngrok.io`
   - Authorized redirect URIs: `https://xyz789.ngrok.io`

7. **Access from mobile:**
   - Open `https://xyz789.ngrok.io` on your phone
   - OAuth will work! ✅

**Note:** Free ngrok URLs change each time you restart. For testing, this is fine.

---

### Option 2: Use Production Site (Simplest)

Just test on your live site at `https://risklo.io`:

1. Make sure Railway backend is deployed
2. Make sure Netlify frontend is deployed
3. Access `https://risklo.io` from mobile
4. OAuth already configured! ✅

---

### Option 3: Local Domain Mapping (Advanced)

Set up a local domain that points to your IP:

1. **Edit `/etc/hosts` on your computer:**
   ```bash
   sudo nano /etc/hosts
   ```
   Add: `192.168.183.203  risklo.local`

2. **Access from mobile:**
   - This won't work directly on mobile
   - You'd need to set up a local DNS server
   - Not recommended for quick testing

---

### Option 4: USB Debugging / Port Forwarding (Android)

If you have an Android device:

1. Enable USB debugging
2. Connect phone via USB
3. Use Chrome DevTools port forwarding
4. Access via `localhost:3000` on your computer
5. Phone will use forwarded connection

---

## Recommended Approach:

**For quick testing:** Use **Option 2** (production site)

**For development:** Use **Option 1** (ngrok) - it's free and easy

**For production:** Already set up with `https://risklo.io`

---

## Quick ngrok Setup:

```bash
# Terminal 1: Backend
cd server && PORT=5001 node index.js

# Terminal 2: ngrok for backend
ngrok http 5001
# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)

# Terminal 3: Frontend with ngrok URL
cd client
REACT_APP_API_URL=https://abc123.ngrok.io npm start

# Terminal 4: ngrok for frontend  
ngrok http 3000
# Copy the HTTPS URL (e.g., https://xyz789.ngrok.io)

# Add https://xyz789.ngrok.io to Google Cloud Console
# Access from mobile: https://xyz789.ngrok.io
```

