# Email Notification Function

This Supabase Edge Function handles sending email notifications using free email services.

## Setup

### Option 1: Resend (Recommended - 3000 free emails/month)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Add to Supabase secrets:
   ```bash
   npx supabase secrets set RESEND_API_KEY=your_api_key_here
   ```

### Option 2: Mailgun (10,000 free emails/month for 3 months)

1. Sign up at [mailgun.com](https://mailgun.com)
2. Add your domain and verify it
3. Get your API key and domain
4. Add to Supabase secrets:
   ```bash
   npx supabase secrets set MAILGUN_API_KEY=your_api_key_here
   npx supabase secrets set MAILGUN_DOMAIN=your-domain.com
   ```

### Option 3: Development Mode

Without any API keys, emails will be logged to the console for testing.

## Usage

### Call the function:

```javascript
const { data, error } = await supabase.functions.invoke('send-email', {
  body: {
    to: 'user@example.com',
    subject: 'Welcome to AutoComment.AI',
    template: 'welcome',
    templateData: {
      name: 'John Doe',
      dashboardUrl: 'https://your-app.com/dashboard'
    }
  }
})
```

### Available Templates:

- `welcome` - Welcome new users
- `token_low` - Warn when tokens are running low
- `monthly_reset` - Notify when tokens are refreshed
- `feedback_request` - Request user feedback

### Custom Email:

```javascript
const { data, error } = await supabase.functions.invoke('send-email', {
  body: {
    to: 'user@example.com',
    subject: 'Custom Subject',
    html: '<h1>Custom HTML content</h1>',
    text: 'Custom plain text content'
  }
})
```

## Deploy

```bash
npx supabase functions deploy send-email
```

## Email Triggers

Create database triggers to automatically send emails:

```sql
-- Trigger for welcome email on user creation
CREATE OR REPLACE FUNCTION send_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the send-email function
  PERFORM net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/send-email',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer your-service-role-key"}'::jsonb,
    body := json_build_object(
      'to', NEW.email,
      'subject', 'Welcome to AutoComment.AI',
      'template', 'welcome',
      'templateData', json_build_object(
        'name', COALESCE(NEW.raw_user_meta_data->>'full_name', 'there'),
        'dashboardUrl', 'https://your-app.com/dashboard'
      )
    )::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_send_welcome_email ON user_profiles;
CREATE TRIGGER trigger_send_welcome_email
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION send_welcome_email();
```

## Cost Optimization

### Free Tier Limits:
- **Resend**: 3,000 emails/month (forever free)
- **Mailgun**: 10,000 emails/month (first 3 months)

### Best Practices:
1. Use templates to reduce function execution time
2. Batch notifications when possible
3. Implement email preferences (allow users to opt-out)
4. Use database triggers for automatic emails
5. Monitor usage to stay within free limits

## Email Types to Implement:

### Immediate Priority:
- ✅ Welcome email (new user signup)
- ✅ Token low warning (< 10 tokens remaining)
- ✅ Monthly token reset notification

### Future Enhancements:
- Weekly usage summary
- Feature announcement emails
- Password reset emails
- Account upgrade confirmations
- Security notifications

## Testing

Test the function locally:

```bash
npx supabase functions serve send-email --env-file .env.local
```

Then send a test request:

```bash
curl -X POST http://localhost:54321/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "template": "welcome",
    "templateData": {
      "name": "Test User",
      "dashboardUrl": "https://test.com"
    }
  }'
```
