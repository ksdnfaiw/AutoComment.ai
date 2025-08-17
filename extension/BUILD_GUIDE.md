# AutoComment.AI Chrome Extension - Build & Setup Guide

## 📋 Prerequisites
- Google Chrome browser
- Chrome Developer Mode enabled
- Access to the web app at your deployed URL

## 🛠️ Build Steps

### Step 1: Prepare Extension Files
1. **Update URLs in Extension Files** (IMPORTANT):
   - Replace `https://727d62769b6941fc99720b10fafde5d4-e068012f2a214dc59a9953e3a.fly.dev` with your actual deployed web app URL in:
     - `extension/content.js` (line 91, 107, 110)
     - `extension/popup.js` (line 107, 110)
     - `extension/background.js` (lines 8, 38, 43)

### Step 2: Convert SVG Icons to PNG (Required)
Chrome extensions require PNG icons, not SVG. Convert the icons:

```bash
# Install a tool like Inkscape or use online converters
# Convert each SVG to PNG:
# icon16.svg → icon16.png
# icon32.svg → icon32.png  
# icon48.svg → icon48.png
# icon128.svg → icon128.png
```

**Online conversion option:**
1. Go to https://convertio.co/svg-png/
2. Upload each SVG file from `extension/icons/`
3. Convert to PNG with the same dimensions
4. Download and replace the SVG files

### Step 3: Load Extension in Chrome

1. **Open Chrome Extensions Page**:
   - Go to `chrome://extensions/`
   - Or Menu → More Tools → Extensions

2. **Enable Developer Mode**:
   - Toggle "Developer mode" switch (top right)

3. **Load Extension**:
   - Click "Load unpacked"
   - Select the `extension/` folder
   - Extension should appear in your extensions list

4. **Pin Extension** (Optional):
   - Click the puzzle piece icon in Chrome toolbar
   - Pin "AutoComment.AI" for easy access

## 🔗 Connecting Extension to Web App

### Step 1: User Authentication Flow
1. **Install Extension** → Opens welcome page automatically
2. **Sign up/Login** on the web app
3. **Authentication Auto-Sync** → Extension detects login

### Step 2: Manual Connection (if needed)
1. Click extension icon in Chrome toolbar
2. If not connected, click "Open Dashboard"
3. Login to your account on the web app
4. Return to LinkedIn and refresh

### Step 3: Test on LinkedIn
1. Go to `linkedin.com`
2. Look for blue "Suggest Comments" buttons on posts
3. Click to generate AI comments
4. Extension should show your authentication status

## 📁 Extension File Structure
```
extension/
├── manifest.json       # Extension configuration
├── content.js         # LinkedIn page integration
├── popup.html         # Extension popup UI
├── popup.js          # Popup functionality
├── background.js     # Background service worker
├── styles.css        # Content script styles
├── icons/            # Extension icons (PNG format)
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── BUILD_GUIDE.md    # This guide
```

## 🔧 Configuration

### Update Web App URLs
Before loading the extension, update these URLs in the code:

**content.js** (line 8):
```javascript
const API_BASE_URL = 'https://YOUR-ACTUAL-DOMAIN.com';
```

**popup.js** (line 57, 107, 110):
```javascript
// Update all instances of the old URL
'https://YOUR-ACTUAL-DOMAIN.com'
```

**background.js** (lines 8, 38, 43):
```javascript
// Update welcome and dashboard URLs
'https://YOUR-ACTUAL-DOMAIN.com/auth?source=extension'
'https://YOUR-ACTUAL-DOMAIN.com/dashboard'
```

## 🚀 Publishing to Chrome Web Store (Optional)

### Step 1: Prepare for Submission
1. Create high-quality screenshots
2. Write compelling store description
3. Set up Google Developer account ($5 fee)

### Step 2: Package Extension
```bash
# Create zip file with all extension files
zip -r autocomment-extension.zip extension/
```

### Step 3: Submit to Store
1. Go to Chrome Web Store Developer Dashboard
2. Upload zip file
3. Fill out store listing details
4. Submit for review (7-14 days)

## 🐛 Troubleshooting

### Extension Not Working
1. Check console errors in `chrome://extensions/`
2. Verify all URLs are updated correctly
3. Ensure you're logged into the web app
4. Refresh LinkedIn page

### Icons Not Showing
1. Ensure icons are PNG format, not SVG
2. Check file paths in manifest.json
3. Reload extension after icon changes

### Authentication Issues
1. Clear extension storage: `chrome://extensions/` → Details → Clear data
2. Re-login to web app
3. Check popup for connection status

## 📞 Support
- Check browser console for errors
- Verify web app is accessible
- Ensure LinkedIn permissions are granted
