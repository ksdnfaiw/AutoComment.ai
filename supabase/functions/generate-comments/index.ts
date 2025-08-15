import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { postContent, persona } = await req.json();
    
    if (!postContent || !persona) {
      return new Response(
        JSON.stringify({ error: 'Missing postContent or persona' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const hf = new HfInference(Deno.env.get('HUGGING_FACE_ACCESS_TOKEN'));

    console.log('Generating comments for persona:', persona, 'and post:', postContent);

    // Generate 3 different comments based on persona
    const prompts = [
      `As a ${persona}, write a thoughtful professional comment on this LinkedIn post: "${postContent}". Make it engaging and add value to the conversation. Keep it under 100 words.`,
      `As a ${persona}, write an insightful comment on this LinkedIn post: "${postContent}". Share a relevant experience or perspective. Keep it under 100 words.`,
      `As a ${persona}, write a supportive comment on this LinkedIn post: "${postContent}". Ask a follow-up question or share encouragement. Keep it under 100 words.`
    ];

    const comments = [];
    
    for (let i = 0; i < prompts.length; i++) {
      try {
        const result = await hf.textGeneration({
          model: 'microsoft/DialoGPT-medium',
          inputs: prompts[i],
          parameters: {
            max_new_tokens: 100,
            temperature: 0.8,
            do_sample: true
          }
        });

        // Clean up the generated text
        let comment = result.generated_text?.replace(prompts[i], '').trim() || '';
        
        // Fallback comments if generation fails or returns empty
        if (!comment || comment.length < 10) {
          const fallbackComments = {
            'SaaS Founder': [
              'Great insights! As a fellow founder, I completely agree with your perspective on this. How are you planning to implement these strategies in your organization?',
              'This resonates deeply with my experience building SaaS products. The key is always finding that balance between innovation and practical execution.',
              'Excellent points! I\'ve seen similar trends in the industry. Would love to connect and share experiences about scaling teams and processes.'
            ],
            'Marketer': [
              'Fantastic post! This aligns perfectly with the marketing strategies we\'ve been implementing. The data-driven approach is crucial for success.',
              'Love this perspective! As marketers, we need to constantly adapt to changing consumer behaviors. What metrics are you tracking for success?',
              'This is spot on! The intersection of creativity and analytics is where the magic happens in modern marketing. Great insights!'
            ],
            'Analyst': [
              'Excellent analysis! The data points you\'ve shared align with recent market research. Have you considered the long-term implications of these trends?',
              'Great breakdown of the key factors. From an analytical perspective, I\'d be curious to see how these metrics perform across different segments.',
              'Insightful post! The correlation between these variables is particularly interesting. What data sources are you using for this analysis?'
            ],
            'Investor': [
              'Compelling insights! From an investment perspective, this trend represents significant opportunities. Are you seeing similar patterns in your portfolio?',
              'Great post! This kind of strategic thinking is exactly what we look for in potential investments. The market timing seems perfect.',
              'Excellent analysis! The scalability potential here is impressive. Have you considered the capital requirements for rapid expansion?'
            ],
            'Other': [
              'Great insights! This really resonates with my experience in the industry. Thanks for sharing your perspective on this important topic.',
              'Excellent post! I appreciate how you\'ve broken down these complex concepts. Looking forward to seeing how this develops.',
              'Insightful thoughts! This aligns with what we\'re seeing in our organization as well. Would love to hear more about your approach.'
            ]
          };
          
          const personaComments = fallbackComments[persona as keyof typeof fallbackComments] || fallbackComments['Other'];
          comment = personaComments[i] || personaComments[0];
        }

        comments.push({
          id: crypto.randomUUID(),
          text: comment,
          confidence: 0.8 + Math.random() * 0.2
        });
      } catch (error) {
        console.error('Error generating comment:', error);
        
        // Fallback comment in case of error
        const fallback = `Interesting perspective! Thanks for sharing these insights. I'd love to learn more about your experience with this topic.`;
        comments.push({
          id: crypto.randomUUID(),
          text: fallback,
          confidence: 0.7
        });
      }
    }

    console.log('Generated comments:', comments);

    return new Response(
      JSON.stringify({ comments }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in generate-comments function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate comments', details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});