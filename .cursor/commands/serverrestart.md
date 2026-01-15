# serverrestart

Restart Backend Server after Changes:
After making any edits to files in the 'server/' directory, you must automatically restart the backend server. 
1. Find the process ID on port 5001: 'lsof -t -i :5001'
2. If a PID is returned, kill it: 'kill <PID>'
3. Restart the server in the background: 'cd server && npm start'
Inform the user when the server has been refreshed.

This command will be available in chat with /serverrestart
