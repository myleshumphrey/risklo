# How to Restart the Backend Server

## Quick Restart (if server is running on port 5001)

```bash
# Kill the existing server
lsof -ti:5001 | xargs kill -9

# Start the server
cd server
PORT=5001 node index.js
```

## Or use this one-liner:

```bash
cd /Users/myleshumphrey/repos/risklo && lsof -ti:5001 | xargs kill -9 2>/dev/null; sleep 2; cd server && PORT=5001 node index.js
```

## Step-by-Step:

1. **Stop the current server:**
   ```bash
   lsof -ti:5001 | xargs kill -9
   ```

2. **Navigate to server directory:**
   ```bash
   cd server
   ```

3. **Start the server:**
   ```bash
   PORT=5001 node index.js
   ```

## To run in background (so you can keep using terminal):

```bash
cd /Users/myleshumphrey/repos/risklo/server
PORT=5001 node index.js &
```

## To see server logs:

If you want to see what the server is doing, run it in the foreground (without `&`):

```bash
cd /Users/myleshumphrey/repos/risklo/server
PORT=5001 node index.js
```

You'll see output like:
```
WARNING: STRIPE_SECRET_KEY not set. Stripe features will be disabled.
Server running on port 5001
```

Or if Stripe is configured:
```
Server running on port 5001
```

## Verify it's running:

Open a new terminal and run:
```bash
curl http://localhost:5001/api/health
```

You should see: `{"status":"ok"}`

