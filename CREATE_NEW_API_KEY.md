# Create a Fresh Google API Key for Picker

If the current API key continues to fail, create a new one:

## Steps:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "+ CREATE CREDENTIALS" → "API key"
3. A new key will be created (copy it immediately)
4. Click "Edit API key" (or the pencil icon)
5. Set up restrictions:

### Application restrictions:
- Select: **Websites**
- Add these referrers:
  ```
  http://localhost:3000
  http://localhost:5001
  https://risklo.io
  https://www.risklo.io
  ```

### API restrictions:
- Select: **Restrict key**
- Check: **Google Drive API** (ONLY this one)

6. Click **Save**
7. Wait 5-10 minutes for propagation
8. Update your `.env` file with the new key:

```bash
REACT_APP_GOOGLE_API_KEY=your_new_key_here
```

9. Restart the dev server
10. Hard refresh browser (Cmd+Shift+R)
11. Try the picker again

## What Should Happen:

✅ Console should show:
```
✅ Developer key set
✅ App ID set: 906472782182
Picker shown successfully
```

✅ Picker dialog opens
✅ You can select the file
✅ No "API developer key is invalid" error
✅ Sheets API calls succeed with the selected file

