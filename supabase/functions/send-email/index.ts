import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  template?: 'welcome' | 'token_low' | 'monthly_reset' | 'feedback_request';
  templateData?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html, text, template, templateData }: EmailRequest = await req.json()

    if (!to || !subject) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let emailHtml = html
    let emailText = text

    // Generate email content from template
    if (template) {
      const templateResult = generateEmailTemplate(template, templateData || {})
      emailHtml = templateResult.html
      emailText = templateResult.text
    }

    // Use Resend (free tier: 3000 emails/month) or other free email service
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY')
    
    let emailResponse
    
    if (resendApiKey) {
      // Use Resend (recommended for free tier)
      emailResponse = await sendWithResend(resendApiKey, {
        to,
        subject,
        html: emailHtml,
        text: emailText
      })
    } else if (mailgunApiKey) {
      // Fallback to Mailgun
      emailResponse = await sendWithMailgun(mailgunApiKey, {
        to,
        subject,
        html: emailHtml,
        text: emailText
      })
    } else {
      // Fallback to console logging for development
      console.log('📧 Email would be sent:', {
        to,
        subject,
        html: emailHtml,
        text: emailText
      })
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email logged to console (no API key configured)',
          provider: 'console'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify(emailResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send email', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function sendWithResend(apiKey: string, email: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'AutoComment.AI <noreply@your-domain.com>', // Replace with your domain
      to: email.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
    }),
  })

  const result = await response.json()
  
  if (!response.ok) {
    throw new Error(`Resend API error: ${result.message}`)
  }

  return {
    success: true,
    messageId: result.id,
    provider: 'resend'
  }
}

async function sendWithMailgun(apiKey: string, email: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  const domain = Deno.env.get('MAILGUN_DOMAIN') || 'your-domain.com'
  
  const formData = new FormData()
  formData.append('from', 'AutoComment.AI <noreply@your-domain.com>')
  formData.append('to', email.to)
  formData.append('subject', email.subject)
  if (email.html) formData.append('html', email.html)
  if (email.text) formData.append('text', email.text)

  const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`api:${apiKey}`)}`,
    },
    body: formData,
  })

  const result = await response.json()
  
  if (!response.ok) {
    throw new Error(`Mailgun API error: ${result.message}`)
  }

  return {
    success: true,
    messageId: result.id,
    provider: 'mailgun'
  }
}

function generateEmailTemplate(template: string, data: Record<string, any>) {
  const templates = {
    welcome: {
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">Welcome to AutoComment.AI! 🚀</h1>
          <p>Hi ${data.name || 'there'},</p>
          <p>Welcome to AutoComment.AI! We're excited to help you network more effectively on LinkedIn.</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>🎉 Your account is ready!</h3>
            <ul>
              <li>✅ 50 free tokens to get you started</li>
              <li>✅ AI-powered comment suggestions</li>
              <li>✅ Chrome extension access</li>
              <li>✅ Professional networking tools</li>
            </ul>
          </div>
          
          <p>Ready to get started? <a href="${data.dashboardUrl || '#'}" style="color: #3b82f6;">Visit your dashboard</a> to begin generating amazing LinkedIn comments!</p>
          
          <p>Questions? Just reply to this email - we're here to help!</p>
          
          <p>Best regards,<br>The AutoComment.AI Team</p>
        </div>
      `,
      text: `Welcome to AutoComment.AI!\n\nHi ${data.name || 'there'},\n\nWelcome to AutoComment.AI! We're excited to help you network more effectively on LinkedIn.\n\nYour account is ready with 50 free tokens to get you started.\n\nVisit your dashboard to begin: ${data.dashboardUrl || '#'}\n\nQuestions? Just reply to this email.\n\nBest regards,\nThe AutoComment.AI Team`
    },
    
    token_low: {
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f59e0b;">⚠️ Running Low on Tokens</h1>
          <p>Hi ${data.name || 'there'},</p>
          <p>You're running low on comment generation tokens! You have <strong>${data.tokensRemaining || 0}</strong> tokens left.</p>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3>Don't miss out on networking opportunities!</h3>
            <p>Upgrade to Pro for unlimited comment generation:</p>
            <ul>
              <li>500 tokens per month</li>
              <li>Advanced AI models</li>
              <li>Priority support</li>
              <li>Custom personas</li>
            </ul>
          </div>
          
          <p><a href="${data.upgradeUrl || '#'}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Upgrade to Pro</a></p>
          
          <p>Your tokens will reset automatically at the beginning of next month.</p>
          
          <p>Happy networking!<br>The AutoComment.AI Team</p>
        </div>
      `,
      text: `Running Low on Tokens\n\nHi ${data.name || 'there'},\n\nYou're running low on comment generation tokens! You have ${data.tokensRemaining || 0} tokens left.\n\nUpgrade to Pro for 500 tokens per month: ${data.upgradeUrl || '#'}\n\nYour tokens will reset automatically next month.\n\nHappy networking!\nThe AutoComment.AI Team`
    },
    
    monthly_reset: {
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10b981;">🎉 Your Tokens Have Been Refreshed!</h1>
          <p>Hi ${data.name || 'there'},</p>
          <p>Great news! Your monthly token balance has been reset.</p>
          
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3>✨ Fresh start for ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
            <p>You now have <strong>${data.newTokenCount || 50}</strong> tokens ready to use!</p>
          </div>
          
          <p>Ready to continue networking? <a href="${data.dashboardUrl || '#'}" style="color: #3b82f6;">Visit your dashboard</a> to start generating comments.</p>
          
          <p>Keep building those professional connections!<br>The AutoComment.AI Team</p>
        </div>
      `,
      text: `Your Tokens Have Been Refreshed!\n\nHi ${data.name || 'there'},\n\nGreat news! Your monthly token balance has been reset.\n\nYou now have ${data.newTokenCount || 50} tokens ready to use!\n\nVisit your dashboard: ${data.dashboardUrl || '#'}\n\nKeep building those professional connections!\nThe AutoComment.AI Team`
    },
    
    feedback_request: {
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">We'd Love Your Feedback! 💙</h1>
          <p>Hi ${data.name || 'there'},</p>
          <p>You've been using AutoComment.AI for a while now, and we'd love to hear about your experience!</p>
          
          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Help us improve AutoComment.AI</h3>
            <p>Your feedback helps us build better features and improve the AI suggestions.</p>
            <p><strong>What's working well? What could be better?</strong></p>
          </div>
          
          <p><a href="${data.feedbackUrl || '#'}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Share Your Feedback</a></p>
          
          <p>As a thank you, we'll add 10 bonus tokens to your account! 🎁</p>
          
          <p>Thanks for being an amazing user!<br>The AutoComment.AI Team</p>
        </div>
      `,
      text: `We'd Love Your Feedback!\n\nHi ${data.name || 'there'},\n\nYou've been using AutoComment.AI for a while now, and we'd love to hear about your experience!\n\nShare your feedback: ${data.feedbackUrl || '#'}\n\nAs a thank you, we'll add 10 bonus tokens to your account!\n\nThanks for being an amazing user!\nThe AutoComment.AI Team`
    }
  }

  return templates[template as keyof typeof templates] || { html: '', text: '' }
}
