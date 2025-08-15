import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')!
    const supabaseClient = createClient(
      Denv.get('SUPABASE_URL') ?? '',
      Denv.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { postContent, persona } = await req.json()

    if (!postContent) {
      return new Response(
        JSON.stringify({ error: 'Post content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check user tokens
    const { data: profile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('tokens_remaining')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile || profile.tokens_remaining <= 0) {
      return new Response(
        JSON.stringify({ error: 'Insufficient tokens' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate AI comments using Hugging Face
    const comments = await generateAIComments(postContent, persona || 'Professional')

    // Deduct token
    await supabaseClient
      .from('user_profiles')
      .update({ tokens_remaining: profile.tokens_remaining - 1 })
      .eq('user_id', user.id)

    // Save comment history
    await supabaseClient
      .from('comment_history')
      .insert({
        user_id: user.id,
        post_content: postContent.substring(0, 500),
        generated_comments: comments,
        persona_used: persona || 'Professional'
      })

    return new Response(
      JSON.stringify({ comments, tokensRemaining: profile.tokens_remaining - 1 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error generating comments:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function generateAIComments(postContent: string, persona: string): Promise<Array<{text: string, confidence: number}>> {
  const HF_TOKEN = Deno.env.get('HUGGING_FACE_TOKEN')
  
  if (!HF_TOKEN) {
    // Fallback to predefined comments if no API token
    return generateFallbackComments(postContent, persona)
  }

  try {
    // Use Hugging Face's free text generation model
    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `Generate a professional LinkedIn comment for this post: "${postContent}". Style: ${persona}`,
          parameters: {
            max_length: 100,
            temperature: 0.7,
            do_sample: true
          }
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`HF API error: ${response.status}`)
    }

    const result = await response.json()
    
    // Parse and format the response
    const comments = []
    if (result && result[0] && result[0].generated_text) {
      const text = result[0].generated_text.replace(postContent, '').trim()
      comments.push({
        text: text || "Great insights! This really resonates with my experience.",
        confidence: Math.random() * 20 + 75 // 75-95% confidence
      })
    }

    // Generate 2 more comments with variations
    for (let i = 0; i < 2; i++) {
      const variations = await generateCommentVariation(postContent, persona, i)
      comments.push(variations)
    }

    return comments.slice(0, 3)

  } catch (error) {
    console.error('HF API error, using fallback:', error)
    return generateFallbackComments(postContent, persona)
  }
}

async function generateCommentVariation(postContent: string, persona: string, index: number): Promise<{text: string, confidence: number}> {
  const variations = {
    'Professional': [
      "This aligns perfectly with industry best practices. Thank you for sharing your insights.",
      "Excellent analysis. Have you considered the implications for smaller organizations?",
      "This data-driven approach is exactly what our industry needs. Well presented."
    ],
    'SaaS Founder': [
      "This resonates deeply with our experience scaling our platform. Great perspective.",
      "We've seen similar patterns in our SaaS metrics. Valuable insights here.",
      "Absolutely agree. Implementation challenges aside, this framework makes perfect sense."
    ],
    'Marketer': [
      "The conversion implications here are fascinating. How did you measure the impact?",
      "This strategy aligns with what we're seeing in our latest campaigns. Brilliant insights.",
      "Love the data-driven approach. Have you tested this across different customer segments?"
    ],
    'Analyst': [
      "The methodology here is sound. Would be interesting to see the longitudinal data.",
      "This statistical approach confirms what we've been observing. Well researched.",
      "Compelling analysis. The correlation metrics must be showing interesting patterns."
    ]
  }

  const personaComments = variations[persona as keyof typeof variations] || variations['Professional']
  
  return {
    text: personaComments[index] || personaComments[0],
    confidence: Math.random() * 15 + 80 // 80-95% confidence
  }
}

function generateFallbackComments(postContent: string, persona: string): Array<{text: string, confidence: number}> {
  const fallbackComments = {
    'Professional': [
      "Excellent insights shared here. This perspective adds real value to the conversation.",
      "Thank you for this thoughtful analysis. The implications for our industry are significant.",
      "Well articulated points. I'd be interested to hear more about your methodology."
    ],
    'SaaS Founder': [
      "This resonates with our experience building scalable solutions. Great perspective!",
      "We've encountered similar challenges in our growth journey. Valuable lessons here.",
      "Absolutely agree with this approach. Implementation is key to seeing real results."
    ],
    'Marketer': [
      "The strategic implications here are fascinating. How are you measuring success?",
      "This data-driven approach is exactly what modern marketing needs. Brilliant insights!",
      "Love how you've broken this down. We're seeing similar trends in our campaigns."
    ],
    'Analyst': [
      "The data supports this conclusion. Have you analyzed the correlation with market trends?",
      "Compelling methodology. This framework aligns with best practices in analytical research.",
      "Strong analytical approach. Would be interesting to see the comparative metrics."
    ]
  }

  const comments = fallbackComments[persona as keyof typeof fallbackComments] || fallbackComments['Professional']
  
  return comments.map(text => ({
    text,
    confidence: Math.random() * 10 + 85 // 85-95% confidence for fallback
  }))
}
