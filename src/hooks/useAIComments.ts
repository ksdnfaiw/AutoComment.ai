import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  text: string;
  confidence: number;
}

interface GenerateCommentsParams {
  postContent: string;
  persona?: string;
}

export const useAIComments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);

  const generateCommentsMutation = useMutation({
    mutationFn: async ({ postContent, persona }: GenerateCommentsParams) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('generate-comment', {
        body: {
          postContent,
          persona: persona || 'Professional'
        }
      });

      if (error) throw error;

      return data;
    },
    onSuccess: (data) => {
      const formattedComments = data.comments.map((comment: any, index: number) => ({
        id: (index + 1).toString(),
        text: comment.text,
        confidence: Math.round(comment.confidence)
      }));
      
      setComments(formattedComments);
      
      toast({
        title: "Comments generated!",
        description: `Generated ${formattedComments.length} AI comments. Tokens remaining: ${data.tokensRemaining}`,
      });
    },
    onError: (error: any) => {
      console.error('Error generating comments:', error);
      
      let errorMessage = 'Failed to generate comments. Please try again.';
      
      if (error.message?.includes('Insufficient tokens')) {
        errorMessage = 'You\'ve run out of tokens. Upgrade your plan or wait for monthly reset.';
      } else if (error.message?.includes('Unauthorized')) {
        errorMessage = 'Please log in to generate comments.';
      }
      
      toast({
        title: "Error generating comments",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const recordFeedback = async (commentText: string, feedback: 'approved' | 'rejected', postContent: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert({ 
          user_id: user.id,
          post_content: postContent.substring(0, 500),
          generated_comment: commentText,
          feedback,
          persona_used: 'Professional'
        });

      if (error) {
        console.error('Error recording feedback:', error);
      }
    } catch (error) {
      console.error('Error recording feedback:', error);
    }
  };

  const generateComments = (postContent: string, persona?: string) => {
    generateCommentsMutation.mutate({ postContent, persona });
  };

  return {
    comments,
    setComments,
    generateComments,
    recordFeedback,
    isGenerating: generateCommentsMutation.isPending,
    error: generateCommentsMutation.error
  };
};
