import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Copy, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAIComments } from '@/hooks/useAIComments';
import { useTokens } from '@/hooks/useTokens';
import { useAuth } from '@/contexts/AuthContext';

interface Comment {
  id: string;
  text: string;
  confidence?: number;
}

export const LinkedInButton = () => {
  const [showPopup, setShowPopup] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { tokenData, hasTokens } = useTokens();
  const { comments, generateComments, recordFeedback, isGenerating } = useAIComments();

  const generateAIComments = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to generate comments.",
        variant: "destructive",
      });
      return;
    }

    if (!hasTokens) {
      toast({
        title: "No tokens remaining",
        description: "Please upgrade your plan or wait for monthly reset.",
        variant: "destructive",
      });
      return;
    }

    setShowPopup(true);
    
    // Get post content from the demo or actual LinkedIn page
    const postContent = getPostContent();
    
    // Get user's persona from localStorage or default
    const persona = localStorage.getItem('autocomment-persona') || 'Professional';
    
    generateComments(postContent, persona);
  };

  const getPostContent = (): string => {
    // Try to find post content on LinkedIn
    if (window.location.hostname.includes('linkedin.com')) {
      const postElements = document.querySelectorAll('.feed-shared-update-v2__description, .update-components-text');
      for (const element of postElements) {
        const content = element.textContent?.trim();
        if (content && content.length > 50) {
          return content;
        }
      }
    }
    
    // Fallback to demo content or default
    return "🚀 Just launched our new AI-powered feature that automates customer support responses! The results are incredible: • 90% faster response times • 95% customer satisfaction • 60% reduction in support tickets AI isn't replacing our team - it's making them superhuman! 💪 What's your experience with AI in customer service? Drop your thoughts below! 👇";
  };

  const approveComment = async (comment: Comment) => {
    const postContent = getPostContent();
    
    // Record feedback in database
    await recordFeedback(comment.text, 'approved', postContent);
    
    // Check if we're in the Chrome extension context
    const isExtension = window.location.hostname === 'www.linkedin.com' || window.location.hostname === 'linkedin.com';
    
    if (isExtension) {
      // Auto-fill LinkedIn comment box (extension functionality)
      const success = await autoFillLinkedInComment(comment.text);
      if (!success) {
        // Fallback to clipboard
        await copyToClipboard(comment.text);
      }
    } else {
      // Web app version - just copy to clipboard
      await copyToClipboard(comment.text);
    }
    
    setShowPopup(false);
  };

  const autoFillLinkedInComment = async (commentText: string): Promise<boolean> => {
    const commentBox = findLinkedInCommentBox();
    
    if (commentBox) {
      try {
        // Scroll comment box into view
        commentBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Click to ensure focus
        commentBox.click();
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // For contenteditable elements (LinkedIn rich text editor)
        if (commentBox.contentEditable === 'true') {
          // Clear existing content using selection
          const range = document.createRange();
          range.selectNodeContents(commentBox);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
          
          // Insert comment text
          document.execCommand('insertText', false, commentText);
          
          // Trigger comprehensive events
          const events = ['input', 'keyup', 'change', 'blur', 'focus'];
          events.forEach(eventType => {
            commentBox.dispatchEvent(new Event(eventType, { bubbles: true }));
          });
        } 
        // For textarea elements
        else if (commentBox.tagName === 'TEXTAREA') {
          (commentBox as HTMLTextAreaElement).value = commentText;
          commentBox.dispatchEvent(new Event('input', { bubbles: true }));
          commentBox.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        // Final focus
        commentBox.focus();
        
        toast({
          title: "Comment ready to post!",
          description: "Click the Post button when ready",
        });
        
        // Visual feedback
        const originalStyle = commentBox.style.border;
        commentBox.style.border = '2px solid #10b981';
        setTimeout(() => {
          commentBox.style.border = originalStyle;
        }, 3000);
        
        return true;
      } catch (error) {
        console.error('Error auto-filling comment:', error);
        return false;
      }
    }
    
    return false;
  };

  const findLinkedInCommentBox = (): HTMLElement | null => {
    // Updated selectors for LinkedIn's latest DOM structure
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
            (element as HTMLElement).offsetParent !== null && 
            !element.hasAttribute('aria-hidden') &&
            !(element as HTMLInputElement).disabled &&
            getComputedStyle(element as HTMLElement).display !== 'none') {
          return element as HTMLElement;
        }
      }
    }
    return null;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Comment copied!",
        description: "The comment has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please try copying manually.",
        variant: "destructive",
      });
    }
  };

  const rejectComment = async (comment: Comment) => {
    const postContent = getPostContent();
    await recordFeedback(comment.text, 'rejected', postContent);
    
    toast({
      title: "Feedback sent",
      description: "Thank you for helping us improve!",
    });
  };

  return (
    <div className="relative">
      <Button
        onClick={generateAIComments}
        className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium shadow-sm"
        size="sm"
        title="Get AI comment suggestions!"
        disabled={!user || !hasTokens}
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        Suggest Comments
      </Button>

      {!user && (
        <div className="absolute top-12 left-0 w-64 bg-card border border-border rounded-lg shadow-lg p-3 z-50">
          <div className="flex items-center gap-2 text-warning">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Login Required</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Please log in to generate AI comments.
          </p>
        </div>
      )}

      {showPopup && (
        <div className="absolute top-12 left-0 w-80 bg-card border border-border rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-card-foreground">AI Comment Suggestions</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPopup(false)}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {isGenerating ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Generating comments...</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tokens remaining: {tokenData.current}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {comments.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No comments generated yet.</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-muted rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">
                        AI Confidence: {comment.confidence || 85}%
                      </span>
                    </div>
                    <p className="text-sm text-foreground mb-3">{comment.text}</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => approveComment(comment)}
                        size="sm"
                        className="bg-primary hover:bg-primary-hover text-primary-foreground flex-1"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => rejectComment(comment)}
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
