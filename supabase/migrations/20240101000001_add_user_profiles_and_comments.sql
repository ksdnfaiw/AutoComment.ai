-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT,
  persona TEXT DEFAULT 'Professional',
  industry TEXT DEFAULT 'Technology',
  tone_style TEXT DEFAULT 'Professional',
  tokens_remaining INTEGER DEFAULT 50,
  tokens_total INTEGER DEFAULT 50,
  subscription_plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create comment_history table
CREATE TABLE IF NOT EXISTS comment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_content TEXT NOT NULL,
  generated_comments JSONB NOT NULL,
  persona_used TEXT DEFAULT 'Professional',
  feedback TEXT, -- 'approved', 'rejected', null
  approved_comment TEXT,
  confidence_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create onboarding_preferences table
CREATE TABLE IF NOT EXISTS onboarding_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  tone_style TEXT,
  industry_domain TEXT,
  sample_feedback JSONB DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_history_user_id ON comment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_history_created_at ON comment_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_onboarding_preferences_user_id ON onboarding_preferences(user_id);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own comment history" ON comment_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own comment history" ON comment_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comment history" ON comment_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own onboarding preferences" ON onboarding_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding preferences" ON onboarding_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding preferences" ON onboarding_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS handle_updated_at ON user_profiles;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON onboarding_preferences;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON onboarding_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
