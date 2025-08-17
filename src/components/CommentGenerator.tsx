import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAIComments } from '@/hooks/useAIComments';
import { MessageSquare, ThumbsUp, ThumbsDown, Copy, Sparkles, RefreshCw, Zap } from 'lucide-react';

interface CommentGeneratorProps {
  defaultPost?: string;
}

export const CommentGenerator = ({ defaultPost = '' }: CommentGeneratorProps) => {
  const [postContent, setPostContent] = useState(defaultPost);
  const { comments, generateComments, isGenerating, recordFeedback } = useAIComments();
  const { toast } = useToast();

  // Update post content when defaultPost changes
  useEffect(() => {
    setPostContent(defaultPost);
  }, [defaultPost]);

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
      title: "Comment approved! ✅",
      description: "The comment has been copied to your clipboard and is ready to paste on LinkedIn.",
    });
  };

  const handleReject = async (comment: any) => {
    await recordFeedback(comment.text, 'rejected', postContent);
    
    toast({
      title: "Feedback recorded 📝",
      description: "This will help improve future comment suggestions.",
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'bg-green-500';
    if (confidence >= 70) return 'bg-blue-500';
    if (confidence >= 55) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 85) return 'Excellent';
    if (confidence >= 70) return 'Good';
    if (confidence >= 55) return 'Fair';
    return 'Needs work';
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            AI Comment Generator
          </CardTitle>
          <CardDescription className="text-gray-600">
            Paste a LinkedIn post to generate thoughtful, engaging comments that boost your professional presence
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Post Content</label>
            <Textarea
              placeholder="Paste the LinkedIn post content here..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={4}
              className="resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <Button
            onClick={handleGenerateComments}
            disabled={isGenerating || !postContent.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating AI Comments...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate AI Comments
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Comments */}
      {comments.length > 0 && (
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Generated Comments</CardTitle>
            <CardDescription className="text-gray-600">
              AI-generated comments tailored to your professional persona. Click "Approve & Copy" to use on LinkedIn.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {comments.map((comment, index) => (
              <div
                key={comment.id}
                className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-blue-50 transition-all duration-200 hover:border-blue-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs border-0 text-white ${getConfidenceColor(comment.confidence)}`}
                    >
                      <div className="w-2 h-2 rounded-full bg-white/80 mr-1" />
                      {getConfidenceLabel(comment.confidence)} ({comment.confidence}%)
                    </Badge>
                    {comment.confidence >= 85 && (
                      <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                        ⭐ Recommended
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    Option {index + 1}
                  </span>
                </div>
                
                <div className="mb-4 p-3 bg-white rounded-md border border-gray-100">
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {comment.text}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(comment)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium"
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Approve & Copy
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(comment)}
                    className="flex-1 hover:bg-red-50 hover:text-red-700 hover:border-red-200 font-medium"
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Not This One
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(comment.text);
                      toast({
                        title: "Copied! 📋",
                        description: "Comment copied to clipboard.",
                      });
                    }}
                    className="px-3 hover:bg-blue-50"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {/* Regenerate Button */}
            <div className="pt-4 border-t border-gray-200">
              <Button
                onClick={handleGenerateComments}
                disabled={isGenerating}
                variant="outline"
                className="w-full font-medium"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate New Comments
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demo Instructions */}
      {comments.length === 0 && !isGenerating && postContent && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Ready to generate AI comments!
                </p>
                <p className="text-xs text-blue-700">
                  Click the button above to see how our AI creates engaging, professional comments for this post.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
