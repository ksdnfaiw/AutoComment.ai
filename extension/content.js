// AutoComment.AI Chrome Extension Content Script
// Adds the "Suggest Comments" button to LinkedIn posts

(function() {
  'use strict';

  // Configuration
  const API_BASE_URL = 'https://fatssalzlbpjilxpfuhw.supabase.co';
  
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
      
      <div class="autocomment-login" style="display: none; text-align: center; padding: 20px;">
        <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px;">Please log in to use AutoComment.AI</p>
        <a href="${API_BASE_URL.replace('https://your-supabase-project.supabase.co', 'https://your-app-domain.com')}/auth" 
           target="_blank" 
           style="
             background: #3b82f6;
             color: white;
             padding: 8px 16px;
             border-radius: 6px;
             text-decoration: none;
             font-size: 14px;
             font-weight: 500;
           ">
          Login to AutoComment.AI
        </a>
      </div>
    </div>
    
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;

  // Generate AI comments using the real API
  async function generateAIComments(postContent, persona) {
    try {
      // Get stored auth token
      const authData = await chrome.storage.local.get(['supabase_auth']);
      
      if (!authData.supabase_auth) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const response = await fetch(`${API_BASE_URL}/functions/v1/generate-comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.supabase_auth.access_token}`,
          'apikey': 'your-supabase-anon-key'
        },
        body: JSON.stringify({
          postContent,
          persona: persona || 'Professional'
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('NOT_AUTHENTICATED');
        }
        if (response.status === 402) {
          throw new Error('INSUFFICIENT_TOKENS');
        }
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.comments || [];
      
    } catch (error) {
      console.error('Error generating AI comments:', error);
      
      if (error.message === 'NOT_AUTHENTICATED') {
        throw error;
      }
      
      // Fallback to predefined comments
      return generateFallbackComments(postContent, persona);
    }
  }

  // Fallback comments when API is unavailable
  function generateFallbackComments(postContent, persona) {
    const fallbackComments = {
      'Professional': [
        { text: "Excellent insights shared here. This perspective adds real value to the conversation.", confidence: 85 },
        { text: "Thank you for this thoughtful analysis. The implications are significant.", confidence: 88 },
        { text: "Well articulated points. I'd be interested to hear more about your methodology.", confidence: 82 }
      ],
      'SaaS Founder': [
        { text: "This resonates with our experience building scalable solutions. Great perspective!", confidence: 90 },
        { text: "We've encountered similar challenges in our growth journey. Valuable lessons here.", confidence: 87 },
        { text: "Absolutely agree with this approach. Implementation is key to seeing real results.", confidence: 85 }
      ],
      'Marketer': [
        { text: "The strategic implications here are fascinating. How are you measuring success?", confidence: 89 },
        { text: "This data-driven approach is exactly what modern marketing needs. Brilliant insights!", confidence: 92 },
        { text: "Love how you've broken this down. We're seeing similar trends in our campaigns.", confidence: 86 }
      ]
    };

    return fallbackComments[persona] || fallbackComments['Professional'];
  }

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
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-size: 12px; color: #6b7280;">
            AI Confidence: ${comment.confidence || 85}%
          </span>
        </div>
        <p style="
          margin: 0 0 12px;
          font-size: 14px;
          line-height: 1.4;
          color: #111827;
        ">${comment.text}</p>
        <div style="display: flex; gap: 8px;">
          <button 
            class="approve-btn" 
            data-comment="${comment.text}"
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
            data-comment="${comment.text}"
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

  // Enhanced LinkedIn comment box finder
  function findCommentBox() {
    const selectors = [
      '.ql-editor[contenteditable="true"]:not([aria-hidden="true"])',
      'div[contenteditable="true"][role="textbox"]:not([aria-hidden="true"])',
      '.comments-comment-box__form .ql-editor',
      '.comments-comment-texteditor .ql-editor',
      '[data-test-id="comments-comment-texteditor"] .ql-editor',
      '.comments-comment-box textarea',
      'div[data-placeholder*="comment" i][contenteditable="true"]'
    ];
    
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        if (element && 
            element.offsetParent !== null && 
            !element.hasAttribute('aria-hidden') &&
            !element.disabled &&
            getComputedStyle(element).display !== 'none') {
          return element;
        }
      }
    }
    return null;
  }

  // Enhanced auto-fill function
  function autoFillComment(comment) {
    const commentBox = findCommentBox();
    
    if (commentBox) {
      commentBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      setTimeout(() => {
        commentBox.click();
        
        setTimeout(() => {
          if (commentBox.contentEditable === 'true') {
            const range = document.createRange();
            range.selectNodeContents(commentBox);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            
            document.execCommand('insertText', false, comment);
            
            const events = ['input', 'keyup', 'change', 'blur', 'focus'];
            events.forEach(eventType => {
              commentBox.dispatchEvent(new Event(eventType, { bubbles: true }));
            });
          } else if (commentBox.tagName === 'TEXTAREA') {
            commentBox.value = comment;
            commentBox.dispatchEvent(new Event('input', { bubbles: true }));
            commentBox.dispatchEvent(new Event('change', { bubbles: true }));
          }
          
          commentBox.focus();
          showToast('Comment ready to post! Click the Post button when ready', 'success');
          
          const originalStyle = commentBox.style.border;
          commentBox.style.border = '2px solid #10b981';
          setTimeout(() => {
            commentBox.style.border = originalStyle;
          }, 3000);
          
        }, 100);
      }, 200);
      
    } else {
      navigator.clipboard.writeText(comment).then(() => {
        showToast('Comment copied to clipboard!', 'info');
      }).catch(() => {
        showToast(`Comment: "${comment}" - Please copy manually`, 'error');
      });
    }
  }

  // Handle approve comment
  function approveComment(comment) {
    autoFillComment(comment);
    // Record feedback via API if authenticated
    recordFeedback(comment, 'approved');
  }

  // Handle reject comment
  function rejectComment(comment) {
    showToast('Feedback sent. Thank you!', 'info');
    recordFeedback(comment, 'rejected');
  }

  // Record feedback
  async function recordFeedback(comment, feedback) {
    try {
      const authData = await chrome.storage.local.get(['supabase_auth']);
      if (!authData.supabase_auth) return;

      await fetch(`${API_BASE_URL}/rest/v1/comment_history`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.supabase_auth.access_token}`,
          'apikey': 'your-supabase-anon-key'
        },
        body: JSON.stringify({ feedback })
      });
    } catch (error) {
      console.error('Error recording feedback:', error);
    }
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
      if (post.querySelector('.autocomment-suggest-btn')) return;
      
      const buttonContainer = createSuggestButton();
      const button = buttonContainer.querySelector('.autocomment-suggest-btn');
      
      post.parentNode.insertBefore(buttonContainer, post.nextSibling);
      
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        document.querySelectorAll('.autocomment-popup').forEach(p => p.remove());
        
        const popup = createCommentsPopup(buttonContainer);
        
        try {
          const postElement = post.closest('[data-urn]') || post.closest('.feed-shared-update-v2');
          const postContent = postElement ? postElement.textContent.slice(0, 200) : '';
          
          const userPersona = await chrome.storage.local.get(['autocomment-persona'])
            .then(result => result['autocomment-persona'] || 'Professional');
          
          const comments = await generateAIComments(postContent, userPersona);
          
          const loadingDiv = popup.querySelector('.autocomment-loading');
          const commentsDiv = popup.querySelector('.autocomment-comments');
          const loginDiv = popup.querySelector('.autocomment-login');
          
          loadingDiv.style.display = 'none';
          commentsDiv.style.display = 'block';
          
          commentsDiv.innerHTML = comments.map(createCommentHTML).join('');
          
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
          
        } catch (error) {
          const loadingDiv = popup.querySelector('.autocomment-loading');
          const loginDiv = popup.querySelector('.autocomment-login');
          
          loadingDiv.style.display = 'none';
          
          if (error.message === 'NOT_AUTHENTICATED') {
            loginDiv.style.display = 'block';
          } else {
            popup.innerHTML = `
              <div style="text-align: center; padding: 20px; color: #ef4444;">
                <p>Error generating comments. Please try again.</p>
              </div>
            `;
          }
        }
        
        popup.querySelector('.autocomment-close').addEventListener('click', () => {
          popup.remove();
        });
        
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
    addButtonsToPosts();
    
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
