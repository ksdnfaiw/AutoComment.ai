# AutoComment.AI Chrome Extension

## Installation Guide

### Method 1: Load Unpacked Extension (Developer Mode)

1. **Enable Developer Mode**
   - Open Chrome and go to `chrome://extensions/`
   - Toggle "Developer mode" in the top right corner

2. **Load the Extension**
   - Click "Load unpacked"
   - Select the `extension` folder from this project
   - The extension should now appear in your extensions list

3. **Pin the Extension**
   - Click the extensions icon (puzzle piece) in Chrome toolbar
   - Find "AutoComment.AI" and click the pin icon
   - The extension icon will now appear in your toolbar

### Method 2: Create CRX Package (Advanced)

1. **Package the Extension**
   - In `chrome://extensions/` with Developer mode on
   - Click "Pack extension"
   - Select the `extension` folder as the extension root
   - Click "Pack Extension"
   - This creates a `.crx` file and `.pem` key

2. **Install the Package**
   - Drag the `.crx` file into Chrome
   - Click "Add Extension" when prompted

## Setup Instructions

### 1. Configure API Endpoints

Before using the extension, update these files with your actual URLs:

**In `extension/content.js`:**
```javascript
const API_BASE_URL = 'https://your-supabase-project.supabase.co';
```

**In `extension/popup.js`:**
```javascript
const response = await fetch('https://your-supabase-project.supabase.co/rest/v1/user_profiles', {
  headers: {
    'Authorization': `Bearer ${authData.supabase_auth.access_token}`,
    'apikey': 'your-supabase-anon-key'  // Replace with actual anon key
  }
});
```

**In `extension/background.js`:**
```javascript
chrome.tabs.create({
  url: 'https://your-app-domain.com/auth?source=extension'  // Replace with your domain
});
```

### 2. Set Up Supabase Integration

1. **Get your Supabase credentials:**
   - Project URL: `https://your-project.supabase.co`
   - Anon Key: Found in Project Settings > API

2. **Update the extension files** with your actual Supabase credentials

3. **Deploy the Edge Function:**
   ```bash
   npx supabase functions deploy generate-comment
   ```

### 3. Authentication Flow

The extension requires users to authenticate through your web app:

1. User clicks extension icon
2. If not authenticated, redirects to your web app login
3. After login, auth token is stored in Chrome storage
4. Extension can now make authenticated API calls

## Usage

### On LinkedIn:

1. **Navigate to LinkedIn.com**
2. **Look for blue "Suggest Comments" buttons** on posts
3. **Click the button** to generate AI comments
4. **Review and approve** comments you like
5. **Comments auto-fill** into LinkedIn's comment box

### Extension Popup:

- Shows connection status
- Displays token count
- Quick access to dashboard
- Refresh status

## Features

### ✅ What Works:
- ✅ Auto-detects LinkedIn posts
- ✅ Generates AI comments via Supabase Edge Functions
- ✅ Auto-fills LinkedIn comment boxes
- ✅ Token management and tracking
- ✅ User authentication
- ✅ Feedback recording

### 🔄 Configuration Needed:
- 🔄 Replace placeholder URLs with your actual domains
- 🔄 Add your Supabase credentials
- 🔄 Deploy Supabase Edge Functions
- 🔄 Set up authentication flow

## File Structure

```
extension/
├── manifest.json          # Extension configuration
├── content.js            # Main LinkedIn integration
├── popup.html           # Extension popup interface
├── popup.js             # Popup functionality
├── background.js        # Service worker
├── styles.css          # Extension styles
├── icons/              # Extension icons (add these)
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md           # This file
```

## Required Icons

Create these icon files in the `extension/icons/` directory:
- `icon16.png` (16x16px)
- `icon32.png` (32x32px)  
- `icon48.png` (48x48px)
- `icon128.png` (128x128px)

## Troubleshooting

### Extension Not Loading:
- Check console for errors in `chrome://extensions/`
- Ensure all files are in the correct location
- Verify manifest.json syntax

### Authentication Issues:
- Check if Supabase credentials are correct
- Verify CORS settings in Supabase
- Check network requests in DevTools

### Comments Not Generating:
- Verify Edge Function is deployed
- Check user has sufficient tokens
- Ensure LinkedIn selectors are working

## Security Notes

- Never commit real API keys to version control
- Use environment variables for production
- Implement proper CORS policies
- Validate all user inputs

## Publishing to Chrome Web Store

1. **Prepare for submission:**
   - Test thoroughly
   - Create store listing assets
   - Write privacy policy

2. **Submit to Chrome Web Store:**
   - Create developer account ($5 fee)
   - Upload packaged extension
   - Fill out store listing
   - Submit for review

## Support

For issues or questions:
- Check browser console for errors
- Verify Supabase configuration
- Test API endpoints manually
- Check LinkedIn DOM structure changes
