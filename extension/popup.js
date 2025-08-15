// AutoComment.AI Chrome Extension Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  const loadingEl = document.getElementById('loading');
  const contentEl = document.getElementById('content');
  const offlineEl = document.getElementById('offline');
  
  try {
    // Check if we're on LinkedIn
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const isLinkedIn = tab.url && (
      tab.url.includes('linkedin.com') || 
      tab.url.includes('www.linkedin.com')
    );
    
    if (!isLinkedIn) {
      loadingEl.style.display = 'none';
      offlineEl.style.display = 'block';
      
      document.getElementById('open-linkedin').addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://www.linkedin.com' });
        window.close();
      });
      return;
    }
    
    // Load user status
    await loadUserStatus();
    
    loadingEl.style.display = 'none';
    contentEl.style.display = 'block';
    
  } catch (error) {
    console.error('Error loading popup:', error);
    loadingEl.style.display = 'none';
    offlineEl.style.display = 'block';
  }
});

async function loadUserStatus() {
  const connectionStatus = document.getElementById('connection-status');
  const tokenCount = document.getElementById('token-count');
  const pageStatus = document.getElementById('page-status');
  const dashboardBtn = document.getElementById('dashboard-btn');
  const refreshBtn = document.getElementById('refresh-btn');
  
  try {
    // Check authentication status
    const authData = await chrome.storage.local.get(['supabase_auth']);
    
    if (authData.supabase_auth && authData.supabase_auth.access_token) {
      connectionStatus.textContent = 'Connected';
      connectionStatus.className = 'badge success';
      
      // Try to fetch user data
      try {
        const response = await fetch('https://fatssalzlbpjilxpfuhw.supabase.co/rest/v1/user_profiles?select=tokens_remaining,tokens_total', {
          headers: {
            'Authorization': `Bearer ${authData.supabase_auth.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhdHNzYWx6bGJwamlseHBmdWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MDM0OTUsImV4cCI6MjA3MDQ3OTQ5NX0.eO4CwmtALYv1Nf9dhrMlucqnFtwyKxfC53dnjQ6_wyI'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            const profile = data[0];
            tokenCount.textContent = `${profile.tokens_remaining}/${profile.tokens_total}`;
            
            if (profile.tokens_remaining < 10) {
              tokenCount.style.color = '#ef4444';
            }
          } else {
            tokenCount.textContent = 'No profile found';
          }
        } else {
          tokenCount.textContent = 'Error loading';
        }
      } catch (error) {
        tokenCount.textContent = 'Offline';
      }
      
    } else {
      connectionStatus.textContent = 'Not logged in';
      connectionStatus.className = 'badge warning';
      tokenCount.textContent = 'Login required';
    }
    
    // Check current page status
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.url && tab.url.includes('linkedin.com')) {
      pageStatus.textContent = 'LinkedIn detected ✓';
      pageStatus.style.color = '#10b981';
    } else {
      pageStatus.textContent = 'Not on LinkedIn';
      pageStatus.style.color = '#6b7280';
    }
    
  } catch (error) {
    console.error('Error loading status:', error);
    connectionStatus.textContent = 'Error';
    connectionStatus.className = 'badge warning';
    tokenCount.textContent = 'Unable to load';
  }
  
  // Set up dashboard link
  dashboardBtn.href = 'https://your-app-domain.com/dashboard';
  dashboardBtn.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://your-app-domain.com/dashboard' });
    window.close();
  });
  
  // Set up refresh button
  refreshBtn.addEventListener('click', () => {
    loadUserStatus();
  });
}

// Store persona selection
async function updatePersona(persona) {
  await chrome.storage.local.set({ 'autocomment-persona': persona });
}

// Message passing with content script
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0] && tabs[0].url && tabs[0].url.includes('linkedin.com')) {
    // Send message to content script if needed
    chrome.tabs.sendMessage(tabs[0].id, { 
      action: 'popup_opened',
      timestamp: Date.now()
    }).catch(() => {
      // Content script not loaded yet, that's ok
    });
  }
});
