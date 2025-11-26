# Fix Mobile Connection Issues

## Issue 1: "Failed to connect to server"

The mobile device needs to access your computer's IP address, not localhost.

### Fix:

1. **Make sure backend is accessible from network:**
   ```bash
   # Test if backend is accessible
   curl http://192.168.183.203:5001/api/health
   ```

2. **If that fails, check firewall:**
   - macOS: System Settings → Network → Firewall
   - Make sure port 5001 is allowed

3. **Restart React dev server:**
   ```bash
   cd client
   npm start
   ```
   (Should already be configured with HOST=0.0.0.0)

4. **Access from mobile:**
   ```
   http://192.168.183.203:3000
   ```

## Issue 2: Google OAuth "origin_mismatch" Error

Google OAuth requires you to register the origin (IP address) in Google Cloud Console.

### Fix:

1. **Go to Google Cloud Console:**
   - https://console.cloud.google.com/
   - Navigate to: APIs & Services → Credentials
   - Click on your OAuth 2.0 Client ID

2. **Add Authorized JavaScript origins:**
   - Click "+ Add URI"
   - Add: `http://192.168.183.203:3000`
   - Click "Save"

3. **Add Authorized redirect URIs:**
   - Click "+ Add URI"  
   - Add: `http://192.168.183.203:3000`
   - Click "Save"

4. **Wait a few minutes** for changes to propagate

5. **Try signing in again from mobile**

## Quick Checklist:

- [ ] Backend accessible: `curl http://192.168.183.203:5001/api/health` returns `{"status":"ok"}`
- [ ] React server running with `HOST=0.0.0.0`
- [ ] Both devices on same WiFi network
- [ ] Google Cloud Console has `http://192.168.183.203:3000` in authorized origins
- [ ] Google Cloud Console has `http://192.168.183.203:3000` in authorized redirect URIs
- [ ] Waited a few minutes after updating Google Cloud Console

## Note:

Your computer's IP address (192.168.183.203) may change if you reconnect to WiFi. If it changes, you'll need to:
1. Update Google Cloud Console with the new IP
2. Access the app using the new IP

For production, use your domain (risklo.io) instead of IP addresses.

