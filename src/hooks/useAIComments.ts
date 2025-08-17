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

// Demo comments for different types of posts
const DEMO_COMMENTS = {
  leadership: [
    {
      text: "Absolutely agree! 🎯 The most successful leaders I've worked with share this adaptability trait. They don't just embrace change - they actively seek it out as a competitive advantage. How do you foster this mindset in your teams?",
      confidence: 92
    },
    {
      text: "This resonates deeply! 💡 I've seen organizations transform when leadership shifts from command-and-control to continuous learning mode. The ripple effect on company culture is remarkable. What's been your biggest learning breakthrough this year?",
      confidence: 88
    },
    {
      text: "Love this perspective! 🚀 In my experience, the leaders who admit they don't have all the answers often make the best decisions. Curiosity and humility are becoming the new leadership superpowers.",
      confidence: 85
    }
  ],
  ai: [
    {
      text: "Fantastic insights! 🤖 The personalization at scale point is crucial - we're seeing similar results with AI-driven customer journeys. The key is maintaining that human touch while automating the routine. What's your take on balancing automation with personal connection?",
      confidence: 94
    },
    {
      text: "This is exactly what we're experiencing! 📈 AI isn't just changing how we work - it's redefining what's possible. Our team's been experimenting with similar workflows. Would love to hear more about your implementation strategy!",
      confidence: 91
    },
    {
      text: "Great point about AI amplifying human capabilities rather than replacing them! 💡 The most successful AI implementations I've seen focus on augmenting decision-making and creativity. How are you measuring the impact on team productivity?",
      confidence: 87
    }
  ],
  marketing: [
    {
      text: "This data is incredible! 📊 300% better engagement with AI personalization speaks volumes about where the industry is heading. We're implementing similar strategies and seeing parallel results. What tools are you using for dynamic content creation?",
      confidence: 93
    },
    {
      text: "Absolutely on point! 🎯 The shift from broad-brush marketing to hyper-personalized experiences is game-changing. The challenge is scaling that personal touch - AI seems to be the bridge. How are you managing data privacy while personalizing?",
      confidence: 89
    },
    {
      text: "Love seeing real numbers behind AI marketing! 📈 The ROI improvements you're sharing align with what we're tracking. The creative testing automation piece is particularly interesting - saves so much manual work while improving results.",
      confidence: 86
    }
  ],
  general: [
    {
      text: "Great insights! 💡 This really resonates with my experience in the field. The practical approach you're sharing could help a lot of professionals navigate similar challenges. Thanks for breaking this down so clearly!",
      confidence: 87
    },
    {
      text: "Thanks for sharing this! 🙏 Your perspective adds valuable context to the ongoing conversation about professional development. I'm curious about your thoughts on implementing these strategies in remote work environments?",
      confidence: 84
    },
    {
      text: "This is exactly the kind of actionable advice the industry needs! 🎯 Your experience clearly shows in how you've framed these insights. Looking forward to applying some of these concepts in my own work.",
      confidence: 82
    }
  ]
};

const getRelevantDemoComments = (postContent: string): Comment[] => {
  const content = postContent.toLowerCase();
  
  let selectedComments;
  if (content.includes('ai') || content.includes('artificial intelligence') || content.includes('automation')) {
    selectedComments = DEMO_COMMENTS.ai;
  } else if (content.includes('leader') || content.includes('management') || content.includes('team')) {
    selectedComments = DEMO_COMMENTS.leadership;
  } else if (content.includes('marketing') || content.includes('campaign') || content.includes('engagement')) {
    selectedComments = DEMO_COMMENTS.marketing;
  } else {
    selectedComments = DEMO_COMMENTS.general;
  }
  
  // Randomly select 3 comments and add some variance to confidence scores
  const shuffled = [...selectedComments].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3).map((comment, index) => ({
    id: (index + 1).toString(),
    text: comment.text,
    confidence: Math.max(75, comment.confidence + Math.floor(Math.random() * 10) - 5)
  }));
};

export const useAIComments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);

  const generateCommentsMutation = useMutation({
    mutationFn: async ({ postContent, persona }: GenerateCommentsParams) => {
      // Demo mode - no authentication required
      if (!user) {
        // Simulate API delay for realistic demo experience
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
        
        const demoComments = getRelevantDemoComments(postContent);
        return {
          comments: demoComments,
          tokensRemaining: 485 // Demo token count
        };
      }

      // Real API call for authenticated users
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
        confidence: Math.round(comment.confidence || comment.confidence)
      }));
      
      setComments(formattedComments);
      
      if (user) {
        toast({
          title: "Comments generated! ✨",
          description: `Generated ${formattedComments.length} AI comments. Tokens remaining: ${data.tokensRemaining}`,
        });
      } else {
        toast({
          title: "Demo comments generated! 🎉",
          description: `Generated ${formattedComments.length} sample AI comments. Sign up to access the full Chrome extension!`,
        });
      }
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
    if (!user) {
      // Demo mode feedback
      if (feedback === 'approved') {
        toast({
          title: "Demo feedback recorded! 👍",
          description: "In the real extension, this helps our AI learn your preferences and improve suggestions.",
        });
      } else {
        toast({
          title: "Demo feedback noted! 📝",
          description: "Our AI learns from rejections to provide better suggestions next time.",
        });
      }
      return;
    }

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
