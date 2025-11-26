# Mobile Testing Setup

## Problem
When testing on mobile, `localhost:5001` doesn't work because `localhost` refers to the mobile device, not your computer.

## Solution
The app now automatically detects when you're accessing it from a network IP and uses that IP for the API.

## Steps to Test on Mobile:

### 1. Make sure both devices are on the same WiFi network
- Your computer and mobile device must be on the same WiFi network

### 2. Find your computer's local IP address
Your computer's IP: **192.168.183.203**

(To find it yourself: `ifconfig | grep "inet " | grep -v 127.0.0.1`)

### 3. Start the React dev server with network access

**Option A: Using environment variable (Recommended)**
```bash
cd client
HOST=0.0.0.0 npm start
```

**Option B: Update package.json scripts**
Add this to `client/package.json`:
```json
"scripts": {
  "start": "HOST=0.0.0.0 react-scripts start"
}
```

### 4. Start the backend server
```bash
cd server
PORT=5001 node index.js
```

### 5. Access from mobile
Open your mobile browser and go to:
```
http://192.168.183.203:3000
```

The app will automatically detect it's on a network IP and use:
```
http://192.168.183.203:5001
```
for API calls.

## Troubleshooting

**Issue: "Failed to connect to server"**
- Make sure backend is running: `curl http://192.168.183.203:5001/api/health`
- Make sure both devices are on same WiFi
- Check firewall isn't blocking port 5001

**Issue: React dev server not accessible**
- Make sure you started with `HOST=0.0.0.0`
- Check firewall isn't blocking port 3000

**Issue: Still seeing localhost errors**
- Hard refresh mobile browser (clear cache)
- Make sure you're accessing via IP, not localhost

## For Production
In production (Netlify), set `REACT_APP_API_URL` to your Railway backend URL, and the automatic detection won't be needed.

