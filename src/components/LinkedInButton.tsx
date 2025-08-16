import { useState } from 'react';
import { Button } from '@/components/ui/button';
 
import { MessageSquare, Copy, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAIComments } from '@/hooks/useAIComments';
import { useTokens } from '@/hooks/useTokens';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
 

interface Comment {
  id: string;
  text: string;
  confidence?: number;
}

interface LinkedInButtonProps {
  postContent?: string;
}

export const LinkedInButton = ({ postContent = '' }: LinkedInButtonProps) => {
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

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [simulatedComment, setSimulatedComment] = useState('');


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

    try {
      // Get persona from localStorage (saved during onboarding)
      const savedPersona = localStorage.getItem('persona') || 'Other';
      
      // Call Supabase edge function to generate comments
      const { data, error } = await supabase.functions.invoke('generate-comments', {
        body: { 
          postContent: postContent || 'AI trends and innovations in business',
          persona: savedPersona 
        }
      });

      if (error) {
        console.error('Error generating comments:', error);
        toast.error('Failed to generate comments. Please try again.');
        
        // Fallback comments if API fails
        const fallbackComments: Comment[] = [
          {
            id: '1',
            text: `Great insights! This really resonates with my experience in the field. Thanks for sharing your perspective.`,
            confidence: 0.7
          },
          {
            id: '2',
            text: `Excellent post! I'd love to hear more about your approach to this. The results speak for themselves.`,
            confidence: 0.7
          },
          {
            id: '3',
            text: `This aligns perfectly with what we're seeing in the industry. Looking forward to more content like this!`,
            confidence: 0.7
          }
        ];
        setComments(fallbackComments);
      } else {
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate comments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const autoFillComment = (comment: string) => {
    // Check if we're on LinkedIn.com
    if (window.location.href.includes('linkedin.com')) {
      // Try to find and fill the real LinkedIn comment box
      const linkedinSelectors = [
        '.comments-post__comment-input',
        '[data-test-id="comments-post__comment-input"]',
        '.ql-editor[data-placeholder*="comment"]',
        'div[role="textbox"][data-placeholder*="comment"]',
        '.ql-editor[contenteditable="true"]'
      ];
      
      let commentBox: HTMLElement | null = null;
      for (const selector of linkedinSelectors) {
        commentBox = document.querySelector(selector);
        if (commentBox) break;
      }
      
      if (commentBox) {
        // Use setTimeout and requestAnimationFrame for reliable auto-paste
        setTimeout(() => {
          requestAnimationFrame(() => {
            // Scroll into view and focus
            commentBox!.scrollIntoView({ behavior: 'smooth', block: 'center' });
            commentBox!.click();
            commentBox!.focus();
            
            setTimeout(() => {
              // For LinkedIn's rich text editor
              if (commentBox!.tagName === 'DIV') {
                commentBox!.innerHTML = comment;
                commentBox!.innerText = comment;
              } else if (commentBox!.tagName === 'TEXTAREA' || commentBox!.tagName === 'INPUT') {
                (commentBox as HTMLInputElement).value = comment;
              }
              
              // Trigger events to ensure LinkedIn detects the change
              const events = ['input', 'change', 'keyup', 'keydown', 'blur', 'focus'];
              events.forEach(eventType => {
                commentBox!.dispatchEvent(new Event(eventType, { bubbles: true }));
              });
              
              commentBox!.focus();
              toast.success('Comment auto-filled in LinkedIn comment box!');
            }, 100);
          });
        }, 200);
        return true;
      } else {
        toast.error('LinkedIn comment box not found. Text copied to clipboard instead.');
        return false;
      }
    } else {
      // We're in demo mode - fill the simulated comment box
      setSimulatedComment(comment);
      
      // Focus the simulated textarea after a brief delay
      setTimeout(() => {
        const textarea = document.querySelector('#simulated-comment-box') as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(comment.length, comment.length);
        }
      }, 100);
      
      toast.success('Comment auto-filled in demo comment box!');
      return true;
    }
  };

  const approveComment = async (comment: Comment) => {
    try {
      // Auto-fill the comment
      const autoFilled = autoFillComment(comment.text);
      
      // If auto-fill failed, copy to clipboard as fallback
      if (!autoFilled) {
        await navigator.clipboard.writeText(comment.text);
        toast.success('Comment copied to clipboard!');
      }
      
      // Save feedback to database
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('feedback').insert({
            user_id: user.id,
            comment_text: comment.text,
            post_content: postContent,
            status: 'approved',
            persona_used: localStorage.getItem('persona') || 'Other'
          });
          
          // Deduct 1 token - first get current tokens_used
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('tokens_used')
            .eq('id', user.id)
            .single();
          
          if (userProfile) {
            const { error: updateError } = await supabase
              .from('user_profiles')
              .update({ tokens_used: (userProfile.tokens_used || 0) + 1 })
              .eq('id', user.id);
            
            if (updateError) {
              console.error('Error updating tokens:', updateError);
            }
          }
        }
      } catch (dbError) {
        console.error('Error saving feedback:', dbError);
      }
      
      // Remove the comment from the list or close popup
      setComments(comments.filter(c => c.id !== comment.id));
      if (comments.length === 1) {
        setShowPopup(false);

      }
    } catch (error) {
      console.error('Failed to process comment approval:', error);
      toast.error('Failed to process comment. Please try again.');
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

  };

  const rejectComment = async (comment: Comment) => {
    try {
      // Save rejection feedback to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('feedback').insert({
          user_id: user.id,
          comment_text: comment.text,
          post_content: postContent,
          status: 'rejected',
          persona_used: localStorage.getItem('persona') || 'Other'
        });
      }
      
      // Remove the comment from the list
      setComments(comments.filter(c => c.id !== comment.id));
      if (comments.length === 1) {
        setShowPopup(false);
      }
      
      toast.success('Feedback recorded. Thank you for helping improve our AI!');
    } catch (error) {
      console.error('Error saving rejection feedback:', error);
      toast.error('Failed to save feedback.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Button 
          onClick={generateComments}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
          disabled={loading}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          {loading ? 'Generating...' : 'Suggest Comments'}
        </Button>

        {showPopup && (
          <div className="absolute top-full mt-2 left-0 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">AI Comment Suggestions</h3>
                <button 
                  onClick={() => setShowPopup(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Generating personalized comments...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment, index) => (
                    <Card key={comment.id} className="p-3 border border-gray-100">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm text-gray-800 flex-1">{comment.text}</p>
                        {comment.confidence && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {Math.round(comment.confidence * 100)}% match
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveComment(comment)}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectComment(comment)}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Simulated LinkedIn Comment Box */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">LinkedIn Comment Box (Demo)</h4>
        <Textarea
          id="simulated-comment-box"
          value={simulatedComment}
          onChange={(e) => setSimulatedComment(e.target.value)}
          placeholder="Write a comment..."
          className="border-gray-300 p-2 rounded w-full min-h-[80px] resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          {window.location.href.includes('linkedin.com') 
            ? 'Real LinkedIn comment box detected' 
            : 'Demo mode - approved comments will auto-fill here'}
        </p>
      </div>
    </div>
  );
};
