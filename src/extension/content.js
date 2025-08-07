// AutoComment.AI Chrome Extension Content Script
// Adds the "Suggest Comments" button to LinkedIn posts

(function() {
  'use strict';

  // Configuration
  const BUTTON_HTML = `
    <button 
      class="autocomment-suggest-btn" 
      title="Get AI comment suggestions!"
      style="
        background: #3b82f6;
        color: white;
        padding: 8px 12px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin: 8px 0;
        transition: background-color 0.2s;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      "
      onmouseover="this.style.backgroundColor='#2563eb'"
      onmouseout="this.style.backgroundColor='#3b82f6'"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      Suggest Comments
    </button>
  `;

  const POPUP_HTML = `
    <div 
      class="autocomment-popup" 
      style="
        position: absolute;
        top: 48px;
        left: 0;
        width: 320px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        padding: 16px;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      "
    >
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">AI Comment Suggestions</h3>
        <button 
          class="autocomment-close" 
          style="
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            color: #6b7280;
            padding: 4px;
          "
        >×</button>
      </div>
      
      <div class="autocomment-loading" style="text-align: center; padding: 32px 0;">
        <div style="
          width: 32px;
          height: 32px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 12px;
        "></div>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">Generating comments...</p>
      </div>
      
      <div class="autocomment-comments" style="display: none;">
        <!-- Comments will be inserted here -->
      </div>
    </div>
    
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;

  // Mock AI comments data
  const MOCK_COMMENTS = [
    "Great insights! AI is definitely changing the game for SaaS.",
    "Love this perspective! AI automation saves us hours daily.",
    "Absolutely agree! The efficiency gains are incredible."
  ];

  // Find LinkedIn post containers
  function findPostContainers() {
    return document.querySelectorAll('.feed-shared-update-v2__description, .update-components-text');
  }

  // Create comment suggestion button
  function createSuggestButton() {
    const div = document.createElement('div');
    div.innerHTML = BUTTON_HTML;
    div.style.position = 'relative';
    return div;
  }

  // Create comments popup
  function createCommentsPopup(container) {
    const popup = document.createElement('div');
    popup.innerHTML = POPUP_HTML;
    container.appendChild(popup.firstElementChild);
    return container.querySelector('.autocomment-popup');
  }

  // Generate comment HTML
  function createCommentHTML(comment, index) {
    return `
      <div style="
        padding: 12px;
        background: #f9fafb;
        border-radius: 6px;
        margin-bottom: 12px;
      ">
        <p style="
          margin: 0 0 12px;
          font-size: 14px;
          line-height: 1.4;
          color: #111827;
        ">${comment}</p>
        <div style="display: flex; gap: 8px;">
          <button 
            class="approve-btn" 
            data-comment="${comment}"
            style="
              background: #3b82f6;
              color: white;
              border: none;
              padding: 6px 12px;
              border-radius: 4px;
              font-size: 12px;
              cursor: pointer;
              flex: 1;
              font-weight: 500;
            "
            onmouseover="this.style.backgroundColor='#2563eb'"
            onmouseout="this.style.backgroundColor='#3b82f6'"
          >
            ✓ Approve
          </button>
          <button 
            class="reject-btn" 
            data-comment="${comment}"
            style="
              background: #6b7280;
              color: white;
              border: none;
              padding: 6px 12px;
              border-radius: 4px;
              font-size: 12px;
              cursor: pointer;
              flex: 1;
              font-weight: 500;
            "
            onmouseover="this.style.backgroundColor='#4b5563'"
            onmouseout="this.style.backgroundColor='#6b7280'"
          >
            ✗ Reject
          </button>
        </div>
      </div>
    `;
  }

  // Find LinkedIn comment input box
  function findCommentBox() {
    // Multiple selectors for LinkedIn comment input variations
    const selectors = [
      '.ql-editor[contenteditable="true"]', // Rich text editor
      'textarea[placeholder*="comment"]', // Regular textarea
      'div[contenteditable="true"][role="textbox"]', // Contenteditable div
      '.comments-comment-box__form textarea', // Specific LinkedIn comment box
      '[data-artdeco-is-focused] .ql-editor', // Focused comment editor
      '.ql-editor.ql-blank' // Empty editor
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.offsetParent !== null) { // Check if visible
        return element;
      }
    }
    return null;
  }

  // Auto-fill comment in LinkedIn comment box
  function autoFillComment(comment) {
    const commentBox = findCommentBox();
    
    if (commentBox) {
      // Focus the comment box first
      commentBox.focus();
      
      // For contenteditable elements (LinkedIn rich text editor)
      if (commentBox.contentEditable === 'true') {
        // Clear existing content
        commentBox.innerHTML = '';
        // Insert comment text
        commentBox.textContent = comment;
        
        // Trigger input events to ensure LinkedIn detects the change
        commentBox.dispatchEvent(new Event('input', { bubbles: true }));
        commentBox.dispatchEvent(new Event('change', { bubbles: true }));
      } 
      // For textarea elements
      else if (commentBox.tagName === 'TEXTAREA') {
        commentBox.value = comment;
        commentBox.dispatchEvent(new Event('input', { bubbles: true }));
        commentBox.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      // Keep focus on the comment box
      commentBox.focus();
      
      showToast('Comment added! Ready to post 🚀', 'success');
      
      // Highlight the comment box briefly
      const originalBorder = commentBox.style.border;
      commentBox.style.border = '2px solid #3b82f6';
      setTimeout(() => {
        commentBox.style.border = originalBorder;
      }, 2000);
      
    } else {
      // Fallback to clipboard if comment box not found
      navigator.clipboard.writeText(comment).then(() => {
        showToast('Comment copied to clipboard!', 'info');
      }).catch(() => {
        showToast('Please copy manually: ' + comment, 'error');
      });
    }
  }

  // Handle approve comment
  function approveComment(comment) {
    // Auto-fill the comment in LinkedIn comment box
    autoFillComment(comment);
    
    // Mock API call to track approval
    console.log('Approved comment:', comment);
  }

  // Handle reject comment
  function rejectComment(comment) {
    showToast('Feedback sent. Thank you!', 'info');
    // Mock API call to track rejection
    console.log('Rejected comment:', comment);
  }

  // Show toast notification
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
    
    toast.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 12px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease-out;
      ">
        ${message}
      </div>
      <style>
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      </style>
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // Add button to LinkedIn posts
  function addButtonsToPosts() {
    const posts = findPostContainers();
    
    posts.forEach(post => {
      // Skip if button already exists
      if (post.querySelector('.autocomment-suggest-btn')) return;
      
      const buttonContainer = createSuggestButton();
      const button = buttonContainer.querySelector('.autocomment-suggest-btn');
      
      // Insert button after the post content
      post.parentNode.insertBefore(buttonContainer, post.nextSibling);
      
      // Add click handler
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Remove existing popups
        document.querySelectorAll('.autocomment-popup').forEach(p => p.remove());
        
        // Create and show popup
        const popup = createCommentsPopup(buttonContainer);
        
        // Simulate API call delay
        setTimeout(() => {
          const loadingDiv = popup.querySelector('.autocomment-loading');
          const commentsDiv = popup.querySelector('.autocomment-comments');
          
          loadingDiv.style.display = 'none';
          commentsDiv.style.display = 'block';
          
          // Add comments
          commentsDiv.innerHTML = MOCK_COMMENTS.map(createCommentHTML).join('');
          
          // Add event listeners to comment buttons
          commentsDiv.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              approveComment(btn.dataset.comment);
              popup.remove();
            });
          });
          
          commentsDiv.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              rejectComment(btn.dataset.comment);
              popup.remove();
            });
          });
        }, 1500);
        
        // Add close handler
        popup.querySelector('.autocomment-close').addEventListener('click', () => {
          popup.remove();
        });
        
        // Close on outside click
        document.addEventListener('click', function closePopup(e) {
          if (!popup.contains(e.target) && !button.contains(e.target)) {
            popup.remove();
            document.removeEventListener('click', closePopup);
          }
        });
      });
    });
  }

  // Initialize extension
  function init() {
    // Add buttons to existing posts
    addButtonsToPosts();
    
    // Watch for new posts (LinkedIn uses dynamic loading)
    const observer = new MutationObserver(() => {
      addButtonsToPosts();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log('AutoComment.AI extension loaded');
  }

  // Start when page is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();