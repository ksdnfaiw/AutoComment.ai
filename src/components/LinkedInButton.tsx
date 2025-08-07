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
    
    // Mock API call to n8n webhook
    setTimeout(() => {
      const mockComments = [
        { id: '1', text: 'Great insights! AI is definitely changing the game for SaaS.' },
        { id: '2', text: 'Love this perspective! AI automation saves us hours daily.' },
        { id: '3', text: 'Absolutely agree! The efficiency gains are incredible.' }
      ];
      setComments(mockComments);
      setLoading(false);
    }, 1500);
  };

  const approveComment = async (comment: Comment) => {
    try {
      await navigator.clipboard.writeText(comment.text);
      toast({
        title: "Comment copied!",
        description: "The comment has been copied to your clipboard.",
      });
      setShowPopup(false);
      
      // Mock API call to n8n webhook for approval
      console.log('Approved comment:', comment);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please try copying manually.",
        variant: "destructive",
      });
    }
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