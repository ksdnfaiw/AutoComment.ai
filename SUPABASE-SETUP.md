# 🚀 AutoComment.AI Supabase Setup Guide

## Step 1: Create New Supabase Project

1. **Go to [supabase.com](https://supabase.com)** and create a new account or sign in
2. **Click "New Project"**
3. **Fill in project details:**
   - Organization: Your organization
   - Name: `AutoComment-AI`
   - Database Password: Create a strong password
   - Region: Choose closest to your users
4. **Click "Create new project"** (takes ~2 minutes)

## Step 2: Get Your Project Credentials

1. **Go to Settings → API** in your Supabase dashboard
2. **Copy these values:**
   - Project URL: `https://your-project-id.supabase.co`
   - Anon public key: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`

## Step 3: Update Environment Variables

Update your environment variables in the DevServerControl tool or `.env` file:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Run Database Schema

1. **Go to SQL Editor** in your Supabase dashboard
2. **Create a new query**
3. **Copy and paste the entire contents** of `database-schema.sql` file
4. **Click "Run"** to execute the schema

This will create:
- ✅ User profiles table
- ✅ Personas table  
- ✅ LinkedIn posts table
- ✅ Comments table
- ✅ Comment templates table
- ✅ User settings table
- ✅ Usage analytics table
- ✅ Row Level Security (RLS) policies
- ✅ Automatic user profile creation
- ✅ Default personas for new users

## Step 5: Configure Authentication

1. **Go to Authentication → Settings** in Supabase dashboard
2. **Site URL**: Set to your domain (for development: `http://localhost:8080`)
3. **Redirect URLs**: Add your auth callback URLs
4. **Email Templates**: Customize signup/reset emails (optional)

## Step 6: Test the Setup

1. **Start your dev server**: `npm run dev`
2. **Visit your app** and try to sign up
3. **Check email** for confirmation link
4. **Sign in** and test the dashboard
5. **Add test comments** to verify database connectivity

## Step 7: Optional - Enable Additional Auth Providers

In **Authentication → Providers**, you can enable:
- 🔗 Google OAuth
- 🔗 GitHub OAuth  
- 🔗 LinkedIn OAuth (perfect for AutoComment.AI!)

## Troubleshooting

### Common Issues:

1. **"Failed to create user profile"**
   - Check if the schema was applied correctly
   - Verify RLS policies are enabled

2. **"Insert failed"**
   - User might not be authenticated
   - Check RLS policies allow inserts for authenticated users

3. **"Table doesn't exist"**
   - Ensure you ran the complete database schema
   - Check table names match exactly

### Database Tables Created:

- `user_profiles` - User profile information
- `personas` - AI comment personas/styles  
- `linkedin_posts` - Scraped/saved LinkedIn posts
- `comments` - Generated comments and feedback
- `comment_templates` - Reusable comment templates
- `user_settings` - User preferences and settings
- `usage_analytics` - Usage tracking and analytics

### Security Features:

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only access their own data
- ✅ Automatic user profile creation on signup
- ✅ Secure password authentication
- ✅ Email verification required

## 🎉 You're Ready!

Your AutoComment.AI app now has:
- ✅ Complete authentication system
- ✅ Secure database with proper RLS
- ✅ User-specific data isolation
- ✅ Real-time comment generation and tracking
- ✅ Professional UI with login/signup

## Next Steps:

1. **Customize personas** in the database
2. **Add LinkedIn extension integration**
3. **Implement AI comment generation**
4. **Set up analytics and reporting**
5. **Add subscription management**

---

Need help? Check the Supabase docs or connect to the Supabase MCP integration for advanced database management!
