# How to Deploy RiskLoWatcher.exe to Netlify

Since the .exe file is too large for GitHub (145MB), here are the best options:

## Option 1: GitHub Releases (Recommended - Easiest)

1. Go to your GitHub repo: https://github.com/myleshumphrey/risklo
2. Click "Releases" → "Create a new release"
3. Tag: `v1.0.0` (or any version)
4. Title: "RiskLo Watcher Desktop App v1.0.0"
5. Upload `RiskLoWatcher.exe` as a release asset
6. Update the download link in `Footer.js` to point to the GitHub release URL

**Update Footer.js:**
```javascript
const handleDesktopAppDownload = (e) => {
  e.preventDefault();
  e.stopPropagation();
  
  // Link to GitHub release
  window.open('https://github.com/myleshumphrey/risklo/releases/latest/download/RiskLoWatcher.exe', '_blank');
};
```

## Option 2: Netlify Manual Deploy (One-time)

1. Build your site locally:
   ```bash
   cd client
   npm run build
   ```

2. Copy the .exe to the build folder:
   ```bash
   cp client/public/downloads/RiskLoWatcher.exe client/build/downloads/
   ```

3. Deploy the build folder:
   ```bash
   netlify deploy --prod --dir=client/build
   ```

## Option 3: Cloud Storage (S3, Google Drive, etc.)

1. Upload .exe to cloud storage
2. Get a public download link
3. Update Footer.js to link to that URL

## Option 4: Build Script (Automatic)

Modify `netlify.toml` to copy the file during build (if it exists locally or can be downloaded).

---

**Recommended: Use GitHub Releases** - It's designed for large binaries and provides versioning.

