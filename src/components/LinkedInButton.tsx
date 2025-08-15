import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [simulatedComment, setSimulatedComment] = useState('');

  const generateComments = async () => {
    setLoading(true);
    setShowPopup(true);
    
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