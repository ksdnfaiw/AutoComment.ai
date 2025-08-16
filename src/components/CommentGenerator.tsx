import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAIComments } from '@/hooks/useAIComments';
import { MessageSquare, ThumbsUp, ThumbsDown, Copy, Sparkles, RefreshCw } from 'lucide-react';

interface CommentGeneratorProps {
  defaultPost?: string;
}

export const CommentGenerator = ({ defaultPost = '' }: CommentGeneratorProps) => {
  const [postContent, setPostContent] = useState(defaultPost);
  const { comments, generateComments, isGenerating, recordFeedback } = useAIComments();
  const { toast } = useToast();

  const handleGenerateComments = () => {
    if (!postContent.trim()) {
      toast({
        title: "Post content required",
        description: "Please enter some post content to generate comments.",
        variant: "destructive",
      });
      return;
    }
    generateComments(postContent);
  };

  const handleApprove = async (comment: any) => {
    await navigator.clipboard.writeText(comment.text);
    await recordFeedback(comment.text, 'approved', postContent);
    
    toast({
      title: "Comment approved!",
      description: "The comment has been copied to your clipboard.",
    });
  };

  const handleReject = async (comment: any) => {
    await recordFeedback(comment.text, 'rejected', postContent);
    
    toast({
      title: "Feedback recorded",
      description: "This will help improve future comment suggestions.",
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-500';
    if (confidence >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Comment Generator
          </CardTitle>
          <CardDescription>
            Paste a LinkedIn post to generate thoughtful, engaging comments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Post Content</label>
            <Textarea
              placeholder="Paste the LinkedIn post content here..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          
          <Button
            onClick={handleGenerateComments}
            disabled={isGenerating || !postContent.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating Comments...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 mr-2" />
                Generate AI Comments
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Comments */}
      {comments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Comments</CardTitle>
            <CardDescription>
              Review and approve the AI-generated comments below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="outline" className="text-xs">
                    <div className={`w-2 h-2 rounded-full mr-1 ${getConfidenceColor(comment.confidence)}`} />
                    {comment.confidence}% confidence
                  </Badge>
                </div>
                
                <p className="text-sm text-foreground mb-4 leading-relaxed">
                  {comment.text}
                </p>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(comment)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    Approve & Copy
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(comment)}
                    className="flex-1 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                  >
                    <ThumbsDown className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(comment.text);
                      toast({
                        title: "Copied!",
                        description: "Comment copied to clipboard.",
                      });
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};