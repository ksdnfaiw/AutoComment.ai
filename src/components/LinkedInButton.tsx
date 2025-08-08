import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Copy, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  text: string;
}

export const LinkedInButton = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateComments = async () => {
    setLoading(true);
    setShowPopup(true);
    
    // Enhanced personalized comment generation
    setTimeout(() => {
      const persona = localStorage.getItem('autocomment-persona') || 'SaaS Founder';
      const personalizedComments = {
        'SaaS Founder': [
          { id: '1', text: 'This resonates deeply. We\'ve seen similar trends disrupting our industry.' },
          { id: '2', text: 'Valuable perspective here. The strategic implications are significant for SaaS businesses.' },
          { id: '3', text: 'Absolutely agree with this approach. We\'re implementing something similar at our company.' }
        ],
        'Marketer': [
          { id: '1', text: 'This is exactly what we\'re seeing in our campaigns. Data-driven insights like this are gold.' },
          { id: '2', text: 'Brilliant analysis! The conversion metrics must be telling an interesting story here.' },
          { id: '3', text: 'Love how you\'ve broken this down. We\'re testing similar strategies with great results.' }
        ],
        'Analyst': [
          { id: '1', text: 'The data supports this conclusion. Have you analyzed the correlation with market trends?' },
          { id: '2', text: 'Compelling analysis. The methodology here aligns with best practices in the field.' },
          { id: '3', text: 'This framework makes sense. Would be interesting to see the longitudinal data on this.' }
        ]
      };
      
      const comments = personalizedComments[persona] || [
        { id: '1', text: 'Insightful perspective on this topic. Thanks for sharing your expertise.' },
        { id: '2', text: 'This analysis adds real value to the conversation. Well articulated.' },
        { id: '3', text: 'Great point about the industry implications. Looking forward to seeing how this develops.' }
      ];
      
      setComments(comments);
      setLoading(false);
    }, 1500);
  };

  const approveComment = async (comment: Comment) => {
    // Check if we're in the Chrome extension context
    const isExtension = window.location.hostname === 'www.linkedin.com' || window.location.hostname === 'linkedin.com';
    
    if (isExtension) {
      // Auto-fill LinkedIn comment box (extension functionality)
      const commentBox = document.querySelector('.ql-editor[contenteditable="true"]') as HTMLElement;
      
      if (commentBox) {
        // Enhanced auto-fill with better LinkedIn integration
        commentBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        setTimeout(() => {
          commentBox.click();
          
          setTimeout(() => {
            if (commentBox.contentEditable === 'true') {
              // Clear and insert using selection for better compatibility
              const range = document.createRange();
              range.selectNodeContents(commentBox);
              const selection = window.getSelection();
              selection.removeAllRanges();
              selection.addRange(range);
              
              document.execCommand('insertText', false, comment.text);
              
              // Trigger comprehensive events
              ['input', 'keyup', 'change', 'blur', 'focus'].forEach(eventType => {
                commentBox.dispatchEvent(new Event(eventType, { bubbles: true }));
              });
            } else if (commentBox.tagName === 'TEXTAREA') {
              (commentBox as HTMLTextAreaElement).value = comment.text;
              commentBox.dispatchEvent(new Event('input', { bubbles: true }));
            }
            
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
          }, 100);
        }, 200);
        
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(comment.text);
        toast({
          title: "Comment copied!",
          description: "Paste it in the LinkedIn comment box.",
        });
      }
    } else {
      // Web app version - just copy to clipboard
      try {
        await navigator.clipboard.writeText(comment.text);
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
    }
    
    setShowPopup(false);
    
    // Mock API call to n8n webhook for approval
    console.log('Approved comment:', comment);
  };

  const rejectComment = async (comment: Comment) => {
    toast({
      title: "Feedback sent",
      description: "Thank you for helping us improve!",
    });
    
    // Mock API call to n8n webhook for rejection
    console.log('Rejected comment:', comment);
  };

  return (
    <div className="relative">
      <Button
        onClick={generateComments}
        className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium shadow-sm"
        size="sm"
        title="Get AI comment suggestions!"
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        Suggest Comments
      </Button>

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

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Generating comments...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="p-3 bg-muted rounded-md">
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
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};