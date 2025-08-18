// AutoComment.AI Chrome Extension Background Script

// Auto-detect web app URL
async function getWebAppURL() {
  try {
    const result = await chrome.storage.local.get(['webapp_url']);
    return result.webapp_url || 'https://727d62769b6941fc99720b10fafde5d4-8f10095ae10a4256928cde286.fly.dev';
  } catch {
    return 'https://727d62769b6941fc99720b10fafde5d4-8f10095ae10a4256928cde286.fly.dev';
  }
}

// Install/Update handler
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Open welcome page on first install
    const webAppURL = await getWebAppURL();
    chrome.tabs.create({
      url: `${webAppURL}/auth?source=extension`
    });
  } else if (details.reason === 'update') {
    // Handle extension updates
    console.log('AutoComment.AI extension updated to version', chrome.runtime.getManifest().version);
  }
});

// Handle toolbar icon click
chrome.action.onClicked.addListener((tab) => {
  // The popup.html will handle this, but this is a fallback
  if (tab.url && !tab.url.includes('linkedin.com')) {
    chrome.tabs.create({ url: 'https://www.linkedin.com' });
  }
});

// Message handling from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'get_auth_status':
      // Check authentication status
      chrome.storage.local.get(['supabase_auth'], (result) => {
        sendResponse({ 
          authenticated: !!result.supabase_auth?.access_token,
          authData: result.supabase_auth
        });
      });
      return true; // Will respond asynchronously
      
    case 'open_dashboard':
      getWebAppURL().then(webAppURL => {
        chrome.tabs.create({ url: `${webAppURL}/dashboard` });
        sendResponse({ success: true });
      });
      return true;

    case 'open_auth':
      getWebAppURL().then(webAppURL => {
        chrome.tabs.create({ url: `${webAppURL}/auth?source=extension` });
        sendResponse({ success: true });
      });
      return true;
      
    case 'store_auth':
      // Store authentication data
      chrome.storage.local.set({ 
        supabase_auth: request.authData 
      }, () => {
        sendResponse({ success: true });
      });
      return true;
      
    case 'clear_auth':
      chrome.storage.local.remove(['supabase_auth'], () => {
        sendResponse({ success: true });
      });
      return true;
      
    case 'get_persona':
      chrome.storage.local.get(['autocomment-persona'], (result) => {
        sendResponse({ 
          persona: result['autocomment-persona'] || 'Professional'
        });
      });
      return true;
      
    case 'set_persona':
      chrome.storage.local.set({ 
        'autocomment-persona': request.persona 
      }, () => {
        sendResponse({ success: true });
      });
      return true;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Tab update listener
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // When LinkedIn page loads, inject content script if needed
  if (changeInfo.status === 'complete' && 
      tab.url && 
      (tab.url.includes('linkedin.com') || tab.url.includes('www.linkedin.com'))) {
    
    // Send a message to refresh the page status
    chrome.runtime.sendMessage({
      action: 'linkedin_page_loaded',
      tabId: tabId,
      url: tab.url
    }).catch(() => {
      // No listeners, that's ok
    });
  }
});

// Context menu (right-click) options
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'suggest_comment' && tab.url.includes('linkedin.com')) {
    // Send message to content script to trigger comment generation
    chrome.tabs.sendMessage(tab.id, {
      action: 'generate_comment',
      selectedText: info.selectionText
    });
  }
});

// Create context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'suggest_comment',
    title: 'Suggest AI Comment',
    contexts: ['selection'],
    documentUrlPatterns: ['*://*.linkedin.com/*']
  });
});

// Badge management
function updateBadgeText(text, tabId) {
  chrome.action.setBadgeText({
    text: text,
    tabId: tabId
  });
  
  chrome.action.setBadgeBackgroundColor({
    color: '#3b82f6'
  });
}

// Listen for authentication events from web app
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  if (request.action === 'auth_success' && request.authData) {
    // Store auth data from web app
    chrome.storage.local.set({ 
      supabase_auth: request.authData 
    }, () => {
      // Update all LinkedIn tabs
      chrome.tabs.query({ url: '*://*.linkedin.com/*' }, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            action: 'auth_updated',
            authenticated: true
          }).catch(() => {});
        });
      });
      
      sendResponse({ success: true });
    });
    return true;
  }
});

// Alarm for token refresh reminders
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'token_refresh_reminder') {
    // Show notification about monthly token refresh
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'AutoComment.AI',
      message: 'Your monthly tokens have been refreshed! Ready to generate more comments.'
    });
  }
});

// Set up monthly reminder (optional)
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('token_refresh_reminder', {
    when: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
    periodInMinutes: 30 * 24 * 60 // Monthly
  });
});

console.log('AutoComment.AI background script loaded');
