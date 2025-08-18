# AutoComment.AI Chrome Extension

## 🚀 Quick Setup

### Step 1: Convert SVG Icons to PNG
**IMPORTANT**: Chrome extensions require PNG icons, not SVG. You need to convert the icons before loading the extension.

**Option A: Online Conversion (Easiest)**
1. Go to https://convertio.co/svg-png/
2. Upload each SVG file from the original `extension/icons/` folder:
   - `icon16.svg`
   - `icon32.svg` 
   - `icon48.svg`
   - `icon128.svg`
3. Convert each to PNG with the same dimensions
4. Download and save as `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`
5. Place them in the `autocomment-extension/icons/` folder

**Option B: Using Inkscape (Command Line)**
```bash
# Install Inkscape first
inkscape --export-type=png --export-width=16 --export-filename=icon16.png icon16.svg
inkscape --export-type=png --export-width=32 --export-filename=icon32.png icon32.svg
inkscape --export-type=png --export-width=48 --export-filename=icon48.png icon48.svg
inkscape --export-type=png --export-width=128 --export-filename=icon128.png icon128.svg
```

### Step 2: Create Icons Folder
Create the icons folder and add your PNG files:
```
autocomment-extension/
├── icons/
│   ├── icon16.png   ← Add this
│   ├── icon32.png   ← Add this
│   ├── icon48.png   ← Add this
│   └── icon128.png  ← Add this
├── manifest.json
├── content.js
├── popup.html
├── popup.js
├── background.js
├── styles.css
└── README.md
```

### Step 3: Load Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `autocomment-extension` folder
5. Extension will appear in your extensions list

### Step 4: Pin Extension (Optional)
1. Click the puzzle piece icon in Chrome toolbar
2. Pin "AutoComment.AI" for easy access

## 📋 Testing

1. **Install Extension** → Should open welcome page automatically
2. **Sign up/Login** on your web app
3. **Go to LinkedIn.com**
4. **Look for blue "Suggest Comments" buttons** on posts
5. **Click to test** AI comment generation

## 🔧 Configuration

The extension automatically detects your web app URL. If you need to override it:

1. Open Chrome DevTools (F12)
2. Go to Application → Storage → Extension Storage
3. Add key-value pair:
   - Key: `webapp_url`
   - Value: `https://your-domain.com`

## 📦 Publishing to Chrome Web Store

### 1. Prepare Assets
- High-quality screenshots (1280x800 or 640x400)
- Store description and promotional copy
- Privacy policy URL

### 2. Create Store Account
- Google Developer account ($5 one-time fee)
- Chrome Web Store Developer Dashboard

### 3. Package Extension
```bash
# Create zip file
zip -r autocomment-extension.zip autocomment-extension/
```

### 4. Submit for Review
- Upload zip to Chrome Web Store Developer Dashboard
- Fill out store listing details
- Submit for review (typically 7-14 days)

## 🐛 Troubleshooting

### Icons Not Showing
- ✅ Ensure icons are PNG format (not SVG)
- ✅ Check all 4 icon sizes are present
- ✅ Reload extension after adding icons

### Extension Not Working
- ✅ Check console errors in `chrome://extensions/`
- ✅ Ensure you're logged into the web app
- ✅ Refresh LinkedIn page
- ✅ Check extension popup for connection status

### Authentication Issues
- ✅ Clear extension storage: `chrome://extensions/` → Details → Clear data
- ✅ Re-login to web app
- ✅ Check popup shows "Connected" status

## 🌟 Features

- **Domain-Free Setup**: Automatically detects your web app URL
- **Real-time Authentication**: Syncs with your web app login
- **Smart Comment Detection**: Works with LinkedIn's dynamic content
- **Fallback Support**: Works offline with predefined comments
- **User Feedback**: Approve/reject comments to improve AI

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify web app is accessible
3. Ensure LinkedIn permissions are granted
4. Check extension popup for status details

The extension is designed to work automatically once icons are converted and it's loaded in Chrome!
